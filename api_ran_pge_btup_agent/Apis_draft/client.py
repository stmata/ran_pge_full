import json, requests

url = 'http://localhost:8000/process-data'


user_input = {'question':'What is marketing?', 'name': 'Steve'}
response = requests.post(url, json=user_input)
print(f'Response: {response.json()}\nStatus: {response.status_code}')