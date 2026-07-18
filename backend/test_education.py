import requests
import json
import time

BASE_URL = "http://localhost:8000/api/v1"

def test_education():
    email = f"ramesh_edu_{int(time.time())}@nexusos.com"
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
    
    # 1. Get Education Insights
    print("3. Querying education insights metrics...")
    res = requests.get(f"{BASE_URL}/education/insights", headers=headers)
    print(f"Status: {res.status_code}")
    edu = res.json()
    print(json.dumps(edu, indent=2))
    assert res.status_code == 200
    
    # Assert values
    assert "summary" in edu
    assert edu["summary"]["branch"] == "Computer Science & Engineering"
    assert len(edu["academics"]) == 4
    assert len(edu["scholarships"]) == 3
    assert len(edu["skills"]) == 5
    assert edu["career_roadmap"]["goal"] == "AI Engineer"
    assert len(edu["predictions"]) == 3
    
    # 2. Update Career Goal
    print("\n4. Updating target career goal to Data Scientist...")
    goal_payload = {"goal_name": "Data Scientist"}
    res_goal = requests.post(f"{BASE_URL}/education/goal", json=goal_payload, headers=headers)
    goal_res = res_goal.json()
    print("Goal Update Result:")
    print(goal_res)
    assert res_goal.status_code == 200
    
    print("\nSuccess! AI Student Mentorship backend is fully operational!")

if __name__ == "__main__":
    test_education()
