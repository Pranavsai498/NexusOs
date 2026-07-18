import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1"

def test_flow():
    email = f"ramesh_{int(time.time())}@nexusos.com"
    password = "password123"
    full_name = "Ramesh Kumar"
    
    print("1. Testing Registration...")
    reg_payload = {
        "email": email,
        "password": password,
        "full_name": full_name,
        "phone_number": "9876543210"
    }
    
    res = requests.post(f"{BASE_URL}/auth/register", json=reg_payload)
    print(f"Status: {res.status_code}")
    print(res.json())
    assert res.status_code == 200
    
    print("\n2. Testing Login...")
    login_data = {
        "username": email,
        "password": password
    }
    res = requests.post(f"{BASE_URL}/auth/login", data=login_data)
    print(f"Status: {res.status_code}")
    login_res = res.json()
    print(login_res)
    assert res.status_code == 200
    token = login_res["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    print("\n3. Testing PIN Verification...")
    pin_payload = {"pin": "1234"}
    res = requests.post(f"{BASE_URL}/auth/verify-pin", json=pin_payload, headers=headers)
    print(f"Status: {res.status_code}")
    print(res.json())
    assert res.status_code == 200
    
    print("\n4. Testing Dashboard Insights Widget Data...")
    res = requests.get(f"{BASE_URL}/dashboard/insights", headers=headers)
    print(f"Status: {res.status_code}")
    insights = res.json()
    print(json.dumps(insights, indent=2))
    assert res.status_code == 200
    
    # Asserting that the 7 widgets are populated
    assert "greeting" in insights
    assert "family_name" in insights
    assert "brief" in insights
    assert len(insights["critical_alerts"]) > 0
    assert len(insights["govt_benefits"]) > 0
    assert len(insights["upcoming_bills"]) > 0
    assert len(insights["health_summary"]) > 0
    assert len(insights["community_insights"]) > 0
    assert len(insights["ai_predictions"]) > 0
    
    print("\n5. Testing AI Chat - Admission Orchestrator...")
    chat_payload = {"query": "My daughter got B.Tech admission."}
    res = requests.post(f"{BASE_URL}/chat", json=chat_payload, headers=headers)
    print(f"Status: {res.status_code}")
    chat_res = res.json()
    print("Response reply:")
    print(chat_res["reply"])
    assert res.status_code == 200
    
    print("\n6. Testing AI Chat - Memory Recall (Insurance Status)...")
    chat_payload_memory = {"query": "Insurance status?"}
    res = requests.post(f"{BASE_URL}/chat", json=chat_payload_memory, headers=headers)
    print(f"Status: {res.status_code}")
    chat_res_memory = res.json()
    print("Response reply:")
    print(chat_res_memory["reply"])
    assert res.status_code == 200

    print("\nSuccess! All endpoints are fully operational.")

if __name__ == "__main__":
    try:
        test_flow()
    except Exception as e:
        print(f"Test failed: {e}")
