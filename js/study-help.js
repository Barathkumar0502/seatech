const { GEMINI_API_KEY, API_ENDPOINT } = CONFIG;

// Core function to generate study plan
async function generateStudyPlan() {
    const subject = document.getElementById('subject').value;
    const goal = document.getElementById('goal').value;
    const hours = document.getElementById('hours').value;
    const days = document.getElementById('days').value;

    if (!subject || !goal || !hours || !days) {
        showMessage('Please fill in all fields', 'error');
        return;
    }

    const generateBtn = document.getElementById('generatePlan');
    const planResult = document.getElementById('planResult');
    generateBtn.disabled = true;
    planResult.innerHTML = '<div class="loading">Generating your personalized study plan...</div>';

    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyB0Vs5cr8z2caW37eAFPvDgOXgmLDYE2KM', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `Create a detailed ${days}-day study plan for ${subject}.
                               Goal: ${goal}
                               Available time: ${hours} hours per day

                               Please provide:
                               # Overview
                               Brief introduction and main objectives

                               # Daily Schedule
                               Detailed breakdown for each day

                               # Resources
                               Required materials and tools

                               # Practice
                               Exercises and assessments

                               # Tips
                               Study strategies and recommendations`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048,
                }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate plan');
        }

        const data = await response.json();
        const plan = data.candidates[0].content.parts[0].text;
        displayPlan(plan, subject, goal, hours, days);

    } catch (error) {
        console.error('Error:', error);
        showMessage('Failed to generate plan. Please try again.', 'error');
    } finally {
        generateBtn.disabled = false;
    }
}

// Display the generated plan
function displayPlan(plan, subject, goal, hours, days) {
    const sections = plan.split('#').filter(Boolean);
    
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

    // Scroll to result
    planResult.scrollIntoView({ behavior: 'smooth' });
}

// Format content with enhanced styling
function formatContent(content) {
    return content
        .split('\n')
        .map(line => {
            line = line.trim();
            if (!line) return '';
            
            // Format day headers
            if (line.match(/^Day \d+/i)) {
                return `<h5 class="day-title">${line}</h5>`;
            }
            
            // Format lists
            if (line.match(/^[-•*]/)) {
                return `<li>${line.replace(/^[-•*]/, '').trim()}</li>`;
            }
            
            // Format regular text
            return `<p>${line}</p>`;
        })
        .join('');
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
document.getElementById('generatePlan').addEventListener('click', generateStudyPlan);

// Handle form submission
document.getElementById('studyPlanForm').addEventListener('submit', (e) => {
    e.preventDefault();
    generateStudyPlan();
});

document.addEventListener('DOMContentLoaded', () => {
    const planForm = document.getElementById('planForm');
    const planResult = document.getElementById('planResult');

    planForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const subject = document.getElementById('subject').value;
        const goal = document.getElementById('goal').value;
        const hours = document.getElementById('hours').value;
        const days = document.getElementById('days').value;

        try {
            const plan = await generatePlan(subject, goal, hours, days);
            displayPlan(plan);
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    async function generatePlan(subject, goal, hours, days) {
        // Simulate API call - replace with actual AI integration
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        return `
# Day 1-${days} Study Plan for ${subject}
- Goal: ${goal}
- Daily commitment: ${hours} hours

## Daily Schedule
1. Review previous material (${Math.floor(hours * 0.2)} hours)
2. New content (${Math.floor(hours * 0.5)} hours)
3. Practice problems (${Math.floor(hours * 0.3)} hours)
        `;
    }
});