#!/usr/bin/env python3
"""
Credit Scoring Dataset Generator
Generates synthetic credit scoring data for ML model training
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

def generate_credit_dataset(n_samples=10000, random_state=42):
    """Generate synthetic credit scoring dataset"""
    np.random.seed(random_state)
    random.seed(random_state)
    
    print(f"Generating {n_samples} synthetic credit records...")
    
    # Generate basic demographics
    data = {
        'age': np.random.normal(40, 12, n_samples).astype(int),
        'income': np.random.lognormal(10.5, 0.8, n_samples).astype(int),
        'employment_length': np.random.exponential(5, n_samples),
        'debt_to_income': np.random.beta(2, 5, n_samples),
        'credit_history_length': np.random.gamma(2, 3, n_samples),
        'num_credit_accounts': np.random.poisson(4, n_samples),
        'num_delinquencies': np.random.poisson(0.5, n_samples),
        'credit_utilization': np.random.beta(2, 3, n_samples),
        'loan_amount': np.random.lognormal(9, 0.7, n_samples).astype(int),
    }
    
    # Clip values to realistic ranges
    data['age'] = np.clip(data['age'], 18, 80)
    data['income'] = np.clip(data['income'], 20000, 500000)
    data['employment_length'] = np.clip(data['employment_length'], 0, 40)
    data['debt_to_income'] = np.clip(data['debt_to_income'], 0, 1)
    data['credit_history_length'] = np.clip(data['credit_history_length'], 0, 50)
    data['num_credit_accounts'] = np.clip(data['num_credit_accounts'], 0, 20)
    data['num_delinquencies'] = np.clip(data['num_delinquencies'], 0, 10)
    data['credit_utilization'] = np.clip(data['credit_utilization'], 0, 1)
    data['loan_amount'] = np.clip(data['loan_amount'], 1000, 100000)
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Generate credit score based on features (realistic scoring logic)
    credit_score = (
        (df['income'] / 1000) * 0.3 +
        (50 - df['age']) * 0.1 +
        df['employment_length'] * 2 +
        (1 - df['debt_to_income']) * 100 +
        df['credit_history_length'] * 3 +
        df['num_credit_accounts'] * 5 +
        (10 - df['num_delinquencies']) * 10 +
        (1 - df['credit_utilization']) * 50 +
        np.random.normal(0, 20, n_samples)  # Add some noise
    )
    
    # Normalize to 300-850 range
    credit_score = 300 + (credit_score - credit_score.min()) / (credit_score.max() - credit_score.min()) * 550
    df['credit_score'] = credit_score.astype(int)
    
    # Generate default probability and binary target
    default_prob = 1 / (1 + np.exp((df['credit_score'] - 600) / 50))  # Sigmoid function
    df['default_risk'] = (np.random.random(n_samples) < default_prob).astype(int)
    
    # Add categorical features
    df['loan_purpose'] = np.random.choice(['home', 'auto', 'personal', 'business', 'education'], n_samples)
    df['employment_type'] = np.random.choice(['full_time', 'part_time', 'self_employed', 'unemployed'], n_samples)
    df['home_ownership'] = np.random.choice(['own', 'rent', 'mortgage'], n_samples)
    
    return df

def main():
    """Generate and save the dataset"""
    print("🏦 Credit Scoring Dataset Generator")
    print("=" * 40)
    
    # Generate dataset
    df = generate_credit_dataset(n_samples=10000)
    
    # Display basic statistics
    print(f"\n📊 Dataset Statistics:")
    print(f"Total records: {len(df)}")
    print(f"Features: {len(df.columns)}")
    print(f"Default rate: {df['default_risk'].mean():.2%}")
    print(f"Average credit score: {df['credit_score'].mean():.0f}")
    
    # Save to CSV
    output_file = 'credit_dataset.csv'
    df.to_csv(output_file, index=False)
    print(f"\n✅ Dataset saved to: {output_file}")
    
    # Display sample data
    print(f"\n📋 Sample Data:")
    print(df.head())
    
    print(f"\n🎯 Target Distribution:")
    print(df['default_risk'].value_counts())

if __name__ == "__main__":
    main()