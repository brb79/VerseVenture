// VerseVenture - Bible Adventure App
class VerseVentureApp {
    constructor() {
        this.currentUser = this.loadUser() || this.createGuestUser();
        this.currentAdventure = null;
        this.currentQuestion = 0;
        this.score = 0;
        this.startTime = null;
        this.init();
    }

    createGuestUser() {
        const guestUser = {
            id: 1,
            username: 'guest_' + Math.random().toString(36).substr(2, 9),
            display_name: 'Bible Explorer',
            avatar_url: '👤',
            total_points: 0,
            current_streak: 0
        };
        localStorage.setItem('verseventure_user', JSON.stringify(guestUser));
        return guestUser;
    }

    loadUser() {
        const stored = localStorage.getItem('verseventure_user');
        return stored ? JSON.parse(stored) : null;
    }

    saveUser() {
        localStorage.setItem('verseventure_user', JSON.stringify(this.currentUser));
    }

    async init() {
        await this.renderApp();
        this.attachEventListeners();
        await this.loadDailyVerse();
    }

    async renderApp() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <!-- Header -->
            <header class="bg-white rounded-lg shadow-lg p-6 mb-8">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <div class="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center shadow-lg">
                            <span class="text-3xl">📖</span>
                        </div>
                        <div>
                            <h1 class="text-3xl font-bold text-gray-800">VerseVenture</h1>
                            <p class="text-gray-600">Bible Adventure App</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-6">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-yellow-600">${this.currentUser.total_points}</div>
                            <div class="text-sm text-gray-600">Points</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-red-500">${this.currentUser.current_streak}🔥</div>
                            <div class="text-sm text-gray-600">Streak</div>
                        </div>
                        <div class="text-center">
                            <div class="text-3xl">${this.currentUser.avatar_url}</div>
                            <div class="text-sm text-gray-600">${this.currentUser.display_name}</div>
                        </div>
                    </div>
                </div>
            </header>

            <!-- Navigation Tabs -->
            <div class="bg-white rounded-lg shadow-lg p-2 mb-8">
                <div class="flex space-x-2">
                    <button class="tab-btn flex-1 px-4 py-3 rounded-lg font-semibold transition-colors active" data-tab="home">
                        <i class="fas fa-home mr-2"></i>Home
                    </button>
                    <button class="tab-btn flex-1 px-4 py-3 rounded-lg font-semibold transition-colors" data-tab="adventures">
                        <i class="fas fa-map mr-2"></i>Adventures
                    </button>
                    <button class="tab-btn flex-1 px-4 py-3 rounded-lg font-semibold transition-colors" data-tab="verses">
                        <i class="fas fa-book-bible mr-2"></i>Verses
                    </button>
                    <button class="tab-btn flex-1 px-4 py-3 rounded-lg font-semibold transition-colors" data-tab="progress">
                        <i class="fas fa-chart-line mr-2"></i>Progress
                    </button>
                    <button class="tab-btn flex-1 px-4 py-3 rounded-lg font-semibold transition-colors" data-tab="leaderboard">
                        <i class="fas fa-trophy mr-2"></i>Leaderboard
                    </button>
                </div>
            </div>

