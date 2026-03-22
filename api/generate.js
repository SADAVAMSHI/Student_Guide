export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { topic } = req.body;
    
    // THIS is where Vercel secretly injects your API key!
    const apiKey = process.env.GEMINI_API_KEY; 

    const systemPrompt = `You are a professional expert with 10 years of experience recommending learning paths for students to get the highest paying job. 
    Generate a detailed path for the user including how much time they should spend on every topic. 
    Give the required projects and certifications to have. 
    Format the response in clean Markdown.
    The user wants to learn: ${topic}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }]
            })
        });

        const data = await response.json();
        
        // Send the AI's answer back to your frontend
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to communicate with AI' });
    }
}