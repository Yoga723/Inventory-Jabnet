import logging
import re
import telnetlib
import time

from dotenv import load_dotenv
load_dotenv()
import os


# Setup logging
logger = logging.getLogger(__name__)

# ==============================================================================
# === KONFIGURASI OLT TELNET (Ganti dengan data Anda!) ===
# ==============================================================================
OLT_HOST = os.getenv('OLT_IP_GRT') 
OLT_PORT = os.getenv('OLT_PORT_GRT')
OLT_USER = os.getenv('OLT_USER_GRT')
OLT_PASS = os.getenv('OLT_PASS_GRT')
TELNET_TIMEOUT = 60       # <<< GANTI INI >>> Waktu tunggu total (detik)
READ_TIMEOUT = 5          # Waktu tunggu untuk setiap pembacaan output (detik)
# ==============================================================================

# --- Helper function to read paginated output --- 
def read_until_prompt(tn, prompt_regex, more_prompt=rb"--More--", timeout=30):
    """Reads output until the final prompt, handling pagination."""
    output_buffer = b""
    start_time = time.time()

    while True:
        if time.time() - start_time > timeout:
            logger.error(f"Overall timeout ({timeout}s) reached waiting for prompt or --More--.")
            return None
        try:
            index, match, chunk = tn.expect([prompt_regex, more_prompt], timeout=READ_TIMEOUT)
            if chunk:
                output_buffer += chunk
            if index == 0: # Final prompt
                if match:
                    prompt_len = len(match.group(0))
                    output_buffer = output_buffer[:-prompt_len]
                logger.debug("Final prompt detected.")
                break
            elif index == 1: # More prompt
                logger.debug("--More-- detected, sending space.")
                output_buffer = output_buffer.replace(more_prompt, b"").rstrip()
                tn.write(b" ")
                time.sleep(0.2)
            elif index == -1: # Timeout
                final_chunk = tn.read_very_eager()
                if final_chunk:
                    output_buffer += final_chunk
                if re.search(prompt_regex, output_buffer):
                     logger.debug("Final prompt detected after last read attempt.")
                     match_final = re.search(prompt_regex, output_buffer)
                     if match_final:
                          prompt_len = len(match_final.group(0))
                          output_buffer = output_buffer[:-prompt_len]
                     break
                else:
                    partial_output_str = output_buffer.decode("ascii", errors="ignore")[-200:]
                    logger.error(f"Read timeout ({READ_TIMEOUT}s) waiting for prompt or --More--. Partial output: {partial_output_str}")
                    return None
        except EOFError:
            logger.error("Telnet connection closed unexpectedly while reading output.")
            return None
        except Exception as e:
            logger.error(f"Error during tn.expect: {e}")
            return None
    return output_buffer.decode("ascii", errors="ignore").strip()

