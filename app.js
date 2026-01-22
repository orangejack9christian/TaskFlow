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
        setupEventListeners();
        renderItems();
        updateStats();
        updateCategoryFilter();
        
        // Fade in
        document.body.style.opacity = '1';
    }, 100);
});

/**
 * Load items from storage
 */
function loadItems() {
    items = loadFromStorage();
    // Ensure all items have required fields
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
        completedAt: item.completedAt || null
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

    // Tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.period;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderItems();
            updateStats();
        });
    });

    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
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

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        updateThemeIcon();
    }

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
    
    if (item) {
        modalTitle.textContent = 'Edit Item';
        document.getElementById('itemId').value = item.id;
        document.getElementById('itemType').value = item.type;
        document.getElementById('itemTitle').value = item.title;
        document.getElementById('itemDescription').value = item.description || '';
        document.getElementById('itemDueDate').value = item.dueDate ? formatDateTimeLocal(item.dueDate) : '';
        document.getElementById('itemPriority').value = item.priority || '';
        document.getElementById('itemCategory').value = item.category || '';
        document.getElementById('itemStatus').value = item.status || 'pending';
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
    const dueDate = document.getElementById('itemDueDate').value;
    const priority = document.getElementById('itemPriority').value || null;
    const category = document.getElementById('itemCategory').value.trim();
    const status = document.getElementById('itemStatus').value;
    
    if (!title) {
        showToast('Please enter a title', 'warning');
        return;
    }
    
    const itemData = {
        title,
        description,
        type,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        priority,
        category,
        status,
        completedAt: status === 'completed' ? new Date().toISOString() : null
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
    
    saveItems();
    closeModal();
    renderItems();
    updateStats();
    updateCategoryFilter();
    
    const action = id ? 'updated' : 'created';
    showToast(`Item ${action} successfully!`, 'success');
}

/**
 * Delete item
 */
function deleteItem(id) {
    const item = items.find(i => i.id === id);
    const card = document.querySelector(`[data-id="${id}"]`);
    
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
            showToast('Task completed! 🎉', 'success', 2000);
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
            case 'all':
            default:
                return true;
        }
    });
}

/**
 * Filter and sort items
 */
function getFilteredItems() {
    let filtered = getItemsByPeriod(currentFilter);
    
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
                    <button class="btn btn-secondary btn-small edit-btn">Edit</button>
                    <button class="btn btn-danger btn-small delete-btn">Delete</button>
                </div>
            </div>
            ${item.description ? `<p class="item-description">${escapeHtml(item.description)}</p>` : ''}
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
 * Show statistics view (placeholder for future enhancement)
 */
function showStatsView() {
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
