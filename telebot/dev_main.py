# -*- coding: utf-8 -*-
import logging
import re
import urllib.parse
import mysql.connector
from mysql.connector import Error
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, MessageHandler, filters, CallbackQueryHandler, ContextTypes, ConversationHandler

from dotenv import load_dotenv
load_dotenv()
import os

# Import the Telnet function from the other file
# Pastikan Anda menggunakan file olt_telnet_v3.py dan menyimpannya sebagai olt_telnet.py
from dev_olt_grt import get_olt_data_grt
from dev_olt_byb import get_olt_data_byb 
from dev_olt_clw import get_olt_data_clw  

# Enable logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logging.getLogger("httpx").setLevel(logging.WARNING)
logger = logging.getLogger(__name__)

# ==============================================================================
# === KONFIGURASI YANG PERLU ANDA UBAH ===
# ==============================================================================

# --- Konfigurasi Bot Telegram --- 
TELEGRAM_BOT_TOKEN = os.getenv('DEV_TELEGRAM_TOKEN')

# --- Konfigurasi Database MySQL --- 
# Sudah disesuaikan dengan info terakhir Anda
DB_CONFIG = {
    "host": os.getenv('DB_HOST'),      # <<< GANTI INI >>> jika host DB berbeda
    "port": os.getenv('DB_PORT'),             # <<< GANTI INI >>> jika port DB berbeda
    "user": os.getenv('DB_USER'),       # Sesuai info Anda
    "password": os.getenv('DB_PASS'),      # Sesuai info Anda
    "database": os.getenv('DB_NAME') 
    }

# ==============================================================================
# === AKHIR BAGIAN KONFIGURASI ===
# ==============================================================================

# --- State definitions for ConversationHandler ---
SELECTING_ACTION, AWAIT_CUSTOMER_ID, AWAIT_ONU_SN = range(3)

# --- Database Helper Function ---
def get_customer_data(customer_id):
    """Fetches customer data from the MySQL database using the correct column names."""
    conn = None
    cursor = None
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        if conn.is_connected():
            logger.info(f"Connected to MySQL database for ID: {customer_id}")
            cursor = conn.cursor(dictionary=True)
            # Menggunakan nama kolom yang benar (name, address, phone, sn) dan WHERE clause (id)
            query = "SELECT name, address, no_telepon, sn, olt FROM customers WHERE id = %s"
            cursor.execute(query, (customer_id,))
            result = cursor.fetchone()
            if result:
                logger.info(f"Data found for ID: {customer_id}")
                return result
            else:
                logger.info(f"ID: {customer_id} not found in table 'customers'.")
                return False # Not found
        else:
            logger.error("Failed to connect to MySQL database.")
            return None  # Error
    except Error as e:
        if e.errno == 1146: # Table doesn't exist
             logger.error(f"Database Error: Table 'customers' not found in database '{DB_CONFIG['database']}'. Please ensure the table exists.")
        elif e.errno == 1054: # Unknown column
             logger.error(f"Database Error: Unknown column in query. Please double-check column names in the script vs. your actual table structure. Error: {e}")
        else:
             logger.error(f"Error connecting to MySQL or executing query for ID {customer_id}: {e}")
        return None  # Error
    finally:
        if cursor:
            cursor.close()
        if conn and conn.is_connected():
            conn.close()
            logger.info(f"MySQL connection closed for ID: {customer_id}")

