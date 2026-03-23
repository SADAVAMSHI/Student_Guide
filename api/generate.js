export default async function handler(req, res) {
    // 1. Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { topic } = req.body;
    
    // 2. Validate Topic
    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY; 

    // 3. Safety Check: Ensure API Key exists in Vercel
    if (!apiKey) {
        console.error("GEMINI_API_KEY is missing from Environment Variables");
        return res.status(500).json({ error: 'Server configuration error: Missing API Key' });
    }

    const systemPrompt = `You are a professional expert with 10 years of experience recommending learning paths for students to get the highest paying job. 
    Generate a detailed path for the user including how much time they should spend on every topic. 
    Give the required projects and certifications to have. 
    Format the response in clean Markdown.
    The user wants to learn: ${topic}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt }] }]
            })
        });

        const data = await response.json();

        // 4. THE CRITICAL FIX: Check if Google returned an error
        if (!response.ok) {
            console.error("Gemini API Error:", data);
            return res.status(response.status).json({ 
                error: data.error?.message || 'The AI service returned an error.' 
            });
        }

        // 5. Send the successful AI answer back
        res.status(200).json(data);

    } catch (error) {
        console.error("Network/Server Error:", error);
        res.status(500).json({ error: 'Failed to communicate with AI' });
    }
}
