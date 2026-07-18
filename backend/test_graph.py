import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1"

def test_graph():
    email = f"ramesh_graph_{int(time.time())}@nexusos.com"
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
    
    # 1. Get Graph Insights
    print("3. Querying knowledge graph insights...")
    res = requests.get(f"{BASE_URL}/graph/insights", headers=headers)
    print(f"Status: {res.status_code}")
    g = res.json()
    print(json.dumps(g, indent=2))
    assert res.status_code == 200
    
    # Assert values
    assert "nodes" in g
    assert len(g["nodes"]) == 14
    assert len(g["links"]) == 13
    assert g["summary"]["relationships_count"] == 842
    
    # 2. Run Semantic Search
    print("\n4. Running semantic search query...")
    q_payload = {"query": "Show everything related to our house"}
    res_q = requests.post(f"{BASE_URL}/graph/search", json=q_payload, headers=headers)
    q_res = res_q.json()
    print("Semantic Search Result:")
    assert res_q.status_code == 200
    assert len(q_res["results"]) == 7
    assert q_res["results"][0]["entity"] == "Ramesh Family House"
    
    print("\nSuccess! AI Knowledge Graph is fully operational!")

if __name__ == "__main__":
    test_graph()
