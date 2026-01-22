// Time tracking system

let activeTimers = JSON.parse(localStorage.getItem('taskflow-timers') || '{}');

/**
 * Save timers
 */
function saveTimers() {
    localStorage.setItem('taskflow-timers', JSON.stringify(activeTimers));
}

/**
 * Start timer for task
 */
function startTimer(itemId) {
    // Stop any other active timers
    Object.keys(activeTimers).forEach(id => {
        if (id !== itemId) {
            stopTimer(id);
        }
    });
    
    activeTimers[itemId] = {
        startTime: Date.now(),
        itemId: itemId
    };
    saveTimers();
    
    const item = items.find(i => i.id === itemId);
    if (item) {
        showToast(`Timer started for: ${item.title}`, 'success');
        updateTimerDisplay(itemId);
    }
}

/**
 * Stop timer for task
 */
function stopTimer(itemId) {
    if (!activeTimers[itemId]) return;
    
    const timer = activeTimers[itemId];
    const duration = Date.now() - timer.startTime;
    
    const item = items.find(i => i.id === itemId);
    if (item) {
        if (!item.timeEntries) {
            item.timeEntries = [];
        }
        
        item.timeEntries.push({
            date: new Date().toISOString(),
            duration: duration, // in milliseconds
            note: ''
        });
        
        if (typeof saveToHistory === 'function') {
            saveToHistory('items', items);
        }
        saveItems();
        renderItems();
        showToast(`Logged ${formatDuration(duration)} for: ${item.title}`, 'success');
    }
    
    delete activeTimers[itemId];
    saveTimers();
}

/**
 * Format duration
 */
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
    } else {
        return `${seconds}s`;
    }
}

/**
 * Format total time
 */
function formatTotalTime(timeEntries) {
    const total = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    return formatDuration(total);
}

/**
 * Show log time modal
 */
function showLogTimeModal(itemId) {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content modal-small">
            <div class="modal-header">
                <h2>📝 Log Time</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <form id="logTimeForm" style="padding: 20px;">
                <div class="form-group">
                    <label>Hours</label>
                    <input type="number" id="logHours" min="0" value="0" step="0.25">
                </div>
                <div class="form-group">
                    <label>Minutes</label>
                    <input type="number" id="logMinutes" min="0" max="59" value="0">
                </div>
                <div class="form-group">
                    <label>Note (optional)</label>
                    <input type="text" id="logNote" placeholder="What did you work on?">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Log Time</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('logTimeForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const hours = parseFloat(document.getElementById('logHours').value) || 0;
        const minutes = parseInt(document.getElementById('logMinutes').value) || 0;
        const note = document.getElementById('logNote').value.trim();
        const duration = (hours * 3600 + minutes * 60) * 1000;
        
        if (duration > 0) {
            if (!item.timeEntries) {
                item.timeEntries = [];
            }
            
            item.timeEntries.push({
                date: new Date().toISOString(),
                duration: duration,
                note: note
            });
            
            if (typeof saveToHistory === 'function') {
                saveToHistory('items', items);
            }
            saveItems();
            renderItems();
            showToast(`Logged ${formatDuration(duration)}`, 'success');
            modal.remove();
        } else {
            showToast('Please enter a valid time', 'warning');
        }
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

/**
 * Update timer display
 */
function updateTimerDisplay(itemId) {
    if (!activeTimers[itemId]) return;
    
    const timer = activeTimers[itemId];
    const elapsed = Date.now() - timer.startTime;
    const btn = document.querySelector(`.start-timer-btn[data-id="${itemId}"]`);
    if (btn) {
        btn.textContent = `⏱️ ${formatDuration(elapsed)}`;
        btn.style.background = 'linear-gradient(135deg, var(--danger-color) 0%, #dc2626 100%)';
    }
}

// Update timer displays every second
if (typeof document !== 'undefined') {
    setInterval(() => {
        Object.keys(activeTimers).forEach(itemId => {
            updateTimerDisplay(itemId);
        });
    }, 1000);
}
