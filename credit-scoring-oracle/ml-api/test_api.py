#!/usr/bin/env python3
"""
Credit Scoring API Test Suite
Tests the Flask API endpoints
"""

import requests
import json
import time

# API base URL
BASE_URL = 'http://localhost:3000'

def test_health_check():
    """Test the health check endpoint"""
    print("🔍 Testing health check endpoint...")
    try:
        response = requests.get(f'{BASE_URL}/')
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data['status']}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API. Make sure the server is running.")
        return False

def test_single_prediction():
    """Test single credit risk prediction"""
    print("\n🔍 Testing single prediction endpoint...")
    
    # Sample credit application data
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
    
    try:
        response = requests.post(
            f'{BASE_URL}/predict',
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Prediction successful!")
            print(f"   Risk Score: {result['risk_score']}/100")
            print(f"   Risk Category: {result['risk_category']}")
            print(f"   Default Probability: {result['probability']['default']:.3f}")
            return True
        else:
            print(f"❌ Prediction failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error during prediction: {e}")
        return False

def test_batch_prediction():
    """Test batch credit risk prediction"""
    print("\n🔍 Testing batch prediction endpoint...")
    
    # Sample batch data
    batch_data = {
        "applications": [
            {
                "age": 25,
                "income": 45000,
                "employment_length": 2,
                "debt_to_income": 0.5,
                "credit_history_length": 3,
                "num_credit_accounts": 2,
                "num_delinquencies": 0,
                "credit_utilization": 0.8,
                "loan_amount": 15000,
                "credit_score": 650,
                "loan_purpose": "auto",
                "employment_type": "full_time",
                "home_ownership": "rent"
            },
            {
                "age": 45,
                "income": 95000,
                "employment_length": 15,
                "debt_to_income": 0.2,
                "credit_history_length": 20,
                "num_credit_accounts": 8,
                "num_delinquencies": 0,
                "credit_utilization": 0.2,
                "loan_amount": 35000,
                "credit_score": 780,
                "loan_purpose": "business",
                "employment_type": "self_employed",
                "home_ownership": "own"
            }
        ]
    }
    
    try:
        response = requests.post(
            f'{BASE_URL}/batch_predict',
            json=batch_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Batch prediction successful!")
            print(f"   Processed {result['total_applications']} applications")
            
            for i, app_result in enumerate(result['results']):
                if 'error' not in app_result:
                    print(f"   App {i}: {app_result['risk_category']} ({app_result['risk_score']}/100)")
                else:
                    print(f"   App {i}: Error - {app_result['error']}")
            return True
        else:
            print(f"❌ Batch prediction failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error during batch prediction: {e}")
        return False

def test_model_info():
    """Test model information endpoint"""
    print("\n🔍 Testing model info endpoint...")
    
    try:
        response = requests.get(f'{BASE_URL}/model_info')
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Model info retrieved!")
            print(f"   Model Type: {result['model_type']}")
            print(f"   Features: {len(result['features'])}")
            print(f"   Categorical Features: {result['categorical_features']}")
            return True
        else:
            print(f"❌ Model info failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error getting model info: {e}")
        return False

def test_error_handling():
    """Test API error handling"""
    print("\n🔍 Testing error handling...")
    
    # Test with invalid data
    invalid_data = {"invalid": "data"}
    
    try:
        response = requests.post(
            f'{BASE_URL}/predict',
            json=invalid_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 400:
            print("✅ Error handling works correctly")
            return True
        else:
            print(f"❌ Expected 400 error, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error during error handling test: {e}")
        return False

def run_performance_test():
    """Run a simple performance test"""
    print("\n🔍 Running performance test...")
    
    test_data = {
        "age": 30,
        "income": 60000,
        "employment_length": 3,
        "debt_to_income": 0.4,
        "credit_history_length": 5,
        "num_credit_accounts": 3,
        "num_delinquencies": 0,
        "credit_utilization": 0.5,
        "loan_amount": 20000,
        "credit_score": 700,
        "loan_purpose": "personal",
        "employment_type": "full_time",
        "home_ownership": "rent"
    }
    
    num_requests = 10
    start_time = time.time()
    successful_requests = 0
    
    for i in range(num_requests):
        try:
            response = requests.post(
                f'{BASE_URL}/predict',
                json=test_data,
                headers={'Content-Type': 'application/json'}
            )
            if response.status_code == 200:
                successful_requests += 1
        except:
            pass
    
    end_time = time.time()
    total_time = end_time - start_time
    avg_time = total_time / num_requests
    
    print(f"✅ Performance test completed!")
    print(f"   Requests: {successful_requests}/{num_requests}")
    print(f"   Total time: {total_time:.2f}s")
    print(f"   Average time per request: {avg_time:.3f}s")
    
    return successful_requests == num_requests

def main():
    """Run all API tests"""
    print("🏦 Credit Scoring API Test Suite")
    print("=" * 40)
    
    tests = [
        ("Health Check", test_health_check),
        ("Single Prediction", test_single_prediction),
        ("Batch Prediction", test_batch_prediction),
        ("Model Info", test_model_info),
        ("Error Handling", test_error_handling),
        ("Performance Test", run_performance_test)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        try:
            if test_func():
                passed += 1
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
    
    print(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed!")
    else:
        print("⚠️  Some tests failed. Check the API server and model.")

if __name__ == "__main__":
    main()