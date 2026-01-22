// Main application logic

let items = [];
let currentFilter = 'today';
let currentSearch = '';
let currentCategory = '';
let currentSort = 'date';

    // Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Add loading state
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        loadItems();
        if (typeof initUndoRedo === 'function') {
            initUndoRedo();
        }
        if (typeof getDefaultProject === 'function') {
            getDefaultProject();
        }
        setupEventListeners();
        renderItems();
        updateStats();
        updateCategoryFilter();
        if (typeof updateProjectSelector === 'function') {
            updateProjectSelector();
        }
        if (typeof processRecurringTasks === 'function') {
            processRecurringTasks();
        }
        
        // Fade in
        document.body.style.opacity = '1';
    }, 100);
});

/**
 * Load items from storage
 */
function loadItems() {
    items = loadFromStorage();
    // Ensure all items have required fields and new fields
    items = items.map(item => ({
        id: item.id || generateId(),
        title: item.title || 'Untitled',
        description: item.description || '',
        type: item.type || 'task',
        dueDate: item.dueDate || null,
        priority: item.priority || null,
        category: item.category || '',
        status: item.status || 'pending',
        createdAt: item.createdAt || new Date().toISOString(),
        completedAt: item.completedAt || null,
        // New fields with defaults
        subtasks: item.subtasks || [],
        project: item.project || 'default',
        recurrence: item.recurrence || null,
        timeEntries: item.timeEntries || [],
        reminders: item.reminders || [],
        archived: item.archived || false,
        archivedAt: item.archivedAt || null
    }));
}

/**
 * Save items to storage
 */
function saveItems() {
    saveToStorage(items);
}

