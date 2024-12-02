
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
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import json
import openai
import time
from datetime import datetime




app = Flask(__name__)
os.environ["TOKENIZERS_PARALLELISM"] = "false"
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})
socketio = SocketIO(app, cors_allowed_origins="http://localhost:3000")


GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# reader = SimpleDirectoryReader(input_files=["./documents/document1.pdf"])
# documents = reader.load_data()

# text_splitter = SentenceSplitter(chunk_size=1024, chunk_overlap=200)
# nodes = text_splitter.get_nodes_from_documents(documents, show_progress=True)

embed_model = HuggingFaceEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")

llm = Groq(model="llama3-70b-8192", api_key=GROQ_API_KEY)

service_context = ServiceContext.from_defaults(embed_model=embed_model,llm=llm)

# vector_index = VectorStoreIndex.from_documents(documents, show_progress=True, service_context=service_context, node_parser=nodes)

# vector_index.storage_context.persist(persist_dir="./storage_mini")

storage_context = StorageContext.from_defaults(persist_dir="./storage_mini")

index = load_index_from_storage(storage_context, service_context=service_context)

query_engine = index.as_query_engine(service_context=service_context)



queries_json_path = os.path.join(os.path.dirname(__file__), '../frontend/public/data/queries.json')

# Max retries and retry delay settings
MAX_RETRIES = 5
INITIAL_RETRY_DELAY = 2  # seconds


@app.route('/api/query', methods=['POST', 'OPTIONS'])
def process_query():
    if request.method == 'OPTIONS':
        return '', 200

    data = request.get_json()
    query = data.get('query')

    resp = None
    retry_delay = INITIAL_RETRY_DELAY
    for attempt in range(MAX_RETRIES):
        try:
            
            resp = query_engine.query(query)
            print("Response from OpenAI:", resp)
            break
        except openai.error.InternalServerError as e:
            print(f"Attempt {attempt + 1}/{MAX_RETRIES}: OpenAI service unavailable, retrying...")
            if attempt < MAX_RETRIES - 1:
                time.sleep(retry_delay)
                retry_delay *= 2
            else:
                return jsonify(message="OpenAI service unavailable after multiple attempts"), 503

    if resp is None:
        return jsonify(message="Failed to process query"), 500


    new_query_content = {
        "prompt": str(query),
        "response": str(resp),
        "date": datetime.now().isoformat(),  # Current date in ISO format
        "good_prompt": False,
        "rewrite": True
    }

    # Load the existing queries from the JSON file
    try:
        with open(queries_json_path, 'r') as file:
            queries = json.load(file)
    except FileNotFoundError:
        
        queries = []


    queries.append(new_query_content)

    # Write the updated queries back to the JSON file
    with open(queries_json_path, 'w') as file:
        json.dump(queries, file, indent=2)

    return jsonify(message="Query processed and appended successfully")

if __name__ == '__main__':
    app.run(debug=True, port=5000)
