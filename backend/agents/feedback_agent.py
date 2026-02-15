from .base_agent import BaseAgent
import json
import os
import random

class FeedbackAgent(BaseAgent):
    def __init__(self):
        super().__init__("FeedbackAgent")
        # Get absolute path to backend directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        backend_dir = os.path.dirname(current_dir)
        self.feedback_file = os.path.join(backend_dir, 'feedback.json')
        self.ensure_file()

    def ensure_file(self):
        if not os.path.exists(self.feedback_file):
            with open(self.feedback_file, 'w') as f:
                json.dump([], f)

    def process(self, feedback_data):
        # feedback_data: { "appointment_id": ..., "rating": ..., "comments": ..., "recurrence": bool }
        sentiment = "Neutral"
        if feedback_data.get("rating", 3) > 4: sentiment = "Positive"
        elif feedback_data.get("rating", 3) < 3: sentiment = "Negative"
        
        feedback_data["sentiment"] = sentiment
        
        with open(self.feedback_file, 'r') as f:
            feedbacks = json.load(f)
            
        feedbacks.append(feedback_data)
        
        with open(self.feedback_file, 'w') as f:
            json.dump(feedbacks, f, indent=2)
            
        return {"status": "Feedback recorded", "sentiment": sentiment}

class FeedbackAgent(BaseAgent):
    def __init__(self):
        super().__init__("FeedbackAgent")
        # Get absolute path to backend directory
        current_dir = os.path.dirname(os.path.abspath(__file__))
        backend_dir = os.path.dirname(current_dir)
        self.feedback_file = os.path.join(backend_dir, 'feedback.json')
        self.ensure_file()

    def ensure_file(self):
        if not os.path.exists(self.feedback_file):
            with open(self.feedback_file, 'w') as f:
                json.dump([], f)

    def process(self, feedback_data):
        # feedback_data: { "appointment_id": ..., "rating": ..., "comments": ..., "recurrence": bool }
        with open(self.feedback_file, 'r') as f:
            feedbacks = json.load(f)
            
        feedbacks.append(feedback_data)
        
        with open(self.feedback_file, 'w') as f:
            json.dump(feedbacks, f, indent=2)
            
        return {"status": "Feedback recorded"}
