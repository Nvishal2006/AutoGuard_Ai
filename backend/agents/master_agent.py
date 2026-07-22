from .analysis_agent import AnalysisAgent
from .diagnosis_agent import DiagnosisAgent
from .engagement_agent import EngagementAgent
from .scheduling_agent import SchedulingAgent
from .feedback_agent import FeedbackAgent
from .insights_agent import InsightsAgent
from schemas import TelematicsData

class MasterAgent:
    def __init__(self):
        self.analysis = AnalysisAgent()
        self.diagnosis = DiagnosisAgent()
        self.engagement = EngagementAgent()
        self.scheduling = SchedulingAgent()
        self.feedback = FeedbackAgent()
        self.insights = InsightsAgent()

    def run_predictive_flow(self, telematics_data: dict):
        """
        Orchestrates: Analysis -> Diagnosis -> Engagement
        """
        try:
            # 1. Analyze
            analysis_res = self.analysis.process(telematics_data)
            if not analysis_res:
                return {"error": "Analysis failed"}

            # 2. Diagnose
            diagnosis_res = self.diagnosis.process(analysis_res)
            
            # 3. Engage
            engagement_res = self.engagement.process(diagnosis_res)
            
            # 4. Schedule (Optional orchestration here, usually handled by engagement reply)
            # But the plan might contain slots which come from Scheduling Agent (TODO)
            # For now, Engagement Agent mocks slots, but ideally:
            # slots = self.scheduling.find_slots(diagnosis_res)
            # engagement_res.recommended_slots = slots
            
            return {
                "analysis": analysis_res.dict(),
                "diagnosis": diagnosis_res.dict(),
                "engagement": engagement_res.dict()
            }
        except Exception as e:
            print(f"Master Agent Error: {e}")
            import traceback
            traceback.print_exc()
            return {"error": str(e)}

    def get_insights(self):
        return self.insights.process()
        
    def submit_feedback(self, data):
        return self.feedback.process(data)
