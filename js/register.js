document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const messageContainer = document.getElementById('messageContainer');
    const registerButton = document.getElementById('registerButton');
    const togglePassword = document.getElementById('togglePassword');
    const toggleConfirmPassword = document.getElementById('toggleConfirmPassword');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // Password visibility toggles
    [togglePassword, toggleConfirmPassword].forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            const input = e.target.id === 'togglePassword' ? passwordInput : confirmPasswordInput;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            e.target.classList.toggle('fa-eye');
            e.target.classList.toggle('fa-eye-slash');
        });
    });

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Reset previous messages
        messageContainer.innerHTML = '';

        // Validation
        if (!fullName || !email || !password || !confirmPassword) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        if (!isValidEmail(email)) {
            showMessage('Please enter a valid email address', 'error');
            return;
        }

        if (password.length < 8) {
            showMessage('Password must be at least 8 characters long', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }

        setLoading(true);

        try {
            await registerUser(fullName, email, password);
            showMessage('Registration successful! Redirecting to login...', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);

        } catch (error) {
            showMessage(error.message, 'error');
        } finally {
            setLoading(false);
        }
    });

    function setLoading(isLoading) {
        registerButton.disabled = isLoading;
        registerButton.classList.toggle('loading', isLoading);
    }

    function showMessage(message, type) {
        messageContainer.innerHTML = `<div class="${type}-message">${message}</div>`;
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    async function registerUser(fullName, email, password) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        if (users.some(user => user.email === email)) {
            throw new Error('Email already registered');
        }

        const newUser = {
            fullName,
            email,
            password,
            createdAt: new Date().toISOString(),
            avatar: `https://api.dicebear.com/6.x/avataaars/svg?seed=${email}`,
            settings: {
                theme: 'light',
                notifications: true,
                language: 'en'
            }
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        return { fullName, email };
    }
});
