// Statistics dashboard

/**
 * Show statistics dashboard
 */
function showStatisticsDashboard() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    
    const stats = calculateStatistics();
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
                <h2>📊 Statistics Dashboard</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div style="padding: 30px; max-height: 70vh; overflow-y: auto;">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${stats.total}</div>
                        <div class="stat-label">Total Tasks</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.completed}</div>
                        <div class="stat-label">Completed</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.completionRate}%</div>
                        <div class="stat-label">Completion Rate</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.overdue}</div>
                        <div class="stat-label">Overdue</div>
                    </div>
                </div>
                
                <div class="stats-section">
                    <h3>By Category</h3>
                    <div class="category-stats">
                        ${Object.entries(stats.byCategory).map(([cat, count]) => `
                            <div class="category-stat-item">
                                <span class="category-stat-name">${escapeHtml(cat || 'Uncategorized')}</span>
                                <div class="category-stat-bar">
                                    <div class="category-stat-fill" style="width: ${(count / stats.total) * 100}%;"></div>
                                </div>
                                <span class="category-stat-count">${count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="stats-section">
                    <h3>By Priority</h3>
                    <div class="priority-stats">
                        ${Object.entries(stats.byPriority).map(([priority, count]) => `
                            <div class="priority-stat-item">
                                <span class="priority-stat-label">${priority || 'None'}</span>
                                <span class="priority-stat-count">${count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                ${stats.totalTime > 0 ? `
                    <div class="stats-section">
                        <h3>Time Tracking</h3>
                        <div class="time-stat">
                            <div class="stat-value">${formatTotalTimeFromEntries(stats.totalTime)}</div>
                            <div class="stat-label">Total Time Logged</div>
                        </div>
                    </div>
                ` : ''}
                
                <div class="stats-section">
                    <h3>Productivity Trends</h3>
                    <div class="trends-info">
                        <p>Completed this week: <strong>${stats.thisWeek}</strong></p>
                        <p>Completed this month: <strong>${stats.thisMonth}</strong></p>
                        <p>Average per day: <strong>${stats.avgPerDay.toFixed(1)}</strong></p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

/**
 * Calculate statistics
 */
function calculateStatistics() {
    const allItems = items.filter(item => !item.archived);
    const total = allItems.length;
    const completed = allItems.filter(item => item.status === 'completed').length;
    const overdue = allItems.filter(item => {
        if (!item.dueDate || item.status === 'completed') return false;
        return new Date(item.dueDate) < new Date();
    }).length;
    
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // By category
    const byCategory = {};
    allItems.forEach(item => {
        const cat = item.category || 'Uncategorized';
        byCategory[cat] = (byCategory[cat] || 0) + 1;
    });
    
    // By priority
    const byPriority = { high: 0, medium: 0, low: 0, none: 0 };
    allItems.forEach(item => {
        const priority = item.priority || 'none';
        byPriority[priority] = (byPriority[priority] || 0) + 1;
    });
    
    // Time tracking
    let totalTime = 0;
    allItems.forEach(item => {
        if (item.timeEntries) {
            totalTime += item.timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
        }
    });
    
    // Trends
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const thisWeek = allItems.filter(item => {
        if (!item.completedAt) return false;
        return new Date(item.completedAt) >= weekAgo;
    }).length;
    
    const thisMonth = allItems.filter(item => {
        if (!item.completedAt) return false;
        return new Date(item.completedAt) >= monthAgo;
    }).length;
    
    const avgPerDay = thisMonth / 30;
    
    return {
        total,
        completed,
        completionRate,
        overdue,
        byCategory,
        byPriority,
        totalTime,
        thisWeek,
        thisMonth,
        avgPerDay
    };
}

/**
 * Format total time from milliseconds
 */
function formatTotalTimeFromEntries(ms) {
    if (typeof formatDuration === 'function') {
        return formatDuration(ms);
    }
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
}
