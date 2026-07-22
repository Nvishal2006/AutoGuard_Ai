import os
import sys
from dotenv import load_dotenv
from agents.gemini_agent import GeminiAgent
import time

# Load env
load_dotenv()

def log(msg):
    print(msg)
    with open("verification_log.txt", "a", encoding="utf-8") as f:
        f.write(msg + "\n")

if os.path.exists("verification_log.txt"):
    os.remove("verification_log.txt")

def test_agent():
    log("--- Initializing GeminiAgent ---")
    agent = GeminiAgent()
    
    if not agent.api_key:
        log("ERROR: API Key not found!")
        return

    log(f"Model: {agent.model.model_name}")

    # Test 1: General Safe Question
    log("\n--- Test 1: General Vehicle Question ---")
    msg = "How often should I change my oil?"
    log(f"User: {msg}")
    res = agent.chat(msg)
    log(f"Agent: {res}")
    
    # Test 2: Risk Question
    log("\n--- Test 2: Risk Question (Expect Booking Prompt) ---")
    msg = "My brakes are making a grinding noise and I'm worried is vehicle safe?"
    log(f"User: {msg}")
    res = agent.chat(msg)
    log(f"Agent: {res}")
    
    if "Agentic automatic booking" in res:
        log("SUCCESS: Booking prompt detected.")
        
        # Test 3: Booking Confirmation
        log("\n--- Test 3: Confirm Booking ---")
        msg = "Yes"
        log(f"User: {msg}")
        
        history = [
            {"role": "user", "parts": ["My brakes are making a grinding noise and I'm worried is vehicle safe?"]},
            {"role": "model", "parts": [res]}
        ]
        
        res_booking = agent.chat(msg, history=history)
        log(f"Agent: {res_booking}")
        
        if "Booking confirmed" in res_booking or "confirmed" in res_booking.lower():
             log("SUCCESS: Booking confirmed.")
        else:
             log("WARNING: Booking confirmation not explicit.")

    else:
        log("FAILURE: Booking prompt NOT detected.")

if __name__ == "__main__":
    try:
        test_agent()
    except Exception as e:
        print(f"An error occurred: {e}")
