let userData = {
    username: '',
    mobile: '',
    password: '',
    avatar: '',
    languages: []
};

// Navigation functions
function showStep2() {
    userData.username = document.getElementById('username').value;
    userData.mobile = document.getElementById('mobile').value;
    
    if (!userData.username || !userData.mobile) {
        showToast('Please fill in all fields');
        return;
    }
    
    fadeOut('step1');
    fadeIn('step2');
}

function showAvatarSelection() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    
    if (password !== confirmPassword) {
        showToast('Passwords do not match');
        return;
    }
    
    userData.password = password;
    fadeOut('registration-page');
    fadeIn('avatar-selection');
    loadAvatars();
}

// UI Helper functions
function fadeOut(elementId) {
    const element = document.getElementById(elementId);
    element.style.opacity = '0';
    setTimeout(() => {
        element.style.display = 'none';
        element.style.opacity = '1';
    }, 300);
}

function fadeIn(elementId) {
    const element = document.getElementById(elementId);
    element.style.opacity = '0';
    element.style.display = 'block';
    setTimeout(() => {
        element.style.opacity = '1';
    }, 10);
}

function showToast(message) {
    // Implement toast notification
}

// Chat functionality
async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    addMessage(message, 'user');
    input.value = '';
    
    try {
        const response = await fetch(CONFIG.API_ENDPOINT + `?key=${CONFIG.GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are a friendly AI tutor. Respond to: ${message}`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;
        addMessage(aiResponse, 'bot');
        
    } catch (error) {
        console.error('Error:', error);
        addMessage("I apologize, but I'm having trouble responding right now. Please try again later.", 'bot');
    }
}

function addMessage(text, sender) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    messageDiv.innerHTML = marked.parse(text); // Using marked for markdown support
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    generateContributionGrid();
    // Add event listener for Enter key
    document.getElementById('user-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    const video = document.getElementById('myVideo');
    
    // Ensure video plays
    video.play().catch(function(error) {
        console.log("Video play failed:", error);
    });

    // Restart video when it ends (backup for loop attribute)
    video.addEventListener('ended', function() {
        video.play();
    });
});

// Generate contribution grid
function generateContributionGrid() {
    const grid = document.querySelector('.contribution-grid');
    for (let i = 0; i < 364; i++) {
        const cell = document.createElement('div');
        cell.classList.add('contribution-cell');
        const intensity = Math.floor(Math.random() * CONFIG.CONTRIBUTION_COLORS.length);
        cell.style.backgroundColor = CONFIG.CONTRIBUTION_COLORS[intensity];
        grid.appendChild(cell);
    }
}