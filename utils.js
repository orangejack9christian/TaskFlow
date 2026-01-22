// Utility functions for toast notifications, confetti, and other features

/**
 * Show toast notification
 */
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-message">${message}</span>
        <button class="toast-close">&times;</button>
    `;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Auto remove
    const autoRemove = setTimeout(() => {
        removeToast(toast);
    }, duration);
    
    // Manual close
    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(autoRemove);
        removeToast(toast);
    });
}

function removeToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
}

/**
 * Confetti animation on task completion
 */
function triggerConfetti() {
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];
    const confettiCount = 50;
    
    for (let i = 0; i < confettiCount; i++) {
        createConfetti(colors[Math.floor(Math.random() * colors.length)]);
    }
}

function createConfetti(color) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        background: ${color};
        left: ${Math.random() * 100}vw;
        top: -10px;
        border-radius: 50%;
        z-index: 9999;
        pointer-events: none;
    `;
    
    document.body.appendChild(confetti);
    
    const animationDuration = Math.random() * 2 + 2;
    const horizontalMovement = (Math.random() - 0.5) * 200;
    
    confetti.animate([
        {
            transform: `translate(0, 0) rotate(0deg)`,
            opacity: 1
        },
        {
            transform: `translate(${horizontalMovement}px, ${window.innerHeight + 100}px) rotate(720deg)`,
            opacity: 0
        }
    ], {
        duration: animationDuration * 1000,
        easing: 'cubic-bezier(0.5, 0, 0.5, 1)'
    }).onfinish = () => confetti.remove();
}

/**
 * Natural language date parsing
 */
function parseNaturalDate(input) {
    if (!input) return null;
    
    const lower = input.toLowerCase().trim();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Patterns
    const patterns = {
        'today': () => today,
        'tomorrow': () => new Date(today.getTime() + 24 * 60 * 60 * 1000),
        'next week': () => new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        'next month': () => new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()),
        'in 2 days': () => new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        'in 3 days': () => new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
        'in a week': () => new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        'in 2 weeks': () => new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
    };
    
    for (const [pattern, fn] of Object.entries(patterns)) {
        if (lower.includes(pattern)) {
            return fn();
        }
    }
    
    // Try to parse as regular date
    const parsed = new Date(input);
    if (!isNaN(parsed.getTime())) {
        return parsed;
    }
    
    return null;
}

/**
 * Format date for natural language display
 */
function formatNaturalDate(date) {
    if (!date) return '';
    
    const d = new Date(date);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    
    if (dateOnly.getTime() === today.getTime()) {
        return `Today at ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (dateOnly.getTime() === tomorrow.getTime()) {
        return `Tomorrow at ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (dateOnly.getTime() === yesterday.getTime()) {
        return `Yesterday at ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    return d.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Download file
 */
function downloadFile(content, filename, contentType = 'application/json') {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Read file as text
 */
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}
