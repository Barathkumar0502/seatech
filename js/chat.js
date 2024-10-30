// Import config
const { GEMINI_API_KEY, API_ENDPOINT, AVATAR_API } = CONFIG;

// DOM Elements
const chatForm = document.getElementById('chatForm');
const userInput = document.getElementById('userInput');
const chatMessages = document.getElementById('chatMessages');
const loadingIndicator = document.getElementById('loadingIndicator');
const subjectSelect = document.getElementById('subjectSelect');
const themeToggle = document.getElementById('themeToggle');
const clearButton = document.querySelector('.tool-btn[title="Clear Chat"]');
const quickActionButtons = document.querySelectorAll('.action-btn');

// Chat History
let chatHistory = [{
    role: 'model',
    parts: [{ text: 'You are a helpful AI learning assistant. You help students understand concepts, solve problems, and learn effectively.' }]
}];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
        chatHistory = JSON.parse(savedHistory);
        renderChatHistory();
    }
    userInput.addEventListener('input', autoResizeTextarea);
});

// Event Listeners
chatForm.addEventListener('submit', handleSubmit);
clearButton.addEventListener('click', clearChat);
themeToggle.addEventListener('click', toggleTheme);
quickActionButtons.forEach(btn => btn.addEventListener('click', handleQuickAction));

// Handle Form Submit
async function handleSubmit(e) {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    addMessageToChat('user', message);
    userInput.value = '';
    autoResizeTextarea();

    loadingIndicator.style.display = 'block';

    try {
        const response = await sendMessageToAPI(message);
        addMessageToChat('assistant', response);
    } catch (error) {
        console.error('Error:', error);
        addMessageToChat('assistant', 'Sorry, I encountered an error. Please try again.');
    }

    loadingIndicator.style.display = 'none';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Send Message to API
async function sendMessageToAPI(message) {
    const subject = subjectSelect.value;
    
    try {
        const response = await fetch('YOUR_BACKEND_ENDPOINT', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: chatHistory,
                subject: subject,
                message: message
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        const data = await response.json();
        const reply = data.response; // Adjust based on your API response structure

        // Update chat history
        chatHistory.push({ 
            role: 'user', 
            parts: [{ text: message }] 
        });
        chatHistory.push({ 
            role: 'model', 
            parts: [{ text: reply }] 
        });
        
        saveChatHistory();
        return reply;

    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Add Message to Chat
function addMessageToChat(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    const avatar = role === 'user' 
        ? `${AVATAR_API}?seed=Student`
        : `${AVATAR_API}?seed=AI`;

    messageDiv.innerHTML = `
        <div class="message-avatar">
            <img src="${avatar}" alt="${role}">
        </div>
        <div class="message-content">
            <div class="message-text">${content}</div>
            <div class="message-time">${getCurrentTime()}</div>
        </div>
    `;

    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }

    chatMessages.appendChild(messageDiv);
}

// Quick Action Handler
function handleQuickAction(e) {
    const action = e.currentTarget.textContent.trim();
    let message = '';

    switch(action) {
        case 'Study Help':
            message = "I need help creating a study plan for my upcoming exams.";
            break;
        case 'Q&A Support':
            message = "I have a question about my current topic of study.";
            break;
        case 'Assignment Help':
            message = "I need guidance with my assignment.";
            break;
        case 'Concept Explanation':
            message = "Can you explain a complex concept to me?";
            break;
    }

    userInput.value = message;
    chatForm.dispatchEvent(new Event('submit'));
}

// Utility Functions
function getCurrentTime() {
    return new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: 'numeric',
        hour12: true 
    });
}

function autoResizeTextarea() {
    userInput.style.height = 'auto';
    userInput.style.height = userInput.scrollHeight + 'px';
}

function clearChat() {
    chatHistory = [{
        role: 'model',
        parts: [{ text: 'You are a helpful AI learning assistant.' }]
    }];
    chatMessages.innerHTML = '';
    localStorage.removeItem('chatHistory');
    location.reload();
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const icon = themeToggle.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
}

function saveChatHistory() {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

function renderChatHistory() {
    chatHistory.forEach(msg => {
        if (msg.role !== 'system') {
            addMessageToChat(
                msg.role === 'user' ? 'user' : 'assistant', 
                msg.parts[0].text
            );
        }
    });
}

// Handle file uploads
const fileInput = document.querySelector('.tool-btn[title="Upload Image"]');
if (fileInput) {
    fileInput.addEventListener('click', () => {
        alert('File upload feature coming soon!');
    });
}

// Handle voice recording
const voiceButton = document.querySelector('.tool-btn[title="Record Voice"]');
if (voiceButton) {
    voiceButton.addEventListener('click', () => {
        alert('Voice recording feature coming soon!');
    });
} 