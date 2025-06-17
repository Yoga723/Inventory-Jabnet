# -*- coding: utf-8 -*-

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
# === KONFIGURASI OLT TELNET ===
# ==============================================================================
OLT_HOST = os.getenv('OLT_IP_CLW') 
OLT_PORT = os.getenv('OLT_PORT_CLW')
OLT_USER = os.getenv('OLT_USER_CLW')
OLT_PASS = os.getenv('OLT_PASS_CLW')
TELNET_TIMEOUT = 60       # <<< GANTI INI UNTUK >>> Waktu tunggu total (detik)
READ_TIMEOUT = 5          # Waktu tunggu untuk setiap pembacaan output (detik)
# ==============================================================================

# --- Helper function to read paginated output --- 
def read_until_prompt(tn, prompt_regex, more_prompt=rb"--More--", timeout=30):
    """Reads output until the final prompt, handling pagination."""
    output_buffer = b""
    start_time = time.time()

    while True:
        if time.time() - start_time > timeout:
            logger.error(f"Timeout ({timeout}s) reached waiting for prompt.")
            return None
        try:
            index, match, chunk = tn.expect([prompt_regex, more_prompt], timeout=READ_TIMEOUT)
            if chunk:
                output_buffer += chunk
            if index == 0:  # Final prompt
                if match:
                    prompt_len = len(match.group(0))
                    output_buffer = output_buffer[:-prompt_len]
                break
            elif index == 1:  # More prompt
                output_buffer = output_buffer.replace(more_prompt, b"").rstrip()
                tn.write(b" ")
                time.sleep(0.2)
            elif index == -1:  # Timeout
                final_chunk = tn.read_very_eager()
                if final_chunk:
                    output_buffer += final_chunk
                if re.search(prompt_regex, output_buffer):
                    break
        except EOFError:
            logger.error("Connection closed unexpectedly.")
            return None
        except Exception as e:
            logger.error(f"Error during read: {e}")
            return None
            
    return output_buffer.decode("ascii", errors="ignore").strip()

def convert_mac_format(mac_address):
    """Convert MAC from XX:XX:XX:XX:XX:XX to XXXX.XXXX.XXXX format"""
    # If already in dotted format, just return lowercase
    if re.match(r'^[0-9a-fA-F]{4}\.[0-9a-fA-F]{4}\.[0-9a-fA-F]{4}$', mac_address):
        return mac_address.lower()
    
    # Remove colons and convert to lowercase
    cleaned_mac = mac_address.replace(':', '').lower()
    
    # Check if we have exactly 12 characters
    if len(cleaned_mac) != 12:
        logger.error(f"Invalid MAC address format: {mac_address}. Must contain exactly 12 hex characters.")
        return None
    
    # Format as three groups of four characters separated by dots
    return '.'.join([cleaned_mac[i:i+4] for i in range(0, 12, 4)]).lower()

def get_power_attenuation(tn, run_command, interface):
    """Retrieves and parses power attenuation data"""
    cmd_power = f"show pon power attenuation {interface}"
    output_power = run_command(cmd_power)
    
    if not output_power:
        logger.warning("Power attenuation command failed")
        return None, None, None  # olt_tx, onu_rx, attenuation
    
    # Try to parse downlink power values
    match = re.search(
        r"down\s+Tx\s*:\s*(-?\d+\.\d+)\s*\(dbm\)\s+Rx\s*:\s*(-?\d+\.\d+)\s*\(dbm\)\s+(-?\d+\.\d+)\s*\(dB\)",
        output_power
    )
    
    if match:
        olt_tx = match.group(1)
        onu_rx = match.group(2)
        attenuation = match.group(3)
        logger.info(f"Parsed downlink power: OLT Tx={olt_tx}, ONU Rx={onu_rx}, Attenuation={attenuation}")
        return olt_tx, onu_rx, attenuation
    
    # If primary pattern fails, try alternative pattern
    match = re.search(
        r"down\s+Tx\s*:\s*(-?\d+\.\d+)\s*\(dbm\)\s+Rx\s*:\s*(-?\d+\.\d+)\s*\(dbm\)",
        output_power
    )
    
    if match:
        olt_tx = match.group(1)
        onu_rx = match.group(2)
        logger.info(f"Parsed downlink power: OLT Tx={olt_tx}, ONU Rx={onu_rx}")
        return olt_tx, onu_rx, None
    
    logger.warning("Could not parse power attenuation output")
    return None, None, None


