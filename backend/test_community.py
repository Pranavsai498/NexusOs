import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1"

def test_community():
    email = f"ramesh_comm_{int(time.time())}@nexusos.com"
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
    
    # 1. Get Community Insights
    print("3. Querying community insights metrics...")
    res = requests.get(f"{BASE_URL}/community/insights", headers=headers)
    print(f"Status: {res.status_code}")
    comm = res.json()
    print(json.dumps(comm, indent=2))
    assert res.status_code == 200
    
    # Assert values
    assert "benchmarks" in comm
    assert len(comm["benchmarks"]) == 4
    assert len(comm["insights"]["Education"]) == 2
    assert "predictions" in comm
    
    # 2. Query assistant
    print("\n4. Triggering community assistant query...")
    q_payload = {"query": "how are families saving money?"}
    res_q = requests.post(f"{BASE_URL}/community/query", json=q_payload, headers=headers)
    q_res = res_q.json()
    print("Assistant Query Result:")
    assert res_q.status_code == 200
    assert len(q_res["items"]) == 5
    assert q_res["items"][0]["name"] == "Home Loan Refinancing"
    
    print("\nSuccess! AI Community Intelligence backend is fully operational!")

if __name__ == "__main__":
    test_community()