/**
 * Generate unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Add button
    document.getElementById('addBtn').addEventListener('click', () => {
        openModal();
    });

    // Modal close
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('itemModal').addEventListener('click', (e) => {
        if (e.target.id === 'itemModal') {
            closeModal();
        }
    });

    // Form submission
    document.getElementById('itemForm').addEventListener('submit', handleFormSubmit);
    
    // Add subtask button
    document.getElementById('addSubtaskBtn')?.addEventListener('click', () => {
        addSubtaskInput();
    });
    
    // Recurrence selector
    document.getElementById('itemRecurrence')?.addEventListener('change', (e) => {
        const options = document.getElementById('recurrenceOptions');
        if (e.target.value === 'custom') {
            options.style.display = 'block';
        } else {
            options.style.display = 'none';
        }
    });
    
    // Natural language date input
    const naturalDateInput = document.getElementById('itemDueDateNatural');
    if (naturalDateInput) {
        naturalDateInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            const suggestions = document.getElementById('dateSuggestions');
            if (value) {
                const parsed = parseNaturalDate(value);
                if (parsed) {
                    suggestions.innerHTML = `<div class="suggestion-item">✓ ${formatNaturalDate(parsed.toISOString())}</div>`;
                } else {
                    const common = ['today', 'tomorrow', 'next week', 'next month', 'in 2 days', 'in 3 days'];
                    const matches = common.filter(c => c.includes(value.toLowerCase()));
                    if (matches.length > 0) {
                        suggestions.innerHTML = matches.map(m => 
                            `<div class="suggestion-item" onclick="document.getElementById('itemDueDateNatural').value='${m}'; document.getElementById('dateSuggestions').innerHTML='';">${m}</div>`
                        ).join('');
                    } else {
                        suggestions.innerHTML = '';
                    }
                }
            } else {
                suggestions.innerHTML = '';
            }
        });
    }
    
    // Smart suggestions for title input
    const titleInput = document.getElementById('itemTitle');
    if (titleInput) {
        titleInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            if (value && value.length > 3) {
                suggestCategoryAndPriority(value);
            }
        });
    }

    // View switcher
    let currentView = localStorage.getItem('taskflow-view') || 'list';
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentView = btn.dataset.view;
            localStorage.setItem('taskflow-view', currentView);
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
        if (currentView === 'calendar') {
            if (typeof switchToCalendarView === 'function') {
                switchToCalendarView();
            }
        } else {
            if (typeof switchToListView === 'function') {
                switchToListView();
            }
        }
        });
    });
    
    // Set initial view
    if (currentView === 'calendar') {
        document.querySelector('.view-btn[data-view="calendar"]')?.classList.add('active');
        document.querySelector('.view-btn[data-view="list"]')?.classList.remove('active');
        if (typeof switchToCalendarView === 'function') {
            switchToCalendarView();
        }
    }
    
    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.period;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (currentView === 'list') {
                renderItems();
            } else {
                if (typeof renderCalendar === 'function') {
                    renderCalendar();
                }
            }
            updateStats();
        });
    });

    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        renderItems();
    });

    // Project filter
    document.getElementById('projectSelector')?.addEventListener('change', (e) => {
        const projectId = e.target.value;
        localStorage.setItem('taskflow-current-project', projectId);
        renderItems();
    });
    
    // Category filter
    document.getElementById('categoryFilter').addEventListener('change', (e) => {
        currentCategory = e.target.value;
        renderItems();
    });

    // Sort
    document.getElementById('sortSelect').addEventListener('change', (e) => {
        currentSort = e.target.value;
        renderItems();
    });

    // Theme toggle in menu
    document.getElementById('quickMenu')?.querySelector('#themeToggle')?.addEventListener('click', () => {
        if (typeof showThemePicker === 'function') {
            showThemePicker();
        }
        document.getElementById('quickMenu').style.display = 'none';
    });

    // Quick menu
    const menuBtn = document.getElementById('menuBtn');
    const quickMenu = document.getElementById('quickMenu');
    if (menuBtn && quickMenu) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            quickMenu.style.display = quickMenu.style.display === 'none' ? 'block' : 'none';
        });
        document.addEventListener('click', (e) => {
            if (!quickMenu.contains(e.target) && e.target !== menuBtn) {
                quickMenu.style.display = 'none';
            }
        });
    }

    // Quick actions
    document.getElementById('exportBtn')?.addEventListener('click', handleExport);
    document.getElementById('importBtn')?.addEventListener('click', () => document.getElementById('importFileInput')?.click());
    document.getElementById('importFileInput')?.addEventListener('change', handleImport);
    document.getElementById('markAllCompleteBtn')?.addEventListener('click', markAllComplete);
    document.getElementById('clearCompletedBtn')?.addEventListener('click', clearCompleted);
    document.getElementById('projectsBtn')?.addEventListener('click', () => {
        if (typeof showProjectManager === 'function') showProjectManager();
    });
    document.getElementById('templatesBtn')?.addEventListener('click', () => {
        if (typeof showTemplates === 'function') showTemplates();
    });
    document.getElementById('soundSettingsBtn')?.addEventListener('click', () => {
        if (typeof showSoundSettings === 'function') showSoundSettings();
    });
    document.getElementById('focusModeBtn')?.addEventListener('click', () => {
        if (typeof toggleFocusMode === 'function') toggleFocusMode();
    });
    document.getElementById('statsViewBtn')?.addEventListener('click', showStatsView);

    // Shortcuts modal
    document.getElementById('shortcutsBtn')?.addEventListener('click', () => {
        document.getElementById('shortcutsModal')?.classList.add('show');
    });
    document.getElementById('closeShortcutsModal')?.addEventListener('click', () => {
        document.getElementById('shortcutsModal')?.classList.remove('show');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.getElementById('shortcutsModal')?.classList.remove('show');
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openModal();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            handleExport();
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
            e.preventDefault();
            document.getElementById('importFileInput')?.click();
        }
        if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            document.getElementById('shortcutsModal')?.classList.add('show');
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            if (typeof undo === 'function') undo();
        }
        if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
            e.preventDefault();
            if (typeof redo === 'function') redo();
        }
    });
    
    // Undo/Redo buttons
    document.getElementById('undoBtn')?.addEventListener('click', () => {
        if (typeof undo === 'function') undo();
    });
    document.getElementById('redoBtn')?.addEventListener('click', () => {
        if (typeof redo === 'function') redo();
    });
}

/**
 * Open modal for adding/editing
 */
