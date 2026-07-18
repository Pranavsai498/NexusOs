import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1"

def test_reminders():
    email = f"ramesh_rem_{int(time.time())}@nexusos.com"
    password = "password123"
    full_name = "Ramesh Kumar"
    
    print("1. Registering user...")
    requests.post(f"{BASE_URL}/auth/register", json={
        "email": email,
        "password": password,
        "full_name": full_name,
        "phone_number": "9876543210"
    })
    
    print("2. Logging in...")
    login_res = requests.post(f"{BASE_URL}/auth/login", data={"username": email, "password": password}).json()
    token = login_res["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Get Reminders Insights
    print("3. Querying reminders insights metrics...")
    res = requests.get(f"{BASE_URL}/notifications/reminders-insights", headers=headers)
    print(f"Status: {res.status_code}")
    rem = res.json()
    print(json.dumps(rem, indent=2))
    assert res.status_code == 200
    
    # Assert values
    assert "critical" in rem
    assert len(rem["critical"]) == 3
    assert len(rem["important"]) == 2
    assert len(rem["upcoming"]) == 1
    assert "grouping" in rem
    assert rem["grouping"]["estimated_time"] == "15 Minutes"
    assert len(rem["location_alerts"]) == 1
    assert len(rem["predictions"]) == 3
    
    print("\nSuccess! AI Smart Reminders backend is fully operational!")

if __name__ == "__main__":
    test_reminders()
