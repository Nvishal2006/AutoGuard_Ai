import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os

# Ensure directory exists
os.makedirs('backend/ml', exist_ok=True)

def generate_synthetic_data(n_samples=1000):
    np.random.seed(42)
    data = {
        'brake_wear': np.random.uniform(0, 100, n_samples),
        'tyre_pressure_variance': np.random.uniform(0, 10, n_samples),
        'engine_temp': np.random.uniform(60, 120, n_samples),
        'vibration_level': np.random.uniform(0, 5, n_samples),
        'mileage': np.random.uniform(0, 100000, n_samples)
    }
    df = pd.DataFrame(data)
    
    # Logic for target variable: Higher wear/temp/vibration -> Higher failure risk
    df['failure_within_30_days'] = (
        (df['brake_wear'] > 80) | 
        (df['engine_temp'] > 110) | 
        (df['vibration_level'] > 4) |
        ((df['mileage'] > 80000) & (df['brake_wear'] > 60))
    ).astype(int)
    
    # Add some noise
    noise_indices = np.random.choice(n_samples, int(n_samples * 0.05), replace=False)
    df.loc[noise_indices, 'failure_within_30_days'] = 1 - df.loc[noise_indices, 'failure_within_30_days']
    
    return df

def train_model():
    print("Generating synthetic data...")
    df = generate_synthetic_data()
    
    X = df.drop('failure_within_30_days', axis=1)
    y = df['failure_within_30_days']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training RandomForest model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    print(f"Model Accuracy: {accuracy_score(y_test, y_pred):.2f}")
    
    model_path = 'backend/ml/predictive_maintenance_model.pkl'
    joblib.dump(model, model_path)
    print(f"Model saved to {model_path}")

if __name__ == "__main__":
    train_model()
