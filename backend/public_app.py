from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import json
import time
import pytz
from datetime import datetime
from dotenv import load_dotenv
import warnings
from llama_index.llms.openllm import OpenLLM
from llama_index.core.llms import ChatMessage

warnings.filterwarnings('ignore')
load_dotenv()

app = Flask(__name__)
CORS(app)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
os.environ['OPENAI_BASE_URL'] = "https://llm-api.cyverse.ai"
model_name_public = "Meta-Llama-3.1-70B-Instruct-quantized"
llm_public = OpenLLM(model=model_name_public, api_base=os.environ['OPENAI_BASE_URL'], api_key=OPENAI_API_KEY)



MAX_RETRIES = 5
INITIAL_RETRY_DELAY = 2
SESSION_ID = '222222'

def generate_prompt(query):
    """Generates a structured prompt for the public LLM."""
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
        f"Ensure the response is well-organized, clear, and easy to read. Avoid overly technical language unless required.\n\n"
        f"Thank you!"
    )


@app.route('/')
def home():
    return "Welcome to the Public LLM API!"

@app.route('/api/public_query', methods=['POST'])
def public_query():
    json_path = os.path.join(os.path.dirname(__file__), '../frontend/public/data/queries.json')
    data = request.get_json()
    user_query = data.get("query")
    structured_prompt = generate_prompt(user_query)
    retry_delay = INITIAL_RETRY_DELAY

    response_text = None
    for attempt in range(MAX_RETRIES):
        try:
            completion_response = llm_public.chat(messages=[ChatMessage(content=structured_prompt)], max_tokens=2000)
            response_public = completion_response.content if hasattr(completion_response, 'content') else str(completion_response)
            print(response_public)

            prompt_object = {
                "id": SESSION_ID,
                "prompt": str(user_query),
                "response": str(response_public),
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
            print(f"Attempt {attempt + 1}/{MAX_RETRIES}: Error querying Public LLM, retrying...")
            if attempt < MAX_RETRIES - 1:
                time.sleep(retry_delay)
                retry_delay *= 2
            else:
                return jsonify(message="Public LLM unavailable after multiple attempts"), 503

    if response_text is None:
        return jsonify(message="Failed to process query"), 500

    
    return jsonify(response=response_public)


if __name__ == '__main__':
    app.run(debug=True, port=5002)
