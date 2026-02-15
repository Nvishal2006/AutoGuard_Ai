from .base_agent import BaseAgent
import random

class InsightsAgent(BaseAgent):
    def __init__(self):
        super().__init__("InsightsAgent")

    def process(self, data=None):
        # Dynamic Mock Insights
        failures = [
            {"component": "Brake Pad", "count": random.randint(30, 50)},
            {"component": "Fuel Injector", "count": random.randint(20, 40)},
            {"component": "Battery", "count": random.randint(15, 35)},
            {"component": "Tyre", "count": random.randint(10, 25)},
            {"component": "Alternator", "count": 12}
        ]
        
        return {
            "top_failures": sorted(failures, key=lambda x: x['count'], reverse=True),
            "uptime_improvement": round(random.uniform(10, 15), 1), 
            "cost_reduction": round(random.uniform(5, 10), 1),
            "rca_recommendations": [
                {
                    "issue": "Recurring Brake Pad Wear",
                    "root_cause": "High friction material batch #992",
                    "capa": "Recall batch #992 and switch to ceramic pads for heavy users."
                },
                {
                    "issue": "Battery Drain",
                    "root_cause": "Telematics module sleep mode failure",
                    "capa": "OTA Firmware Update v2.1.4 to fix sleep cycle."
                }
            ],
            "defect_recurrence": [
                {"month": "Jan", "count": 12},
                {"month": "Feb", "count": 10},
                {"month": "Mar", "count": 15},
                {"month": "Apr", "count": 8},
                {"month": "May", "count": 5}
            ]
        }