def get_olt_data_grt(onu_sn):
    """Connects to OLT via Telnet, executes commands, handles pagination, and parses output."""
    tn = None
    try:
        logger.info(f"Connecting to OLT {OLT_HOST}:{OLT_PORT} for SN {onu_sn}...")
        tn = telnetlib.Telnet(OLT_HOST, OLT_PORT, TELNET_TIMEOUT)

        # Login Process
        try:
            tn.read_until(b"Username:", timeout=5)
            tn.write(OLT_USER.encode("ascii") + b"\n")
            tn.read_until(b"Password:", timeout=5)
            tn.write(OLT_PASS.encode("ascii") + b"\n")
        except EOFError:
            logger.error("Telnet connection closed unexpectedly during login prompt.")
            return None

        prompt_regex_compiled = re.compile(rb"[>#]\s*$")
        login_output = read_until_prompt(tn, prompt_regex_compiled, timeout=10)
        if login_output is None:
            logger.error(f"OLT Login failed. Did not reach prompt within timeout or error occurred.")
            return None
        logger.info("OLT Login successful.")

        # --- Helper function to run command and get paginated output --- 
        def run_olt_command_paginated(command, timeout=TELNET_TIMEOUT):
            logger.info(f"Executing: {command.strip()}")
            tn.write(command.encode("ascii"))
            full_output = read_until_prompt(tn, prompt_regex_compiled, timeout=timeout)
            if full_output is None:
                logger.error(f"Failed to get complete output for command \'{command.strip()}\'. Check logs for details.")
                return None
            logger.debug(f"Output ({command.split()[0]}):\n{full_output}")
            return full_output

        # --- 1. Find Interface by SN ---
        cmd_find_sn = f"show gpon onu by sn {onu_sn}\n"
        output_find_sn = run_olt_command_paginated(cmd_find_sn, timeout=15)
        if output_find_sn is None: return None

        match_interface = re.search(r"(gpon-onu_\d+/\d+/\d+:\d+)", output_find_sn)
        if not match_interface:
            logger.warning(f"Interface not found for SN: {onu_sn} in output.")
            if "No related information to show" in output_find_sn or "not found" in output_find_sn.lower():
                logger.info(f"SN {onu_sn} explicitly not found on OLT.")
                return False
            else:
                logger.error(f"Could not parse interface for SN {onu_sn}, unexpected output format.")
                return None

        interface = match_interface.group(1)
        logger.info(f"Found interface: {interface} for SN: {onu_sn}")
        olt_data = {"interface": interface}

        # --- 2. Get ONU IP ---
        cmd_ip = f"show gpon remote-onu ip-host {interface}\n"
        output_ip = run_olt_command_paginated(cmd_ip, timeout=TELNET_TIMEOUT)
        if output_ip is None: return None
        match_ip = re.search(r"CurIP\s*:\s*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})", output_ip)
        olt_data["onu_ip"] = match_ip.group(1) if match_ip else "N/A"

        # --- 3. Get Power Attenuation ---
        cmd_power = f"show pon power attenuation {interface}\n"
        output_power = run_olt_command_paginated(cmd_power, timeout=TELNET_TIMEOUT)
        if output_power is None: return None
        # PERBAIKAN V3: Regex lebih presisi untuk redaman downlink berdasarkan log user
        match_power_down = re.search(
            r"^\s*down\s+Tx\s*:\s*([\d\.\-]+)\s*\(dbm\)\s+Rx\s*:\s*([\d\.\-]+)\s*\(dbm\)", 
            output_power, 
            re.MULTILINE
        )
        if match_power_down:
            olt_data["olt_tx"] = match_power_down.group(1)
            olt_data["onu_rx"] = match_power_down.group(2)
            # PERBAIKAN F-STRING: Gunakan kutip tunggal untuk akses dictionary
            logger.info(f"Parsed downlink power: OLT Tx={olt_data['olt_tx']}, ONU Rx={olt_data['onu_rx']}")
        else:
            olt_data["olt_tx"] = "N/A"
            olt_data["onu_rx"] = "N/A"
            logger.warning(f"Could not parse downlink power from output:\n------\n{output_power}\n------")

        # --- 4. Get Detail Info & Auth History ---
        cmd_detail = f"show gpon onu detail-info {interface}\n"
        output_detail = run_olt_command_paginated(cmd_detail, timeout=TELNET_TIMEOUT)
        if output_detail is None: return None

        match_name = re.search(r"Name\s*:\s*(.+?)\s*\n", output_detail)
        olt_data["nama"] = match_name.group(1).strip() if match_name else "N/A"

        match_type = re.search(r"Type\s*:\s*(.+?)\s*\n", output_detail)
        olt_data["tipe"] = match_type.group(1).strip() if match_type else "N/A"

        match_state = re.search(r"State\s*:\s*(.+?)\s*\n", output_detail)
        olt_data["status"] = match_state.group(1).strip() if match_state else "N/A"

        match_online = re.search(r"Online Duration\s*:\s*(.+?)\s*\n", output_detail)
        olt_data["online"] = match_online.group(1).strip() if match_online else "N/A"

        match_distance = re.search(r"ONU Distance\s*:\s*(\d+m)\s*\n", output_detail)
        olt_data["distance"] = match_distance.group(1).strip() if match_distance else "N/A"

        # PERBAIKAN V3: Parsing Auth History lebih teliti
        auth_history_lines = []
        # Look for the auth history section - GRT uses different headers
        history_start_pattern = r"Authpass history information:"
        history_header_pattern = r"Index\s+Authpass Time\s+OfflineTime\s+Cause"
        history_line_pattern = r"^\s*(\d+)\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}|0000-00-00\s+00:00:00)\s+(\S+)"

        lines = output_detail.splitlines()
        logger.debug(f"Starting Auth History parsing. Total lines: {len(lines)}")
        
        in_history_section = False
        for i, line in enumerate(lines):
            if not in_history_section:
                # Look for the start of the auth history section
                if re.search(history_start_pattern, line):
                    logger.debug(f"Auth history section found at line {i}")
                    in_history_section = True
                    # Skip the next separator line if it exists
                    if i+1 < len(lines) and "----" in lines[i+1]:
                        i += 1  # Skip the separator line
                    continue
            else:
                # Check if we've reached the end of the section
                if not line.strip() or re.search(r"^[>#]", line):
                    logger.debug(f"End of auth history section at line {i}")
                    break
                    
                # Try to match header or data lines
                if re.search(history_header_pattern, line):
                    continue  # Skip header line
                    
                match = re.match(history_line_pattern, line)
                if match:
                    index, auth_time, offline_time, cause = match.groups()
                    # Handle "0000-00-00 00:00:00" as "N/A"
                    offline_time = "N/A" if "0000-00-00" in offline_time else offline_time
                    auth_history_lines.append(f"{index}   {auth_time}   {offline_time}   {cause}")
            
        olt_data["auth_history"] = "\n".join(auth_history_lines[-5:]) if auth_history_lines else "N/A"

        if not auth_history_lines:
            logger.warning(f"Could not parse any auth history lines from GRT output")
        else:
            logger.info(f"Parsed {len(auth_history_lines)} auth history lines for GRT")

        # Logout
        logger.info("Executing OLT logout.")
        tn.write(b"exit\n")

        return olt_data

    except (ConnectionRefusedError, TimeoutError, OSError, EOFError) as e:
        logger.error(f"Telnet connection or communication error: {e}")
        return None
    except Exception as e:
        logger.error(f"An unexpected error occurred during Telnet operation: {e}", exc_info=True)
        return None
    finally:
        if tn:
            try:
                tn.close()
                logger.info("Telnet connection closed.")
            except Exception as e:
                logger.error(f"Error closing Telnet connection: {e}")
