from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse
import time
import collections

# Simple in-memory store for UEBA
# In production, use Redis
request_counters = collections.defaultdict(list)
blocked_agents = set()
alerts = []

class UEBAMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        
        # 1. Check if blocked
        if client_ip in blocked_agents:
            return JSONResponse(status_code=403, content={"error": "Agent blocked by UEBA due to suspicious behavior."})

        # 2. Track Request Frequency (Rate Limiting / Anomaly Detection)
        now = time.time()
        timestamps = request_counters[client_ip]
        timestamps.append(now)
        
        # Clean old timestamps (last 60 seconds)
        request_counters[client_ip] = [t for t in timestamps if now - t < 60]
        
        # 3. Anomaly Detection Logic
        req_count = len(request_counters[client_ip])
        
        # Threshold: > 50 requests per minute is suspicious for a single agent
        if req_count > 50:
            self.trigger_alert(client_ip, "High Frequency API Access", f"{req_count} requires/min detected.")
            blocked_agents.add(client_ip)
            return JSONResponse(status_code=403, content={"error": "Rate limit exceeded. Anomaly detected by UEBA."})
            
        # 4. Access Pattern Monitoring (Mock)
        # If accessing /admin endpoints without token (mocked check)
        if "/admin" in request.url.path and "auth" not in request.headers:
             self.trigger_alert(client_ip, "Unauthorized Admin Access", "Attempted access to sensitive endpoint.")

        response = await call_next(request)
        return response

    def trigger_alert(self, source, alert_type, description):
        alert = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "source": source,
            "type": alert_type,
            "description": description,
            "risk_score": 90 if "frequency" in alert_type.lower() else 70,
            "action": "Blocked"
        }
        alerts.append(alert)
        print(f"UEBA ALERT: {alert}")

def get_ueba_alerts():
    return sorted(alerts, key=lambda x: x['timestamp'], reverse=True)
