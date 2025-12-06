# MindSpark Backend Setup Guide

## Quick Start

### 1. Add Your OpenAI API Key
Edit `backend/.env` and replace the placeholder:
```
OPENAI_API_KEY=sk-your_actual_api_key_here
```

### 2. Install Dependencies
Open PowerShell in the `backend` folder and run:
```powershell
npm install
```

### 3. Start the Backend Server
In the `backend` folder, run:
```powershell
npm start
```

You should see:
```
🚀 MindSpark Backend Server running on http://localhost:3000
✅ Endpoints available:
   POST /api/summarize
   POST /api/eli5
   POST /api/flashcards
   POST /api/quiz
```

### 4. Start the Frontend
Open `index.html` with Live Server in VS Code (right-click → Open with Live Server)

### 5. Test It
- Write or paste some study notes in the text area
- Click any of the 4 buttons (Summary, ELI5, Flashcards, Quiz)
- Watch the magic happen with real OpenAI responses!

---

## API Endpoints

### POST /api/summarize
**Request:**
```json
{ "text": "Your study notes here..." }
```
**Response:**
```json
{
  "title": "Key Takeaways",
  "content": "Bullet-point summary..."
}
```

### POST /api/eli5
**Request:**
```json
{ "text": "Your study notes here..." }
```
**Response:**
```json
{
  "title": "Simply Put",
  "content": "Simple explanation..."
}
```

### POST /api/flashcards
**Request:**
```json
{ "text": "Your study notes here..." }
```
**Response:**
```json
[
  { "front": "Question 1", "back": "Answer 1" },
  { "front": "Question 2", "back": "Answer 2" },
  ...
]
```

### POST /api/quiz
**Request:**
```json
{ "text": "Your study notes here..." }
```
**Response:**
```json
[
  {
    "question": "Question 1?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0
  },
  ...
]
```

---

## Troubleshooting

### Backend won't start
- Check Node.js is installed: `node --version`
- Check port 3000 is not in use
- Make sure `npm install` completed successfully

### "Failed to generate..." error in frontend
- Verify backend is running on port 3000
- Check your OpenAI API key in `.env` is correct
- Ensure you have API credits available
- Check backend console for detailed error messages

### CORS error
- Backend is configured to allow all origins for local testing
- If issues persist, verify frontend is accessing `http://localhost:3000`

---

## Important Security Note
**NEVER commit your `.env` file to GitHub!** It's already in `.gitignore`. Your API key is confidential.

## Next Steps
- Customize prompts in `server.js` for different study styles
- Add rate limiting to prevent excessive API calls
- Deploy backend to production service (Heroku, Railway, etc.)
