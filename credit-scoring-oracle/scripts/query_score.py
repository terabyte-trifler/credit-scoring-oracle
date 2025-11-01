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
    
    # Contract ABI (just the function we need)
    contract_abi = [{
        "inputs": [{"internalType": "address", "name": "_wallet", "type": "address"}],
        "name": "getCreditScore",
        "outputs": [
            {"internalType": "uint256", "name": "score", "type": "uint256"},
            {"internalType": "uint256", "name": "confidence", "type": "uint256"},
            {"internalType": "uint256", "name": "lastUpdate", "type": "uint256"},
            {"internalType": "uint256", "name": "requestCount", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    }]
    
    # Create contract instance
    contract = w3.eth.contract(address=contract_address, abi=contract_abi)
    
    # Call the function (FREE - no gas needed!)
    try:
        print(f"\n⏳ Querying score from Somnia blockchain...")
        result = contract.functions.getCreditScore(wallet_address).call()
        
        score = result[0]
        confidence = result[1]
        last_update = result[2]
        request_count = result[3]
        
        # Print results
        print("\n" + "="*55)
        print(f"        📊 CREDIT SCORE QUERY RESULTS")
        print("="*55)
        print(f"Wallet:       {wallet_address}")
        print(f"Score:        {score} / 850")
        print(f"Confidence:   {confidence}%")
        
        if last_update > 0:
            update_time = datetime.fromtimestamp(last_update)
            print(f"Last Update:  {update_time.strftime('%Y-%m-%d %H:%M:%S')}")
        else:
            print(f"Last Update:  Never (no score yet)")
        
        print(f"Requests:     {request_count} times")
        print("-"*55)
        
        # Risk rating
        if score >= 720:
            risk = "Low Risk 🟢"
            description = "Excellent creditworthiness"
        elif score >= 630:
            risk = "Medium Risk 🟡"
            description = "Moderate creditworthiness"
        else:
            risk = "High Risk 🔴"
            description = "Poor creditworthiness"
        
        print(f"Risk Rating:  {risk}")
        print(f"Description:  {description}")
        print("="*55 + "\n")
        
        return {
            'score': score,
            'confidence': confidence,
            'last_update': last_update,
            'request_count': request_count
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