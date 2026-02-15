import requests
import json

try:
    response = requests.post(
        "http://localhost:8000/chat",
        json={"message": "hi", "history": []},
        timeout=10
    )
    print(f"Status: {response.status_code}")
    try:
        print(f"JSON Body: {response.json()}")
    except:
        print(f"Raw Text Body: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
