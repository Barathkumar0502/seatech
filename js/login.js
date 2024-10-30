document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageContainer = document.getElementById('messageContainer');

    // Demo credentials (replace with actual authentication)
    const DEMO_USERS = [
        { email: 'demo@seatech.com', password: 'demo123' }
    ];

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Basic validation
        if (!email || !password) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        try {
            // Simulate API call
            await authenticateUser(email, password);
            
            showMessage('Login successful! Redirecting...', 'success');
            
            // Store auth state
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userEmail', email);

            // Redirect after short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    function showMessage(message, type) {
        messageContainer.innerHTML = `<div class="${type}-message">${message}</div>`;
    }

    async function authenticateUser(email, password) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check demo user first
        const demoUser = DEMO_USERS.find(u => u.email === email && u.password === password);
        if (demoUser) return demoUser;

        // Check registered users
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            throw new Error('Invalid email or password');
        }

        return user;
    }

    // Check if user is already logged in
    if (localStorage.getItem('isAuthenticated') === 'true') {
        window.location.href = 'dashboard.html';
    }
});