function openModal(item = null) {
    const modal = document.getElementById('itemModal');
    const form = document.getElementById('itemForm');
    const modalTitle = document.getElementById('modalTitle');
    
    form.reset();
    document.getElementById('itemId').value = '';
    document.getElementById('itemDueDateNatural').value = '';
    document.getElementById('dateSuggestions').innerHTML = '';
    document.getElementById('subtasksContainer').innerHTML = '';
    
    // Update project selector in form
    if (typeof updateProjectSelector === 'function') {
        setTimeout(() => {
            const projectSelect = document.getElementById('itemProject');
            if (projectSelect) {
                projectSelect.innerHTML = '<option value="default">Default</option>' +
                    (typeof projects !== 'undefined' ? projects.filter(p => p.id !== 'default').map(p => 
                        `<option value="${p.id}">${escapeHtml(p.name)}</option>`
                    ).join('') : '');
            }
        }, 100);
    }
    
    if (item) {
        modalTitle.textContent = 'Edit Item';
        document.getElementById('itemId').value = item.id;
        document.getElementById('itemType').value = item.type;
        document.getElementById('itemTitle').value = item.title;
        document.getElementById('itemDescription').value = item.description || '';
        if (item.dueDate) {
            document.getElementById('itemDueDateNatural').value = formatNaturalDate(item.dueDate);
            document.getElementById('itemDueDate').value = formatDateTimeLocal(item.dueDate);
        } else {
            document.getElementById('itemDueDateNatural').value = '';
            document.getElementById('itemDueDate').value = '';
        }
        document.getElementById('itemPriority').value = item.priority || '';
        document.getElementById('itemCategory').value = item.category || '';
        document.getElementById('itemStatus').value = item.status || 'pending';
        
        // Load project
        if (document.getElementById('itemProject')) {
            document.getElementById('itemProject').value = item.project || 'default';
        }
        
        // Load recurrence
        if (item.recurrence) {
            document.getElementById('itemRecurrence').value = item.recurrence.type || '';
            if (item.recurrence.type === 'custom') {
                document.getElementById('recurrenceOptions').style.display = 'block';
                document.getElementById('recurrenceInterval').value = item.recurrence.interval || 1;
            }
        }
        
        // Load subtasks
        renderSubtasksInForm(item.subtasks || []);
    } else {
        modalTitle.textContent = 'Add New Item';
    }
    
    modal.classList.add('show');
    document.getElementById('itemTitle').focus();
}

/**
 * Close modal
 */
function closeModal() {
    document.getElementById('itemModal').classList.remove('show');
}

/**
 * Format date for datetime-local input
 */
