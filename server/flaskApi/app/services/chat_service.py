import os
import json
from langchain_openai import ChatOpenAI, AzureOpenAI, AzureChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from openai import OpenAI
import os
import time


class ChatManager:
    def __init__(self):
        self.load_env()
        self.current_llm = ChatOpenAI(streaming=True,callbacks=[StreamingStdOutCallbackHandler()])
        # self.current_llm = AzureChatOpenAI(api_key=os.getenv('AZURE_OPENAI_KEY'), azure_endpoint=os.getenv('AZURE_OPENAI_ENDPOINT') , azure_deployment='sk-3',openai_api_version="2023-05-15")
        self.client = OpenAI()
        # self.client = AzureOpenAI(api_key=os.getenv('AZURE_OPENAI_KEY'), azure_endpoint=os.getenv('AZURE_OPENAI_ENDPOINT') , azure_deployment='sk-3',openai_api_version="2023-05-15")

    def load_env(self):
        from dotenv import load_dotenv
        load_dotenv()

    def get_conversation_chain(self, vector_store, memory_key):
        try:
            current_memory = ConversationBufferMemory(memory_key='chat_history', return_messages=True)
            
        
            conversation_chain = ConversationalRetrievalChain.from_llm(
                llm=self.current_llm,
                retriever=vector_store.as_retriever(),
                memory=current_memory
            )
            return conversation_chain
        except Exception as e:
            print(f"Erreur lors de la création de la chaîne de conversation: {e}")
            raise


    def generate_title_with_openai(self, newMessages):
        # Construire le texte de la requête à partir des messages
        combined_text = "\n".join([
            f"{'User' if msg['user'] == 0 else 'Bot'}: {msg['text']}" 
            for msg in newMessages
        ])

        prompt = f"Create a concise title for the following messages summary:\n{combined_text}"

        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",  # Ou un autre modèle approprié
                messages=[{
                    "role": "system",
                    "content": prompt
                }],
                
            )
            title = response.choices[0].message.content
            return title
        except Exception as e:
            print(f"Erreur lors de la génération du titre : {str(e)}")
            return "Conversation"
    

# import os
# import requests
# from dotenv import load_dotenv
# from langchain.memory import ConversationBufferMemory
# from langchain.chains import ConversationalRetrievalChain

# class AzureChatOpenAI:
#     def __init__(self):
#         self.api_key = os.getenv('AZURE_OPENAI_KEY')
#         self.endpoint = os.getenv('AZURE_OPENAI_ENDPOINT')
#         self.headers = {
#             'Content-Type': 'application/json',
#             'Authorization': f'Bearer {self.api_key}'
#         }

#     def generate_response(self, prompt):
#         data = {
#             "prompt": prompt,
#             "max_tokens": 150,
#             "temperature": 0.7
#         }
#         response = requests.post(f'{self.endpoint}/chat/completions', headers=self.headers, json=data)
#         response_json = response.json()
#         return response_json['choices'][0]['message']['content']

# class ChatManager:
#     def __init__(self):
#         self.load_env()
#         self.current_llm = AzureChatOpenAI()

#     def load_env(self):
#         load_dotenv()

#     def get_conversation_chain(self, vector_store, memory_key):
#         try:
#             current_memory = ConversationBufferMemory(memory_key='chat_history', return_messages=True)
#             conversation_chain = ConversationalRetrievalChain.from_llm(
#                 llm=self.current_llm,
#                 retriever=vector_store.as_retriever(),
#                 memory=current_memory
#             )
#             return conversation_chain
#         except Exception as e:
#             print(f"Erreur lors de la création de la chaîne de conversation: {e}")
#             raise

#     def generate_title_with_openai(self, newMessages):
#         combined_text = "\n".join([
#             f"{'User' if msg['user'] == 0 else 'Bot'}: {msg['text']}" 
#             for msg in newMessages
#         ])
#         prompt = f"Create a concise title for the following messages summary:\n{combined_text}"
#         try:
#             title = self.current_llm.generate_response(prompt)
#             return title
#         except Exception as e:
#             print(f"Erreur lors de la génération du titre : {str(e)}")
#             return "Conversation"

# Note: This code assumes that you have an `AZURE_OPENAI_KEY` and `AZURE_OPENAI_ENDPOINT` in your environment variables.
# You will also need to adjust the URL path to match the actual API endpoints provided by Azure OpenAI for your subscription.

