// Recurring tasks logic

/**
 * Process recurring tasks - create next occurrence if needed
 */
function processRecurringTasks() {
    const now = new Date();
    items.forEach(item => {
        if (!item.recurrence || item.recurrence.type === null) return;
        if (item.status !== 'completed') return; // Only process completed recurring tasks
        
        const lastCreated = item.recurrence.lastCreated ? new Date(item.recurrence.lastCreated) : null;
        const dueDate = item.dueDate ? new Date(item.dueDate) : null;
        
        if (!dueDate) return;
        
        let shouldCreate = false;
        let nextDate = new Date(dueDate);
        
        switch (item.recurrence.type) {
            case 'daily':
                nextDate.setDate(nextDate.getDate() + 1);
                shouldCreate = !lastCreated || lastCreated < now;
                break;
            case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                shouldCreate = !lastCreated || (now - lastCreated) >= 7 * 24 * 60 * 60 * 1000;
                break;
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                shouldCreate = !lastCreated || (now - lastCreated) >= 30 * 24 * 60 * 60 * 1000;
                break;
            case 'custom':
                nextDate.setDate(nextDate.getDate() + (item.recurrence.interval || 1));
                shouldCreate = !lastCreated || (now - lastCreated) >= (item.recurrence.interval || 1) * 24 * 60 * 60 * 1000;
                break;
        }
        
        if (shouldCreate && nextDate <= now) {
            createNextRecurrence(item, nextDate);
        }
    });
}

/**
 * Create next occurrence of recurring task
 */
function createNextRecurrence(originalItem, nextDate) {
    const newItem = {
        id: generateId(),
        title: originalItem.title,
        description: originalItem.description,
        type: originalItem.type,
        dueDate: nextDate.toISOString(),
        priority: originalItem.priority,
        category: originalItem.category,
        status: 'pending',
        subtasks: JSON.parse(JSON.stringify(originalItem.subtasks || [])).map(st => ({
            ...st,
            completed: false
        })),
        project: originalItem.project,
        recurrence: JSON.parse(JSON.stringify(originalItem.recurrence)),
        timeEntries: [],
        reminders: [],
        archived: false,
        archivedAt: null,
        createdAt: new Date().toISOString(),
        completedAt: null
    };
    
    items.push(newItem);
    originalItem.recurrence.lastCreated = new Date().toISOString();
    
    saveItems();
    renderItems();
    updateStats();
    showToast(`Recurring task created: ${newItem.title}`, 'success');
}

// Check for recurring tasks periodically
if (typeof document !== 'undefined') {
    setInterval(() => {
        if (typeof processRecurringTasks === 'function') {
            processRecurringTasks();
        }
    }, 60000); // Check every minute
}