function formatDateTimeLocal(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Handle form submission
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('itemId').value;
    const title = document.getElementById('itemTitle').value.trim();
    const description = document.getElementById('itemDescription').value.trim();
    const type = document.getElementById('itemType').value;
    const naturalDate = document.getElementById('itemDueDateNatural').value.trim();
    const dueDateInput = document.getElementById('itemDueDate').value;
    const priority = document.getElementById('itemPriority').value || null;
    const category = document.getElementById('itemCategory').value.trim();
    const status = document.getElementById('itemStatus').value;
    const project = document.getElementById('itemProject')?.value || 'default';
    const recurrenceType = document.getElementById('itemRecurrence')?.value || null;
    const recurrenceInterval = document.getElementById('recurrenceInterval')?.value || 1;
    
    // Get subtasks
    const subtasks = getSubtasksFromForm();
    
    // Build recurrence object
    let recurrence = null;
    if (recurrenceType) {
        recurrence = {
            type: recurrenceType,
            interval: recurrenceType === 'custom' ? parseInt(recurrenceInterval) : 1,
            endDate: null,
            lastCreated: null
        };
    }
    
    if (!title) {
        showToast('Please enter a title', 'warning');
        return;
    }
    
    // Duplicate detection
    const similarItems = items.filter(item => {
        if (id && item.id === id) return false; // Don't check against self when editing
        const similarity = calculateSimilarity(title.toLowerCase(), item.title.toLowerCase());
        return similarity > 0.7; // 70% similarity threshold
    });
    
    if (similarItems.length > 0 && !id) {
        const similarTitles = similarItems.map(item => item.title).join(', ');
        if (!confirm(`Similar tasks found:\n${similarTitles}\n\nAdd anyway?`)) {
            return;
        }
    }
    
    // Parse natural language date or use datetime-local input
    let dueDate = null;
    if (naturalDate) {
        const parsed = parseNaturalDate(naturalDate);
        if (parsed) {
            dueDate = parsed.toISOString();
        } else {
            showToast('Could not understand that date. Try "tomorrow", "next week", etc.', 'warning');
            return;
        }
    } else if (dueDateInput) {
        dueDate = new Date(dueDateInput).toISOString();
    }
    
    const itemData = {
        title,
        description,
        type,
        dueDate,
        priority,
        category,
        status,
        completedAt: status === 'completed' ? new Date().toISOString() : null,
        subtasks: subtasks,
        project: project,
        recurrence: recurrence,
        timeEntries: [],
        reminders: [],
        archived: false,
        archivedAt: null
    };
    
    if (id) {
        // Update existing item
        const item = items.find(i => i.id === id);
        if (item) {
            Object.assign(item, itemData);
            if (status === 'completed' && !item.completedAt) {
                item.completedAt = new Date().toISOString();
            } else if (status !== 'completed') {
                item.completedAt = null;
            }
        }
    } else {
        // Add new item
        const newItem = {
            id: generateId(),
            ...itemData,
            createdAt: new Date().toISOString()
        };
        items.push(newItem);
    }
    
    // Save to history before making changes
    if (typeof saveToHistory === 'function') {
        saveToHistory('items', items);
    }
    
    saveItems();
    closeModal();
    renderItems();
    updateStats();
    updateCategoryFilter();
    
    const action = id ? 'updated' : 'created';
    if (typeof playSound === 'function' && !id) {
        playSound('add');
    }
    showToast(`Item ${action} successfully!`, 'success');
}

/**
 * Delete item
 */
function deleteItem(id) {
    const item = items.find(i => i.id === id);
    const card = document.querySelector(`[data-id="${id}"]`);
    
    // Save to history before deletion
    if (typeof saveToHistory === 'function') {
        saveToHistory('items', items);
    }
    
    if (card) {
        // Animate deletion
        card.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.8) translateY(-20px)';
        
        setTimeout(() => {
            items = items.filter(item => item.id !== id);
            saveItems();
            renderItems();
            updateStats();
            updateCategoryFilter();
            showToast('Item deleted', 'info');
        }, 300);
    } else {
        items = items.filter(item => item.id !== id);
        saveItems();
        renderItems();
        updateStats();
        updateCategoryFilter();
        showToast('Item deleted', 'info');
    }
}

/**
 * Toggle item completion
 */
function toggleComplete(id) {
    const item = items.find(i => i.id === id);
    const card = document.querySelector(`[data-id="${id}"]`);
    
    if (item) {
        const wasCompleted = item.status === 'completed';
        
        if (wasCompleted) {
            item.status = 'pending';
            item.completedAt = null;
        } else {
            item.status = 'completed';
            item.completedAt = new Date().toISOString();
        }
        
        // Add animation effect
        if (card) {
            card.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            card.style.transform = 'scale(1.05)';
            setTimeout(() => {
                card.style.transform = '';
            }, 200);
        }
        
        // Confetti on completion
        if (!wasCompleted && item.status === 'completed') {
            triggerConfetti();
            if (typeof playSound === 'function') {
                playSound('complete');
            }
            showToast('Task completed! 🎉', 'success', 2000);
        }
        
        if (typeof playSound === 'function') {
            playSound('success');
        }
        
        // Save to history
        if (typeof saveToHistory === 'function') {
            saveToHistory('items', items);
        }
        
        saveItems();
        renderItems();
        updateStats();
    }
}

/**
 * Get items filtered by period
 */
