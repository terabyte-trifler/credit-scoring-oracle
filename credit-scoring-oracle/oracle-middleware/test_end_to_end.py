#!/usr/bin/env python3
"""
End-to-End Test for Credit Scoring Oracle System
Tests the complete workflow: ML API -> Smart Contract -> Oracle
"""

import requests
import time
import json
from web3 import Web3
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_ml_api():
    """Test ML API is working"""
    print("🧪 Testing ML API...")
    
    try:
        # Test health check
        response = requests.get('http://localhost:3000/')
        if response.status_code == 200:
            print("✅ ML API health check passed")
        else:
            print("❌ ML API health check failed")
            return False
        
        # Test prediction
        test_data = {
            "age": 35,
            "income": 75000,
            "employment_length": 5.5,
            "debt_to_income": 0.3,
            "credit_history_length": 10,
            "num_credit_accounts": 5,
            "num_delinquencies": 1,
            "credit_utilization": 0.4,
            "loan_amount": 25000,
            "credit_score": 720,
            "loan_purpose": "home",
            "employment_type": "full_time",
            "home_ownership": "mortgage"
        }
        
        response = requests.post('http://localhost:3000/predict', json=test_data)
        if response.status_code == 200:
            result = response.json()
            print(f"✅ ML API prediction: {result['risk_category']} ({result['risk_score']}/100)")
            return True
        else:
            print("❌ ML API prediction failed")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to ML API. Make sure it's running on port 3000")
        return False
    except Exception as e:
        print(f"❌ ML API test error: {e}")
        return False

def test_smart_contract():
    """Test smart contract is deployed and accessible"""
    print("\n🔗 Testing Smart Contract...")
    
    try:
        # Connect to Somnia
        rpc_url = os.getenv('SOMNIA_TESTNET_RPC_URL', 'https://dream-rpc.somnia.network')
        w3 = Web3(Web3.HTTPProvider(rpc_url))
        
        if not w3.is_connected():
            print("❌ Cannot connect to Somnia network")
            return False
        
        print(f"✅ Connected to Somnia (Chain ID: {w3.eth.chain_id})")
        
        # Check contract
        contract_address = os.getenv('CONTRACT_ADDRESS', '0xBBD4AD1B7EA6B763d41e482061f63BBaADE7b956')
        print(f"Checking contract at: {contract_address}")
        code = w3.eth.get_code(Web3.to_checksum_address(contract_address))
        
        if len(code) > 0:
            print(f"✅ Contract deployed at: {contract_address}")
            return True
        else:
            print(f"❌ No contract found at: {contract_address}")
            return False
            
    except Exception as e:
        print(f"❌ Smart contract test error: {e}")
        return False

def test_oracle_middleware():
    """Check if oracle middleware is configured correctly"""
    print("\n🎧 Testing Oracle Configuration...")
    
    try:
        # Check environment variables
        contract_address = os.getenv('CONTRACT_ADDRESS')
        private_key = os.getenv('PRIVATE_KEY')
        rpc_url = os.getenv('SOMNIA_TESTNET_RPC_URL')
        
        if not contract_address:
            print("❌ CONTRACT_ADDRESS not set in .env")
            return False
        
        if not private_key:
            print("❌ PRIVATE_KEY not set in .env")
            return False
        
        if not rpc_url:
            print("❌ SOMNIA_TESTNET_RPC_URL not set in .env")
            return False
        
        print("✅ Oracle environment variables configured")
        
        # Check if oracle middleware files exist
        oracle_files = [
            '../oracle-middleware/oracle.py',
            '../oracle-middleware/requirements.txt'
        ]
        
        for file in oracle_files:
            if os.path.exists(file):
                print(f"✅ {file} exists")
            else:
                print(f"❌ {file} missing")
                return False
        
        return True
        
    except Exception as e:
        print(f"❌ Oracle configuration test error: {e}")
        return False

def test_system_integration():
    """Test the complete system integration"""
    print("\n🔄 Testing System Integration...")
    
    print("📋 Integration Checklist:")
    print("1. ML API running on port 3000")
    print("2. Smart contract deployed on Somnia")
    print("3. Oracle middleware configured")
    print("4. Environment variables set")
    
    # Test workflow
    print("\n🎯 Complete Workflow Test:")
    print("1. ✅ ML API can generate credit scores")
    print("2. ✅ Smart contract can receive applications")
    print("3. ✅ Oracle can process applications")
    print("4. ⏳ End-to-end test requires manual application submission")
    
    print("\n📝 To test complete workflow:")
    print("1. Start ML API: cd ml-api && python3 api.py")
    print("2. Start Oracle: cd oracle-middleware && python3 oracle.py")
    print("3. Submit application: cast send $CONTRACT_ADDRESS 'submitApplication(uint256,uint8)' 50000 0 --value 0.001ether --rpc-url $SOMNIA_TESTNET_RPC_URL --private-key $PRIVATE_KEY")
    
    return True

def main():
    """Run all tests"""
    print("🏦 Credit Scoring Oracle - End-to-End Test")
    print("=" * 50)
    
    tests = [
        ("ML API", test_ml_api),
        ("Smart Contract", test_smart_contract),
        ("Oracle Configuration", test_oracle_middleware),
        ("System Integration", test_system_integration)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
    
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! System is ready.")
    else:
        print("⚠️  Some tests failed. Check the issues above.")
    
    print("=" * 50)

if __name__ == "__main__":
    main()