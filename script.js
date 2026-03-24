document.getElementById('generate-btn').addEventListener('click', generatePath);
document.getElementById("topic").addEventListener("keydown", function(event) {
    if (event.key = "Enter") {
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
        
        // --- DEFENSIVE CHECK START ---
        // This ensures data.candidates exists and has at least one item
        if (data && data.candidates && data.candidates[0] && data.candidates[0].content) {
            const aiText = data.candidates[0].content.parts[0].text;
            
            loader.style.display = 'none';
            resultDiv.style.display = 'block';

            // Check if marked library is available
            if (typeof marked !== 'undefined') {
                resultDiv.innerHTML = marked.parse(aiText);
            } else {
                resultDiv.innerText = aiText; // Fallback to plain text
            }
        } else {
            throw new Error("The AI returned an empty response. Try a different topic.");
        }
        // --- DEFENSIVE CHECK END ---

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