function getItemsByPeriod(period) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return items.filter(item => {
        if (!item.dueDate) {
            return period === 'later' || period === 'all';
        }
        
        const dueDate = new Date(item.dueDate);
        const itemDate = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
        
        switch (period) {
            case 'today':
                return itemDate.getTime() === today.getTime();
            case 'week':
                return dueDate >= weekStart && dueDate < new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
            case 'month':
                return dueDate >= monthStart && dueDate < new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
            case 'later':
                return dueDate > new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
            case 'archive':
                return item.archived === true;
            case 'all':
            default:
                return !item.archived; // Don't show archived in "all" unless specifically viewing archive
        }
    });
}

/**
 * Filter and sort items
 */
function getFilteredItems() {
    let filtered = getItemsByPeriod(currentFilter);
    
    // Filter out archived items unless viewing archive
    if (currentFilter !== 'archive') {
        filtered = filtered.filter(item => !item.archived);
    }
    
    // Project filter
    const projectSelector = document.getElementById('projectSelector');
    if (projectSelector && projectSelector.value !== 'all') {
        filtered = filtered.filter(item => (item.project || 'default') === projectSelector.value);
    }
    
    // Search filter
    if (currentSearch) {
        filtered = filtered.filter(item => 
            item.title.toLowerCase().includes(currentSearch) ||
            item.description.toLowerCase().includes(currentSearch) ||
            item.category.toLowerCase().includes(currentSearch)
        );
    }
    
    // Category filter
    if (currentCategory) {
        filtered = filtered.filter(item => item.category === currentCategory);
    }
    
    // Sort
    filtered.sort((a, b) => {
        switch (currentSort) {
            case 'priority':
                const priorityOrder = { high: 3, medium: 2, low: 1, null: 0 };
                return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
            case 'category':
                return (a.category || '').localeCompare(b.category || '');
            case 'title':
                return a.title.localeCompare(b.title);
            case 'date':
            default:
                const dateA = a.dueDate ? new Date(a.dueDate) : new Date(0);
                const dateB = b.dueDate ? new Date(b.dueDate) : new Date(0);
                return dateA - dateB;
        }
    });
    
    return filtered;
}

/**
 * Render items to the DOM
 */
