document.addEventListener('DOMContentLoaded', () => {
    // Add this at the beginning of the DOMContentLoaded event
    const session = JSON.parse(localStorage.getItem('session'));
    if (!session || !session.isAuthenticated) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize mood buttons
    const moodButtons = document.querySelectorAll('.mood-btn');
    const resumeButtons = document.querySelectorAll('.resume-btn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    moodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            moodButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            saveMood(btn.dataset.mood);
        });
    });

    // Initialize resume buttons
    resumeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const sessionTitle = btn.parentElement.querySelector('.session-info h4').textContent;
            localStorage.setItem('currentSession', sessionTitle);
            window.location.href = 'chat.html';
        });
    });

    // Initialize logout
    logoutBtn?.addEventListener('click', () => {
        logout();
    });

    function saveMood(mood) {
        const today = new Date().toISOString().split('T')[0];
        const moods = JSON.parse(localStorage.getItem('moods') || '{}');
        moods[today] = mood;
        localStorage.setItem('moods', JSON.stringify(moods));
        showMessage('Mood updated!', 'success');
    }

    function showMessage(message, type) {
        const toast = document.createElement('div');
        toast.className = `message ${type}-message`;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    document.querySelector('.new-session-btn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('currentSession'); // Ensure no session is active
        window.location.href = 'chat.html';
    });

    function logout() {
        localStorage.removeItem('session');
        localStorage.removeItem('chatHistory_' + JSON.parse(localStorage.getItem('session'))?.userEmail);
        localStorage.removeItem('moods');
        window.location.href = 'index.html';
    }
}); 