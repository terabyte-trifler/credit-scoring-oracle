#!/usr/bin/env python3
"""
Credit Scoring API
Flask API for credit risk prediction
"""

from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np
import os
from datetime import datetime

app = Flask(__name__)

# Global variables for model and preprocessing objects
model = None
scaler = None
label_encoders = None

def load_model():
    """Load the trained model and preprocessing objects"""
    global model, scaler, label_encoders
    
    model_path = 'models/best_credit_model.pkl'
    scaler_path = 'models/best_credit_model_scaler.pkl'
    encoders_path = 'models/best_credit_model_encoders.pkl'
    
    if not all(os.path.exists(path) for path in [model_path, scaler_path, encoders_path]):
        print("❌ Model files not found. Please train the model first.")
        return False
    
    try:
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        label_encoders = joblib.load(encoders_path)
        print("✅ Model loaded successfully")
        return True
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return False

def preprocess_input(data):
    """Preprocess input data for prediction"""
    try:
        # Create DataFrame from input
        df = pd.DataFrame([data])
        
        # Encode categorical variables
        categorical_cols = ['loan_purpose', 'employment_type', 'home_ownership']
        for col in categorical_cols:
            if col in df.columns and col in label_encoders:
                # Handle unknown categories
                try:
                    df[col] = label_encoders[col].transform(df[col])
                except ValueError:
                    # Use most frequent category for unknown values
                    df[col] = 0
        
        # Ensure all required columns are present
        required_cols = [
            'age', 'income', 'employment_length', 'debt_to_income',
            'credit_history_length', 'num_credit_accounts', 'num_delinquencies',
            'credit_utilization', 'loan_amount', 'credit_score',
            'loan_purpose', 'employment_type', 'home_ownership'
        ]
        
        # Check for missing required fields
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            raise ValueError(f"Missing required fields: {missing_cols}")
        
        # Set reasonable defaults only for optional fields
        for col in required_cols:
            if col not in df.columns:
                if col in ['age', 'income', 'credit_score']:
                    raise ValueError(f"Required field '{col}' is missing")
                else:
                    df[col] = 0  # Default for optional fields
        
        # Reorder columns to match training data
        df = df[required_cols]
        
        return df
    except Exception as e:
        raise ValueError(f"Error preprocessing data: {e}")

@app.route('/', methods=['GET'])
def home():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Credit Scoring API',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Predict credit risk for a given application"""
    try:
        # Check if model is loaded
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        # Get input data
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No input data provided'}), 400
        
        # Preprocess input
        processed_data = preprocess_input(data)
        
        # Make prediction
        prediction_proba = model.predict_proba(processed_data)[0]
        prediction = model.predict(processed_data)[0]
        
        # Calculate risk score (0-100)
        risk_score = int(prediction_proba[1] * 100)
        
        # Determine risk category
        if risk_score < 20:
            risk_category = 'Low Risk'
        elif risk_score < 50:
            risk_category = 'Medium Risk'
        else:
            risk_category = 'High Risk'
        
        return jsonify({
            'prediction': int(prediction),
            'risk_score': risk_score,
            'risk_category': risk_category,
            'probability': {
                'no_default': float(prediction_proba[0]),
                'default': float(prediction_proba[1])
            },
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/batch_predict', methods=['POST'])
def batch_predict():
    """Predict credit risk for multiple applications"""
    try:
        # Check if model is loaded
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500
        
        # Get input data
        data = request.get_json()
        if not data or 'applications' not in data:
            return jsonify({'error': 'No applications data provided'}), 400
        
        applications = data['applications']
        results = []
        
        for i, app_data in enumerate(applications):
            try:
                # Preprocess input
                processed_data = preprocess_input(app_data)
                
                # Make prediction
                prediction_proba = model.predict_proba(processed_data)[0]
                prediction = model.predict(processed_data)[0]
                
                # Calculate risk score
                risk_score = int(prediction_proba[1] * 100)
                
                # Determine risk category
                if risk_score < 20:
                    risk_category = 'Low Risk'
                elif risk_score < 50:
                    risk_category = 'Medium Risk'
                else:
                    risk_category = 'High Risk'
                
                results.append({
                    'application_id': i,
                    'prediction': int(prediction),
                    'risk_score': risk_score,
                    'risk_category': risk_category,
                    'probability': {
                        'no_default': float(prediction_proba[0]),
                        'default': float(prediction_proba[1])
                    }
                })
                
            except Exception as e:
                results.append({
                    'application_id': i,
                    'error': str(e)
                })
        
        return jsonify({
            'results': results,
            'total_applications': len(applications),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 400

@app.route('/model_info', methods=['GET'])
def model_info():
    """Get information about the loaded model"""
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    
    return jsonify({
        'model_type': type(model).__name__,
        'features': [
            'age', 'income', 'employment_length', 'debt_to_income',
            'credit_history_length', 'num_credit_accounts', 'num_delinquencies',
            'credit_utilization', 'loan_amount', 'credit_score',
            'loan_purpose', 'employment_type', 'home_ownership'
        ],
        'categorical_features': list(label_encoders.keys()) if label_encoders else [],
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🏦 Starting Credit Scoring API...")
    
    # Load model on startup
    if load_model():
        print("🚀 API ready to serve predictions!")
        app.run(debug=True, host='0.0.0.0', port=8001)
    else:
        print("❌ Failed to load model. Please train the model first.")