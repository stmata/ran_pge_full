import json, requests

url = 'http://localhost:8000/get-data'


user_input = json.dumps({'question':'What is marketing?', 'user': 'Steve'}) 
response = requests.get(url, params=user_input)
print(f'Response: {response.json()}\nStatus: {response.status_code}')