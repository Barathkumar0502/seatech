document.addEventListener('DOMContentLoaded', () => {
    const moodButtons = document.querySelectorAll('.mood-btn');
    const contributionCells = document.querySelectorAll('.contribution-cell');
    
    moodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            moodButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            // Save mood
            saveMood(btn.dataset.mood);
        });
    });

    function saveMood(mood) {
        const today = new Date().toISOString().split('T')[0];
        const moods = JSON.parse(localStorage.getItem('moods') || '{}');
        moods[today] = mood;
        localStorage.setItem('moods', JSON.stringify(moods));
        showMessage('Mood updated!', 'success');
    }
}); 