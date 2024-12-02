from llama_index.core import (
    VectorStoreIndex,
    SimpleDirectoryReader,
    StorageContext,
    ServiceContext,
    load_index_from_storage
)
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core.node_parser import SentenceSplitter
from llama_index.llms.groq import Groq
import os
from dotenv import load_dotenv
load_dotenv()
import warnings
warnings.filterwarnings('ignore')
import json
import openai
import time
from datetime import datetime



GROQ_API_KEY = os.getenv("GROQ_API_KEY")

reader = SimpleDirectoryReader(input_files=["./documents/1.pdf",'./documents/2.pdf','./documents/3.pdf','./documents/4.pdf','./documents/5.pdf','./documents/6.pdf','./documents/7.pdf','./documents/8.pdf','./documents/9.pdf','./documents/10.pdf','./documents/11.pdf','./documents/12.pdf','./documents/13.pdf','./documents/14.pdf','./documents/15.pdf','./documents/16.pdf','./documents/17.pdf','./documents/18.pdf','./documents/19.pdf','./documents/20.pdf','./documents/21.pdf','./documents/22.pdf','./documents/23.pdf','./documents/24.pdf','./documents/25.pdf','./documents/26.pdf','./documents/27.pdf','./documents/28.pdf','./documents/29.pdf','./documents/30.pdf','./documents/31.pdf','./documents/32.pdf','./documents/33.pdf','./documents/34.pdf','./documents/35.pdf','./documents/36.pdf','./documents/37.pdf','./documents/38.pdf','./documents/39.pdf','./documents/40.pdf','./documents/41.pdf','./documents/42.pdf','./documents/43.pdf','./documents/44.pdf','./documents/45.pdf','./documents/46.pdf','./documents/47.pdf','./documents/48.pdf','./documents/49.pdf'])
documents = reader.load_data()

text_splitter = SentenceSplitter(chunk_size=1024, chunk_overlap=200)
nodes = text_splitter.get_nodes_from_documents(documents, show_progress=True)

embed_model = HuggingFaceEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")

llm = Groq(model="llama3-70b-8192", api_key=GROQ_API_KEY)

service_context = ServiceContext.from_defaults(embed_model=embed_model,llm=llm)

vector_index = VectorStoreIndex.from_documents(documents, show_progress=True, service_context=service_context, node_parser=nodes)

vector_index.storage_context.persist(persist_dir="./storage_mini")

storage_context = StorageContext.from_defaults(persist_dir="./storage_mini")

index = load_index_from_storage(storage_context, service_context=service_context)

query_engine = index.as_query_engine(service_context=service_context)