            <!-- Content Area -->
            <div id="content" class="bg-white rounded-lg shadow-lg p-6">
                <!-- Content will be loaded here -->
            </div>
        `;
    }

    attachEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => {
                    b.classList.remove('active', 'bg-blue-600', 'text-white');
                    b.classList.add('text-gray-600', 'hover:bg-gray-100');
                });
                btn.classList.add('active', 'bg-blue-600', 'text-white');
                btn.classList.remove('text-gray-600', 'hover:bg-gray-100');
                
                const tab = btn.dataset.tab;
                this.loadTab(tab);
            });
        });

        // Load home tab by default
        this.loadTab('home');
    }

    async loadTab(tab) {
        const content = document.getElementById('content');
        
        switch(tab) {
            case 'home':
                await this.loadHomeTab();
                break;
            case 'adventures':
                await this.loadAdventuresTab();
                break;
            case 'verses':
                await this.loadVersesTab();
                break;
            case 'progress':
                await this.loadProgressTab();
                break;
            case 'leaderboard':
                await this.loadLeaderboardTab();
                break;
        }
    }

    async loadHomeTab() {
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="space-y-6">
                <!-- Daily Verse Card -->
                <div id="daily-verse" class="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                    <h2 class="text-2xl font-bold mb-4">
                        <i class="fas fa-calendar-day mr-2"></i>Daily Verse
                    </h2>
                    <div class="verse-content">Loading...</div>
                </div>

                <!-- Quick Actions -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button onclick="app.startRandomAdventure()" class="bg-green-500 hover:bg-green-600 text-white rounded-lg p-6 transition-colors">
                        <i class="fas fa-random text-3xl mb-2"></i>
                        <div class="font-bold">Random Adventure</div>
                        <div class="text-sm opacity-90">Start a surprise journey</div>
                    </button>
                    
                    <button onclick="app.loadTab('verses')" class="bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg p-6 transition-colors">
                        <i class="fas fa-search text-3xl mb-2"></i>
                        <div class="font-bold">Explore Verses</div>
                        <div class="text-sm opacity-90">Browse scripture library</div>
                    </button>
                    
                    <button onclick="app.showDailyChallenge()" class="bg-red-500 hover:bg-red-600 text-white rounded-lg p-6 transition-colors">
                        <i class="fas fa-fire text-3xl mb-2"></i>
                        <div class="font-bold">Daily Challenge</div>
                        <div class="text-sm opacity-90">Keep your streak alive</div>
                    </button>
                </div>

                <!-- Recent Activity -->
                <div class="border-t pt-6">
                    <h3 class="text-xl font-bold mb-4 text-gray-800">
                        <i class="fas fa-clock mr-2"></i>Your Journey
                    </h3>
                    <div class="space-y-3">
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <div class="font-semibold">Adventures Completed</div>
                                <div class="text-sm text-gray-600">Keep exploring!</div>
                            </div>
                            <div class="text-2xl font-bold text-green-600">3</div>
                        </div>
                        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <div class="font-semibold">Verses Learned</div>
                                <div class="text-sm text-gray-600">Growing in wisdom</div>
                            </div>
                            <div class="text-2xl font-bold text-blue-600">12</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        await this.loadDailyVerse();
    }

    async loadDailyVerse() {
        try {
            const response = await axios.get('/api/verses/daily');
            if (response.data.success && response.data.verse) {
                const verse = response.data.verse;
                const verseElement = document.querySelector('#daily-verse .verse-content');
                if (verseElement) {
                    verseElement.innerHTML = `
                        <div class="text-lg mb-2">"${verse.text}"</div>
                        <div class="text-sm opacity-90">- ${verse.book} ${verse.chapter}:${verse.verse}</div>
                        ${verse.reflection ? `<div class="mt-4 text-sm italic">${verse.reflection}</div>` : ''}
                    `;
                }
            }
        } catch (error) {
            console.error('Failed to load daily verse:', error);
        }
    }

    async loadAdventuresTab() {
        const content = document.getElementById('content');
        content.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-4xl text-blue-600"></i></div>';
        
        try {
            const response = await axios.get('/api/adventures');
            if (response.data.success) {
                const adventures = response.data.adventures;
                
                content.innerHTML = `
                    <div class="space-y-6">
                        <h2 class="text-2xl font-bold text-gray-800 mb-6">
                            <i class="fas fa-map-marked-alt mr-2"></i>Bible Adventures
                        </h2>
                        
                        <!-- Difficulty Filter -->
                        <div class="flex space-x-2 mb-6">
                            <button onclick="app.filterAdventures('all')" class="px-4 py-2 bg-blue-600 text-white rounded-lg">All</button>
                            <button onclick="app.filterAdventures('easy')" class="px-4 py-2 bg-green-500 text-white rounded-lg">Easy</button>
                            <button onclick="app.filterAdventures('medium')" class="px-4 py-2 bg-yellow-500 text-white rounded-lg">Medium</button>
                            <button onclick="app.filterAdventures('hard')" class="px-4 py-2 bg-red-500 text-white rounded-lg">Hard</button>
                        </div>
                        
