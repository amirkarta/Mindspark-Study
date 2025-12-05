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

    /* --- 3. MOCK AI ENGINE (Simulates Backend) --- */
    // In a real app, replace `simulateAIResponse` with a fetch() call to OpenAI/Anthropic
    
    async function simulateAIResponse(text, mode) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let response;
                const sentences = text.split('.').filter(s => s.length > 10);
                
                switch(mode) {
                    case 'summary':
                        response = {
                            title: "Key Takeaways",
                            content: `Here is a concise summary of your notes:\n\n• ${sentences[0] || 'No content'}.\n• ${sentences[1] || 'Add more text for better results'}.\n• ${sentences[sentences.length-1] || 'Conclusion'}.`
                        };
                        break;
                    case 'eli5':
                        response = {
                            title: "Simply Put",
                            content: `Imagine this like a Lego set. ${sentences[0] ? sentences[0].toLowerCase() : 'It'} is basically the main block. When you put it together, it works because... (AI simplified logic would go here).`
                        };
                        break;
                    case 'flashcards':
                        // Create mock cards from sentences
                        response = sentences.slice(0, 4).map((s, i) => ({
                            front: `Concept #${i + 1} from text`,
                            back: s.trim()
                        }));
                        break;
                    case 'quiz':
                        response = [
                            {
                                question: "What is the main concept discussed in the first paragraph?",
                                options: ["The first sentence", "Something irrelevant", "A wrong answer", "Another wrong answer"],
                                correct: 0
                            },
                            {
                                question: "Which of the following is implied by the text?",
                                options: ["Option A", "Option B", "Option C", "The text implies this"],
                                correct: 3
                            }
                        ];
                        break;
                }
                resolve(response);
            }, 1500); // Simulate network delay
        });
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