def get_olt_data_clw(mac_address):
    """Connects to OLT via Telnet to retrieve ONU data"""
    converted_mac = convert_mac_format(mac_address)
    if not converted_mac:
        return None
    
    tn = None
    try:
        logger.info(f"Connecting to {OLT_HOST}:{OLT_PORT} for {mac_address}...")
        tn = telnetlib.Telnet(OLT_HOST, OLT_PORT, TELNET_TIMEOUT)

        # Login
        tn.read_until(b"Username:", 5)
        tn.write(OLT_USER.encode() + b"\n")
        tn.read_until(b"Password:", 5)
        tn.write(OLT_PASS.encode() + b"\n")
        
        # Wait for prompt
        prompt_regex = re.compile(rb"[>#]\s*$")
        if not read_until_prompt(tn, prompt_regex, timeout=10):
            logger.error("Login failed")
            return None
        logger.info("Login successful")

        # Helper function to run commands
        def run_command(command, timeout=TELNET_TIMEOUT):
            logger.debug(f"Executing: {command}")
            tn.write(command.encode() + b"\n")
            return read_until_prompt(tn, prompt_regex, timeout=timeout)

        # --- 1. Find EPON Interface by MAC ---
        cmd_find_mac = f"show epon onu by mac {converted_mac}"
        output = run_command(cmd_find_mac, 15)
        if not output:
            logger.error("MAC search command failed")
            return None
            
        # Find EPON interface
        interface_match = re.search(r"(epon-onu_\d+/\d+/\d+:\d+)", output)
        if not interface_match:
            if "not found" in output.lower():
                logger.info(f"MAC {converted_mac} not found")
                return False
            logger.warning(f"Interface not found for {converted_mac}")
            return None
            
        interface = interface_match.group(1)
        logger.info(f"Found interface: {interface}")
        olt_data = {"interface": interface}

        # --- 2. Get Optical Power Attenuation (NEW) ---
        olt_tx, onu_rx, attenuation = get_power_attenuation(tn, run_command, interface)
        if olt_tx is not None and onu_rx is not None:
            olt_data["olt_tx"] = olt_tx
            olt_data["onu_rx"] = onu_rx
            if attenuation:
                olt_data["attenuation"] = attenuation
        else:
            logger.warning("Falling back to optical transceiver diagnosis")
            # Fallback method if power attenuation command fails
            cmd_diag = f"show epon optical-transceiver-diagnosis interface {interface}"
            output_diag = run_command(cmd_diag)
            if output_diag:
                power_match = re.search(r"RSSI\s*:\s*(-?\d+\.\d+)\s*\(dBm\)", output_diag)
                if power_match:
                    olt_data["onu_rx"] = power_match.group(1)
                else:
                    olt_data["onu_rx"] = "N/A"
                olt_data["olt_tx"] = "N/A"  # Not available in this command
            else:
                olt_data["olt_tx"] = "N/A"
                olt_data["onu_rx"] = "N/A"

        # --- 3. Get Optical Power (EPON specific)
        # First try: Standard optical info
        cmd_optical = f"show epon onu optical-info {interface}"
        output_optical = run_command(cmd_optical)
        
        if output_optical:
            # Try to find Rx power
            power_match = re.search(r"Rx Power\s*\(dBm\)\s*:\s*(-?\d+\.\d+)", output_optical)
            if not power_match:
                # Alternative pattern
                power_match = re.search(r"RSSI\s*:\s*(-?\d+\.\d+)\s*\(dBm\)", output_optical)
            
            olt_data["onu_rx"] = power_match.group(1) if power_match else "N/A"
            olt_data["olt_tx"] = "N/A"  # EPON doesn't provide OLT Tx
        else:
            # Fallback to transceiver diagnosis
            cmd_diag = f"show epon optical-transceiver-diagnosis interface {interface}"
            output_diag = run_command(cmd_diag)
            if output_diag:
                power_match = re.search(r"RSSI\s*:\s*(-?\d+\.\d+)\s*\(dBm\)", output_diag)
                olt_data["onu_rx"] = power_match.group(1) if power_match else "N/A"
            else:
                olt_data["olt_tx"] = "N/A"
                olt_data["onu_rx"] = "N/A"

        # --- 4. Get ONU IP ---
        cmd_ip = f"show onu ip-host {interface}"
        output_ip = run_command(cmd_ip)
        if output_ip:
            ip_match = re.search(r"CurIP\s*:\s*(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})", output_ip)
            olt_data["onu_ip"] = ip_match.group(1) if ip_match else "N/A"
        else:
            olt_data["onu_ip"] = "N/A"

        # Logout
        tn.write(b"exit\n")
        return olt_data

    except (ConnectionRefusedError, TimeoutError, OSError, EOFError) as e:
        logger.error(f"Connection error: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return None
    finally:
        if tn:
            try:
                tn.close()
            except:
                pass
