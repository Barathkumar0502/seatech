document.addEventListener('DOMContentLoaded', () => {
    // Get current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Check if we're on auth pages
    const isAuthPage = currentPage === 'index.html' || currentPage === 'register.html';
    const protectedPages = ['dashboard.html', 'chat.html', 'courses.html', 'settings.html', 'study-help.html'];
    
    const session = JSON.parse(localStorage.getItem('session'));
    
    // If on protected pages and not authenticated, redirect to login
    if (protectedPages.includes(currentPage) && (!session || !session.isAuthenticated)) {
        window.location.href = 'index.html';
        return;
    }
    
    // If authenticated and on auth pages, redirect to dashboard
    if (session?.isAuthenticated && isAuthPage) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Update user info in sidebar if available
    updateUserInfo(session);

    // Handle logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    // Add CSRF token
    addCSRFToken();
});

function handleLogout() {
    const userEmail = JSON.parse(localStorage.getItem('session'))?.userEmail;
    if (userEmail) {
        // Clear session-specific data
        sessionStorage.removeItem(`chat_active_${userEmail}`);
        localStorage.removeItem(`chatHistory_${userEmail}`);
        localStorage.removeItem('currentSession');
    }
    
    // Clear auth data
    localStorage.removeItem('session');
    localStorage.removeItem('isAuthenticated');
    
    // Redirect to login
    window.location.replace('index.html');
}

function addCSRFToken() {
    const token = Math.random().toString(36).substring(2);
    localStorage.setItem('csrfToken', token);
    
    document.querySelectorAll('form').forEach(form => {
        const tokenInput = document.createElement('input');
        tokenInput.type = 'hidden';
        tokenInput.name = 'csrf_token';
        tokenInput.value = token;
        form.appendChild(tokenInput);
    });
}

// Call this when the page loads
document.addEventListener('DOMContentLoaded', addCSRFToken);

// Add this function to update user info in sidebar
function updateUserInfo(session) {
    if (!session) return;
    
    const nameElement = document.querySelector('.user-info h3');
    const avatarElement = document.querySelector('.user-profile .avatar');
    
    if (nameElement) {
        nameElement.textContent = session.userName || 'User';
    }
    
    if (avatarElement) {
        avatarElement.src = `https://api.dicebear.com/6.x/avataaars/svg?seed=${session.userEmail}`;
    }
}