function renderItems() {
    const itemsList = document.getElementById('itemsList');
    const emptyState = document.getElementById('emptyState');
    const filtered = getFilteredItems();
    
    if (filtered.length === 0) {
        // Fade out items before clearing
        const cards = itemsList.querySelectorAll('.item-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'translateX(-30px)';
            }, index * 50);
        });
        setTimeout(() => {
            itemsList.innerHTML = '';
            emptyState.style.display = 'block';
        }, cards.length * 50 + 200);
        return;
    }
    
    emptyState.style.display = 'none';
    
    // Clear with fade out
    const existingCards = itemsList.querySelectorAll('.item-card');
    existingCards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '0';
            card.style.transform = 'translateX(-30px) scale(0.9)';
        }, index * 30);
    });
    
    // Add new items with fade in
    setTimeout(() => {
        itemsList.innerHTML = filtered.map(item => createItemCard(item)).join('');
        
        // Attach event listeners and animate in
        filtered.forEach((item, index) => {
            const card = document.querySelector(`[data-id="${item.id}"]`);
            if (card) {
                card.style.opacity = '0';
                card.style.transform = 'translateX(-30px) scale(0.9)';
                setTimeout(() => {
                    card.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    card.style.opacity = '1';
                    card.style.transform = 'translateX(0) scale(1)';
                }, index * 80);
            }
            
            const checkbox = document.querySelector(`[data-id="${item.id}"] .item-checkbox`);
            const editBtn = document.querySelector(`[data-id="${item.id}"] .edit-btn`);
            const deleteBtn = document.querySelector(`[data-id="${item.id}"] .delete-btn`);
            
            if (checkbox) {
                checkbox.addEventListener('change', () => toggleComplete(item.id));
            }
            if (editBtn) {
                editBtn.addEventListener('click', () => openModal(item));
            }
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => deleteItem(item.id));
        }
        
        // Archive button
        const archiveBtn = document.querySelector(`[data-id="${item.id}"] .archive-btn`);
        if (archiveBtn) {
            archiveBtn.addEventListener('click', () => archiveItem(item.id));
        }
        
        // Restore button
        const restoreBtn = document.querySelector(`[data-id="${item.id}"] .restore-btn`);
        if (restoreBtn) {
            restoreBtn.addEventListener('click', () => restoreItem(item.id));
        }
        
        // Subtask toggle
        const toggleSubtasks = document.querySelector(`[data-id="${item.id}"].toggle-subtasks`);
        if (toggleSubtasks) {
            toggleSubtasks.addEventListener('click', () => {
                const list = document.getElementById(`subtasks-${item.id}`);
                if (list) {
                    list.style.display = list.style.display === 'none' ? 'block' : 'none';
                    toggleSubtasks.textContent = list.style.display === 'none' ? '▼' : '▲';
                }
            });
        }
        
        // Subtask checkboxes
        document.querySelectorAll(`#subtasks-${item.id} .subtask-display-checkbox`).forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const itemId = checkbox.dataset.itemId;
                const subtaskId = checkbox.dataset.subtaskId;
                toggleSubtask(itemId, subtaskId, checkbox.checked);
            });
        });
        
        // Time tracking buttons
        const startTimerBtn = document.querySelector(`[data-id="${item.id}"].start-timer-btn`);
        if (startTimerBtn) {
            startTimerBtn.addEventListener('click', () => {
                if (typeof startTimer === 'function') {
                    startTimer(item.id);
                }
            });
        }
        
        const logTimeBtn = document.querySelector(`[data-id="${item.id}"].log-time-btn`);
        if (logTimeBtn) {
            logTimeBtn.addEventListener('click', () => {
                if (typeof showLogTimeModal === 'function') {
                    showLogTimeModal(item.id);
                }
            });
        }
        
        const reminderBtn = document.querySelector(`[data-id="${item.id}"].reminder-btn`);
        if (reminderBtn) {
            reminderBtn.addEventListener('click', () => {
                if (typeof showReminderModal === 'function') {
                    showReminderModal(item.id);
                }
            });
        }
    });
    }, existingCards.length * 30 + 100);
}

/**
 * Create item card HTML
 */
