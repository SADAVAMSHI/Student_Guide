from flask import Flask, render_template, request, jsonify
from agno.agent import Agent
from agno.models.ollama import Ollama
from agno.tools.duckduckgo import DuckDuckGoTools

app = Flask(__name__)

# --- AGENT CONFIGURATION ---
agent = Agent(
    model=Ollama(id="llama3.2"),
    tools=[DuckDuckGoTools()],
    
    # THIS LINE shows everything in your backend terminal
    debug_mode=True, 
    
    # This keeps the final website output clean (no JSON blocks)
    # show_tool_calls=False, 
    
   
    
    description = "your a professional expert in 10 years of experience recommending learning path for students to get the highest paying job by featching the information from the internet",
    instructions=[
        "Search the web using duckduckgo_search to find current facts, skills about the topic.",
        "Genrate the detailed path to user with how much time he has to spend on every topic",
        "Give the required projects and certifications to have "
    ],
  
)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    topic = request.json.get('topic')
    # agent.run() will now trigger the terminal logs because debug_mode=True
    response = agent.run(topic)
    return jsonify({"song": response.content})

if __name__ == '__main__':
    app.run(debug=True)