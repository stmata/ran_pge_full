import json
from langchain.text_splitter import RecursiveCharacterTextSplitter
import time

class TextChunker:
    def __init__(self, chunk_size=3500, chunk_overlap=600):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len,
            is_separator_regex=False,
        )

    def get_text_chunks(self, data):
        start_time = time.time()
        title = data['title']
        text_brute = data['text_brute']
        module = data['module']
        level = data['level']
        content_type = data['source']
        topic = data['topic']
        
        print(module)
        chunks = self.text_splitter.split_text(text_brute)
        end_time = time.time()
        print(f'Time to get chunks: {round(end_time - start_time, 2)} seconds')
        
        return chunks, module, level, title, content_type , topic

