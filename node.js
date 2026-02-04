const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // Ensure you ran: npm install node-fetch@2
const app = express();

app.use(cors()); // This tells the browser: "I allow external requests"
app.use(express.json());

const API_KEY = "YOUR_ACTUAL_API_KEY_HERE"; 

app.post('/generate', async (req, res) => {
    console.log("Received request for topic:", req.body.topic);
    const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Write a high-quality single-file HTML/CSS webpage for: "${req.body.topic}". Return ONLY raw code.` }] }]
            })
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error("Gemini Error:", err);
        res.status(500).json({ error: "Failed to connect to Gemini" });
    }
});

app.listen(3000, () => console.log('✅ Galactic Server running on http://localhost:3000'));
