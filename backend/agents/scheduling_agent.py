from .base_agent import BaseAgent
import json
import os
from datetime import datetime, timedelta
import random
from schemas import EngagementPlan, BookingRequest

class SchedulingAgent(BaseAgent):
    def __init__(self):
        super().__init__("SchedulingAgent")
        current_dir = os.path.dirname(os.path.abspath(__file__))
        backend_dir = os.path.dirname(current_dir)
        self.calendar_file = os.path.join(backend_dir, 'calendar.json')
        self.ensure_calendar()

    def ensure_calendar(self):
        if not os.path.exists(self.calendar_file):
            with open(self.calendar_file, 'w') as f:
                json.dump([], f)

    def process(self, engagement_result: dict) -> dict:
        # If it's a booking request (from Master via Engagement flow or direct)
        pass 
        # For now, let's assume it provides slots when asked
        
        return {}

    def find_slots(self, service_centers=["Downtown", "Westside", "North Hub"]):
        # Mock Load Balancing
        slots = []
        now = datetime.now()
        
        for center in service_centers:
            # Random load factor
            load = random.random()
            if load > 0.8: continue # Full
            
            # Generate 2 slots per available center
            for i in range(1, 4):
                slot_time = now + timedelta(days=i, hours=random.randint(9, 16))
                slots.append({
                    "center": center,
                    "time": slot_time.strftime("%Y-%m-%d %H:%M"),
                    "load": f"{int(load*100)}%"
                })
        
        return sorted(slots, key=lambda x: x['time'])[:5]

    def book_slot(self, booking_request: BookingRequest):
        with open(self.calendar_file, 'r') as f:
            appointments = json.load(f)
        
        new_appointment = {
            "id": random.randint(10000, 99999),
            "vehicle_id": booking_request.vehicle_id,
            "time": booking_request.preferred_time,
            "service_center": "Best Available Center", # Simplification
            "technician": "Auto-Assigned",
            "issue": booking_request.service_type,
            "status": "Confirmed"
        }
        
        appointments.append(new_appointment)
        
        with open(self.calendar_file, 'w') as f:
            json.dump(appointments, f, indent=2)
            
        return new_appointment
