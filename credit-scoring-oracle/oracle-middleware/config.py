# config.py
import os
from dotenv import load_dotenv

load_dotenv('../.env')

# Somnia Network Configuration
SOMNIA_RPC_URL = os.getenv('SOMNIA_TESTNET_RPC_URL', 'https://dream-rpc.somnia.network')
CHAIN_ID = 50312

# Contract Configuration
CONTRACT_ADDRESS = '0x37feb802a7babd7dac29e5749ac3956b8e259d91'  # Updated to deployed contract
ORACLE_PRIVATE_KEY = os.getenv('PRIVATE_KEY')

# ML API Configuration
ML_API_URL = os.getenv('ML_API_URL', 'http://localhost:8000')
ML_API_ENDPOINT = f'{ML_API_URL}/api/v1/credit-score'

# Oracle Configuration
POLL_INTERVAL = 5  # Check for new events every 5 seconds
GAS_LIMIT = 500000
MAX_FEE_PER_GAS = 2000000000  # 2 gwei
MAX_PRIORITY_FEE_PER_GAS = 1000000000  # 1 gwei

# Logging
LOG_LEVEL = 'INFO'
