import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_service_history():
    print("Testing Service History...")
    # 1. Book a service
    booking_payload = {
        "vehicle_id": "test_veh_01",
        "service_type": "Test Service",
        "preferred_time": "2025-12-10T10:00:00",
        "customer_id": "test_user"
    }
    try:
        res = requests.post(f"{BASE_URL}/schedule/book", json=booking_payload)
        if res.status_code == 200:
            print("[PASS] Booking successful")
        else:
            print(f"[FAIL] Booking failed: {res.text}")
            return
        
        # 2. Check history
        res = requests.get(f"{BASE_URL}/schedule/list")
        if res.status_code == 200:
            history = res.json()
            # print(json.dumps(history, indent=2)) # Debug
            found = False
            for item in history:
                vid = item.get('vehicle_id')
                issue = item.get('issue')
                if vid == 'test_veh_01' and issue == 'Test Service':
                    found = True
                    break
            
            if found:
                print(f"[PASS] Booking found in history. Total items: {len(history)}", flush=True)
            else:
                print("[FAIL] Booking NOT found in history", flush=True)
        else:
            print(f"[FAIL] Failed to fetch history: {res.text}", flush=True)

    except Exception as e:
        print(f"[ERROR] Service History Test: {e}", flush=True)

def test_insights():
    print("\nTesting Insights...")
    try:
        res = requests.get(f"{BASE_URL}/insights")
        if res.status_code == 200:
            data = res.json()
            if "defect_recurrence" in data and "top_failures" in data:
                print("[PASS] Insights data structure valid")
                print(f"   Top Failure: {data['top_failures'][0]['component']}")
            else:
                print("[FAIL] Missing keys in insights data")
        else:
            print(f"[FAIL] Failed to fetch insights: {res.text}")
    except Exception as e:
        print(f"[ERROR] Insights Test: {e}")

def test_ueba_agents():
    print("\nTesting UEBA Agents...")
    try:
        res = requests.get(f"{BASE_URL}/ueba/agents")
        if res.status_code == 200:
            agents = res.json()
            if isinstance(agents, list) and len(agents) > 0:
                print(f"[PASS] Retrieved {len(agents)} active agents")
                print(f"   First Agent: {agents[0]['name']} ({agents[0]['status']})")
            else:
                print("[FAIL] Agents list empty or invalid")
        else:
            print(f"[FAIL] Failed to fetch agents: {res.text}")
    except Exception as e:
        print(f"[ERROR] UEBA Agents Test: {e}")

if __name__ == "__main__":
    import sys
    with open("verification_result.txt", "w") as f:
        sys.stdout = f
        test_service_history()
        test_insights()
        test_ueba_agents()
