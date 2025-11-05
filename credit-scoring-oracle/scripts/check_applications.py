#!/usr/bin/env python3

import os
from web3 import Web3
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Configuration
RPC_URL = "https://dream-rpc.somnia.network"
CONTRACT_ADDRESS = "0x37feb802a7babd7dac29e5749ac3956b8e259d91"

# Contract ABI (minimal for testing)
CONTRACT_ABI = [
    {
        "inputs": [{"name": "_user", "type": "address"}],
        "name": "getUserApplications",
        "outputs": [{"name": "", "type": "uint256[]"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"name": "_applicationId", "type": "uint256"}],
        "name": "getApplication", 
        "outputs": [
            {"name": "applicant", "type": "address"},
            {"name": "loanAmount", "type": "uint256"},
            {"name": "creditScore", "type": "uint256"},
            {"name": "riskScore", "type": "uint256"},
            {"name": "purpose", "type": "uint8"},
            {"name": "status", "type": "uint8"},
            {"name": "timestamp", "type": "uint256"},
            {"name": "interestRate", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

def main():
    # Connect to blockchain
    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    
    if not w3.is_connected():
        print("❌ Failed to connect to Somnia network")
        return
    
    print("✅ Connected to Somnia network")
    
    # Get contract
    contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)
    
    # Replace with your wallet address
    user_address = input("Enter your wallet address: ").strip()
    
    try:
        # Get user applications
        app_ids = contract.functions.getUserApplications(user_address).call()
        print(f"\n📋 Found {len(app_ids)} applications for {user_address}")
        
        for i, app_id in enumerate(app_ids):
            print(f"\n--- Application {i+1} (ID: {app_id}) ---")
            
            # Get application details
            app = contract.functions.getApplication(app_id).call()
            
            print(f"Applicant: {app[0]}")
            print(f"Loan Amount: {app[1]} wei")
            print(f"Credit Score: {app[2]}")
            print(f"Risk Score: {app[3]}")
            print(f"Purpose: {app[4]}")
            print(f"Status: {app[5]} (0=Pending, 1=Approved, 2=Rejected)")
            print(f"Timestamp: {app[6]}")
            print(f"Interest Rate: {app[7]}")
            
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    main()