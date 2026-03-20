from flask import Flask, render_template, request, jsonify
from agno.agent import Agent
from agno.models.ollama import Ollama
from agno.tools.duckduckgo import DuckDuckGoTools

app = Flask(__name__)

# --- AGENT CONFIGURATION ---
agent = Agent(
    model=Ollama(id="llama3.2"),
    tools=[DuckDuckGoTools()],
    debug_mode=True, 
    description="You are a professional expert with 10 years of experience recommending learning paths for students to get the highest paying job by fetching information from the internet.",
    instructions=[
        "Search the web using duckduckgo_search to find current facts and skills about the topic.",
        "Generate a detailed path for the user including how much time they should spend on every topic.",
        "Give the required projects and certifications to have."
    ]
)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    topic = request.json.get('topic')
    response = agent.run(topic)
    return jsonify({"song": response.content})

if __name__ == '__main__':
    app.run(debug=True)
