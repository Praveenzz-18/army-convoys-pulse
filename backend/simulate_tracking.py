import requests
import time
import random
import json

BASE_URL = "http://localhost:8000/api/track/update"

# Convoys to simulate
CONVOYS = [
    {"id": "CNV-001", "name": "Operation Trident Alpha", "lat": 34.1526, "lng": 77.5771},
    {"id": "CNV-003", "name": "Operation Thunder Strike", "lat": 26.9157, "lng": 71.9083},
    {"id": "CNV-005", "name": "Logistics Support Bravo", "lat": 16.7050, "lng": 74.2433},
    {"id": "CNV-006", "name": "Border Patrol Omega", "lat": 27.3314, "lng": 88.8299},
]

def simulate():
    print("🚀 Starting GPS Tracking Simulation...")
    print("Coordinates are being broadcasted via Backend WebSockets.")
    
    while True:
        for convoy in CONVOYS:
            # Slightly move the convoy
            convoy["lat"] += (random.random() - 0.5) * 0.005
            convoy["lng"] += (random.random() - 0.5) * 0.005
            
            payload = {
                "convoy_id": convoy["id"],
                "lat": convoy["lat"],
                "lng": convoy["lng"],
                "status": "active" if random.random() > 0.1 else "delayed",
                "progress": random.randint(10, 95)
            }
            
            try:
                response = requests.post(BASE_URL, json=payload)
                if response.status_code == 200:
                    print(f"📡 Update sent for {convoy['id']}: ({convoy['lat']:.4f}, {convoy['lng']:.4f})")
                else:
                    print(f"❌ Failed to send update for {convoy['id']}: {response.status_code}")
            except Exception as e:
                print(f"⚠️ Error: {e}")
        
        time.sleep(2)  # Wait 2 seconds between updates

if __name__ == "__main__":
    simulate()
