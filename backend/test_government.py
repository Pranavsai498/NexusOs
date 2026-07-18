import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1"

def test_government():
    email = f"ramesh_govt_{int(time.time())}@nexusos.com"
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
    
    # Let's seed family member and documents to check eligibility
    print("3. Seeding family student Sarah (19) and Father Venkat (68)...")
    requests.post(f"{BASE_URL}/family", json={"name": "Sarah Kumar", "relation": "Child", "age": 19}, headers=headers)
    requests.post(f"{BASE_URL}/family", json={"name": "Venkat Kumar", "relation": "Parent", "age": 68}, headers=headers)
    
    # 1. Get Government Insights
    print("4. Querying matched government schemes...")
    res = requests.get(f"{BASE_URL}/government/insights", headers=headers)
    print(f"Status: {res.status_code}")
    insights = res.json()
    print(json.dumps(insights, indent=2))
    assert res.status_code == 200
    
    # Assert values
    assert "summary" in insights
    assert insights["summary"]["recommended_count"] >= 12
    assert len(insights["recommended"]) == 4
    
    # Check that Sarah matched the scholarship and Father matched pension
    scholarship = next(s for s in insights["recommended"] if s["id"] == "aicte-scholarship")
    pension = next(s for s in insights["recommended"] if s["id"] == "senior-pension")
    assert scholarship["eligible"] is True
    assert "Sarah" in scholarship["matching_member"]
    assert pension["eligible"] is True
    assert "Venkat" in pension["matching_member"]
    
    # 2. Apply for Scheme
    print("\n5. Applying for AICTE scholarship...")
    app_payload = {"scheme_name": "AICTE Pragati Scholarship"}
    res_apply = requests.post(f"{BASE_URL}/government/apply", json=app_payload, headers=headers)
    apply_res = res_apply.json()
    print("Apply Result:")
    print(apply_res)
    assert res_apply.status_code == 200
    assert "application_id" in apply_res
    
    print("\nSuccess! Government Intelligence backend is fully operational!")

if __name__ == "__main__":
    test_government()
