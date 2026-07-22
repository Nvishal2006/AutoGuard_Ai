from .base_agent import BaseAgent
from schemas import DiagnosisResult, EngagementPlan
import datetime

class EngagementAgent(BaseAgent):
    def __init__(self):
        super().__init__("EngagementAgent")

    def process(self, diagnosis_result: DiagnosisResult) -> EngagementPlan:
        severity = diagnosis_result.severity
        rca = diagnosis_result.root_cause_analysis
        action = diagnosis_result.recommended_action
        
        # Craft Message
        alert_msg = f"[{severity.upper()} ALERT] {rca} {action}"
        
        # Craft Voice Script
        voice_script = ""
        if severity == "Critical":
            voice_script = (
                f"Hello. This is your vehicle's AI assistant. I have detected a critical issue with your {rca.split(':')[0] if ':' in rca else 'vehicle'}. "
                f"Evaluation indicates {rca.lower()}. It is unsafe to continue operation without maintenance. "
                f"I have prioritized a service slot for you. Shall I confirm the booking?"
            )
        elif severity == "High":
             voice_script = (
                f"Attention. I have detected a potential failure risk. {rca}. "
                f"I recommend scheduling service within the next 48 hours to prevent breakdown. "
                f"Would you like to see available appointments?"
            )
        elif severity == "Medium":
             voice_script = (
                f"Just a heads up. Your vehicle is showing signs of {rca.lower()}. "
                f"It's not critical yet, but we should look at it soon. "
                f"I can add this to your next service. Is that okay?"
            )
        else:
            voice_script = "All systems are running smoothly. Have a safe journey."

        # Recommended Slots (Mock)
        now = datetime.datetime.now()
        slots = [
            (now + datetime.timedelta(hours=2)).strftime("%Y-%m-%d %H:%M"),
            (now + datetime.timedelta(days=1, hours=10)).strftime("%Y-%m-%d %H:%M"),
        ]

        return EngagementPlan(
            alert_message=alert_msg,
            voice_script=voice_script,
            recommended_slots=slots if severity != "Normal" else [],
            diagnosis_data=diagnosis_result
        )
