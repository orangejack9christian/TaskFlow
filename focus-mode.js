// Focus mode

let focusModeActive = false;

/**
 * Toggle focus mode
 */
function toggleFocusMode() {
    focusModeActive = !focusModeActive;
    document.body.classList.toggle('focus-mode', focusModeActive);
    
    if (focusModeActive) {
        // Hide all except high priority tasks
        const allCards = document.querySelectorAll('.item-card');
        allCards.forEach(card => {
            const itemId = card.dataset.id;
            const item = items.find(i => i.id === itemId);
            if (item && item.priority !== 'high' && item.status !== 'in-progress') {
                card.style.display = 'none';
            }
        });
        
        // Hide controls
        document.querySelector('.controls')?.style.setProperty('display', 'none');
        document.querySelector('.tabs')?.style.setProperty('display', 'none');
        document.querySelector('.stats-bar')?.style.setProperty('display', 'none');
        
        showToast('Focus mode activated - Only high priority tasks shown', 'success');
    } else {
        // Show all tasks
        document.querySelectorAll('.item-card').forEach(card => {
            card.style.display = '';
        });
        
        // Show controls
        document.querySelector('.controls')?.style.removeProperty('display');
        document.querySelector('.tabs')?.style.removeProperty('display');
        document.querySelector('.stats-bar')?.style.removeProperty('display');
        
        showToast('Focus mode deactivated', 'info');
    }
}
