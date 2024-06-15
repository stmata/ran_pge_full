from fastapi import FastAPI, HTTPException, Request, Query
from typing import Optional
import json
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List
import uvicorn
from dotenv import load_dotenv
import os
import ast
import json, requests
from openai import OpenAI
client = OpenAI()
from collections import defaultdict
import httpx, asyncio
load_dotenv()

# Define chapter dictionnary

# URLs for the two APIs you're querying
agent_api_url_topdown = 'http://localhost:8001/process-data'
agent_api_url_bottopup = 'http://localhost:8002/process-data'


# Get response from topdown agent
def get_agent_response_topdown(prompt):
    user_input = {'question': prompt + ' Use bullet to format the output whenever possible.'}
    print(f'User Input: {user_input}')
    try:
        print('Query sent to server ...')
        response = requests.post(agent_api_url_topdown, json=user_input)
        print('Response received from server ...')
        print(f'Answer: {response.json()["response"]}')
        print(f'Sources: {response.json()["sources"]}')
        print(f'Scores: {response.json()["scores"]}')
        return response.json()['response'], response.json()['sources'], response.json()['scores'], response.json()['chunks']
    except:
        return ""

# Get response from bottomup agent
def get_agent_response_bottomup(prompt):
    user_input = {'question': prompt + ' Use bullet to format the output whenever possible.'}
    print(f'User Input: {user_input}')
    try:
        print('Query sent to server ...')
        response = requests.post(agent_api_url_bottopup, json=user_input)
        print('Response received from server ...')
        print(f'Answer: {response.json()["response"]}')
        print(f'Sources: {response.json()["sources"]}')
        print(f'Scores: {response.json()["scores"]}')
        return response.json()['response'], response.json()['sources'], response.json()['scores'], response.json()['chunks']
    except:
        return ""
# Define a function to extract approximately 30 words from a position in the text
def extract_approx_30_words(text, start=0, end=None):
    words = text.split()  # Split the text into words
    if end:
        selected_words = words[start:end]
    else:
        selected_words = words[start:start+80]
    return " ".join(selected_words) + "...\n"  # Return the joined words and add "..." at the end

# Adjusting the approach to correctly extract and display the end subtext
def extract_end_approx_30_words(text):
    words = text.split()  # Split the text into words
    selected_words = words[-80:]  # Select the last 30 words
    return " ".join(selected_words) + "..."  # Return the joined words and add "..." at the end
# Combined chunks and display beginning, middle, and end
def combine_split_chunks(text):
    total_words = len(text.split())
    start_middle = total_words // 2 - 40  # Start from the middle, adjusting to get ~30 words
    # Extract approximately 30 words for each subtext
    beginning_sub_text_30 = extract_approx_30_words(text, 0, 80)
    middle_sub_text_30 = extract_approx_30_words(text, start_middle, start_middle + 80)
    end_sub_text_30 = extract_end_approx_30_words(text)
    # Combine the subtexts for display
    display_text_30_words = f"[...] {beginning_sub_text_30} \n[...] {middle_sub_text_30} \n[...] {end_sub_text_30}"
    return display_text_30_words
# Create FastAPI app
app = FastAPI()

# Model of Client input values
class userQuery(BaseModel):
    question: str

@app.post("/process-data")
def process_data(query: userQuery):
    # Process the receive data
    print('Receiving user query ...')
    user_input = query.question
    print(f'User input: {user_input}')
    if user_input == "":
        return {'response' : "", 'sources':[], 'scores':[], 'chunks': ""}
    else:
        try:
            # Make GET requests to both APIs
            thought_topdown, source_topdown, score_topdown, chunk_topdown = get_agent_response_topdown(user_input)
            thought_bottomup, source_bottomup, score_bottomup, chunk_bottomup = get_agent_response_bottomup(user_input)
            # Combine the responses
            combined_response = f"{thought_topdown}\n{thought_bottomup}"
            # Merge source and remove duplicates, preserving order
            merged_source = list(set(source_topdown) | set(source_bottomup))
            seen = set()
            unique_list = [x for x in merged_source if not (x in seen or seen.add(x))]
            merged_source = unique_list

            # Merge scores and remove duplicates, preserving order
            merged_score = list(set(score_topdown) | set(score_bottomup))
            # Here, we're assuming we want to generate a summary, we can customize the prompt as needed
            messages = [
                {"role": "system", "content":"You are an editor of a marketing journal. Your role is to synthesize the text you are provided with; there are responses from two different sources for the same question. Provide as much relavant details and use bullet where necessary. DO NOT BE REDUNDANT. DO NOT SEARCH FROM THE WEB. IF THE CONTENT IS EMPTY RESPOND: 'It was not possible no retrieve responses. Please try again later or contact the administrator. "}
            ]
            # Add the user's question to the messages as a User Role
            messages.append({"role": "user", "content": f"The question was '{user_input}' and the combined responses to synthesisis :'{combined_response}'"})
            gpt_response = client.chat.completions.create(
                model="gpt-4", # we might need to adjust the engine name based on what's available
            messages=messages,
                temperature=0.7,
                max_tokens=2000
            )
            gpt_synthesis = gpt_response.choices[0].message.content
            sample_chunks = combine_split_chunks(chunk_topdown)
            print(f'Response: {gpt_synthesis}\nSources: {merged_source}\nScores: {merged_score}\nChunks: {sample_chunks}')
            return {'response' : gpt_synthesis, 'sources':merged_source, 'scores':merged_score, 'chunks': sample_chunks}
        except:
            return {'response' : "", 'sources':[], 'scores':[], 'chunks': ""}

# Launch the app
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8011))
    uvicorn.run(app, host="0.0.0.0", port=port)
    
