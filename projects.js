// Projects/Workspaces system

let projects = JSON.parse(localStorage.getItem('taskflow-projects') || '[]');

/**
 * Save projects
 */
function saveProjects() {
    localStorage.setItem('taskflow-projects', JSON.stringify(projects));
}

/**
 * Get or create default project
 */
function getDefaultProject() {
    if (projects.length === 0) {
        const defaultProject = {
            id: 'default',
            name: 'Default',
            color: '#6366f1',
            createdAt: new Date().toISOString()
        };
        projects.push(defaultProject);
        saveProjects();
    }
    return projects[0];
}

/**
 * Create new project
 */
function createProject(name, color = '#6366f1') {
    const project = {
        id: generateId(),
        name,
        color,
        createdAt: new Date().toISOString()
    };
    projects.push(project);
    saveProjects();
    return project;
}

/**
 * Get project by ID
 */
function getProject(id) {
    return projects.find(p => p.id === id);
}

/**
 * Delete project
 */
function deleteProject(id) {
    if (id === 'default') {
        showToast('Cannot delete default project', 'warning');
        return;
    }
    projects = projects.filter(p => p.id !== id);
    // Move items to default project
    items.forEach(item => {
        if (item.project === id) {
            item.project = 'default';
        }
    });
    saveItems();
    saveProjects();
    renderItems();
    updateProjectSelector();
    showToast('Project deleted', 'info');
}

/**
 * Update project selector in header
 */
function updateProjectSelector() {
    const selector = document.getElementById('projectSelector');
    if (!selector) return;
    
    const currentProject = localStorage.getItem('taskflow-current-project') || 'default';
    
    selector.innerHTML = projects.map(project => 
        `<option value="${project.id}" ${project.id === currentProject ? 'selected' : ''}>${escapeHtml(project.name)}</option>`
    ).join('');
}

/**
 * Show project manager
 */
function showProjectManager() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>📁 Projects</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="projects-list" style="padding: 20px;">
                <button class="btn btn-primary" id="createProjectBtn" style="margin-bottom: 20px;">+ New Project</button>
                <div id="projectsList">
                    ${projects.map(project => `
                        <div class="project-item">
                            <div class="project-info">
                                <div class="project-color" style="background: ${project.color};"></div>
                                <span class="project-name">${escapeHtml(project.name)}</span>
                            </div>
                            <div class="project-actions">
                                <button class="btn-icon-small edit-project" data-id="${project.id}">✏️</button>
                                ${project.id !== 'default' ? `<button class="btn-icon-small delete-project" data-id="${project.id}">🗑️</button>` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Create project
    document.getElementById('createProjectBtn')?.addEventListener('click', () => {
        const name = prompt('Project name:');
        if (name) {
            const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            createProject(name, color);
            modal.remove();
            showProjectManager();
            updateProjectSelector();
        }
    });
    
    // Delete project
    modal.querySelectorAll('.delete-project').forEach(btn => {
        btn.addEventListener('click', () => {
            if (confirm('Delete this project? Tasks will be moved to default project.')) {
                deleteProject(btn.dataset.id);
                modal.remove();
                showProjectManager();
            }
        });
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// Initialize
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        getDefaultProject();
    });
}
