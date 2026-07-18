import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1"

def test_planning():
    email = f"ramesh_plan_{int(time.time())}@nexusos.com"
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
    
    # 1. Get Planning Insights
    print("3. Querying planning insights metrics...")
    res = requests.get(f"{BASE_URL}/planning/insights", headers=headers)
    print(f"Status: {res.status_code}")
    plan = res.json()
    print(json.dumps(plan, indent=2))
    assert res.status_code == 200
    
    # Assert values
    assert "critical" in plan
    assert len(plan["critical"]) == 4
    assert len(plan["important"]) == 3
    assert len(plan["normal"]) == 3
    assert "focus_brief" in plan
    assert plan["focus_brief"]["potential_savings"] == 2300.0
    assert len(plan["checklists"]["moving"]) == 8
    assert len(plan["predictions"]) == 3
    
    # 2. Trigger Checklist
    print("\n4. Triggering event checklist...")
    checklist_payload = {"event_type": "moving"}
    res_chk = requests.post(f"{BASE_URL}/planning/checklist", json=checklist_payload, headers=headers)
    chk_res = res_chk.json()
    print("Checklist Result:")
    print(chk_res)
    assert res_chk.status_code == 200
    
    print("\nSuccess! AI Life Planner backend is fully operational!")

if __name__ == "__main__":
    test_planning()
