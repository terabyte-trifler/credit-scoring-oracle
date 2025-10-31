#!/usr/bin/env python3
"""
Credit Scoring Model Training
Trains ML models for credit risk prediction
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import joblib
import os

def load_and_preprocess_data(file_path='credit_dataset.csv'):
    """Load and preprocess the credit dataset"""
    print(f"📂 Loading data from {file_path}...")
    
    if not os.path.exists(file_path):
        print(f"❌ Dataset not found. Please run generate_dataset.py first.")
        return None, None, None, None
    
    df = pd.read_csv(file_path)
    print(f"✅ Loaded {len(df)} records with {len(df.columns)} features")
    
    # Separate features and target
    target_col = 'default_risk'
    feature_cols = [col for col in df.columns if col != target_col]
    
    X = df[feature_cols].copy()
    y = df[target_col].copy()
    
    # Encode categorical variables
    categorical_cols = ['loan_purpose', 'employment_type', 'home_ownership']
    label_encoders = {}
    
    for col in categorical_cols:
        if col in X.columns:
            le = LabelEncoder()
            X[col] = le.fit_transform(X[col])
            label_encoders[col] = le
    
    print(f"🔧 Preprocessed features: {list(X.columns)}")
    return X, y, feature_cols, label_encoders

def train_models(X, y):
    """Train multiple ML models and compare performance"""
    print("\n🤖 Training ML Models...")
    print("=" * 40)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale features for logistic regression
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Define models
    models = {
        'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
        'Gradient Boosting': GradientBoostingClassifier(n_estimators=100, random_state=42),
        'Logistic Regression': LogisticRegression(random_state=42, max_iter=1000)
    }
    
    results = {}
    
    for name, model in models.items():
        print(f"\n🔄 Training {name}...")
        
        # Use scaled data for logistic regression
        if name == 'Logistic Regression':
            model.fit(X_train_scaled, y_train)
            y_pred = model.predict(X_test_scaled)
            y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
        else:
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            y_pred_proba = model.predict_proba(X_test)[:, 1]
        
        # Calculate metrics
        auc_score = roc_auc_score(y_test, y_pred_proba)
        
        # Cross-validation score
        if name == 'Logistic Regression':
            cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5, scoring='roc_auc')
        else:
            cv_scores = cross_val_score(model, X_train, y_train, cv=5, scoring='roc_auc')
        
        results[name] = {
            'model': model,
            'auc_score': auc_score,
            'cv_mean': cv_scores.mean(),
            'cv_std': cv_scores.std(),
            'predictions': y_pred,
            'probabilities': y_pred_proba
        }
        
        print(f"✅ {name} - AUC: {auc_score:.4f}, CV: {cv_scores.mean():.4f} (±{cv_scores.std():.4f})")
    
    # Find best model
    best_model_name = max(results.keys(), key=lambda k: results[k]['auc_score'])
    best_model = results[best_model_name]['model']
    
    print(f"\n🏆 Best Model: {best_model_name}")
    print(f"🎯 Best AUC Score: {results[best_model_name]['auc_score']:.4f}")
    
    # Detailed evaluation of best model
    print(f"\n📊 Detailed Evaluation - {best_model_name}:")
    print("=" * 50)
    
    best_predictions = results[best_model_name]['predictions']
    print("\nClassification Report:")
    print(classification_report(y_test, best_predictions))
    
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, best_predictions))
    
    # Feature importance (for tree-based models)
    if hasattr(best_model, 'feature_importances_'):
        feature_importance = pd.DataFrame({
            'feature': X.columns,
            'importance': best_model.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print(f"\n🔍 Top 10 Feature Importances:")
        print(feature_importance.head(10))
    
    return best_model, scaler, results, (X_test, y_test)

def save_model(model, scaler, label_encoders, model_name='best_credit_model'):
    """Save the trained model and preprocessing objects"""
    print(f"\n💾 Saving model as {model_name}...")
    
    # Create models directory
    os.makedirs('models', exist_ok=True)
    
    # Save model
    joblib.dump(model, f'models/{model_name}.pkl')
    joblib.dump(scaler, f'models/{model_name}_scaler.pkl')
    joblib.dump(label_encoders, f'models/{model_name}_encoders.pkl')
    
    print(f"✅ Model saved to models/{model_name}.pkl")
    print(f"✅ Scaler saved to models/{model_name}_scaler.pkl")
    print(f"✅ Encoders saved to models/{model_name}_encoders.pkl")

def main():
    """Main training pipeline"""
    print("🏦 Credit Scoring Model Training")
    print("=" * 40)
    
    # Load and preprocess data
    X, y, feature_cols, label_encoders = load_and_preprocess_data()
    
    if X is None:
        return
    
    print(f"\n📈 Dataset Overview:")
    print(f"Features: {len(X.columns)}")
    print(f"Samples: {len(X)}")
    print(f"Default rate: {y.mean():.2%}")
    
    # Train models
    best_model, scaler, results, test_data = train_models(X, y)
    
    # Save the best model
    save_model(best_model, scaler, label_encoders)
    
    print(f"\n🎉 Training completed successfully!")
    print(f"📁 Model files saved in 'models/' directory")

if __name__ == "__main__":
    main()