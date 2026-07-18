import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1"

def test_health():
    email = f"ramesh_health_{int(time.time())}@nexusos.com"
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
    
    # 1. Get Health Insights
    print("3. Querying health insights metrics...")
    res = requests.get(f"{BASE_URL}/health/insights", headers=headers)
    print(f"Status: {res.status_code}")
    health = res.json()
    print(json.dumps(health, indent=2))
    assert res.status_code == 200
    
    # Assert values
    assert "status" in health
    assert len(health["status"]) >= 2
    assert "timelines" in health
    assert "medications" in health
    assert "vaccinations" in health
    assert "visits" in health
    assert "appointments" in health
    assert health["insurance"]["policy_number"] == "ERGO-4492812"
    assert len(health["predictions"]) == 3
    
    # 2. Mark Medication Taken
    print("\n4. Logging medication intake...")
    med_payload = {
        "med_name": "Metformin 500mg",
        "time_slot": "8 AM",
        "taken": True
    }
    res_med = requests.post(f"{BASE_URL}/health/meds/taken", json=med_payload, headers=headers)
    med_res = res_med.json()
    print("Med Taken Result:")
    print(med_res)
    assert res_med.status_code == 200
    
    print("\nSuccess! AI Family Health Companion backend is fully operational!")

if __name__ == "__main__":
    test_health()
