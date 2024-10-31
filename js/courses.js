document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (localStorage.getItem('isAuthenticated') !== 'true') {
        window.location.href = 'index.html';
        return;
    }

    const coursesGrid = document.querySelector('.courses-grid');
    const filterSelects = document.querySelectorAll('.filter-select');
    const searchInput = document.querySelector('.search-bar input');

    // Load and render courses
    function loadCourses() {
        const courses = JSON.parse(localStorage.getItem('userCourses') || '[]');
        coursesGrid.innerHTML = ''; // Clear existing content

        courses.forEach(course => {
            const courseCard = `
                <div class="course-card" data-category="${course.category}">
                    <div class="course-image" style="background-image: url('${course.image}')">
                        <span class="course-badge ${course.status === 'completed' ? 'completed' : ''}">${course.status}</span>
                    </div>
                    <div class="course-content">
                        <h3>${course.title}</h3>
                        <p>${course.description}</p>
                        <div class="course-progress">
                            <div class="progress-bar">
                                <div class="progress" style="width: ${course.progress}%"></div>
                            </div>
                            <span>${course.progress}% Complete</span>
                        </div>
                        <div class="course-footer">
                            <span>
                                ${getStatusIcon(course.status)} ${getStatusText(course.status, course.timeLeft)}
                            </span>
                            <button class="${getButtonClass(course.status)}-btn">
                                ${getButtonText(course.status)}
                            </button>
                        </div>
                    </div>
                </div>
            `;
            coursesGrid.innerHTML += courseCard;
        });

        // Reattach event listeners
        attachEventListeners();
    }

    function getStatusIcon(status) {
        const icons = {
            'completed': '<i class="fas fa-trophy"></i>',
            'in-progress': '<i class="fas fa-clock"></i>',
            'not-started': '<i class="fas fa-book"></i>'
        };
        return icons[status] || icons['not-started'];
    }

    function getStatusText(status, timeLeft) {
        if (status === 'completed') return 'Certificate earned';
        if (status === 'in-progress') return `${timeLeft} left`;
        return `${timeLeft} total`;
    }

    function getButtonClass(status) {
        if (status === 'completed') return 'review';
        if (status === 'in-progress') return 'resume';
        return 'start';
    }

    function getButtonText(status) {
        if (status === 'completed') return 'Review';
        if (status === 'in-progress') return 'Resume';
        return 'Start Now';
    }

    function attachEventListeners() {
        // Filter functionality
        filterSelects.forEach(select => {
            select.addEventListener('change', filterCourses);
        });

        // Search functionality
        searchInput.addEventListener('input', filterCourses);

        // Course button clicks
        document.querySelectorAll('.course-footer button').forEach(button => {
            button.addEventListener('click', handleCourseAction);
        });
    }

    function filterCourses() {
        const categoryFilter = document.querySelector('.filter-select').value;
        const progressFilter = document.querySelectorAll('.filter-select')[1].value;
        const searchTerm = searchInput.value.toLowerCase();

        document.querySelectorAll('.course-card').forEach(card => {
            const title = card.querySelector('h3').textContent.toLowerCase();
            const badge = card.querySelector('.course-badge').textContent.toLowerCase();
            
            const matchesCategory = categoryFilter === 'all' || card.dataset.category === categoryFilter;
            const matchesProgress = progressFilter === 'all' || badge.includes(progressFilter);
            const matchesSearch = title.includes(searchTerm);

            card.style.display = 
                matchesCategory && matchesProgress && matchesSearch ? 'block' : 'none';
        });
    }

    function handleCourseAction(e) {
        const button = e.target;
        const card = button.closest('.course-card');
        const courseTitle = card.querySelector('h3').textContent;
        const action = button.className.replace('-btn', '');

        // Handle different course actions
        switch(action) {
            case 'start':
            case 'resume':
                window.location.href = `chat.html?course=${encodeURIComponent(courseTitle)}`;
                break;
            case 'review':
                // Add review functionality
                console.log(`Reviewing course: ${courseTitle}`);
                break;
        }
    }

    // Initial load
    loadCourses();
});
