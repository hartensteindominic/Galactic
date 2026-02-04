const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Install via: npm install node-fetch@2
const app = express();

app.use(cors());
app.use(express.json());

// 🔑 Your Secured API Key
const API_KEY = "AIzaSyA1DV3pYPbZhulRAthhreH3cl7HfGm0zUg"; 

app.post('/generate', async (req, res) => {
    const { topic } = req.body;
    console.log(`> Galactic Architect: Received request for "${topic}"`);

    // Using Gemini 1.5 Flash
    const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ 
                    parts: [{ text: `Create a professional, high-quality single-file HTML/CSS webpage for: "${topic}". Include responsive design. Return ONLY the code.` }] 
                }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error("Gemini Error:", data.error.message);
            return res.status(500).json({ error: data.error.message });
        }

        res.json(data);
    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ error: "Transmission failed." });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`
    🚀 GALACTIC BACKEND ACTIVE
    Listening on: http://localhost:${PORT}
    Project ID: gen-lang-client-0151934736
    `);
});
