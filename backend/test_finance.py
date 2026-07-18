import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1"

def test_finance():
    email = f"ramesh_cfo_{int(time.time())}@nexusos.com"
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
    
    # 1. Get CFO Insights
    print("3. Querying CFO insights metrics...")
    res = requests.get(f"{BASE_URL}/finance/cfo-insights", headers=headers)
    print(f"Status: {res.status_code}")
    cfo = res.json()
    print(json.dumps(cfo, indent=2))
    assert res.status_code == 200
    
    # Assert values
    assert "summary" in cfo
    assert cfo["summary"]["income"] == 120000.0
    assert len(cfo["budgets"]) == 5
    assert len(cfo["loans"]) == 3
    assert len(cfo["credit_cards"]) == 2
    assert len(cfo["insurance"]) == 2
    assert cfo["savings_coach"]["total_annual_benefit"] == 33600.0
    assert len(cfo["predictions"]) == 3
    
    # 2. Add Bill
    print("\n4. Adding a utility bill...")
    bill_payload = {
        "title": "Jio Fiber Broadband",
        "amount": 999.0,
        "category": "Utilities",
        "record_type": "Utilities",
        "due_date": "2026-07-25"
      }
    res_add = requests.post(f"{BASE_URL}/finance/bills", json=bill_payload, headers=headers)
    add_res = res_add.json()
    print("Add Bill Result:")
    print(add_res)
    assert res_add.status_code == 200
    bill_id = add_res["id"]
    
    # 3. Pay Bill
    print(f"\n5. Marking bill {bill_id} as Paid...")
    res_pay = requests.put(f"{BASE_URL}/finance/bills/{bill_id}/pay", headers=headers)
    print(f"Pay Status: {res_pay.status_code}")
    assert res_pay.status_code == 200
    
    print("\nSuccess! AI Family CFO backend is fully functional!")

if __name__ == "__main__":
    test_finance()
