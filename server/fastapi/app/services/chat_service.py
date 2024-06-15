import os
import json
from typing import Any
from langchain_openai import ChatOpenAI, AzureOpenAI, AzureChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationalRetrievalChain
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from openai import OpenAI
import time
from dotenv import load_dotenv
import asyncio
from langchain.callbacks.base import BaseCallbackHandler

class StreamingCallbackHandler(BaseCallbackHandler):
    def __init__(self):
        self.queue = asyncio.Queue()

    async def on_llm_new_token(self, token: str, **kwargs: Any) -> None:
        #print(token)
        await self.queue.put(token)

    async def on_llm_end(self, response: None, **kwargs: Any) -> None:
        await self.queue.put(None)

    async def stream_response(self):
        while True:
            token = await self.queue.get()
            
            if token is None:
                break
            yield token

class ChatManager:
    def __init__(self):
        self.load_env()
        self.callback_handler = StreamingCallbackHandler()
        self.current_llm = ChatOpenAI(streaming=True, callbacks=[self.callback_handler])
        self.memory = ConversationBufferMemory(memory_key='chat_history', return_messages=True)
        self.client = OpenAI()

    def load_env(self):
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


    async def stream_chat_response(self, question: str, vector_store):
        try:
            conversation_chain = self.get_conversation_chain(vector_store)
            await conversation_chain.acall({"question": question})
            async for token in self.callback_handler.stream_response():
                yield token  # Les tokens sont envoyés directement sans encodage
        except Exception as e:
            print(f"Erreur lors du traitement de la réponse en streaming: {e}")
            raise
    def generate_title_with_openai(self, new_messages):
        # Construire le texte de la requête à partir des messages
        combined_text = "\n".join([
            f"{'User' if msg['user'] == 0 else 'Bot'}: {msg['text']}" 
            for msg in new_messages
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
