import json
import random
import os

def generate_samples():
    os.makedirs('sample_telematics', exist_ok=True)
    
    scenarios = [
        {"name": "normal", "brake": (0, 40), "temp": (70, 90), "vib": (0, 2)},
        {"name": "warning", "brake": (40, 70), "temp": (90, 105), "vib": (2, 3.5)},
        {"name": "critical", "brake": (70, 100), "temp": (105, 120), "vib": (3.5, 5)}
    ]
    
    for i in range(10):
        scenario = random.choice(scenarios)
        data = {
            "brake_wear": random.uniform(*scenario["brake"]),
            "tyre_pressure_variance": random.uniform(0, 5),
            "engine_temp": random.uniform(*scenario["temp"]),
            "vibration_level": random.uniform(*scenario["vib"]),
            "mileage": random.uniform(10000, 90000)
        }
        
        filename = f"sample_telematics/sample_{i}_{scenario['name']}.json"
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2)
            
    print("Generated sample telematics data.")

if __name__ == "__main__":
    generate_samples()
