// Common functionality for authenticated pages
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logoutBtn');
    const userProfile = document.querySelector('.user-profile');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    if (userProfile) {
        updateUserProfile();
    }
});

function handleLogout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    window.location.href = 'seatech1.html';
}

function updateUserProfile() {
    const userEmail = localStorage.getItem('userEmail');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === userEmail);
    
    if (user) {
        document.querySelector('.user-info h3').textContent = user.fullName;
    }
}
