document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const messageContainer = document.getElementById('messageContainer');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Basic validation
        if (!fullName || !email || !password || !confirmPassword) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }

        try {
            // Simulate API call
            await registerUser(fullName, email, password);
            
            showMessage('Registration successful! Redirecting to login...', 'success');
            
            // Redirect after short delay
            setTimeout(() => {
                window.location.href = 'seatech1.html';
            }, 2000);

        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    function showMessage(message, type) {
        messageContainer.innerHTML = `<div class="${type}-message">${message}</div>`;
    }

    async function registerUser(fullName, email, password) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Demo registration - you would typically make an API call here
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if email already exists
        if (users.some(user => user.email === email)) {
            throw new Error('Email already registered');
        }

        // Store new user
        users.push({ fullName, email, password });
        localStorage.setItem('users', JSON.stringify(users));

        return { fullName, email };
    }
});
