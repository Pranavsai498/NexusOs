import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1"

def test_predictive():
    email = f"ramesh_pred_{int(time.time())}@nexusos.com"
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
    
    # 1. Get Predictive Insights
    print("3. Querying predictive insights metrics...")
    res = requests.get(f"{BASE_URL}/predictive/insights", headers=headers)
    print(f"Status: {res.status_code}")
    pred = res.json()
    print(json.dumps(pred, indent=2))
    assert res.status_code == 200
    
    # Assert values
    assert "opportunities" in pred
    assert len(pred["opportunities"]) == 4
    assert len(pred["risks"]) == 4
    assert "categories" in pred
    assert len(pred["categories"]["Finance"]) == 3
    assert len(pred["timeline"]) == 7
    
    # 2. Run simulation
    print("\n4. Running future simulator request...")
    sim_payload = {"scenario": "buy a house"}
    res_sim = requests.post(f"{BASE_URL}/predictive/simulate", json=sim_payload, headers=headers)
    sim_res = res_sim.json()
    assert res_sim.status_code == 200
    assert sim_res["impacts"]["Finance"] == "Adds new SBI Home Loan EMI payment of ₹32,000 monthly."
    
    print("\nSuccess! AI Future Simulator & Predictive Center is fully operational!")

if __name__ == "__main__":
    test_predictive()
