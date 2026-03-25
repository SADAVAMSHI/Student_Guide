// --- DOM ELEMENTS ---
const loginForm = document.getElementById('login-form');
const loginScreen = document.getElementById('login-screen');
const appScreen = document.getElementById('app-screen');
const avatar = document.getElementById('profile-avatar');
const topicInput = document.getElementById('topic');
const generateBtn = document.getElementById('generate-btn');
const resultDiv = document.getElementById('result');
const loader = document.getElementById('loader');

// --- 1. UI & LOGIN LOGIC ---

// Handle Dummy Login
loginForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevents page reload
    
    // Get username to generate a unique avatar
    const username = document.getElementById('username').value;
    avatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
    
    // Hide login screen, show app screen
    loginScreen.classList.add('hidden');
    appScreen.classList.remove('hidden');
});

// Handle Logout
avatar.addEventListener('click', function() {
    if(confirm("Are you sure you want to log out?")) {
        // Reset state
        loginForm.reset();
        resultDiv.style.display = 'none';
        topicInput.value = '';
        
        // Hide app, show login
        appScreen.classList.add('hidden');
        loginScreen.classList.remove('hidden');
    }
});

// Handle Trending Courses Clicks
document.querySelectorAll('.trending-pill').forEach(pill => {
    pill.addEventListener('click', function() {
        topicInput.value = this.innerText;
        generatePath(); // Auto-generate on click
    });
});

// --- 2. API & GENERATION LOGIC ---

generateBtn.addEventListener('click', generatePath);

topicInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        generatePath();
    }
});

async function generatePath() {
    const topic = topicInput.value.trim();

    if (!topic) {
        alert("Please enter a topic to learn.");
        return;
    }

    // Reset UI state
    resultDiv.style.display = 'none';
    resultDiv.innerHTML = ''; 
    loader.style.display = 'block';

    try {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: topic })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Server responded with ${response.status}`);
        }

        const data = await response.json();
        
        if (data && data.candidates && data.candidates[0] && data.candidates[0].content) {
            const aiText = data.candidates[0].content.parts[0].text;
            
            loader.style.display = 'none';
            resultDiv.style.display = 'block';

            // 1. Render Markdown to HTML
            if (typeof marked !== 'undefined') {
                resultDiv.innerHTML = marked.parse(aiText);
            } else {
                resultDiv.innerText = aiText; // Fallback
            }

            // 2. Find and Render Mermaid Diagrams
            if (typeof mermaid !== 'undefined') {
                const mermaidCodes = resultDiv.querySelectorAll('.language-mermaid');
                
                mermaidCodes.forEach((codeBlock) => {
                    const mermaidText = codeBlock.textContent;
                    const preElement = codeBlock.parentElement; 
                    
                    const mermaidDiv = document.createElement('div');
                    mermaidDiv.className = 'mermaid';
                    mermaidDiv.textContent = mermaidText;
                    
                    preElement.parentNode.replaceChild(mermaidDiv, preElement);
                });

                mermaid.init(undefined, document.querySelectorAll('.mermaid'));
            }

        } else {
            throw new Error("The AI returned an empty response. Try a different topic.");
        }

    } catch (error) {
        console.error("Path Generation Error:", error);
        loader.style.display = 'none';
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <div style="color: #ff4d4d; padding: 20px; border: 1px solid #ff4d4d; border-radius: 8px;">
                <h3>Oops! Something went wrong</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
}
