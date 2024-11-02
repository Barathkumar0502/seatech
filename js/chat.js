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

// Initialize chat history with user-specific key
let chatHistory = [{
    role: 'model',
    parts: [{ text: 'You are a helpful AI learning assistant. You help students understand concepts, solve problems, and learn effectively.' }]
}];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication first
    const session = JSON.parse(localStorage.getItem('session'));
    if (!session || !session.isAuthenticated) {
        window.location.href = 'index.html';
        return;
    }

    const userEmail = session.userEmail;
    if (!userEmail) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize chat interface
    initializeChat(userEmail);
});

function initializeChat(userEmail) {
    // Load saved history if exists
    const savedHistory = localStorage.getItem(`chatHistory_${userEmail}`);
    if (savedHistory) {
        chatHistory = JSON.parse(savedHistory);
        renderChatHistory();
    }

    // Get current session if resuming
    const currentSession = localStorage.getItem('currentSession');
    if (currentSession && subjectSelect) {
        setSubjectBasedOnSession(currentSession);
    }

    // Set up event listeners
    userInput.addEventListener('input', autoResizeTextarea);
    chatForm.addEventListener('submit', handleSubmit);
    clearButton.addEventListener('click', clearChat);
    themeToggle.addEventListener('click', toggleTheme);
    quickActionButtons.forEach(btn => btn.addEventListener('click', handleQuickAction));
}

function setSubjectBasedOnSession(currentSession) {
    if (currentSession.includes('Python') || currentSession.includes('Programming')) {
        subjectSelect.value = 'programming';
    } else if (currentSession.includes('Machine Learning')) {
        subjectSelect.value = 'science';
    } else if (currentSession.includes('Database')) {
        subjectSelect.value = 'general';
    }
    // Clear the current session after setting subject
    localStorage.removeItem('currentSession');
}

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
    
    // Format messages for Gemini API
    const formattedMessages = chatHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.parts[0].text }]
    }));

    // Add current message
    formattedMessages.push({
        role: 'user',
        parts: [{ text: message }]
    });

    // Add subject context
    formattedMessages.push({
        role: 'model',
        parts: [{ text: `I'll help you with ${subject} related questions.` }]
    });

    try {
        const response = await fetch(`${API_ENDPOINT}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: formattedMessages,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        const data = await response.json();
        const reply = data.candidates[0].content.parts[0].text;

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
    messageDiv.className = `message ${role}-message animate-in`;
    
    const avatar = role === 'user' 
        ? `${AVATAR_API}?seed=Student`
        : `${AVATAR_API}?seed=AI`;

    // Parse markdown and add syntax highlighting
    const formattedContent = marked.parse(content, {
        highlight: function(code, lang) {
            if (lang && hljs.getLanguage(lang)) {
                return hljs.highlight(code, { language: lang }).value;
            }
            return code;
        }
    });

    messageDiv.innerHTML = `
        <div class="message-avatar">
            <img src="${avatar}" alt="${role}">
        </div>
        <div class="message-content">
            <div class="message-bubble">
                <div class="message-text">${formattedContent}</div>
                <div class="message-metadata">
                    <span class="message-time">${getCurrentTime()}</span>
                    ${role === 'assistant' ? '<span class="ai-badge">AI</span>' : ''}
                </div>
            </div>
        </div>
    `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
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

// Modified clear chat function
function clearChat() {
    const userEmail = JSON.parse(localStorage.getItem('session'))?.userEmail;
    chatHistory = [{
        role: 'model',
        parts: [{ text: 'You are a helpful AI learning assistant.' }]
    }];
    chatMessages.innerHTML = '';
    if (userEmail) {
        localStorage.removeItem(`chatHistory_${userEmail}`);
        sessionStorage.removeItem(`chat_active_${userEmail}`);
    }
    location.reload();
}

function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const icon = themeToggle.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
}

// Modified save chat history function
function saveChatHistory() {
    const userEmail = JSON.parse(localStorage.getItem('session'))?.userEmail;
    if (userEmail) {
        localStorage.setItem(`chatHistory_${userEmail}`, JSON.stringify(chatHistory));
    }
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
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = 'image/*';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);

const uploadButton = document.querySelector('.tool-btn[title="Upload Image"]');
if (uploadButton) {
    uploadButton.addEventListener('click', () => {
        fileInput.click();
    });
}

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        // TODO: Handle file upload
        console.log('File selected:', file);
        // For now, just show the filename in the chat
        addMessageToChat('user', `Uploaded file: ${file.name}`);
    }
});

// Handle voice recording
const voiceButton = document.querySelector('.tool-btn[title="Record Voice"]');
if (voiceButton) {
    voiceButton.addEventListener('click', () => {
        alert('Voice recording feature coming soon!');
    });
} 
