import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1"

def test_family_insights():
    email = f"ramesh_fam_{int(time.time())}@nexusos.com"
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
    
    # 1. Get Family Insights
    print("3. Querying family insights metrics...")
    res = requests.get(f"{BASE_URL}/family/insights", headers=headers)
    print(f"Status: {res.status_code}")
    fam = res.json()
    print(json.dumps(fam, indent=2))
    assert res.status_code == 200
    
    # Assert values
    assert "members" in fam
    assert len(fam["members"]) >= 2
    assert "goals" in fam
    assert len(fam["goals"]) == 4
    assert "calendar" in fam
    assert len(fam["calendar"]) == 5
    assert len(fam["timeline"]) == 5
    assert "twin" in fam
    assert fam["twin"]["event"] == "Sarah gets first job"
    
    print("\nSuccess! AI Family Roster Dashboard is fully operational!")

if __name__ == "__main__":
    test_family_insights()
