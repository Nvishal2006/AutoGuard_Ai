from pydantic import BaseModel
from typing import List, Optional, Dict

class TelematicsData(BaseModel):
    brake_wear: float
    tyre_pressure_variance: float
    engine_temp: float
    vibration_level: float
    mileage: float
    oil_level: Optional[str] = "Normal"
    battery_health: Optional[str] = "Good"

class ComponentRisk(BaseModel):
    component: str
    risk_score: float # 0-100
    status: str # "Normal", "Low Risk", "High Risk", "Critical"

class AnalysisResult(BaseModel):
    failure_probability: float # 0-1
    predicted_failure_date: Optional[str]
    remaining_useful_life: int # in days or miles
    component_risks: List[ComponentRisk]
    anomalies_detected: List[str]

class DiagnosisResult(BaseModel):
    severity: str # "Low", "Medium", "High", "Critical"
    root_cause_analysis: str
    recommended_action: str
    estimated_repair_time: str
    required_parts: List[str]
    suc_score: float # System Utility Case score or similar
    analysis_data: AnalysisResult

class EngagementPlan(BaseModel):
    alert_message: str
    voice_script: str
    recommended_slots: List[str]
    diagnosis_data: DiagnosisResult

class BookingRequest(BaseModel):
    vehicle_id: str
    service_type: str
    preferred_time: Optional[str]
    customer_id: str
    
class AgentMessage(BaseModel):
    sender: str
    receiver: str
    message_type: str
    payload: Dict