                        <!-- Adventures Grid -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${adventures.map(adventure => this.renderAdventureCard(adventure)).join('')}
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            content.innerHTML = '<div class="text-red-600">Failed to load adventures. Please try again.</div>';
        }
    }

    renderAdventureCard(adventure) {
        const difficultyColors = {
            easy: 'bg-green-100 text-green-800',
            medium: 'bg-yellow-100 text-yellow-800',
            hard: 'bg-red-100 text-red-800'
        };
        
        return `
            <div class="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer" onclick="app.startAdventure(${adventure.id})">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="text-lg font-bold text-gray-800">${adventure.title}</h3>
                    <span class="px-2 py-1 rounded text-xs font-semibold ${difficultyColors[adventure.difficulty]}">
                        ${adventure.difficulty}
                    </span>
                </div>
                <p class="text-gray-600 text-sm mb-3">${adventure.description}</p>
                <div class="flex justify-between items-center">
                    <div class="text-sm text-gray-500">
                        <i class="fas fa-star text-yellow-500"></i> ${adventure.rewards_points} points
                    </div>
                    <button class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700">
                        Start <i class="fas fa-arrow-right ml-1"></i>
                    </button>
                </div>
            </div>
        `;
    }

    async startAdventure(adventureId) {
        try {
            const response = await axios.get(`/api/adventures/${adventureId}`);
            if (response.data.success) {
                this.currentAdventure = response.data.adventure;
                this.currentQuestion = 0;
                this.score = 0;
                this.startTime = Date.now();
                this.showAdventureQuestion();
            }
        } catch (error) {
            alert('Failed to load adventure. Please try again.');
        }
    }

    showAdventureQuestion() {
        const content = document.getElementById('content');
        const adventure = this.currentAdventure;
        const question = adventure.questions[this.currentQuestion];
        
        // First show the verse(s) for this adventure
        if (this.currentQuestion === 0 && adventure.verses) {
            content.innerHTML = `
                <div class="max-w-2xl mx-auto">
                    <h2 class="text-2xl font-bold mb-6">${adventure.title}</h2>
                    
                    <!-- Verses to Study -->
                    <div class="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
                        <h3 class="font-bold mb-3">📖 Study these verses:</h3>
                        ${adventure.verses.map(v => `
                            <div class="mb-3">
                                <div class="font-semibold">${v.book} ${v.chapter}:${v.verse}</div>
                                <div class="text-gray-700 italic">"${v.text}"</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <button onclick="app.showQuestion()" class="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700">
                        Ready for Questions! <i class="fas fa-arrow-right ml-2"></i>
                    </button>
                </div>
            `;
            return;
        }
        
        this.showQuestion();
    }

    showQuestion() {
        const content = document.getElementById('content');
        const adventure = this.currentAdventure;
        const question = adventure.questions[this.currentQuestion];
        
        content.innerHTML = `
            <div class="max-w-2xl mx-auto">
                <div class="mb-6">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-bold">${adventure.title}</h2>
                        <div class="text-sm text-gray-600">
                            Question ${this.currentQuestion + 1} of ${adventure.questions.length}
                        </div>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-blue-600 h-2 rounded-full transition-all" style="width: ${((this.currentQuestion + 1) / adventure.questions.length) * 100}%"></div>
                    </div>
                </div>
                
                <div class="bg-gray-50 rounded-lg p-6 mb-6">
                    <h3 class="text-lg font-semibold mb-4">${question.question}</h3>
                    
                    <div class="space-y-3">
                        ${question.options.map((option, index) => `
                            <button onclick="app.checkAnswer(${index})" class="answer-btn w-full text-left p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-400 transition-colors">
                                ${option}
                            </button>
                        `).join('')}
                    </div>
                </div>
                
                <div id="feedback" class="hidden"></div>
            </div>
        `;
    }

    async checkAnswer(selectedIndex) {
        const question = this.currentAdventure.questions[this.currentQuestion];
        const correct = selectedIndex === question.correct;
        const feedback = document.getElementById('feedback');
        const buttons = document.querySelectorAll('.answer-btn');
        
        // Disable all buttons
        buttons.forEach(btn => btn.disabled = true);
        
        // Show correct/incorrect styling
        buttons[selectedIndex].classList.add(correct ? 'bg-green-100' : 'bg-red-100');
        buttons[question.correct].classList.add('bg-green-100', 'border-green-500');
        
        if (correct) {
            this.score += Math.floor(this.currentAdventure.rewards_points / this.currentAdventure.questions.length);
        }
        
        // Show feedback
        feedback.innerHTML = `
            <div class="p-4 rounded-lg ${correct ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}">
                <div class="font-bold mb-2">
                    ${correct ? '✅ Correct!' : '❌ Not quite right'}
                </div>
                ${question.explanation ? `<div class="text-sm">${question.explanation}</div>` : ''}
            </div>
            
            <button onclick="app.nextQuestion()" class="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">
                ${this.currentQuestion < this.currentAdventure.questions.length - 1 ? 'Next Question' : 'Complete Adventure'} 
                <i class="fas fa-arrow-right ml-2"></i>
            </button>
        `;
        feedback.classList.remove('hidden');
    }

    async nextQuestion() {
        this.currentQuestion++;
        
        if (this.currentQuestion < this.currentAdventure.questions.length) {
            this.showQuestion();
        } else {
            await this.completeAdventure();
        }
    }

    async completeAdventure() {
        const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
        
        // Save progress
        try {
            await axios.post('/api/progress', {
                userId: this.currentUser.id,
                adventureId: this.currentAdventure.id,
                status: 'completed',
                score: this.score,
                timeSpent: timeSpent
            });
            
            // Update local user points
            this.currentUser.total_points += this.score;
            this.saveUser();
        } catch (error) {
            console.error('Failed to save progress:', error);
        }
        
        // Show completion screen
        const content = document.getElementById('content');
        content.innerHTML = `
            <div class="max-w-2xl mx-auto text-center">
                <div class="text-6xl mb-4">🎉</div>
                <h2 class="text-3xl font-bold mb-4">Adventure Complete!</h2>
                
                <div class="bg-yellow-50 rounded-lg p-6 mb-6">
                    <div class="text-2xl font-bold text-yellow-600 mb-2">
                        +${this.score} Points Earned!
                    </div>
                    <div class="text-gray-600">
                        Time: ${Math.floor(timeSpent / 60)}m ${timeSpent % 60}s
                    </div>
                </div>
                
                <div class="space-y-3">
                    <button onclick="app.loadTab('adventures')" class="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700">
                        Back to Adventures
                    </button>
                    <button onclick="app.startRandomAdventure()" class="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700">
                        Try Another Adventure
                    </button>
                </div>
            </div>
        `;
    }

    async startRandomAdventure() {
        try {
            const response = await axios.get('/api/adventures');
            if (response.data.success && response.data.adventures.length > 0) {
                const randomIndex = Math.floor(Math.random() * response.data.adventures.length);
                const adventure = response.data.adventures[randomIndex];
                await this.startAdventure(adventure.id);
            }
        } catch (error) {
            alert('Failed to load adventures.');
        }
    }

    async loadVersesTab() {
        const content = document.getElementById('content');
        content.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-4xl text-blue-600"></i></div>';
        
        try {
            const response = await axios.get('/api/verses');
            if (response.data.success) {
                const verses = response.data.verses;
                
                content.innerHTML = `
                    <div class="space-y-6">
                        <h2 class="text-2xl font-bold text-gray-800 mb-6">
                            <i class="fas fa-book-bible mr-2"></i>Scripture Library
                        </h2>
                        
                        <!-- Search and Filter -->
                        <div class="flex space-x-4 mb-6">
                            <select onchange="app.filterVerses(this.value)" class="px-4 py-2 border rounded-lg">
                                <option value="">All Books</option>
                                <option value="Genesis">Genesis</option>
                                <option value="Psalms">Psalms</option>
                                <option value="Proverbs">Proverbs</option>
                                <option value="Matthew">Matthew</option>
                                <option value="John">John</option>
                                <option value="Romans">Romans</option>
                            </select>
                            
                            <button onclick="app.getRandomVerse()" class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                                <i class="fas fa-random mr-2"></i>Random Verse
                            </button>
                        </div>
                        
                        <!-- Verses List -->
                        <div class="space-y-4">
                            ${verses.map(verse => `
                                <div class="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                                    <div class="flex justify-between items-start mb-2">
                                        <h3 class="font-bold text-lg">${verse.book} ${verse.chapter}:${verse.verse}</h3>
                                        <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                            ${verse.testament === 'old' ? 'Old Testament' : 'New Testament'}
                                        </span>
                                    </div>
                                    <p class="text-gray-700 italic">"${verse.text}"</p>
                                    ${verse.category ? `<div class="mt-2 text-sm text-gray-500">Category: ${verse.category}</div>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            content.innerHTML = '<div class="text-red-600">Failed to load verses. Please try again.</div>';
        }
    }

    async getRandomVerse() {
        try {
            const response = await axios.get('/api/verses/random');
            if (response.data.success && response.data.verse) {
                const verse = response.data.verse;
                const content = document.getElementById('content');
                
                content.innerHTML = `
                    <div class="max-w-2xl mx-auto">
                        <button onclick="app.loadVersesTab()" class="mb-4 text-blue-600 hover:text-blue-800">
                            <i class="fas fa-arrow-left mr-2"></i>Back to Verses
                        </button>
                        
                        <div class="bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg p-8 text-white text-center">
                            <div class="text-3xl mb-4">✨</div>
                            <h2 class="text-2xl font-bold mb-4">${verse.book} ${verse.chapter}:${verse.verse}</h2>
                            <p class="text-lg italic mb-4">"${verse.text}"</p>
                            <button onclick="app.getRandomVerse()" class="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100">
                                Get Another <i class="fas fa-random ml-2"></i>
                            </button>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            alert('Failed to load random verse.');
        }
    }

    async filterVerses(book) {
        const url = book ? `/api/verses?book=${book}` : '/api/verses';
        const response = await axios.get(url);
        // Re-render verses tab with filtered results
        if (response.data.success) {
            // Update the verses display
            await this.loadVersesTab();
        }
    }

    async filterAdventures(difficulty) {
        const url = difficulty === 'all' ? '/api/adventures' : `/api/adventures?difficulty=${difficulty}`;
        const response = await axios.get(url);
        if (response.data.success) {
            await this.loadAdventuresTab();
        }
    }

    async loadProgressTab() {
        const content = document.getElementById('content');
        
        try {
            const response = await axios.get(`/api/users/${this.currentUser.id}/stats`);
            if (response.data.success) {
                const { user, stats, badges } = response.data;
                
                content.innerHTML = `
                    <div class="space-y-6">
                        <h2 class="text-2xl font-bold text-gray-800 mb-6">
                            <i class="fas fa-chart-line mr-2"></i>Your Progress
                        </h2>
                        
                        <!-- Stats Grid -->
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div class="bg-blue-50 rounded-lg p-4 text-center">
                                <div class="text-3xl font-bold text-blue-600">${user.total_points || 0}</div>
                                <div class="text-sm text-gray-600">Total Points</div>
                            </div>
                            <div class="bg-green-50 rounded-lg p-4 text-center">
                                <div class="text-3xl font-bold text-green-600">${stats?.completed_adventures || 0}</div>
                                <div class="text-sm text-gray-600">Adventures</div>
                            </div>
                            <div class="bg-yellow-50 rounded-lg p-4 text-center">
                                <div class="text-3xl font-bold text-yellow-600">${user.current_streak || 0}</div>
                                <div class="text-sm text-gray-600">Day Streak</div>
                            </div>
                            <div class="bg-purple-50 rounded-lg p-4 text-center">
                                <div class="text-3xl font-bold text-purple-600">${badges?.length || 0}</div>
                                <div class="text-sm text-gray-600">Badges</div>
                            </div>
                        </div>
                        
                        <!-- Badges -->
                        <div>
                            <h3 class="text-xl font-bold mb-4">🏆 Achievements</h3>
                            <div class="grid grid-cols-3 md:grid-cols-6 gap-4">
                                ${badges && badges.length > 0 ? badges.map(badge => `
                                    <div class="text-center">
                                        <div class="text-3xl mb-1">${badge.icon_emoji}</div>
                                        <div class="text-xs font-semibold">${badge.name}</div>
                                    </div>
                                `).join('') : '<div class="col-span-full text-gray-500">Complete adventures to earn badges!</div>'}
                            </div>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            content.innerHTML = '<div class="text-red-600">Failed to load progress data.</div>';
        }
    }

    async loadLeaderboardTab() {
        const content = document.getElementById('content');
        content.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-4xl text-blue-600"></i></div>';
        
        try {
            const response = await axios.get('/api/leaderboard?limit=10');
            if (response.data.success) {
                const leaderboard = response.data.leaderboard;
                
                content.innerHTML = `
                    <div class="space-y-6">
                        <h2 class="text-2xl font-bold text-gray-800 mb-6">
                            <i class="fas fa-trophy mr-2"></i>Leaderboard
                        </h2>
                        
                        <div class="space-y-3">
                            ${leaderboard.map((user, index) => `
                                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg ${index < 3 ? 'border-2 border-yellow-400' : ''}">
                                    <div class="flex items-center space-x-4">
                                        <div class="text-2xl font-bold ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-600' : 'text-gray-600'}">
                                            ${index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                        </div>
                                        <div class="text-2xl">${user.avatar_url || '👤'}</div>
                                        <div>
                                            <div class="font-semibold">${user.display_name || user.username}</div>
                                            <div class="text-sm text-gray-600">${user.current_streak || 0} day streak</div>
                                        </div>
                                    </div>
                                    <div class="text-2xl font-bold text-blue-600">
                                        ${user.total_points || 0}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            content.innerHTML = '<div class="text-red-600">Failed to load leaderboard.</div>';
        }
    }

    showDailyChallenge() {
        alert('Daily Challenge: Complete 3 adventures today to keep your streak alive!');
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new VerseVentureApp();
});