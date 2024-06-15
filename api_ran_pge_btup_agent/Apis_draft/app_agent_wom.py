from fastapi import FastAPI, HTTPException, Request, Query
from typing import Optional
import json
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
import uvicorn


# Create FastAPI app
app = FastAPI()


class serverResponse(BaseModel):
    question: str
    response: str
    content: str
    source: list
# Model of Client input values
class userQuery(BaseModel):
    question: str
    name: str


@app.post("/process-data")
async def process_data(query: userQuery):
    # Process the receive data
    processed_data = f"question: {query.question}, name: {query.name}"
    print(processed_data)
    processed_data = dict({'question': {query.question}, 'name': {query.name}})
    return {processed_data}


# Launch the app
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)