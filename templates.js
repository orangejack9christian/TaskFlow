// Templates system

let templates = JSON.parse(localStorage.getItem('taskflow-templates') || '[]');

/**
 * Save templates
 */
function saveTemplates() {
    localStorage.setItem('taskflow-templates', JSON.stringify(templates));
}

/**
 * Create template from task
 */
function createTemplateFromTask(task) {
    const template = {
        id: generateId(),
        name: task.title + ' Template',
        taskData: {
            title: task.title,
            description: task.description,
            type: task.type,
            priority: task.priority,
            category: task.category,
            subtasks: task.subtasks || []
        },
        createdAt: new Date().toISOString()
    };
    templates.push(template);
    saveTemplates();
    return template;
}

/**
 * Show templates modal
 */
function showTemplates() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>📋 Templates</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div style="padding: 20px;">
                <div id="templatesList" class="templates-list">
                    ${templates.length === 0 ? '<p style="text-align: center; color: var(--text-secondary);">No templates yet. Create one from a task!</p>' : ''}
                    ${templates.map(template => `
                        <div class="template-item">
                            <div class="template-info">
                                <h3>${escapeHtml(template.name)}</h3>
                                <p class="template-preview">${escapeHtml(template.taskData.title)}</p>
                            </div>
                            <div class="template-actions">
                                <button class="btn btn-primary btn-small use-template" data-id="${template.id}">Use</button>
                                <button class="btn-icon-small delete-template" data-id="${template.id}">🗑️</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid var(--border-color);">
                    <button class="btn btn-secondary" id="saveCurrentAsTemplate">Save Current Task as Template</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Use template
    modal.querySelectorAll('.use-template').forEach(btn => {
        btn.addEventListener('click', () => {
            const template = templates.find(t => t.id === btn.dataset.id);
            if (template) {
                useTemplate(template);
                modal.remove();
            }
        });
    });
    
    // Delete template
    modal.querySelectorAll('.delete-template').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Delete this template?')) {
                templates = templates.filter(t => t.id !== btn.dataset.id);
                saveTemplates();
                modal.remove();
                showTemplates();
            }
        });
    });
    
    // Save current as template
    document.getElementById('saveCurrentAsTemplate')?.addEventListener('click', () => {
        const form = document.getElementById('itemForm');
        const title = document.getElementById('itemTitle').value;
        if (!title) {
            showToast('Please fill in the task form first', 'warning');
            return;
        }
        
        const taskData = {
            title,
            description: document.getElementById('itemDescription').value,
            type: document.getElementById('itemType').value,
            priority: document.getElementById('itemPriority').value,
            category: document.getElementById('itemCategory').value,
            subtasks: getSubtasksFromForm()
        };
        
        const name = prompt('Template name:', title + ' Template');
        if (name) {
            const template = {
                id: generateId(),
                name,
                taskData,
                createdAt: new Date().toISOString()
            };
            templates.push(template);
            saveTemplates();
            showToast('Template saved!', 'success');
            modal.remove();
        }
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

/**
 * Use template to create task
 */
function useTemplate(template) {
    openModal();
    const data = template.taskData;
    document.getElementById('itemTitle').value = data.title || '';
    document.getElementById('itemDescription').value = data.description || '';
    document.getElementById('itemType').value = data.type || 'task';
    document.getElementById('itemPriority').value = data.priority || '';
    document.getElementById('itemCategory').value = data.category || '';
    if (data.subtasks && data.subtasks.length > 0) {
        renderSubtasksInForm(data.subtasks);
    }
}
