const { GEMINI_API_KEY, API_ENDPOINT } = CONFIG;

// Core function to generate study plan
async function generateStudyPlan(e) {
    e.preventDefault();
    
    const subject = document.getElementById('subject').value;
    const goal = document.getElementById('goal').value;
    const hours = document.getElementById('hours').value;
    const days = document.getElementById('days').value;

    if (!subject || !goal || !hours || !days) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    const generateBtn = document.querySelector('.submit-btn');
    const planResult = document.getElementById('planResult');
    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    planResult.innerHTML = '<div class="loading">Generating your personalized study plan...</div>';

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-goog-api-key': GEMINI_API_KEY
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `As an educational expert, create a detailed ${days}-day study plan for ${subject}.
                        
                        Student's Goal: ${goal}
                        Available Study Time: ${hours} hours per day
                        
                        Please provide a structured study plan following this format:
                        
                        # Overview
                        [Brief introduction about the study plan and its objectives]
                        
                        # Daily Schedule
                        ## Day 1
                        - Morning (${Math.round(hours/2)} hours):
                          * [Specific topics/activities]
                        - Evening (${Math.round(hours/2)} hours):
                          * [Specific topics/activities]
                        
                        [Continue for each day with specific topics and time allocations]
                        
                        # Study Resources
                        - [Required textbooks/materials]
                        - [Online resources]
                        - [Practice materials]
                        
                        # Success Strategies
                        - [Study techniques]
                        - [Time management tips]
                        - [Progress tracking methods]
                        
                        Make the plan specific to ${subject} and align it with the goal: ${goal}`
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate study plan');
        }

        const data = await response.json();
        const plan = data.candidates[0].content.parts[0].text;
        displayPlan(plan, subject, goal, hours, days);
        showMessage('Study plan generated successfully!', 'success');

    } catch (error) {
        console.error('Error:', error);
        planResult.innerHTML = '<div class="error-message">Failed to generate plan. Please try again.</div>';
        showMessage('Failed to generate plan', 'error');
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-calendar-plus"></i> Generate Study Plan';
    }
}

// Display the generated plan
function displayPlan(plan, subject, goal, hours, days) {
    const sections = plan.split('#').filter(Boolean);
    const planResult = document.getElementById('planResult');
    
    planResult.innerHTML = `
        <div class="plan-content">
            <div class="plan-header">
                <h3>${subject} Study Plan</h3>
                <div class="plan-meta">
                    <span><i class="fas fa-calendar"></i> ${days} days</span>
                    <span><i class="fas fa-clock"></i> ${hours} hours/day</span>
                    <span><i class="fas fa-bullseye"></i> ${goal}</span>
                </div>
            </div>
            
            <div class="plan-sections">
                ${sections.map(section => {
                    const [title, ...content] = section.trim().split('\n');
                    return `
                        <div class="plan-section">
                            <h4 class="section-title">${title.trim()}</h4>
                            <div class="section-content">
                                ${formatContent(content.join('\n'))}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>

            <div class="plan-actions">
                <button onclick="savePlan()" class="action-btn">
                    <i class="fas fa-save"></i> Save Plan
                </button>
                <button onclick="sharePlan()" class="action-btn">
                    <i class="fas fa-share"></i> Share
                </button>
                <button onclick="printPlan()" class="action-btn">
                    <i class="fas fa-print"></i> Print
                </button>
            </div>
        </div>
    `;

    planResult.scrollIntoView({ behavior: 'smooth' });
}

// Format content with enhanced styling
function formatContent(content) {
    return content
        .split('\n')
        .map(line => {
            line = line.trim();
            if (!line) return '';
            
            if (line.match(/^Day \d+/i)) {
                return `<h5 class="day-title">${line}</h5>`;
            }
            
            if (line.match(/^[-•*]/)) {
                return `<li>${line.replace(/^[-•*]/, '').trim()}</li>`;
            }
            
            return `<p>${line}</p>`;
        })
        .join('');
}

// Generate daily table rows
function generateDailyTable(days, plan, hours) {
    let tableRows = '';
    const dailyContent = plan.split('Day').filter(Boolean);
    
    for (let i = 1; i <= days; i++) {
        const dayContent = dailyContent.find(content => content.startsWith(` ${i}`)) || '';
        const topics = extractTopics(dayContent);
        
        tableRows += `
            <tr>
                <td>Day ${i}</td>
                <td>
                    <div class="topic-pills">
                        ${topics.map(topic => `<span class="topic-pill">${topic}</span>`).join('')}
                    </div>
                </td>
                <td>${hours} hours</td>
                <td>
                    <select class="status-select" onchange="updateStatus(this, ${i})">
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </td>
            </tr>
        `;
    }
    return tableRows;
}

function extractTopics(dayContent) {
    const topics = dayContent.match(/[-•*]\s*(.*?)(?=[-•*]|$)/g) || [];
    return topics.map(topic => topic.replace(/[-•*]\s*/, '').trim()).slice(0, 3);
}

// Utility functions
function savePlan() {
    const planContent = document.querySelector('.plan-content').innerHTML;
    localStorage.setItem('savedStudyPlan', planContent);
    showMessage('Plan saved successfully!', 'success');
}

function sharePlan() {
    if (navigator.share) {
        navigator.share({
            title: 'My Study Plan',
            text: document.querySelector('.plan-sections').textContent,
            url: window.location.href
        }).catch(err => {
            console.error('Error sharing:', err);
            showMessage('Failed to share plan', 'error');
        });
    } else {
        showMessage('Sharing is not supported on this device', 'warning');
    }
}

function printPlan() {
    window.print();
}

function showMessage(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 
                          type === 'error' ? 'exclamation-circle' : 
                          type === 'warning' ? 'exclamation-triangle' : 
                          'info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Event listeners
document.getElementById('studyPlanForm').addEventListener('submit', generateStudyPlan);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('studyPlanForm');
    if (form) {
        form.addEventListener('submit', generateStudyPlan);
    } else {
        console.error("Form element not found!");
    }
});