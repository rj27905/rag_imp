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

# Environment variable for the API key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Define the directory containing the documents
DOC_DIRECTORY = "/Users/rahuljadhav/Documents/rag_imp-main/backend/documents"

# Get all file paths in the directory
doc_files = [
    os.path.join(DOC_DIRECTORY, file)
    for file in os.listdir(DOC_DIRECTORY)
    if file.endswith('.pdf')  # Add conditions for other file types if needed
]

# Use the dynamically generated file paths
reader = SimpleDirectoryReader(input_files=doc_files)
documents = reader.load_data()

# Split documents into nodes
text_splitter = SentenceSplitter(chunk_size=1024, chunk_overlap=200)
nodes = text_splitter.get_nodes_from_documents(documents, show_progress=True)

# Define embedding model
embed_model = HuggingFaceEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Define LLM
llm = Groq(model="llama3-70b-8192", api_key=GROQ_API_KEY)

# Create service context
service_context = ServiceContext.from_defaults(embed_model=embed_model, llm=llm)

# Create vector index
vector_index = VectorStoreIndex.from_documents(documents, show_progress=True, service_context=service_context, node_parser=nodes)

# Persist vector index
vector_index.storage_context.persist(persist_dir="./storage_mini")

# Load index from storage
storage_context = StorageContext.from_defaults(persist_dir="./storage_mini")
index = load_index_from_storage(storage_context, service_context=service_context)

# Create query engine
query_engine = index.as_query_engine(service_context=service_context)
