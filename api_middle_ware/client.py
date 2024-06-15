import json, requests

url = 'https://api-ranpge-middleware-agent.azurewebsites.net/process-data'

qts = ["Quels sont les éléments clés du marketing mix ?", "Comment les éléments clés du marketing interagissent-ils pour influencer les décisions des consommateurs ?", "En quoi consiste la segmentation du marché ?"]
res = []

for q in qts:
    user_input = {"question":q}
    r = requests.post(url, json=user_input)
    print(f'Question: {q}')
    print(f"Status: {r.status_code}")
    print(f"Response: {r.json()['response']}\n")
    print(f"References: {r.json()['sources']}\n")
    print(f"Scores: {r.json()['scores']}\n")
    print(f"Chunks\n-------\n{r.json()['chunks']}\n")
    print('\nNext response\n----------------')





