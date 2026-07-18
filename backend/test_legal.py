import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1"

def test_legal():
    email = f"ramesh_legal_{int(time.time())}@nexusos.com"
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
    
    # 1. Get Legal Insights
    print("3. Querying legal insights metrics...")
    res = requests.get(f"{BASE_URL}/legal/insights", headers=headers)
    print(f"Status: {res.status_code}")
    legal = res.json()
    print(json.dumps(legal, indent=2))
    assert res.status_code == 200
    
    # Assert values
    assert "property_docs" in legal
    assert len(legal["property_docs"]) == 8
    assert "vehicles" in legal
    assert len(legal["vehicles"]) == 1
    assert "rental" in legal
    assert legal["rental"]["deposit"] == 25000.0
    assert len(legal["timeline"]) == 6
    assert len(legal["predictions"]) == 3
    
    # 2. Register Property
    print("\n4. Registering property...")
    prop_payload = {
        "name": "Ramesh Family House",
        "location": "Hyderabad (TS)"
    }
    res_prop = requests.post(f"{BASE_URL}/legal/property", json=prop_payload, headers=headers)
    prop_res = res_prop.json()
    print("Property Add Result:")
    print(prop_res)
    assert res_prop.status_code == 200
    
    print("\nSuccess! AI Legal Center backend is fully operational!")

if __name__ == "__main__":
    test_legal()
