import requests
import json
import time
import io

BASE_URL = "http://localhost:8000/api/v1"

def test_vault():
    email = f"ramesh_vault_{int(time.time())}@nexusos.com"
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
    
    # Let's seed a family member
    print("3. Adding family member Sarah...")
    requests.post(f"{BASE_URL}/family", json={"name": "Sarah Kumar", "relation": "Child", "age": 19}, headers=headers)
    
    # 1. OCR Test with simulated Aadhaar file
    print("4. Testing OCR on 'sarah_income_certificate.pdf'...")
    dummy_file = io.BytesIO(b"Dummy content for income certificate scan")
    files = {"file": ("sarah_income_certificate.pdf", dummy_file, "application/pdf")}
    res = requests.post(f"{BASE_URL}/documents/ocr", files=files, data={"doc_type": "identity"}, headers=headers)
    ocr_result = res.json()
    print("OCR Extraction fields:")
    print(ocr_result)
    assert ocr_result["document_type"] == "Income Certificate"
    assert ocr_result["category"] == "Government IDs"
    assert "Sarah Kumar" in ocr_result["name"]
    
    # 2. Upload Document with custom OCR metadata
    print("5. Saving document with auto-association details...")
    dummy_file2 = io.BytesIO(b"Dummy content for income certificate scan")
    files2 = {"file": ("sarah_income_certificate.pdf", dummy_file2, "application/pdf")}
    upload_payload = {
        "card_type": ocr_result["document_type"],
        "category": ocr_result["category"],
        "extracted_name": ocr_result["name"],
        "dob": ocr_result["dob"],
        "document_number": ocr_result["document_number"],
        "expiry_date": ocr_result["expiry_date"]
    }
    res_upload = requests.post(f"{BASE_URL}/documents/upload", files=files2, data=upload_payload, headers=headers)
    upload_res = res_upload.json()
    print("Upload Result:")
    print(upload_res)
    assert res_upload.status_code == 200
    doc_id = upload_res["id"]
    
    # Check that member_id is automatically associated with Sarah's ID!
    # Let's list all documents and check member_id
    res_docs = requests.get(f"{BASE_URL}/documents/", headers=headers).json()
    saved_doc = next(d for d in res_docs if d["filename"] == "sarah_income_certificate.pdf")
    print(f"Saved Document Member ID: {saved_doc['member_id']}")
    assert saved_doc["member_id"] != "self" and saved_doc["member_id"] is not None
    assert saved_doc["category"] == "Government IDs"
    assert saved_doc["card_type"] == "Income Certificate"
    
    # 3. Smart Intent Search Test
    print("6. Testing Smart Intent Search for 'scholarship'...")
    res_search = requests.get(f"{BASE_URL}/documents/search?query=scholarship", headers=headers).json()
    print("Search results:")
    print(res_search)
    assert len(res_search["results"]) > 0
    assert res_search["results"][0]["card_type"] == "Income Certificate"
    
    # 4. Document deletion
    print("7. Testing document deletion...")
    res_delete = requests.delete(f"{BASE_URL}/documents/{doc_id}", headers=headers)
    print(f"Delete Status: {res_delete.status_code}")
    assert res_delete.status_code == 200
    
    print("\nSuccess! Digital Vault backend is fully functional!")

if __name__ == "__main__":
    test_vault()