# --- Bot Functions ---

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """1) Sends welcome message with main menu buttons"""
    keyboard = [
        [InlineKeyboardButton("Cek ID Pelanggan", callback_data="cek_id")],
        [InlineKeyboardButton("Cek Info ONU Garut", callback_data="cek_onu_grt")],
        [InlineKeyboardButton("Cek Info ONU BYB", callback_data="cek_onu_byb")],
        [InlineKeyboardButton("Cek Info ONU CLW", callback_data="cek_onu_clw")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    welcome_text = "Selamat datang! Silakan pilih tindakan yang ingin Anda lakukan:"

    if update.message:
        await update.message.reply_text(welcome_text, reply_markup=reply_markup)
    elif update.callback_query:
        query = update.callback_query
        await query.answer()
        try:
            await query.edit_message_text(text=welcome_text, reply_markup=reply_markup)
        except Exception as e:
            logger.warning(f"Could not edit message in start (likely same content): {e}")

    return SELECTING_ACTION

async def ask_customer_id(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """2) Handles 'Cek ID Pelanggan' button - asks for customer ID"""
    query = update.callback_query
    await query.answer()
    await query.edit_message_text(text="Sok kirimkeun ID Pelanggana  anu bade di cek.")
    return AWAIT_CUSTOMER_ID

async def handle_customer_id(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """3) Handles customer ID input - queries DB and shows results"""
    customer_id = update.message.text.strip()
    logger.info(f"Received customer ID request: {customer_id}")

    thinking_message = await update.message.reply_text(f"Mencari data untuk ID Pelanggan: {customer_id}...")
    db_data = get_customer_data(customer_id)

    if isinstance(db_data, dict):
        # Data found - show customer info
        sn_value = db_data.get('sn', 'TIDAK ADA')
        response_text = (
            f"Hasil Pengecekan ID Pelanggan:\n"
            f"Nama: {db_data.get('name', 'N/A')}\n"
            f"Alamat: {db_data.get('address', 'N/A')}\n"
            f"No HP: {db_data.get('no_telepon', 'N/A')}\n"
            f"OLT: {db_data.get('olt', 'N/A')}\n"
            f"ODP: {db_data.get('odp', 'N/A')}\n"
            f"PORT ODP: {db_data.get('port_odp', 'N/A')}\n"
            f"SN: {sn_value}"
        )
        # 4) Create action buttons including location-specific OLT checks
        keyboard = [
            [InlineKeyboardButton("Cek ONU Garut", callback_data=f"cek_grt_{sn_value}")],
            [InlineKeyboardButton("Cek ONU BYB", callback_data=f"cek_byb_{sn_value}")],
            [InlineKeyboardButton("Cek ONU CLW", callback_data=f"cek_clw_{sn_value}")],
            [InlineKeyboardButton("Kembali ke Menu Utama", callback_data="start_over")],
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await thinking_message.edit_text(response_text, reply_markup=reply_markup)

    elif db_data is False:
        # Data not found
        response_text = f"Maaf, ID Pelanggan '{customer_id}' tidak ditemukan di tabel 'customers'. Cing baleg ngirim ID teh atuh atau hubungi noc jabnet"
        keyboard = [
            [InlineKeyboardButton("Coba Lagi", callback_data="cek_id")],
            [InlineKeyboardButton("Menu Utama", callback_data="start_over")],
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await thinking_message.edit_text(response_text, reply_markup=reply_markup)

    else: # db_data is None (Error)
        response_text = "Terjadi kesalahan saat mengakses database. Silakan periksa log bot atau hubungi administrator."
        keyboard = [
            [InlineKeyboardButton("Coba Lagi", callback_data="cek_id")],
            [InlineKeyboardButton("Menu Utama", callback_data="start_over")],
        ]
        reply_markup = InlineKeyboardMarkup(keyboard)
        await thinking_message.edit_text(response_text, reply_markup=reply_markup)

    return SELECTING_ACTION

async def ask_onu_sn(update: Update, context: ContextTypes.DEFAULT_TYPE, location: str) -> int:
    """5) Asks for ONU identifier based on selected location"""
    query = update.callback_query
    await query.answer()
    
    # Store location in context for later use
    context.user_data['olt_location'] = location
    location_name = location.upper()
    
    if location == 'clw':
        message_text = (
            "Silakan kirimkan MAC ADDRESS ONU untuk OLT CLW.\n"
            "Format yang diterima:\n"
            "XX:XX:XX:XX:XX:XX atau XXXX.XXXX.XXXX"
        )
    else:
        message_text = (
            f"Silakan kirimkan SN ONU untuk OLT {location_name}.\n"
            "Format: ZTEGABCDEFGH"
        )
    
    await query.edit_message_text(text=message_text)
    return AWAIT_ONU_SN

async def ask_onu_grt(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handles Garut OLT selection"""
    return await ask_onu_sn(update, context, 'grt')

async def ask_onu_byb(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handles BYB OLT selection"""
    return await ask_onu_sn(update, context, 'byb')

async def ask_onu_clw(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Handles CLW OLT selection"""
    return await ask_onu_sn(update, context, 'clw')

async def handle_olt_check(update: Update, context: ContextTypes.DEFAULT_TYPE, onu_sn: str, location: str):
    """6) Performs OLT check and displays results"""
    # Determine which OLT function to call based on location
    if location == 'grt':
        olt_data = get_olt_data_grt(onu_sn)
    elif location == 'byb':
        olt_data = get_olt_data_byb(onu_sn)
    elif location == 'clw':
        olt_data = get_olt_data_clw(onu_sn)
    else:
        olt_data = None

    # Create common action buttons
    action_buttons = [
        [
            InlineKeyboardButton("Cek ONU Garut", callback_data="cek_onu_grt"),
            InlineKeyboardButton("Cek ONU BYB", callback_data="cek_onu_byb"),
            InlineKeyboardButton("Cek ONU CLW", callback_data="cek_onu_clw"),
        ],
        [InlineKeyboardButton("Menu Utama", callback_data="start_over")]
    ]
    reply_markup = InlineKeyboardMarkup(action_buttons)

    if isinstance(olt_data, dict):
        # Process OLT data and create response
        status_onu = "Aktif \U0001F91F" if olt_data.get('onu_ip', '').startswith('100.64.') else "Isolir \U0001F608" if olt_data.get('onu_ip', '').startswith('172.') else "Tidak diketahui \U0001F937"

        # Determine service status based on Rx power
        status_layanan = "N/A"
        if olt_data.get('onu_rx', 'N/A') != 'N/A':
            try:
                rx_value = float(olt_data['onu_rx'])
                if -26 <= rx_value <= -10:
                    status_layanan = "Aktif \U0001F970"
                elif rx_value < -26:
                    status_layanan = "Bermasalah \U0001F622"
            except ValueError:
                pass
        
        # Prepare response text
        response_text = (
            f"Hasil Pengecekan ONT (OLT {location.upper()})\n\n"
            f"SN: {onu_sn}\n"
            f"Interface: {olt_data.get('interface', 'N/A')}\n"
            f"Status: <b>{olt_data.get('status', 'N/A')}</b>\n"
            f"ONU IP: {olt_data.get('onu_ip', 'N/A')}\n"
            f"Status ONU: <b>{status_onu}</b>\n" 
            f"Redaman:\n"
            f"  OLT Tx: {olt_data.get('olt_tx', 'N/A')} dBm\n"
            f"  ONU Rx: {olt_data.get('onu_rx', 'N/A')} dBm\n"
            f"<b>Status Layanan</b>: <b>{status_layanan}</b>\n" 
            f"Detail:\n"
            f"  Nama: {olt_data.get('nama', 'N/A')}\n"
            f"  Tipe: {olt_data.get('tipe', 'N/A')}\n"
            f"Jarak: {olt_data.get('distance', 'N/A')}\n"
            f"  Online: {olt_data.get('online', 'N/A')}"
        )
        
        # Add auth history if available
        if auth_history := olt_data.get('auth_history', ''):
            if auth_history != 'N/A' and auth_history.strip():
                response_text += (
                    f"\n--------------------------------\n"
                    f"Authpass Time       OfflineTime       Cause\n"
                    f"{auth_history}"
                )
        
        # ===== NEW: ADD RECOMMENDED ACTIONS =====
        tindakan = []
        
        # Check for 0.0.0.0 IP
        if olt_data.get('onu_ip') == '0.0.0.0':
            tindakan.append("Hubungi tim operator untuk create ulang")
        
        # Check for high attenuation
        try:
            rx_value = float(olt_data.get('onu_rx', 0))
            if rx_value < -25:
                interface = olt_data.get('interface', 'N/A')
                tindakan.append(f"Hubungi tim teknisi untuk mengatasi redaman. Beritahu interfacenya: {interface}")
        except (ValueError, TypeError):
            pass  # Ignore if rx_value is not a number
        
        # Add actions section if any recommendations exist
        if tindakan:
            response_text += "\n\n<b>Tindakan yang disarankan:</b>\n"
            response_text += "\n".join(tindakan)
        # ===== END OF NEW SECTION =====
        
        return response_text, reply_markup

    elif olt_data is False:
        # SN not found
        return f"SN '{onu_sn}' tidak ditemukan di OLT {location.upper()}. Mohon periksa kembali Untuk SN nya atau hubungi noc jabnet", reply_markup

    else:  # Error case
        return f"Gagal memeriksa SN '{onu_sn}' di OLT {location.upper()}. Cing baleg nulis SN na dak", reply_markup

async def handle_onu_sn(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """7) Handles SN input and processes OLT check"""
    user_input = update.message.text.strip()
    location = context.user_data.get('olt_location', 'grt')
    location_name = location.upper()
    
    thinking_msg = await update.message.reply_text(
        f"Mengecek SN: {user_input} di OLT {location_name}..."
    )

    # Perform OLT check
    response_text, reply_markup = await handle_olt_check(update, context, user_input, location)
    await thinking_msg.edit_text(response_text, reply_markup=reply_markup, parse_mode='HTML')
    
    return SELECTING_ACTION

async def handle_location_with_sn(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """8) Handles direct OLT check from customer data (with SN pre-filled)"""
    query = update.callback_query
    await query.answer()
    
    # Extract location and SN from callback data
    pattern = r"cek_(grt|byb|clw)_(.+)"
    match = re.match(pattern, query.data)
    
    if not match:
        await query.edit_message_text("Terjadi kesalahan format data.")
        return SELECTING_ACTION
        
    location = match.group(1)
    onu_sn = match.group(2)
    location_name = location.upper()
    
    # Show processing message
    processing_msg = await query.edit_message_text(
        f"Mengecek SN: {onu_sn} di OLT {location_name}..."
    )

    # Perform OLT check
    response_text, reply_markup = await handle_olt_check(update, context, onu_sn, location)
    await processing_msg.edit_text(response_text, reply_markup=reply_markup, parse_mode='HTML')
    
    return SELECTING_ACTION

async def start_over(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """9) Returns to main menu"""
    return await start(update, context)

async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Cancels operation"""
    # ... (same as before) ...

def main() -> None:
    """Start the bot."""
    # --- Pre-run Checks ---
    if "YOUR_TELEGRAM_BOT_TOKEN" in TELEGRAM_BOT_TOKEN:
        logger.error("FATAL: TELEGRAM_BOT_TOKEN belum diubah di main.py! Silakan ganti 'YOUR_TELEGRAM_BOT_TOKEN' dengan token bot Anda.")
        return

    # Create the Application
    application = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

    # Setup conversation handler
    conv_handler = ConversationHandler(
        entry_points=[CommandHandler("start", start)],
        states={
            SELECTING_ACTION: [
                CallbackQueryHandler(ask_customer_id, pattern="^cek_id$"),
                CallbackQueryHandler(ask_onu_grt, pattern="^cek_onu_grt$"),
                CallbackQueryHandler(ask_onu_byb, pattern="^cek_onu_byb$"),
                CallbackQueryHandler(ask_onu_clw, pattern="^cek_onu_clw$"),
                CallbackQueryHandler(handle_location_with_sn, pattern=r"^cek_(grt|byb|clw)_"),
                CallbackQueryHandler(start_over, pattern="^start_over$"),
            ],
            AWAIT_CUSTOMER_ID: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, handle_customer_id),
                CallbackQueryHandler(start_over, pattern="^start_over$"),
            ],
            AWAIT_ONU_SN: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, handle_onu_sn),
                CallbackQueryHandler(start_over, pattern="^start_over$"),
                # CallbackQueryHandler(ask_onu_sn, pattern="^cek_onu_menu$"),
            ],
        },
        fallbacks=[CommandHandler("cancel", cancel), CallbackQueryHandler(start_over, pattern="^start_over$")],
    )

    application.add_handler(conv_handler)

    # Run the bot
    logger.info("Starting bot polling...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)

if __name__ == "__main__":
    main()