function createItemCard(item) {
    const dueDate = item.dueDate ? new Date(item.dueDate) : null;
    const now = new Date();
    const isOverdue = dueDate && dueDate < now && item.status !== 'completed';
    const isCompleted = item.status === 'completed';
    
    const priorityClass = item.priority ? `priority-${item.priority}` : '';
    const cardClass = `item-card ${isCompleted ? 'completed' : ''} ${priorityClass}`;
    
    return `
        <div class="${cardClass}" data-id="${item.id}">
            <div class="item-header">
                <div class="item-title-row">
                    <input type="checkbox" class="item-checkbox" ${isCompleted ? 'checked' : ''}>
                    <h3 class="item-title">${escapeHtml(item.title)}</h3>
                    <span class="item-type-badge ${item.type}">${item.type}</span>
                </div>
                <div class="item-actions">
                    ${!item.archived ? `
                        <button class="btn btn-secondary btn-small edit-btn">Edit</button>
                        <button class="btn btn-secondary btn-small archive-btn" title="Archive">📦</button>
                    ` : `
                        <button class="btn btn-secondary btn-small restore-btn" title="Restore">↩️</button>
                    `}
                    <button class="btn btn-danger btn-small delete-btn">Delete</button>
                </div>
            </div>
            ${item.description ? `<p class="item-description">${escapeHtml(item.description)}</p>` : ''}
            ${item.subtasks && item.subtasks.length > 0 ? `
                <div class="subtasks-display">
                    <div class="subtasks-header">
                        <span class="subtasks-progress">${item.subtasks.filter(s => s.completed).length}/${item.subtasks.length} completed</span>
                        <button class="btn-icon-small toggle-subtasks" data-id="${item.id}">▼</button>
                    </div>
                    <div class="subtasks-list" id="subtasks-${item.id}" style="display: none;">
                        ${item.subtasks.map(subtask => `
                            <div class="subtask-display-item">
                                <input type="checkbox" class="subtask-display-checkbox" ${subtask.completed ? 'checked' : ''} data-item-id="${item.id}" data-subtask-id="${subtask.id}">
                                <span class="${subtask.completed ? 'completed' : ''}">${escapeHtml(subtask.title)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            <div class="item-meta">
                ${dueDate ? `
                    <div class="meta-item">
                        <span class="meta-label">Due:</span>
                        <span class="${isOverdue ? 'item-overdue' : ''}">
                            ${formatDate(dueDate)} ${isOverdue ? '(Overdue)' : ''}
                        </span>
                    </div>
                ` : ''}
                ${item.priority ? `
                    <div class="meta-item">
                        <span class="priority-badge ${item.priority}">${item.priority}</span>
                    </div>
                ` : ''}
                <div class="meta-item">
                    <span class="status-badge ${item.status}">${item.status.replace('-', ' ')}</span>
                </div>
                ${item.category ? `
                    <div class="meta-item">
                        <span class="category-badge">${escapeHtml(item.category)}</span>
                    </div>
                ` : ''}
                ${item.timeEntries && item.timeEntries.length > 0 ? `
                    <div class="meta-item">
                        <span class="meta-label">Time:</span>
                        <span>${typeof formatTotalTime === 'function' ? formatTotalTime(item.timeEntries) : '0h 0m'}</span>
                    </div>
                ` : ''}
            </div>
            <div class="time-tracking-controls">
                <button class="btn btn-secondary btn-small start-timer-btn" data-id="${item.id}">⏱️ Start Timer</button>
                <button class="btn btn-secondary btn-small log-time-btn" data-id="${item.id}">📝 Log Time</button>
                ${item.dueDate ? `<button class="btn btn-secondary btn-small reminder-btn" data-id="${item.id}">🔔 Reminder</button>` : ''}
            </div>
        </div>
    `;
}

/**
 * Format date for display
 */
function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Update statistics
 */
function updateStats() {
    const filtered = getFilteredItems();
    const total = filtered.length;
    const completed = filtered.filter(item => item.status === 'completed').length;
    const pending = total - completed;
    const overdue = filtered.filter(item => {
        if (!item.dueDate || item.status === 'completed') return false;
        return new Date(item.dueDate) < new Date();
    }).length;
    
    const statsText = document.getElementById('statsText');
    let stats = `Total: ${total}`;
    if (pending > 0) stats += ` | Pending: ${pending}`;
    if (completed > 0) stats += ` | Completed: ${completed}`;
    if (overdue > 0) stats += ` | Overdue: ${overdue}`;
    
    statsText.textContent = stats;
    
    // Update progress bar
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    if (progressFill && progressText && total > 0) {
        const percentage = Math.round((completed / total) * 100);
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${percentage}%`;
    } else if (progressFill && progressText) {
        progressFill.style.width = '0%';
        progressText.textContent = '0%';
    }
}

/**
 * Add subtask input field
 */
function addSubtaskInput(subtask = null) {
    const container = document.getElementById('subtasksContainer');
    const id = subtask?.id || generateId();
    const div = document.createElement('div');
    div.className = 'subtask-item';
    div.innerHTML = `
        <input type="checkbox" class="subtask-checkbox" ${subtask?.completed ? 'checked' : ''} data-id="${id}">
        <input type="text" class="subtask-input" placeholder="Subtask..." value="${subtask?.title || ''}" data-id="${id}">
        <button type="button" class="btn-icon-small remove-subtask" data-id="${id}">×</button>
    `;
    container.appendChild(div);
    
    // Remove button
    div.querySelector('.remove-subtask').addEventListener('click', () => {
        div.remove();
    });
}

/**
 * Get subtasks from form
 */
function getSubtasksFromForm() {
    const container = document.getElementById('subtasksContainer');
    const subtasks = [];
    container.querySelectorAll('.subtask-item').forEach(item => {
        const id = item.querySelector('.subtask-input').dataset.id;
        const title = item.querySelector('.subtask-input').value.trim();
        const completed = item.querySelector('.subtask-checkbox').checked;
        if (title) {
            subtasks.push({ id, title, completed });
        }
    });
    return subtasks;
}

/**
 * Render subtasks in form
 */
function renderSubtasksInForm(subtasks) {
    const container = document.getElementById('subtasksContainer');
    container.innerHTML = '';
    subtasks.forEach(subtask => {
        addSubtaskInput(subtask);
    });
}

/**
 * Update category filter dropdown
 */
function updateCategoryFilter() {
    const categories = [...new Set(items.map(item => item.category).filter(cat => cat))].sort();
    const categoryFilter = document.getElementById('categoryFilter');
    const categoryList = document.getElementById('categoryList');
    
    // Update filter dropdown
    const currentValue = categoryFilter.value;
    categoryFilter.innerHTML = '<option value="">All Categories</option>' +
        categories.map(cat => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`).join('');
    if (categories.includes(currentValue)) {
        categoryFilter.value = currentValue;
    }
    
    // Update datalist for autocomplete
    categoryList.innerHTML = categories.map(cat => 
        `<option value="${escapeHtml(cat)}">`
    ).join('');
}

/**
 * Toggle dark mode
 */
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
    showToast(`Switched to ${isDark ? 'dark' : 'light'} mode`, 'info', 2000);
}

function updateThemeIcon() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const isDark = document.body.classList.contains('dark-mode');
        themeToggle.textContent = isDark ? '☀️' : '🌙';
    }
}

