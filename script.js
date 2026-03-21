document.getElementById('generate-btn').addEventListener('click', generatePath);
document.getElementById("topic").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        generatePath();
    }
});

async function generatePath() {
    const topic = document.getElementById('topic').value.trim();
    const resultDiv = document.getElementById('result');
    const loader = document.getElementById('loader');

    if (!topic) {
        alert("Please enter a topic to learn.");
        return;
    }

    resultDiv.style.display = 'none';
    loader.style.display = 'block';

    try {
        // We send the topic to our new Vercel serverless function
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: topic })
        });

        if (!response.ok) throw new Error("Failed to fetch from Vercel");

        const data = await response.json();
        
        // Render the response
        const aiText = data.candidates[0].content.parts[0].text;
        loader.style.display = 'none';
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = marked.parse(aiText);

    } catch (error) {
        console.error(error);
        loader.style.display = 'none';
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `<h3 style="color: red;">Error connecting to the server.</h3>`;
    }
}
