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
from llama_index.agent import ReActAgent
from llama_index.llms import OpenAI
from helpers.bottom_up import tools
from prompts import new_prompt, instruction_str, context
from collections import defaultdict
load_dotenv()


llm = OpenAI(model="gpt-3.5-turbo")
agent = ReActAgent.from_tools(tools, llm=llm, verbose=True, context=context, max_iterations=None)

# Define chapter dictionnary

chapters = {'Chap1': 'Chapter 1: Defining Marketing  for the New Realities, Kotler et. al.',
            'Chap2': 'Chapter 2: Marketing Planning and Management, Kotler et. al.',
            'Chap3': 'Chapter 3: Analyzing Consumer Markets, Kotler et. al.',
            'Chap4': 'Chapter 5: Analyzing Business Markets, Kotler et. al.',
            'Chap5': 'Chapter 5: Conducting Marketing Research, Kotler et. al.',
            'Chap6': 'Chapter 6: Identifying Market Segments and Target Customers, Kotler et. al.',
            'Chap7': 'Chapter 7: Crafting a Customer Value Proposition and Positioning, Kotler et. al.',
            'Chap8': 'Chapter 8: Designing and Managing Products, Kotler et. al.',
            'Chap9': 'Chapter 9: Designing and Managing Services, Kotler et. al.',
            'Chap10': 'Chapter 10: Building Strong Brands, Kotler et. al.',
            'Chap11': 'Chapter 11: Managing Pricing and Sales Promotions, Kotler et. al.',
            'Chap12': 'Chapter 12: Managing Marketing Communications, Kotler et. al.',
            'Chap13': 'Chapter 13: Designing an Integrated Marketing Campaign in the Digital Age, Kotler et. al.',
            'Chap14': 'Chapter 14: Personal Selling and Direct Marketing, Kotler et. al.',
            'Chap15': 'Chapter 15: Designing and Managing Distribution Channels, Kotler et. al.',
            'Chap16': 'Chapter 16: Managing Retailing, Kotler et. al.',
            'Chap17': 'Chapter 17: Driving Growth in Competitive Markets, Kotler et. al.',
            'Chap18': 'Chapter 18: Developing New Market Offerings, Kotler et. al.',
            'Chap19': 'Chapter 19: Building Customer Loyalty, Kotler et. al.',
            'Chap20': 'Chapter 20: Tapping into Global Markets, Kotler et. al.',
            'Chap21': 'Chapter 21: Socially Responsible Marketing, Kotler et. al.',
            'Chap22': 'Article: Target marketing and segmentation, valid and useful tools for marketing.  Dennis J. Cahill',
            'Chap23': 'Article: Measuring Emotions in the Consumption Experience Marsha L. Richins',
            'Chap24': 'Article: Consumers perception of organic product characteristics. A review. Rosa Schleenbecker , Ulrich Hamm',
            'Chap25': 'Book: consuming experience. Antonella CAR and Bernard Cova',
            'Chap26': 'Article: An Exercise in Personal Exploration,  Maslows Hierarchy of Needs. Bob Poston, cst',
            'Chap27': 'Article: Consumer behaviour. From Wikipedia made available by the professor.',
            'Chap28': 'Article: Emotions in consumer behavior, a hierarchical approach Fleur J.M. Laros, Jan-Benedict E.M. Steenkamp',
            'Chap29': 'Article:The Family Life Cycle,  a DemographicAnalysis Rob W. Lawson',
            'Chap30': 'Book: This is Marketing Seth Godin',
            'Chap31': 'Book: Marketing the basics. Karl Moore and Niketh Pareek',
            'Chap32': 'Book: Marketing stratégique et opérationnel. Du marketing à l orientation-marché. 7e édition. Jean-Jacques Lambin et Chantal de Moerloose',
            }

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

# Function to retrieve the extracted chunks to answer the question
def extract_chunk_content(agent_result):
     # Get text element from result source_nodes
    extracted_text = [entry.text for entry in agent_result.source_nodes]
    # Provided text
    text = extracted_text
    # Convert the text from list to string
    text = ''.join(text)
    # Removing "[" and "]" characters from the beginning and end of the text
    text = text[2:-1]
    # Replacing "\n" with new line
    text = text.replace('\n', '\n')
    # Splitting text into chapters
    chapters = text.split("CHAPTER")
    return text

@app.post("/process-data")
def process_data(query: userQuery):
    # Process the receive data
    print('Receiving user query ...')
    print(f'User input: {query.question}')
    try:
        result = agent.query(query.question)
        print(result)
        # Get Metadata
        metadata = [entry.metadata for entry in result.source_nodes]
        list_of_dicts = ast.literal_eval(str(metadata))
        scores = [entry.score for entry in result.source_nodes]
        print(list_of_dicts)
        # Extract peace of texts (chunks) used to respond
        chunks = extract_chunk_content(result) 
        # # Given dictionary
        # data = [{'page_label': '2', 'file_name': './data/Chap1.pdf'}, {'page_label': '11', 'file_name': './data/Chap1.pdf'}]

        # Extract and format the desired information
        formatted_sources = [f"{entry['file_name'].split('/')[-1].split('.')[0]} : Page label {entry['page_label']}" for entry in list_of_dicts]
        # Replacing Chapx with its corresponding value from the chapters dictionary
        formatted_sources_with_chapter_names = [chapters.get(source.split(" : ")[0], source.split(" : ")[0]) + " : Page label " + source.split(" : ")[1] for source in formatted_sources]
        # Cleaning up the source list to remove the duplicate "Page label" phrase and organizing by chapter
        chapter_pages = defaultdict(list)
        for item in formatted_sources_with_chapter_names:
            chapter_info, page_number = item.rsplit(' ', 3)[0], item.split()[-1]
            chapter_info = chapter_info.replace(" : Page label Page label", "")  # Clean up redundant "Page label"
            chapter_pages[chapter_info].append(page_number)
        # Adjusting the formatting to remove the repeated "Page label: Page label" issue
        bullet_list = [f"- {chapter} {', '.join(sorted(set(pages)))}" for chapter, pages in chapter_pages.items()]
        print(f'Formatted sources: {formatted_sources}')
        print(f'Formatted sources with chapters: {bullet_list}')
        print(scores)
        print('End bottom up!')
        
        # return {'Response': {response}}
        return {'response' : result.response, 'sources':bullet_list, 'scores':scores, 'chunks': chunks}
    except:
        return {'response' : "", 'sources':[], 'scores':[], 'chunks': ""}

# Launch the app
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8002))
    uvicorn.run(app, host="0.0.0.0", port=port)
