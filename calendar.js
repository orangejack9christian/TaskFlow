// Calendar view component

let currentView = 'month'; // month, week, day
let currentDate = new Date();

// Access items from global scope (defined in app.js)

/**
 * Initialize calendar
 */
function initCalendar() {
    renderCalendar();
}

/**
 * Render calendar view
 */
function renderCalendar() {
    const container = document.getElementById('calendarContainer');
    if (!container) return;
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    container.innerHTML = `
        <div class="calendar-header">
            <button class="calendar-nav-btn" id="prevMonth">‹</button>
            <h2 class="calendar-title">${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
            <button class="calendar-nav-btn" id="nextMonth">›</button>
            <button class="calendar-today-btn" id="goToToday">Today</button>
        </div>
        <div class="calendar-grid" id="calendarGrid">
            ${renderCalendarGrid(year, month)}
        </div>
    `;
    
    // Attach event listeners
    document.getElementById('prevMonth')?.addEventListener('click', () => {
        currentDate.setMonth(month - 1);
        renderCalendar();
    });
    
    document.getElementById('nextMonth')?.addEventListener('click', () => {
        currentDate.setMonth(month + 1);
        renderCalendar();
    });
    
    document.getElementById('goToToday')?.addEventListener('click', () => {
        currentDate = new Date();
        renderCalendar();
    });
}

/**
 * Render calendar grid
 */
function renderCalendarGrid(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    // Get items for this month
    const monthItems = items.filter(item => {
        if (!item.dueDate) return false;
        const dueDate = new Date(item.dueDate);
        return dueDate.getFullYear() === year && dueDate.getMonth() === month;
    });
    
    // Day names
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let html = '<div class="calendar-weekdays">';
    dayNames.forEach(day => {
        html += `<div class="calendar-weekday">${day}</div>`;
    });
    html += '</div>';
    
    // Calendar days
    html += '<div class="calendar-days">';
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
        html += '<div class="calendar-day empty"></div>';
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayItems = monthItems.filter(item => {
            const dueDate = new Date(item.dueDate);
            return dueDate.getDate() === day;
        });
        
        const isToday = date.toDateString() === new Date().toDateString();
        const dayClass = `calendar-day ${isToday ? 'today' : ''} ${dayItems.length > 0 ? 'has-items' : ''}`;
        
        html += `
            <div class="${dayClass}" data-date="${date.toISOString()}">
                <div class="calendar-day-number">${day}</div>
                <div class="calendar-day-items">
                    ${dayItems.slice(0, 3).map(item => `
                        <div class="calendar-item ${item.priority || ''}" title="${escapeHtml(item.title)}">
                            ${escapeHtml(item.title.substring(0, 20))}
                        </div>
                    `).join('')}
                    ${dayItems.length > 3 ? `<div class="calendar-more">+${dayItems.length - 3} more</div>` : ''}
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    
    // Attach click handlers
    setTimeout(() => {
        document.querySelectorAll('.calendar-day[data-date]').forEach(dayEl => {
            dayEl.addEventListener('click', (e) => {
                if (!e.target.closest('.calendar-item')) {
                    const date = dayEl.dataset.date;
                    openModalWithDate(date);
                }
            });
        });
        
        document.querySelectorAll('.calendar-item').forEach(itemEl => {
            itemEl.addEventListener('click', (e) => {
                const dayEl = e.target.closest('.calendar-day');
                const date = dayEl.dataset.date;
                const dayItems = monthItems.filter(item => {
                    const dueDate = new Date(item.dueDate);
                    return dueDate.toDateString() === new Date(date).toDateString();
                });
                if (dayItems.length === 1) {
                    openModal(dayItems[0]);
                } else if (dayItems.length > 1) {
                    // Show items for that day
                    showDayItems(dayItems, date);
                }
            });
        });
    }, 100);
    
    return html;
}

/**
 * Open modal with pre-filled date
 */
function openModalWithDate(dateString) {
    const date = new Date(dateString);
    openModal();
    document.getElementById('itemDueDateNatural').value = formatNaturalDate(date.toISOString());
    document.getElementById('itemDueDate').value = formatDateTimeLocal(date.toISOString());
}

/**
 * Show items for a specific day
 */
function showDayItems(dayItems, dateString) {
    const date = new Date(dateString);
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Tasks for ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="day-items-list">
                ${dayItems.map(item => `
                    <div class="day-item-card" onclick="openModal(${JSON.stringify(item).replace(/"/g, '&quot;')}); this.closest('.modal').remove();">
                        <h3>${escapeHtml(item.title)}</h3>
                        <div class="day-item-meta">
                            ${item.priority ? `<span class="priority-badge ${item.priority}">${item.priority}</span>` : ''}
                            <span class="status-badge ${item.status}">${item.status}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

/**
 * Switch to calendar view
 */
function switchToCalendarView() {
    document.getElementById('listView').style.display = 'none';
    document.getElementById('calendarView').style.display = 'block';
    renderCalendar();
}

/**
 * Switch to list view
 */
function switchToListView() {
    document.getElementById('listView').style.display = 'block';
    document.getElementById('calendarView').style.display = 'none';
    renderItems();
}
