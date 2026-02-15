from .base_agent import BaseAgent
from schemas import AnalysisResult, DiagnosisResult

class DiagnosisAgent(BaseAgent):
    def __init__(self):
        super().__init__("DiagnosisAgent")

    def process(self, analysis_result: AnalysisResult) -> DiagnosisResult:
        # Determine Severity
        prob = analysis_result.failure_probability
        severity = "Normal"
        if prob > 0.8: severity = "Critical"
        elif prob > 0.5: severity = "High"
        elif prob > 0.3: severity = "Medium"
        elif prob > 0.1: severity = "Low"

        # RCA Generation
        rca_text = "No significant issues detected."
        recommended_action = "Routine maintenance only."
        repair_time = "0 hours"
        parts = []

        if analysis_result.anomalies_detected:
            rca_text = f"Detected anomalies: {', '.join(analysis_result.anomalies_detected)}. "
            if "Brake" in rca_text:
                rca_text += "Possible brake pad wear or hydraulics failure."
                recommended_action = "Inspect brake pads and fluid lines immediately."
                repair_time = "2-4 hours"
                parts = ["Brake Pads", "Brake Fluid"]
            elif "Engine" in rca_text:
                rca_text += "Engine is running hotter than expected."
                recommended_action = "Check coolant levels and radiator functionality."
                repair_time = "1-2 hours"
                parts = ["Coolant", "Thermostat"]
            elif "Tyre" in rca_text:
                rca_text += "Uneven tyre pressure detected."
                recommended_action = "Inspect tyres for punctures or leaks."
                repair_time = "0.5 hours"
                
        # Calculate SUC Score based on failure probability
        # Higher probability = Lower SUC? Or assumes Risk Score. 
        # Let's assume SUC is a risk score 0-100 here based on the dashboard usage.
        # Dashboard shows "SUC: {score}" and colors it. 
        # If it's risk, Prob * 100 makes sense.
        suc_score = prob * 100

        return DiagnosisResult(
            severity=severity,
            root_cause_analysis=rca_text,
            recommended_action=recommended_action,
            estimated_repair_time=repair_time,
            required_parts=parts,
            suc_score=suc_score,
            analysis_data=analysis_result
        )
