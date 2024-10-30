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

// Add these after existing DOM elements
const uploadButton = document.querySelector('.tool-btn[title="Upload Image"]');
const voiceButton = document.querySelector('.tool-btn[title="Record Voice"]');
const attachButton = document.querySelector('.tool-btn[title="Attach File"]');

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

// Add this after your existing event listeners (around line 39):

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
    }
});

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
    document.body.classList.toggle('dark-theme');
    const icon = themeToggle.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
    
    // Save theme preference
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
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
if (voiceButton) {
    voiceButton.addEventListener('click', () => {
        alert('Voice recording feature coming soon!');
    });
}

// File Upload Handler
uploadButton.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = handleImageUpload;
    input.click();
});

async function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        try {
            const message = `[Uploading image: ${file.name}]`;
            addMessageToChat('user', message);
            // Here you would typically upload to a server
            // For now, we'll just show a local preview
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgPreview = `<img src="${e.target.result}" style="max-width: 300px; border-radius: 8px;">`;
                addMessageToChat('user', imgPreview);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Upload error:', error);
            addMessageToChat('assistant', 'Sorry, there was an error uploading your image.');
        }
    }
};

// Voice Recording Handler
let mediaRecorder;
let audioChunks = [];

voiceButton.addEventListener('click', async () => {
    try {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = `<audio controls src="${audioUrl}"></audio>`;
                addMessageToChat('user', audio);
            };

            mediaRecorder.start();
            voiceButton.innerHTML = '<i class="fas fa-stop"></i>';
            addMessageToChat('assistant', 'Recording started... Click again to stop.');
        } else {
            mediaRecorder.stop();
            voiceButton.innerHTML = '<i class="fas fa-microphone"></i>';
            addMessageToChat('assistant', 'Recording stopped.');
        }
    } catch (error) {
        console.error('Recording error:', error);
        addMessageToChat('assistant', 'Sorry, there was an error with the voice recording.');
    }
});

// File Attachment Handler
attachButton.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = handleFileAttachment;
    input.click();
});

function handleFileAttachment(event) {
    const file = event.target.files[0];
    if (file) {
        const message = `[Attached file: ${file.name}]`;
        addMessageToChat('user', message);
        // Here you would typically upload to a server
        addMessageToChat('assistant', 'File received! I can help you analyze its contents.');
    }
};

// Enhanced Quick Action Buttons
quickActionButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const action = e.currentTarget.textContent.trim();
        let message = '';
        
        switch(action) {
            case 'Study Help':
                window.location.href = 'study-help.html';
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

        if (message) {
            userInput.value = message;
            chatForm.dispatchEvent(new Event('submit'));
        }
    });
});

// Load saved theme
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    }
});