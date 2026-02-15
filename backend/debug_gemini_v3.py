from dotenv import load_dotenv
import os
from agents.gemini_agent import GeminiAgent

load_dotenv()

agent = GeminiAgent()
print(f"API Key present: {bool(agent.api_key)}")

# Test 1: Simple Chat
print("\n--- Test 1: Simple Chat ---")
try:
    response = agent.chat("Hello, who are you?")
    print(f"Response: {response}")
except Exception as e:
    print(f"Test 1 Failed: {e}")

# Test 2: Chat with History (Conversational Booking Flow)
print("\n--- Test 2: Chat with History ---")
history = [
    {"role": "user", "content": "I want to book a service."},
    {"role": "assistant", "content": "Sure. I need your Vehicle Model, Year, and Service Type. What is the vehicle model?"},
    {"role": "user", "content": "Tesla Model 3"}
]
try:
    response = agent.chat("2023", history=history)
    print(f"Response to '2023' (expecting service question): {response}")
    
    # Append response and send next
    history.append({"role": "user", "content": "2023"})
    history.append({"role": "assistant", "content": response})
    
    # Send Service Type
    response_service = agent.chat("Tire Rotation", history=history)
    print(f"Response to 'Tire Rotation': {response_service}")
    history.append({"role": "user", "content": "Tire Rotation"})
    history.append({"role": "assistant", "content": response_service})

    # Send Date
    response_date = agent.chat("2024-12-25", history=history)
    print(f"Response to Date: {response_date}")
    history.append({"role": "user", "content": "2024-12-25"})
    history.append({"role": "assistant", "content": response_date})

    # Send Time
    response_final = agent.chat("10:00 AM", history=history)
    print(f"Response to Time (expecting confirmation): {response_final}")

except Exception as e:
    print(f"Test 2 Failed: {e}")
