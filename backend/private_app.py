from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import time
import json
import uuid
from datetime import datetime
import pytz
from dotenv import load_dotenv
import warnings
from llama_index.core import (
    StorageContext,
    ServiceContext,
    load_index_from_storage
)
from llama_index.embeddings.huggingface import HuggingFaceEmbedding
from llama_index.llms.groq import Groq

warnings.filterwarnings('ignore')
load_dotenv()

app = Flask(__name__)
CORS(app, origins="http://localhost:3000")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
embed_model_private = HuggingFaceEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")
llm_private = Groq(model="llama3-70b-8192", api_key=GROQ_API_KEY)
service_context_private = ServiceContext.from_defaults(embed_model=embed_model_private, llm=llm_private)
storage_context_private = StorageContext.from_defaults(persist_dir="./storage_mini")
index_private = load_index_from_storage(storage_context_private, service_context=service_context_private)
query_engine_private = index_private.as_query_engine(service_context=service_context_private)

MAX_RETRIES = 5
INITIAL_RETRY_DELAY = 2
SESSION_ID = '222222'


def generate_prompt(query):
    """Generates a structured prompt for the LLM to produce organized responses."""
    return (
        f"Please provide a comprehensive, well-structured, and neatly formatted response to the following query.\n\n"
        f"**Query:** \"{query}\"\n\n"
        f"**Response Requirements:**\n"
        f"1. **Overview**: Start with a concise overview or introduction, summarizing the main points.\n"
        f"2. **Organized Content**:\n"
        f"   - Use clear headings for each major section.\n"
        f"   - Break down the content into bullet points or numbered lists where applicable.\n"
        f"   - Include specific examples, definitions, or explanations to clarify each point.\n"
        f"3. **Formatting**:\n"
        f"   - Use bold text for key terms and headings (e.g., **Key Term:**).\n"
        f"   - For sub-points, use indentation for readability.\n"
        f"   - Separate sections with line breaks to ensure the response is visually easy to follow.\n"
        f"4. **Summary**: Conclude with a brief summary or key takeaways.\n\n"
        f"Ensure the response is well-organized, clear, and easy to read.\n\n"
        f"Thank you!"
    )

@app.route('/')
def home():
    return "Welcome to the Private LLM API!"

@app.route('/api/new_chat', methods=['POST'])
def new_chat():
    json_path = os.path.join(os.path.dirname(__file__), '../frontend/public/data/queries.json')
    #print(json_data)
    with open((json_path), 'w') as file:
        json.dump([], file, indent=2)

@app.route('/api/upload', methods=['POST'])
def upload():
    file_path_string = os.path.join(os.path.dirname(__file__), '../frontend/public/data/uploads')
    os.makedirs(file_path_string, exist_ok=True)  # Ensure the directory exists

    file = request.files.get('file')
    if not file or file.filename == '':
        return jsonify({'error': 'No file provided or filename is empty'}), 400

    try:
        file_path = os.path.join(file_path_string, file.filename)
        file.save(file_path)
        return jsonify({'message': 'File uploaded successfully!'}), 200
    except Exception as e:
        print(f"Error saving file: {e}")
        return jsonify({'error': 'Failed to save file'}), 500

@app.route('/api/rating_prompts', methods=['POST'])
def rating_prompts():
    json_path = os.path.join(os.path.dirname(__file__), '../frontend/public/data/queries.json')
    data = request.get_json()
    json_data = data.get("jsonData")
    print(json_data)
    with open((json_path), 'w') as file:
        json.dump(json_data, file, indent=2)

    return jsonify(response = json_data)

@app.route('/api/private_query', methods=['POST'])
def private_query():
    
    json_path = os.path.join(os.path.dirname(__file__), '../frontend/public/data/queries.json')
    data = request.get_json()
    user_query = data.get("query")
    prompt = generate_prompt(user_query)
    retry_delay = INITIAL_RETRY_DELAY

    response_private = None
    for attempt in range(MAX_RETRIES):
        try:
            response = query_engine_private.query(prompt)
            response_private = response.text if hasattr(response, 'text') else str(response)  
            print("Response from Private LLM:", response_private)
            
            prompt_object = {
                "id": SESSION_ID,
                "prompt": str(user_query),
                "response": str(response_private),
                "date": datetime.now(pytz.timezone("America/Phoenix")).isoformat(),
                "good_prompt": False,
                "bad_prompt": False,
                "rewrite": True
            }
            with open((json_path), 'r') as file:
                queries = json.load(file)
                
            
            queries.append(prompt_object)
            print(SESSION_ID)
            with open((json_path), 'w') as file:
                json.dump(queries, file, indent=2)

            return jsonify(message="Query processed and appended successfully")
        except Exception as e:
            print(f"Attempt {attempt + 1}/{MAX_RETRIES}: Error querying Private LLM - {e}")
            if attempt < MAX_RETRIES - 1:
                time.sleep(retry_delay)
                retry_delay *= 2
            else:
                return jsonify(message="Private LLM unavailable after multiple attempts"), 503

    if response_private is None:
        return jsonify(message="Failed to process query"), 500

    return jsonify(response=response_private)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
