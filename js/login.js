document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageContainer = document.getElementById('messageContainer');
    const loginButton = document.getElementById('loginButton');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Password visibility toggle
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.classList.toggle('fa-eye');
        togglePassword.classList.toggle('fa-eye-slash');
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = passwordInput.value;

        // Reset previous error messages
        messageContainer.innerHTML = '';
        
        // Validate inputs
        if (!email || !password) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }

        // Show loading state
        setLoading(true);

        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email);
            
            if (!user || user.password !== password) {
                throw new Error('Invalid email or password');
            }
            
            const session = {
                token: generateSessionToken(),
                expires: new Date().getTime() + (24 * 60 * 60 * 1000),
                userEmail: email,
                userName: user.fullName,
                isAuthenticated: true,
                lastLogin: new Date().toISOString()
            };

            localStorage.setItem('session', JSON.stringify(session));
            showMessage('Login successful! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            showMessage(error.message, 'error');
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        loginButton.disabled = isLoading;
        loginButton.classList.toggle('loading', isLoading);
    }

    function showMessage(message, type) {
        messageContainer.innerHTML = `<div class="${type}-message">${message}</div>`;
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function generateSessionToken() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
});
