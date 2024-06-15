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

class userQuery(BaseModel):
    question: dict


@app.get("/get-data")
async def answer(question: Optional[str] = Query(None), user: Optional[str] = Query(None)):
    
    return json.dumps({"User_input":question, "User_name":user})



# Launch the app
if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)