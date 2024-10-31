document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageContainer = document.getElementById('messageContainer');

    // Demo credentials and course data
    const DEMO_USERS = [
        { 
            email: 'demo@seatech.com', 
            password: 'demo123',
            courses: [
                {
                    id: 1,
                    title: 'Introduction to Python Programming',
                    description: 'Learn the fundamentals of Python programming language',
                    progress: 65,
                    category: 'programming',
                    status: 'in-progress',
                    timeLeft: '12 hours',
                    image: 'https://source.unsplash.com/random/800x600?programming'
                },
                {
                    id: 2,
                    title: 'Web Design Fundamentals',
                    description: 'Master the basics of web design and UI principles',
                    progress: 100,
                    category: 'design',
                    status: 'completed',
                    timeLeft: '0 hours',
                    image: 'https://source.unsplash.com/random/800x600?webdesign'
                },
                {
                    id: 3,
                    title: 'Advanced JavaScript',
                    description: 'Deep dive into modern JavaScript development',
                    progress: 0,
                    category: 'programming',
                    status: 'not-started',
                    timeLeft: '20 hours',
                    image: 'https://source.unsplash.com/random/800x600?javascript'
                }
            ]
        }
    ];

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const user = DEMO_USERS.find(u => u.email === email && u.password === password);
            
            if (!user) {
                throw new Error('Invalid credentials');
            }
            
            // Store auth state and user data
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userEmail', email);
            localStorage.setItem('userCourses', JSON.stringify(user.courses));

            showMessage('Login successful! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);

        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    function showMessage(message, type) {
        const messageContainer = document.getElementById('messageContainer');
        messageContainer.innerHTML = `<div class="${type}-message">${message}</div>`;
        setTimeout(() => {
            messageContainer.innerHTML = '';
        }, 3000);
    }

    async function authenticateUser(email, password) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check demo users
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
