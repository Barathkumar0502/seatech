// Generate Contribution Graph
function generateContributionGraph() {
    const graph = document.getElementById('contributionGraph');
    const days = 52 * 7; // One year
    const today = new Date();

    for (let i = 0; i < days; i++) {
        const cell = document.createElement('div');
        cell.className = 'contribution-cell';
        
        // Generate random activity level for demo
        const level = Math.floor(Math.random() * 5);
        cell.style.background = `rgba(255, 0, 128, ${level * 0.2})`;
        
        // Calculate date for this cell
        const date = new Date(today);
        date.setDate(date.getDate() - (days - i));
        
        // Add tooltip
        cell.title = `${level} activities on ${date.toLocaleDateString()}`;
        
        graph.appendChild(cell);
    }
}

// Call when document loads
document.addEventListener('DOMContentLoaded', function() {
    generateContributionGraph();
    // ... existing code ...
}); 