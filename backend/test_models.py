import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

model_names = [
    "gemini-2.0-flash",
    "models/gemini-2.0-flash",
    "gemini-2.0-flash-001",
    "gemini-pro-latest",
    "gemini-flash-lite-latest"
]

print("Testing model accessibility...")
for name in model_names:
    print(f"\nTesting: {name}")
    try:
        model = genai.GenerativeModel(name)
        response = model.generate_content("Hello")
        print(f"SUCCESS: {name} works!")
        break # Found one
    except Exception as e:
        print(f"FAILED: {name} - Error: {e}")
