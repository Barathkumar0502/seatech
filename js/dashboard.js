document.addEventListener('DOMContentLoaded', () => {
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
            window.location.href = 'chat.html';
        });
    });

    // Initialize logout
    logoutBtn?.addEventListener('click', () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userEmail');
        window.location.href = 'seatech1.html';
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
}); 