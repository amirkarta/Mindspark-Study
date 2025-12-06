 /* --- 1. STATE MANAGEMENT & STORAGE --- */
    const defaultState = {
        xp: 0,
        streak: 1,
        itemsCreated: 0,
        lastLogin: new Date().toDateString()
    };

    let userState = JSON.parse(localStorage.getItem('mindSparkState')) || defaultState;

    // Check Streak
    const today = new Date().toDateString();
    if (userState.lastLogin !== today) {
        // Logic to increment or reset streak would go here
        userState.lastLogin = today;
        saveState();
    }

    function saveState() {
        localStorage.setItem('mindSparkState', JSON.stringify(userState));
        updateDashboard();
    }

    function updateDashboard() {
        document.getElementById('xp-display').innerText = userState.xp;
        document.getElementById('streak-display').innerText = userState.streak;
        document.getElementById('items-display').innerText = userState.itemsCreated;
        
        // Simple Level Logic: Level up every 100 XP
        const level = Math.floor(userState.xp / 100) + 1;
        document.getElementById('user-level').innerText = `Level ${level} Scholar`;
    }

    // Initialize UI
    updateDashboard();

    /* --- 2. INPUT HANDLING --- */
    const textArea = document.getElementById('user-input');
    const charCount = document.getElementById('char-count');

    textArea.addEventListener('input', () => {
        charCount.innerText = `${textArea.value.length} chars`;
    });

    // File Upload Simulation
    document.getElementById('file-upload').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            textArea.value = e.target.result;
            charCount.innerText = `${textArea.value.length} chars`;
        };
        reader.readAsText(file);
    });

    /* --- 3. AI ENGINE (Real Backend API) --- */
    const API_BASE_URL = 'http://localhost:3000';
    
    async function simulateAIResponse(text, mode) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/${mode}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `API error: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error calling API for mode '${mode}':`, error);
            throw error;
        }
    }

    /* --- 4. CORE LOGIC --- */
    async function generateContent(mode) {
        const text = textArea.value.trim();
        if (!text) {
            alert("Please enter some text or upload a note first!");
            return;
        }

        // UI Loading State
        const loader = document.getElementById('loader');
        const outputArea = document.getElementById('output-area');
        outputArea.innerHTML = '';
        loader.style.display = 'block';

        try {
            // Get Data
            const data = await simulateAIResponse(text, mode);
            
            // Hide Loader
            loader.style.display = 'none';

            // Render based on mode
            if (mode === 'summary' || mode === 'eli5') {
                renderTextResult(data.title, data.content);
            } else if (mode === 'flashcards') {
                renderFlashcards(data);
            } else if (mode === 'quiz') {
                renderQuiz(data);
            }

            // Gamification Update
            userState.xp += 20;
            userState.itemsCreated += 1;
            saveState();
        } catch (error) {
            // Hide Loader
            loader.style.display = 'none';

            // Display error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'result-card';
            errorDiv.style.borderLeft = '4px solid #ff6b6b';
            errorDiv.innerHTML = `
                <h3 style="color: #ff6b6b; margin-bottom:0.5rem;">⚠️ Error</h3>
                <p>${error.message}</p>
                <small style="color: #666;">Make sure the backend server is running on port 3000 and your OpenAI API key is configured.</small>
            `;
            outputArea.appendChild(errorDiv);
        }
    }

    /* --- 5. RENDER FUNCTIONS --- */
    
    function renderTextResult(title, content) {
        const div = document.createElement('div');
        div.className = 'result-card';
        div.innerHTML = `
            <h3 style="color:var(--primary); margin-bottom:1rem;">${title}</h3>
            <p style="white-space: pre-line;">${content}</p>
        `;
        document.getElementById('output-area').appendChild(div);
    }

    function renderFlashcards(cards) {
        const container = document.createElement('div');
        container.className = 'flashcard-container';
        
        cards.forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.className = 'flashcard';
            cardEl.innerText = card.front;
            cardEl.onclick = () => {
                cardEl.classList.toggle('flipped');
                cardEl.innerText = cardEl.classList.contains('flipped') ? card.back : card.front;
            };
            container.appendChild(cardEl);
        });
        document.getElementById('output-area').appendChild(container);
    }

    function renderQuiz(questions) {
        const container = document.createElement('div');
        container.className = 'result-card';
        
        questions.forEach((q, idx) => {
            const qBlock = document.createElement('div');
            qBlock.style.marginBottom = '2rem';
            qBlock.innerHTML = `<h4 style="margin-bottom:1rem;">${idx+1}. ${q.question}</h4>`;
            
            q.options.forEach((opt, optIdx) => {
                const btn = document.createElement('button');
                btn.className = 'quiz-option';
                btn.innerText = opt;
                btn.onclick = function() {
                    // Reset siblings
                    Array.from(qBlock.querySelectorAll('.quiz-option')).forEach(b => {
                        b.classList.remove('correct', 'wrong');
                        b.disabled = true;
                    });
                    
                    if(optIdx === q.correct) {
                        this.classList.add('correct');
                        userState.xp += 10; // Bonus XP for correct answer
                        saveState();
                    } else {
                        this.classList.add('wrong');
                    }
                };
                qBlock.appendChild(btn);
            });
            container.appendChild(qBlock);
        });
        document.getElementById('output-area').appendChild(container);
    }