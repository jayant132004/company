import requests
import json

def test_selection():
    url = "http://127.0.0.1:8000/api/sortmentor/session"
    payload = {
        "data": [50, 23, 9, 18, 61, 32],
        "userLevel": "intermediate",
        "algorithm": "bubble"
    }
    
    print(f"Sending request with algorithm='bubble'...")
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            res_json = response.json()
            
            # Check what was executed
            exec_algo = res_json.get('selected_execution', {}).get('algorithm')
            rec_algo = res_json.get('recommendation', {}).get('algorithm')
            
            print(f"Response Execution Algorithm: {exec_algo}")
            print(f"Response Recommended Algorithm: {rec_algo}")
            
            if exec_algo == 'bubble':
                print("SUCCESS: Backend honored the selected algorithm.")
            else:
                print(f"FAILURE: Backend returned '{exec_algo}' instead of 'bubble'.")
                
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_selection()
