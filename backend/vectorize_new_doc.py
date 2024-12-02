from llama_index.core import (
    VectorStoreIndex,
    SimpleDirectoryReader,
    StorageContext,
    ServiceContext,
    load_index_from_storage
)
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.core.node_parser import SimpleNodeParser
from llama_index.llms.groq import Groq
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Load Groq API key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Define the directory where documents are stored
DOC_DIRECTORY = "/Users/rahuljadhav/Documents/rag_imp-main/backend/documents"

# Initialize the HuggingFace embedding model
embed_model = HuggingFaceEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")

# Initialize the Groq model for LLM queries
llm = Groq(model="llama3-70b-8192", api_key=GROQ_API_KEY)

# Set up the service context with embedding model and LLM
service_context = ServiceContext.from_defaults(embed_model=embed_model, llm=llm)

# Function to load and process documents from the directory
def load_and_process_documents():
    reader = SimpleDirectoryReader(input_files=get_pdf_files(DOC_DIRECTORY))
    documents = reader.load_data()

    # Split documents into chunks (parsing into nodes)
    parser = SimpleNodeParser()
    nodes = parser.get_nodes_from_documents(documents)

    return documents, nodes

# Function to get all PDF files in the specified directory
def get_pdf_files(directory):
    pdf_files = [os.path.join(directory, f) for f in os.listdir(directory) if f.endswith('.pdf')]
    return pdf_files

# Function to create and persist a vector index
def create_and_persist_index(documents, nodes):
    # Create a vector store index from the documents
    index = VectorStoreIndex.from_documents(documents, service_context=service_context)

    # Persist the vector index to storage
    index.storage_context.persist(persist_dir="./storage_mini")
    return index

# Check if the vector index exists and load it
def load_existing_index():
    if os.path.exists("./storage_mini"):
        storage_context = StorageContext.from_defaults(persist_dir="./storage_mini")
        index = load_index_from_storage(storage_context, service_context=service_context)
        return index
    return None

# Function to perform incremental update of the vector index
def incremental_update():
    documents, nodes = load_and_process_documents()

    # Load existing index if it exists
    existing_index = load_existing_index()

    if existing_index is None:
        # No existing index, create a new one
        create_and_persist_index(documents, nodes)
    else:
        # Index exists, insert new nodes
        print("Adding new nodes to the existing index...")
        existing_index.insert_nodes(nodes)

    # Return the updated index
    storage_context = StorageContext.from_defaults(persist_dir="./storage_mini")
    index = load_index_from_storage(storage_context, service_context=service_context)
    return index

# Function to create query engine for the given index
def create_query_engine(index):
    query_engine = index.as_query_engine(service_context=service_context)
    return query_engine

# Main execution logic
def main():
    # Perform incremental update
    index = incremental_update()

    # Create query engine for interacting with the index
    query_engine = create_query_engine(index)

    # Example query execution (uncomment to run queries)
    # response = query_engine.query("What is the content of document 1?")
    # print(response)

if __name__ == "__main__":
    main()


