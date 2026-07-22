import requests
import time
import json
import random

BASE_URL = "http://localhost:8000"

def print_result(name, passed, detail=""):
    status = "[PASS]" if passed else "[FAIL]"
    print(f"{status} | {name} | {detail}")

def test_system():
    print("\n--- Starting End-to-End System Verification ---\n")
    
    # 1. Test Root
    try:
        res = requests.get(f"{BASE_URL}/")
        print_result("API Root", res.status_code == 200, res.json())
    except:
        print_result("API Root", False, "Connection refused")
        return

    # 2. Test Telematics Prediction Flow
    payload = {
        "brake_wear": 85.5,
        "tyre_pressure_variance": 1.2,
        "engine_temp": 112.0,
        "vibration_level": 0.5,
        "mileage": 55000,
        "oil_level": "Low",
        "battery_health": "Good"
    }
    
    try:
        res = requests.post(f"{BASE_URL}/predict-failure", json=payload)
        data = res.json()
        passed = "diagnosis" in data and "engagement" in data
        detail = data.get("diagnosis", {}).get("severity", "Unknown") if passed else "No diagnosis"
        print_result("Prediction Flow (High Risk)", passed, f"Severity: {detail}")
    except Exception as e:
        print_result("Prediction Flow", False, str(e))

    # 3. Test Insights
    try:
        res = requests.get(f"{BASE_URL}/insights")
        data = res.json()
        passed = "top_failures" in data
        print_result("OEM Insights", passed, f"Records: {len(data.get('top_failures', []))}")
    except:
        print_result("OEM Insights", False)

    # 4. Test Scheduling
    try:
        # Book
        booking = {
            "vehicle_id": "VH-999",
            "service_type": "Brake Check",
            "preferred_time": "2025-12-10 10:00",
            "customer_id": "user_verify"
        }
        res = requests.post(f"{BASE_URL}/schedule/book", json=booking)
        booked = res.status_code == 200
        
        # List
        res_list = requests.get(f"{BASE_URL}/schedule/list")
        has_list = len(res_list.json()) > 0
        
        print_result("Scheduling API", booked and has_list, "Booking + Listing confirmed")
    except Exception as e:
        print_result("Scheduling API", False, str(e))

    # 5. Test UEBA Middleware (Security)
    print("\n--- Testing Security Layer (UEBA) ---")
    
    # Simulate Attack (High Frequency)
    blocked = False
    for i in range(60):
        try:
            res = requests.get(f"{BASE_URL}/")
            if res.status_code == 403:
                blocked = True
                break
        except:
            pass
            
    print_result("UEBA Rate Limiting", blocked, "Agent blocked after flood")
    
    # Check Alerts
    try:
        res = requests.get(f"{BASE_URL}/ueba/alerts")
        alerts = res.json()
        has_alerts = len(alerts) > 0
        print_result("UEBA Alerts System", has_alerts, f"Alerts found: {len(alerts)}")
    except:
         print_result("UEBA Alerts System", False)

if __name__ == "__main__":
    test_system()
