const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const { OpenAI } = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for local testing; restrict in production
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(bodyParser.json());

// Helper function to parse JSON from OpenAI response
function parseJSON(str) {
    try {
        return JSON.parse(str);
    } catch (e) {
        console.error('Failed to parse JSON:', e);
        return null;
    }
}

// SUMMARY ENDPOINT
app.post('/api/summarize', async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful study assistant. Create concise, bullet-point summaries of study notes.'
                },
                {
                    role: 'user',
                    content: `Please summarize the following text into 3-5 key takeaways as bullet points:\n\n${text}`
                }
            ],
            temperature: 0.7,
            max_tokens: 300
        });

        const summary = response.choices[0].message.content;
        
        res.json({
            title: 'Key Takeaways',
            content: summary
        });
    } catch (error) {
        console.error('Error in /api/summarize:', error.message);
        res.status(500).json({ error: 'Failed to generate summary. Check your API key.' });
    }
});

// ELI5 ENDPOINT
app.post('/api/eli5', async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful study assistant who explains complex topics in simple, easy-to-understand language. Use analogies and simple words.'
                },
                {
                    role: 'user',
                    content: `Explain the following text as if explaining to a 5-year-old (ELI5). Use simple words and fun analogies:\n\n${text}`
                }
            ],
            temperature: 0.7,
            max_tokens: 300
        });

        const explanation = response.choices[0].message.content;
        
        res.json({
            title: 'Simply Put',
            content: explanation
        });
    } catch (error) {
        console.error('Error in /api/eli5:', error.message);
        res.status(500).json({ error: 'Failed to generate explanation. Check your API key.' });
    }
});

// FLASHCARDS ENDPOINT
app.post('/api/flashcards', async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful study assistant. Create flashcards in JSON format with "front" (question) and "back" (answer) fields. Return ONLY valid JSON array.'
                },
                {
                    role: 'user',
                    content: `Create 4 flashcards from the following text. Return ONLY a JSON array like this: [{"front": "Question 1", "back": "Answer 1"}, ...]\n\nText:\n${text}`
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        let flashcards;
        const content = response.choices[0].message.content;
        
        // Try to extract JSON from response
        const jsonMatch = content.match(/\[.*\]/s);
        if (jsonMatch) {
            flashcards = parseJSON(jsonMatch[0]);
        } else {
            flashcards = parseJSON(content);
        }

        if (!Array.isArray(flashcards) || flashcards.length === 0) {
            throw new Error('Invalid flashcard format');
        }

        res.json(flashcards);
    } catch (error) {
        console.error('Error in /api/flashcards:', error.message);
        res.status(500).json({ error: 'Failed to generate flashcards. Check your API key.' });
    }
});

// QUIZ ENDPOINT
app.post('/api/quiz', async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: 'Text is required' });
        }

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful study assistant. Create quiz questions in JSON format. Return ONLY valid JSON array with objects containing "question", "options" (array of 4 strings), and "correct" (index of correct answer).'
                },
                {
                    role: 'user',
                    content: `Create 2 multiple-choice quiz questions from the following text. Return ONLY a JSON array like this: [{"question": "Q1?", "options": ["A", "B", "C", "D"], "correct": 0}, ...]\n\nText:\n${text}`
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });

        let quizzes;
        const content = response.choices[0].message.content;
        
        // Try to extract JSON from response
        const jsonMatch = content.match(/\[.*\]/s);
        if (jsonMatch) {
            quizzes = parseJSON(jsonMatch[0]);
        } else {
            quizzes = parseJSON(content);
        }

        if (!Array.isArray(quizzes) || quizzes.length === 0) {
            throw new Error('Invalid quiz format');
        }

        res.json(quizzes);
    } catch (error) {
        console.error('Error in /api/quiz:', error.message);
        res.status(500).json({ error: 'Failed to generate quiz. Check your API key.' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 MindSpark Backend Server running on http://localhost:${PORT}`);
    console.log('✅ Endpoints available:');
    console.log('   POST /api/summarize');
    console.log('   POST /api/eli5');
    console.log('   POST /api/flashcards');
    console.log('   POST /api/quiz');
});
