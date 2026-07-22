import joblib
import pandas as pd
import os
import random
from .base_agent import BaseAgent
from schemas import TelematicsData, AnalysisResult, ComponentRisk
from datetime import datetime, timedelta

class AnalysisAgent(BaseAgent):
    def __init__(self):
        super().__init__("AnalysisAgent")
        # Get absolute path to backend directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        backend_dir = os.path.dirname(current_dir)
        self.model_path = os.path.join(backend_dir, 'ml', 'predictive_maintenance_model.pkl')
        self.model = None
        self.load_model()

    def load_model(self):
        if os.path.exists(self.model_path):
            try:
                self.model = joblib.load(self.model_path)
            except Exception as e:
                print(f"Warning: Failed to load model due to {e}. Running in Mock Mode.")
                self.model = None
        else:
            print(f"Warning: Model not found at {self.model_path}")

    def process(self, telematics_data: dict) -> AnalysisResult:
        # Validate data with schema
        try:
            data = TelematicsData(**telematics_data)
        except Exception as e:
            print(f"Schema validation error: {e}")
            # Fallback for now or raise
            return None

        # Prepare data for inference
        features = ['brake_wear', 'tyre_pressure_variance', 'engine_temp', 'vibration_level', 'mileage']
        df = pd.DataFrame([telematics_data])
        
        # Ensure all features exist
        for feature in features:
            if feature not in df.columns:
                df[feature] = 0
        
        X = df[features]
        
        # Predict probability
        probability = 0.5 # Default
        if self.model:
            try:
                probability = self.model.predict_proba(X)[0][1]
            except:
                probability = 0.5 
        else:
            # Mock logic if model missing
            if data.engine_temp > 100 or data.brake_wear > 80:
                probability = 0.85
            elif data.vibration_level > 2:
                probability = 0.6
            else:
                probability = 0.1

        # Calculate Component Risks (Rule-based for granular insight)
        risks = []
        anomalies = []
        
        # Brake System
        brake_risk = data.brake_wear
        risks.append(ComponentRisk(component="Braking System", risk_score=brake_risk, status=self._get_status(brake_risk)))
        if brake_risk > 70: anomalies.append("High Brake Wear")

        # Engine
        engine_risk = (data.engine_temp / 130) * 100 # Normalize to ~100 max
        risks.append(ComponentRisk(component="Engine", risk_score=engine_risk, status=self._get_status(engine_risk)))
        if data.engine_temp > 105: anomalies.append("Engine Overheating")

        # Tyres
        tyre_risk = data.tyre_pressure_variance * 10
        risks.append(ComponentRisk(component="Tyres", risk_score=tyre_risk, status=self._get_status(tyre_risk)))
        if data.tyre_pressure_variance > 5: anomalies.append("Tyre Pressure Imbalance")

        # RUL Calculation (Mock)
        # RUL roughly inversely proportional to probability
        rul_days = int(max(0, 365 * (1 - probability)))
        predicted_date = (datetime.now() + timedelta(days=rul_days)).strftime("%Y-%m-%d")

        return AnalysisResult(
            failure_probability=float(probability),
            predicted_failure_date=predicted_date,
            remaining_useful_life=rul_days,
            component_risks=risks,
            anomalies_detected=anomalies
        )

    def _get_status(self, score):
        if score > 80: return "Critical"
        if score > 60: return "High Risk"
        if score > 40: return "Low Risk"
        return "Normal"
