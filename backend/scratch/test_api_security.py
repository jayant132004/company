import sys
import os
import requests

def test_security_endpoints():
    print("==================================================")
    print("         ALGOVERSE API SECURITY AUDIT")
    print("==================================================")
    
    base_url = "http://localhost:8000/api/v1"
    
    # 1. Unauthenticated request to protected route
    print("\nTesting: Access /auth/me without token...")
    res = requests.get(f"{base_url}/auth/me")
    print(f"Status: {res.status_code}")
    assert res.status_code == 401, "Expected 401 Unauthorized"
    print("✓ Success: Correctly rejected.")

    # 2. Malformed token verification
    print("\nTesting: Access /auth/me with invalid token...")
    res = requests.get(f"{base_url}/auth/me", headers={"Authorization": "Bearer bad_token"})
    print(f"Status: {res.status_code}")
    assert res.status_code == 401, "Expected 401 Unauthorized"
    print("✓ Success: Correctly rejected.")

    # 3. Input validation: invalid data type in sortmentor execution
    print("\nTesting: Execute sortmentor with invalid array elements...")
    payload = {"data": [1, 2, "three", 4], "algorithm": "bubble"}
    res = requests.post(f"{base_url}/sortmentor/execute", json=payload)
    print(f"Status: {res.status_code}")
    assert res.status_code == 422, "Expected 422 Unprocessable Entity"
    print("✓ Success: Pydantic validation active.")

    # 4. Input validation: missing required field
    print("\nTesting: Execute sortmentor with missing algorithm parameter...")
    payload = {"data": [1, 2, 3]}
    res = requests.post(f"{base_url}/sortmentor/execute", json=payload)
    print(f"Status: {res.status_code}")
    assert res.status_code == 422, "Expected 422 Unprocessable Entity"
    print("✓ Success: Missing parameter validation active.")

    # 5. Invalid / Non-existent route traversal
    print("\nTesting: Access non-existent route...")
    res = requests.get(f"http://localhost:8000/non-existent-endpoint-abc")
    print(f"Status: {res.status_code}")
    assert res.status_code == 404, "Expected 404 Not Found"
    print("✓ Success: 404 routing verified.")

    print("\n==================================================")
    print("          API SECURITY AUDIT: ALL PASSED")
    print("==================================================")

if __name__ == "__main__":
    test_security_endpoints()