// Load theme preference
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
}

/**
 * Export data
 */
function handleExport() {
    try {
        const data = exportData();
        const filename = `taskflow-export-${new Date().toISOString().split('T')[0]}.json`;
        downloadFile(data, filename);
        showToast('Data exported successfully!', 'success');
    } catch (error) {
        showToast('Export failed', 'error');
        console.error('Export error:', error);
    }
}

/**
 * Import data
 */
async function handleImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        const text = await readFileAsText(file);
        if (importData(text)) {
            loadItems();
            renderItems();
            updateStats();
            updateCategoryFilter();
            showToast('Data imported successfully!', 'success');
        } else {
            showToast('Invalid file format', 'error');
        }
    } catch (error) {
        showToast('Import failed', 'error');
        console.error('Import error:', error);
    }
    
    // Reset input
    event.target.value = '';
}

/**
 * Mark all items as complete
 */
function markAllComplete() {
    const filtered = getFilteredItems();
    const incomplete = filtered.filter(item => item.status !== 'completed');
    
    if (incomplete.length === 0) {
        showToast('All items are already completed!', 'info');
        return;
    }
    
    incomplete.forEach(item => {
        item.status = 'completed';
        item.completedAt = new Date().toISOString();
    });
    
    saveItems();
    renderItems();
    updateStats();
    triggerConfetti();
    showToast(`${incomplete.length} item(s) marked as complete! 🎉`, 'success');
}

/**
 * Clear completed items
 */
function clearCompleted() {
    const completed = items.filter(item => item.status === 'completed');
    
    if (completed.length === 0) {
        showToast('No completed items to clear', 'info');
        return;
    }
    
    items = items.filter(item => item.status !== 'completed');
    saveItems();
    renderItems();
    updateStats();
    updateCategoryFilter();
    showToast(`${completed.length} completed item(s) cleared`, 'info');
}

/**
 * Show statistics view
 */
function showStatsView() {
    if (typeof showStatisticsDashboard === 'function') {
        showStatisticsDashboard();
    } else {
        const total = items.length;
        const completed = items.filter(item => item.status === 'completed').length;
        const pending = total - completed;
        const byCategory = {};
        items.forEach(item => {
            const cat = item.category || 'Uncategorized';
            byCategory[cat] = (byCategory[cat] || 0) + 1;
        });
        
        const stats = `
Total Items: ${total}
Completed: ${completed} (${total > 0 ? Math.round(completed/total*100) : 0}%)
Pending: ${pending}
Categories: ${Object.keys(byCategory).length}
        `.trim();
        
        showToast('Statistics: ' + stats.replace(/\n/g, ' | '), 'info', 5000);
    }
}
