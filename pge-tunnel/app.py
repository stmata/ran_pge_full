from flask import Flask, request, Response
import requests
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

BACKEND_BASE_URL = "http://20.19.90.68:8080"

@app.route('/', defaults={'path': ''}, methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
@app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
def proxy(path):
    print(f"Receiving request for {path}")
    dest_url = f"{BACKEND_BASE_URL}/{path}"
    print(f"Destination URL: {dest_url}")

    headers = {key: value for key, value in request.headers.items() if key.lower() != 'host'}
    print("Request Headers:", headers)

    if request.content_type and 'multipart/form-data' in request.content_type:
        print("Handling multipart/form-data")
        files = {
            name: (file.filename, file.stream, file.content_type)
            for name, file in request.files.items()
        }
        data = request.form
        print("Form Data:", data)
        print("Files:", list(files.keys()))

        # Ajoutez data aux arguments de la requête
        response = requests.request(
            method=request.method,
            url=dest_url,
            #headers=headers,
            files=files,
            data=data,  # <-- Ici
            params=request.args,
            allow_redirects=False
        )

    else:
        json_data = request.get_json(silent=True)
        print("JSON Data:", json_data)

        response = requests.request(
            method=request.method, 
            url=dest_url, 
            headers=headers, 
            json=json_data, 
            params=request.args, 
            allow_redirects=False
        )

    print(f"Response Status Code: {response.status_code}")
    excluded_headers = ['content-encoding', 'content-length', 'transfer-encoding', 'connection']
    response_headers = {name: value for (name, value) in response.headers.items() if name.lower() not in excluded_headers}
    print("Response Headers:", response_headers)

    return Response(response.content, status=response.status_code, headers=response_headers)

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=8000)

