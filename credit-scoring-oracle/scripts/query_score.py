#!/usr/bin/env python3
"""
Query credit scores from the smart contract
Usage: python3 query_score.py <wallet_address>
"""

import sys
import os
from datetime import datetime
from web3 import Web3
from dotenv import load_dotenv

# Load environment
load_dotenv('../.env')

def query_credit_score(wallet_address):
    """Query credit score for a wallet address"""
    
    # Configuration
    rpc_url = os.getenv('SOMNIA_TESTNET_RPC_URL', 'https://dream-rpc.somnia.network')
    contract_address = os.getenv('CONTRACT_ADDRESS')
    
    if not contract_address:
        print("❌ CONTRACT_ADDRESS not set in .env")
        print("\n💡 Fix: Add CONTRACT_ADDRESS=0x... to your .env file")
        return
    
    # Connect to Somnia
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    
    if not w3.is_connected():
        print("❌ Cannot connect to Somnia RPC")
        print(f"   RPC URL: {rpc_url}")
        return
    
    # Contract ABI for your deployed CreditScoringOracle
    contract_abi = [
        {
            "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
            "name": "getUserApplications",
            "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"internalType": "uint256", "name": "_applicationId", "type": "uint256"}],
            "name": "getApplication",
            "outputs": [
                {"internalType": "address", "name": "applicant", "type": "address"},
                {"internalType": "uint256", "name": "loanAmount", "type": "uint256"},
                {"internalType": "uint256", "name": "creditScore", "type": "uint256"},
                {"internalType": "uint256", "name": "riskScore", "type": "uint256"},
                {"internalType": "uint8", "name": "purpose", "type": "uint8"},
                {"internalType": "uint8", "name": "status", "type": "uint8"},
                {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
                {"internalType": "uint256", "name": "interestRate", "type": "uint256"}
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]
    
    # Create contract instance
    contract = w3.eth.contract(address=contract_address, abi=contract_abi)
    
    # Get user's applications (FREE - no gas needed!)
    try:
        print(f"\n⏳ Querying applications from Somnia blockchain...")
        application_ids = contract.functions.getUserApplications(wallet_address).call()
        
        if not application_ids:
            print("\n" + "="*55)
            print(f"        📊 CREDIT APPLICATION RESULTS")
            print("="*55)
            print(f"Wallet:       {wallet_address}")
            print(f"Applications: No applications found")
            print("="*55 + "\n")
            return None
        
        print(f"\n✅ Found {len(application_ids)} application(s)")
        
        # Get details for each application
        for i, app_id in enumerate(application_ids):
            app_details = contract.functions.getApplication(app_id).call()
            
            applicant = app_details[0]
            loan_amount = app_details[1]
            credit_score = app_details[2]
            risk_score = app_details[3]
            purpose = app_details[4]
            status = app_details[5]
            timestamp = app_details[6]
            interest_rate = app_details[7]
            
            # Print results
            print("\n" + "="*55)
            print(f"        📊 APPLICATION #{app_id} RESULTS")
            print("="*55)
            print(f"Applicant:    {applicant}")
            print(f"Loan Amount:  ${loan_amount:,}")
            print(f"Credit Score: {credit_score} / 850")
            print(f"Risk Score:   {risk_score} / 100")
            
            # Status mapping
            status_names = ["Pending", "Approved", "Rejected", "Funded", "Repaid", "Defaulted"]
            status_name = status_names[status] if status < len(status_names) else "Unknown"
            print(f"Status:       {status_name}")
            
            # Purpose mapping
            purpose_names = ["Personal", "Home", "Auto", "Business", "Education"]
            purpose_name = purpose_names[purpose] if purpose < len(purpose_names) else "Unknown"
            print(f"Purpose:      {purpose_name}")
            
            if interest_rate > 0:
                print(f"Interest:     {interest_rate / 100:.2f}%")
            
            if timestamp > 0:
                app_time = datetime.fromtimestamp(timestamp)
                print(f"Applied:      {app_time.strftime('%Y-%m-%d %H:%M:%S')}")
            
            print("-"*55)
            
            # Risk rating based on credit score
            if credit_score >= 720:
                risk = "Low Risk 🟢"
                description = "Excellent creditworthiness"
            elif credit_score >= 630:
                risk = "Medium Risk 🟡"
                description = "Moderate creditworthiness"
            elif credit_score > 0:
                risk = "High Risk 🔴"
                description = "Poor creditworthiness"
            else:
                risk = "Not Scored ⚪"
                description = "Application not processed yet"
            
            print(f"Risk Rating:  {risk}")
            print(f"Description:  {description}")
            print("="*55 + "\n")
        
        return {
            'applications': len(application_ids),
            'latest_score': credit_score if application_ids else 0,
            'latest_risk': risk_score if application_ids else 0
        }
        
    except Exception as e:
        print(f"\n❌ Error querying score: {e}")
        print("\n💡 Possible fixes:")
        print("   1. Make sure CONTRACT_ADDRESS is correct in .env")
        print("   2. Check that contract is deployed to Somnia")
        print("   3. Verify wallet address format is valid")
        return None

def main():
    print("\n🔍 Somnia Credit Score Query Tool")
    print("="*55)
    
    if len(sys.argv) < 2:
        print("\n❌ Error: Wallet address required")
        print("\nUsage: python3 query_score.py <wallet_address>")
        print("\nExample:")
        print("  python3 query_score.py 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb")
        print("\nNote: This is a FREE query (no gas required!)")
        sys.exit(1)
    
    wallet_address = sys.argv[1]
    
    # Validate address format
    if not wallet_address.startswith('0x') or len(wallet_address) != 42:
        print("\n❌ Invalid wallet address format")
        print("   Must be 42 characters starting with 0x")
        print("\nExample: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb")
        sys.exit(1)
    
    query_credit_score(wallet_address)

if __name__ == '__main__':
    main()