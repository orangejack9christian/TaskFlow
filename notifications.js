// Browser notifications and reminders

let notificationPermission = Notification.permission;

/**
 * Request notification permission
 */
async function requestNotificationPermission() {
    if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        notificationPermission = permission;
        if (permission === 'granted') {
            showToast('Notifications enabled!', 'success');
        } else {
            showToast('Notifications blocked', 'warning');
        }
        return permission === 'granted';
    }
    return Notification.permission === 'granted';
}

/**
 * Check and show reminders
 */
function checkReminders() {
    if (Notification.permission !== 'granted') return;
    
    const now = new Date();
    items.forEach(item => {
        if (!item.dueDate || item.status === 'completed') return;
        if (!item.reminders || item.reminders.length === 0) return;
        
        const dueDate = new Date(item.dueDate);
        
        item.reminders.forEach(reminder => {
            const reminderTime = new Date(dueDate.getTime() - reminder.beforeMinutes * 60 * 1000);
            
            if (now >= reminderTime && (!reminder.sent || new Date(reminder.sent) < reminderTime)) {
                showNotification(item, reminder);
                reminder.sent = new Date().toISOString();
                saveItems();
            }
        });
    });
}

/**
 * Show browser notification
 */
function showNotification(item, reminder) {
    if (Notification.permission !== 'granted') return;
    
    const notification = new Notification(`TaskFlow: ${item.title}`, {
        body: reminder.message || `Due ${formatNaturalDate(item.dueDate)}`,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: item.id,
        requireInteraction: false
    });
    
    notification.onclick = () => {
        window.focus();
        notification.close();
    };
    
    setTimeout(() => notification.close(), 5000);
}

/**
 * Add reminder to task
 */
function addReminder(itemId, beforeMinutes, message = '') {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    if (!item.reminders) {
        item.reminders = [];
    }
    
    item.reminders.push({
        id: generateId(),
        beforeMinutes: beforeMinutes,
        message: message,
        sent: null
    });
    
    saveItems();
    showToast('Reminder added', 'success');
}

/**
 * Show reminder setup modal
 */
function showReminderModal(itemId) {
    const item = items.find(i => i.id === itemId);
    if (!item || !item.dueDate) {
        showToast('Task needs a due date to set reminders', 'warning');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content modal-small">
            <div class="modal-header">
                <h2>🔔 Set Reminder</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <form id="reminderForm" style="padding: 20px;">
                <div class="form-group">
                    <label>Remind me</label>
                    <select id="reminderTime">
                        <option value="5">5 minutes before</option>
                        <option value="15">15 minutes before</option>
                        <option value="30">30 minutes before</option>
                        <option value="60">1 hour before</option>
                        <option value="1440">1 day before</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Message (optional)</label>
                    <input type="text" id="reminderMessage" placeholder="Custom reminder message">
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Set Reminder</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    document.getElementById('reminderForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (Notification.permission !== 'granted') {
            const granted = await requestNotificationPermission();
            if (!granted) {
                showToast('Please enable notifications in browser settings', 'warning');
                modal.remove();
                return;
            }
        }
        
        const beforeMinutes = parseInt(document.getElementById('reminderTime').value);
        const message = document.getElementById('reminderMessage').value.trim();
        
        if (typeof addReminder === 'function') {
            addReminder(itemId, beforeMinutes, message);
        }
        
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// Check reminders every minute
if (typeof document !== 'undefined') {
    setInterval(() => {
        if (typeof checkReminders === 'function') {
            checkReminders();
        }
    }, 60000);
    
    // Request permission on load
    document.addEventListener('DOMContentLoaded', () => {
        if (Notification.permission === 'default') {
            // Don't auto-request, let user do it
        }
    });
}
