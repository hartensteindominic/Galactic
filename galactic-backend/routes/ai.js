const express = require('express');
const router = express.Router();
const axios = require('axios');

const XAI_API_KEY = process.env.XAI_API_KEY;
const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';
const MODEL = 'grok-beta';

// Helper function to call xAI Grok API
async function callGrok(messages, temperature = 0.7) {
    try {
        const response = await axios.post(
            XAI_API_URL,
            {
                model: MODEL,
                messages: messages,
                temperature: temperature
            },
            {
                headers: {
                    'Authorization': `Bearer ${XAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error('xAI API Error:', error.response?.data || error.message);
        throw new Error('Failed to call xAI Grok API: ' + (error.response?.data?.error?.message || error.message));
    }
}

// POST /api/ai/analyze - Analyze code with Grok
router.post('/analyze', async (req, res) => {
    try {
        const { code, language } = req.body;
        
        if (!code) {
            return res.status(400).json({ error: 'Code is required' });
        }
        
        const messages = [
            {
                role: 'system',
                content: 'You are an expert code analyzer. Analyze the provided code for quality, potential bugs, security issues, and performance improvements.'
            },
            {
                role: 'user',
                content: `Analyze this ${language || 'code'}:\n\n${code}`
            }
        ];
        
        const analysis = await callGrok(messages);
        
        res.json({
            success: true,
            analysis: analysis
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// POST /api/ai/rewrite - Rewrite code based on instructions
router.post('/rewrite', async (req, res) => {
    try {
        const { code, instruction, language } = req.body;
        
        if (!code || !instruction) {
            return res.status(400).json({ error: 'Code and instruction are required' });
        }
        
        const messages = [
            {
                role: 'system',
                content: 'You are an expert programmer. Rewrite the provided code according to the given instructions. Return only the modified code without explanations.'
            },
            {
                role: 'user',
                content: `Rewrite this ${language || 'code'} according to these instructions: ${instruction}\n\nOriginal code:\n${code}`
            }
        ];
        
        const rewrittenCode = await callGrok(messages, 0.5);
        
        res.json({
            success: true,
            code: rewrittenCode
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// POST /api/ai/customize-style - Modify CSS with natural language
router.post('/customize-style', async (req, res) => {
    try {
        const { css, preferences } = req.body;
        
        if (!preferences) {
            return res.status(400).json({ error: 'Style preferences are required' });
        }
        
        const messages = [
            {
                role: 'system',
                content: 'You are a CSS expert. Modify the provided CSS according to the user\'s natural language preferences. Return only the modified CSS without explanations.'
            },
            {
                role: 'user',
                content: `Modify this CSS according to these preferences: ${preferences}\n\n${css ? `Current CSS:\n${css}` : 'Generate new CSS from scratch.'}`
            }
        ];
        
        const modifiedCSS = await callGrok(messages, 0.6);
        
        res.json({
            success: true,
            css: modifiedCSS
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// POST /api/ai/generate-feature - Generate new features
router.post('/generate-feature', async (req, res) => {
    try {
        const { description, language } = req.body;
        
        if (!description) {
            return res.status(400).json({ error: 'Feature description is required' });
        }
        
        const messages = [
            {
                role: 'system',
                content: `You are an expert ${language || 'JavaScript'} developer. Generate code for the requested feature with proper structure and best practices.`
            },
            {
                role: 'user',
                content: `Generate code for this feature: ${description}`
            }
        ];
        
        const featureCode = await callGrok(messages, 0.7);
        
        res.json({
            success: true,
            code: featureCode
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// POST /api/ai/fix-bug - Debug and fix code issues
router.post('/fix-bug', async (req, res) => {
    try {
        const { code, bugDescription, language } = req.body;
        
        if (!code || !bugDescription) {
            return res.status(400).json({ error: 'Code and bug description are required' });
        }
        
        const messages = [
            {
                role: 'system',
                content: 'You are an expert debugger. Identify and fix the described bug in the provided code. Return the fixed code with a brief explanation of what was wrong.'
            },
            {
                role: 'user',
                content: `Fix this bug: ${bugDescription}\n\nCode (${language || 'unknown language'}):\n${code}`
            }
        ];
        
        const fixedCode = await callGrok(messages, 0.5);
        
        res.json({
            success: true,
            result: fixedCode
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// POST /api/ai/optimize - Optimize code performance
router.post('/optimize', async (req, res) => {
    try {
        const { code, language } = req.body;
        
        if (!code) {
            return res.status(400).json({ error: 'Code is required' });
        }
        
        const messages = [
            {
                role: 'system',
                content: 'You are a performance optimization expert. Optimize the provided code for better performance, memory usage, and efficiency. Explain your optimizations.'
            },
            {
                role: 'user',
                content: `Optimize this ${language || 'code'}:\n\n${code}`
            }
        ];
        
        const optimizedResult = await callGrok(messages, 0.6);
        
        res.json({
            success: true,
            result: optimizedResult
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// POST /api/ai/suggest-garden - AI suggestions for garden improvements
router.post('/suggest-garden', async (req, res) => {
    try {
        const { gardenData } = req.body;
        
        const messages = [
            {
                role: 'system',
                content: 'You are an expert in 3D scene design and procedural generation. Suggest creative improvements for the virtual garden.'
            },
            {
                role: 'user',
                content: `Suggest improvements for this garden:\n${JSON.stringify(gardenData, null, 2)}`
            }
        ];
        
        const suggestions = await callGrok(messages, 0.8);
        
        res.json({
            success: true,
            suggestions: suggestions
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// POST /api/ai/chat - Chat with Grok about the garden
router.post('/chat', async (req, res) => {
    try {
        const { message, history } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        // Build conversation history
        const messages = [
            {
                role: 'system',
                content: 'You are a helpful AI assistant for the Infinite Galactic Garden, a 3D metaverse experience. Help users with questions about the garden, Web3 features, and provide creative suggestions.'
            }
        ];
        
        // Add conversation history if provided
        if (history && Array.isArray(history)) {
            messages.push(...history);
        }
        
        // Add current message
        messages.push({
            role: 'user',
            content: message
        });
        
        const response = await callGrok(messages, 0.7);
        
        res.json({
            success: true,
            response: response,
            timestamp: Date.now()
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;
