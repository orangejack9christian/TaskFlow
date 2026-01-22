// Theme system

const themes = {
    blue: {
        name: 'Blue',
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#ec4899'
    },
    purple: {
        name: 'Purple',
        primary: '#8b5cf6',
        secondary: '#a855f7',
        accent: '#c084fc'
    },
    green: {
        name: 'Green',
        primary: '#10b981',
        secondary: '#059669',
        accent: '#34d399'
    },
    orange: {
        name: 'Orange',
        primary: '#f59e0b',
        secondary: '#d97706',
        accent: '#fbbf24'
    },
    red: {
        name: 'Red',
        primary: '#ef4444',
        secondary: '#dc2626',
        accent: '#f87171'
    }
};

let currentTheme = localStorage.getItem('taskflow-theme') || 'blue';

/**
 * Apply theme
 */
function applyTheme(themeName) {
    if (!themes[themeName]) return;
    
    currentTheme = themeName;
    localStorage.setItem('taskflow-theme', themeName);
    const theme = themes[themeName];
    
    document.documentElement.style.setProperty('--primary-color', theme.primary);
    document.documentElement.style.setProperty('--primary-dark', darkenColor(theme.primary, 20));
    document.documentElement.style.setProperty('--primary-light', lightenColor(theme.primary, 20));
    document.documentElement.style.setProperty('--secondary-color', theme.secondary);
    document.documentElement.style.setProperty('--accent-color', theme.accent);
}

/**
 * Darken color
 */
function darkenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, Math.min(255, (num >> 16) + amt));
    const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
    const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

/**
 * Lighten color
 */
function lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return "#" + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}

/**
 * Initialize theme
 */
function initTheme() {
    applyTheme(currentTheme);
}

/**
 * Show theme picker
 */
function showThemePicker() {
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content modal-small">
            <div class="modal-header">
                <h2>🎨 Choose Theme</h2>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="theme-grid">
                ${Object.entries(themes).map(([key, theme]) => `
                    <div class="theme-option ${key === currentTheme ? 'active' : ''}" data-theme="${key}">
                        <div class="theme-preview" style="background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%);"></div>
                        <div class="theme-name">${theme.name}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', () => {
            const themeKey = option.dataset.theme;
            applyTheme(themeKey);
            showToast(`Switched to ${themes[themeKey].name} theme`, 'success');
            modal.remove();
        });
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// Initialize on load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initTheme);
}
