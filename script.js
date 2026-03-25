document.getElementById('generate-btn').addEventListener('click', generatePath);
document.getElementById("topic").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        generatePath();
    }
});

async function generatePath() {
    const topicInput = document.getElementById('topic');
    const topic = topicInput.value.trim();
    const resultDiv = document.getElementById('result');
    const loader = document.getElementById('loader');

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

            // 2. Find Mermaid code blocks, format them, and render the chart
            if (typeof mermaid !== 'undefined') {
                // Marked.js automatically turns ```mermaid into <code class="language-mermaid">
                const mermaidCodes = resultDiv.querySelectorAll('.language-mermaid');
                
                mermaidCodes.forEach((codeBlock) => {
                    const mermaidText = codeBlock.textContent;
                    const preElement = codeBlock.parentElement; // The wrapping <pre> tag
                    
                    // Create a new div specifically for Mermaid to target
                    const mermaidDiv = document.createElement('div');
                    mermaidDiv.className = 'mermaid';
                    mermaidDiv.textContent = mermaidText;
                    
                    // Replace the old code block with the new diagram block
                    preElement.parentNode.replaceChild(mermaidDiv, preElement);
                });

                // Trigger Mermaid to draw the diagrams
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
}// --- NEW FEATURES LOGIC ---

// 1. Trending Courses Click Logic
document.querySelectorAll('.trending-pill').forEach(pill => {
    pill.addEventListener('click', function() {
        // Set the input value to the pill's text
        document.getElementById('topic').value = this.innerText;
        // Automatically trigger the generation
        generatePath(); 
    });
});

// 2. Mock Login / Avatar Toggle Logic
const loginBtn = document.getElementById('login-btn');
const avatar = document.getElementById('profile-avatar');
let isLoggedIn = false;

loginBtn.addEventListener('click', () => {
    isLoggedIn = true;
    loginBtn.style.display = 'none';
    avatar.style.display = 'block';
    
    // Generates a random nice-looking avatar using DiceBear API
    const randomSeed = Math.random().toString(36).substring(7);
    avatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`; 
});

