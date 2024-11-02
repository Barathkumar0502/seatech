document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const session = JSON.parse(localStorage.getItem('session'));
    if (!session || !session.isAuthenticated) {
        window.location.href = 'index.html';
        return;
    }

    // Initialize elements
    const settingsTabs = document.querySelectorAll('.settings-tab');
    const settingsSections = document.querySelectorAll('.settings-section');
    const profileForm = document.getElementById('profileForm');
    const accountForm = document.getElementById('accountForm');
    const themeButtons = document.querySelectorAll('.theme-btn');
    const colorButtons = document.querySelectorAll('.color-btn');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    const messageContainer = document.getElementById('messageContainer');

    // Load initial data
    loadUserData();
    loadThemePreference();
    loadColorPreference();

    // Tab switching
    settingsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            settingsTabs.forEach(t => t.classList.remove('active'));
            settingsSections.forEach(s => s.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    // Profile form submission
    profileForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = profileForm.querySelector('.btn-primary');
        setLoading(submitBtn, true);

        try {
            const formData = {
                fullName: document.getElementById('fullName').value.trim(),
                institution: document.getElementById('institution').value.trim(),
                fieldOfStudy: document.getElementById('fieldOfStudy').value.trim(),
                bio: document.getElementById('bio').value.trim()
            };

            await updateProfile(formData);
            showMessage('Profile updated successfully!', 'success');
        } catch (error) {
            showMessage(error.message, 'error');
        } finally {
            setLoading(submitBtn, false);
        }
    });

    // Account form submission
    accountForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = accountForm.querySelector('.btn-primary');
        setLoading(submitBtn, true);

        try {
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const recoveryEmail = document.getElementById('recoveryEmail').value.trim();

            if (newPassword && !validatePassword(newPassword, confirmPassword)) {
                throw new Error('Passwords do not match or are too weak');
            }

            await updateAccount(currentPassword, newPassword, recoveryEmail);
            showMessage('Account settings updated successfully!', 'success');
            clearPasswordFields();
        } catch (error) {
            showMessage(error.message, 'error');
        } finally {
            setLoading(submitBtn, false);
        }
    });

    // Theme switching
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.dataset.theme;
            setTheme(theme);
            themeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            localStorage.setItem('theme', theme);
        });
    });

    // Color switching
    colorButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const color = btn.dataset.color;
            setAccentColor(color);
            colorButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            localStorage.setItem('accentColor', color);
        });
    });
    // Password visibility toggle
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            const type = input.type === 'password' ? 'text' : 'password';
            input.type = type;
            btn.classList.toggle('fa-eye');
            btn.classList.toggle('fa-eye-slash');
        });
    });
});

// Helper functions
function loadUserData() {
    const session = JSON.parse(localStorage.getItem('session'));
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === session.userEmail);

    if (user) {
        document.getElementById('fullName').value = user.fullName || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('institution').value = user.institution || '';
        document.getElementById('fieldOfStudy').value = user.fieldOfStudy || '';
        document.getElementById('bio').value = user.bio || '';
        document.getElementById('recoveryEmail').value = user.recoveryEmail || '';
        document.getElementById('profileAvatar').src = user.avatar || '';
    }
}

async function updateProfile(formData) {
    const session = JSON.parse(localStorage.getItem('session'));
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === session.userEmail);

    if (userIndex === -1) throw new Error('User not found');

    users[userIndex] = {
        ...users[userIndex],
        ...formData,
        updatedAt: new Date().toISOString()
    };

    localStorage.setItem('users', JSON.stringify(users));
    
    // Update session if name changed
    if (formData.fullName !== session.userName) {
        session.userName = formData.fullName;
        localStorage.setItem('session', JSON.stringify(session));
    }
}

function setLoading(button, isLoading) {
    button.classList.toggle('loading', isLoading);
    button.disabled = isLoading;
}

function showMessage(message, type) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    messageContainer.appendChild(messageElement);

    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

function validatePassword(password, confirmPassword) {
    if (password !== confirmPassword) return false;
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    return true;
}

function clearPasswordFields() {
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

function setAccentColor(color) {
    const colors = {
        pink: { primary: '#FF1493', secondary: '#FF69B4' },
        blue: { primary: '#007AFF', secondary: '#5856D6' },
        purple: { primary: '#6B46C1', secondary: '#9F7AEA' },
        green: { primary: '#10B981', secondary: '#34D399' }
    };

    document.documentElement.style.setProperty('--primary-color', colors[color].primary);
    document.documentElement.style.setProperty('--secondary-color', colors[color].secondary);
}

