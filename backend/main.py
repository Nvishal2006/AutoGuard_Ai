from fastapi import FastAPI, WebSocket, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

import uvicorn
import os
import json
import random
from dotenv import load_dotenv
from typing import List, Optional
from pydantic import BaseModel

# Import Agents & Middleware
from agents.master_agent import MasterAgent
from agents.gemini_agent import GeminiAgent
from middleware.ueba import UEBAMiddleware, get_ueba_alerts

# Load environment variables
load_dotenv()

app = FastAPI(title="Agentic AI Predictive Maintenance System")

# 1. Add UEBA Security Middleware
app.add_middleware(UEBAMiddleware)

# 2. CORS (Allow all for demo)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Core Agents
master_agent = MasterAgent()
gemini_agent = GeminiAgent()

# --- Pydantic Models ---
class TelematicsRequest(BaseModel):
    brake_wear: float
    tyre_pressure_variance: float
    engine_temp: float
    vibration_level: float
    mileage: float
    oil_level: Optional[str] = "Normal"
    battery_health: Optional[str] = "Good"

class ChatRequest(BaseModel):
    message: str
    history: List[dict] = []

class BookingRequest(BaseModel):
    vehicle_id: str
    service_type: str
    preferred_time: str
    customer_id: str = "user_123"

# --- API Endpoints ---

@app.get("/")
def read_root():
    return {"status": "Agentic AI System Operational", "version": "2.0.0"}

@app.post("/predict-failure")
def predict_failure(data: TelematicsRequest):
    """
    Main entry point for the Agentic Workflow.
    Triggers Master -> Analysis -> Diagnosis -> Engagement.
    """
    result = master_agent.run_predictive_flow(data.dict())
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    return result

@app.get("/insights")
def get_insights():
    """
    Returns aggregated manufacturing insights.
    """
    return master_agent.get_insights()

@app.post("/chat")
def chat_interface(req: ChatRequest):
    """
    Direct interface to the Voice/Chat Agent (Gemini Wrapper).
    """
    # Simply pass through to existing Gemini Logic for now, 
    # but ideally Master Agent could handle this too.
    # For continuity with existing frontend, we keep the signature.
    response = gemini_agent.chat(req.message, req.history)
    return {"response": response}

@app.get("/ueba/alerts")
def get_security_alerts():
    """
    Returns security alerts detected by the UEBA layer.
    """
    return get_ueba_alerts()

@app.get("/ueba/agents")
def get_active_agents():
    """
    Returns the status of all active agents in the system.
    """
    return [
        {"name": "Master Agent", "role": "Orchestrator", "status": "Active", "type": "Core"},
        {"name": "Analysis Agent", "role": "Data Processing", "status": "Active", "type": "Worker"},
        {"name": "Diagnosis Agent", "role": "Failure Prediction", "status": "Active", "type": "Worker"},
        {"name": "Engagement Agent", "role": "User Interaction", "status": "Active", "type": "Worker"},
        {"name": "Scheduling Agent", "role": "Service Booking", "status": "Idle", "type": "Worker"},
        {"name": "Insights Agent", "role": "Manufacturing Feedback", "status": "Idle", "type": "Worker"},
        {"name": "Gemini Agent", "role": "LLM Interface", "status": "Active", "type": "Core"},
    ]

@app.post("/schedule/book")
def book_service(req: BookingRequest):
    """
    Direct booking endpoint.
    """
    # Use scheduling agent via master or direct
    # For now, let's just use the logic we had or call scheduling agent
    from agents.scheduling_agent import SchedulingAgent
    scheduler = SchedulingAgent() # Instance for now
    result = scheduler.book_slot(req)
    return result

@app.get("/schedule/list")
def list_appointments():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    calendar_file = os.path.join(current_dir, 'calendar.json')
    if os.path.exists(calendar_file):
        with open(calendar_file, 'r') as f:
            return json.load(f)
    return []

# --- Real-time Websocket ---
@app.websocket("/ws/telematics")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    import asyncio
    try:
        while True:
            # Simulate streaming raw sensor data
            data = {
                "brake_wear": random.uniform(0, 100),
                "tyre_pressure_variance": random.uniform(0, 8),
                "engine_temp": random.uniform(70, 115),
                "vibration_level": random.uniform(0, 3),
                "mileage": random.uniform(10000, 150000),
                "timestamp": str(asyncio.get_event_loop().time())
            }
            await websocket.send_json(data)
            await asyncio.sleep(2)
    except Exception as e:
        print(f"WS Error: {e}")

