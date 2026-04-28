import sys
import os

# Add the directory to sys.path
sys.path.append('/Users/macbook/Documents/dsa_p/coding_visualization')

import sortmentor

from app import app, db
from sortmentor import SortRun, PolicyWeights

# Must run in app context with a dummy DB setup if needed
with app.app_context():
    # Bypass login by injecting session
    with app.test_client() as client:
        with client.session_transaction() as sess:
            sess['user_id'] = 1
        
        response = client.post('/api/sortmentor/session', json={
            "data": [60, 4, 30, 22, 11, 80, 70, 99, 100, 45, 12, 1, 9, 34, 55, 66, 77, 88, 3, 2],
            "userLevel": "intermediate",
            "algorithm": ""
        })
        print("STATUS:", response.status_code)
        
        if response.status_code != 200:
            print("ERROR JSON:", response.get_json())
            print("ERROR TEXT:", response.text)
        else:
            print("SUCCESS! Output keys:", response.get_json().keys())

