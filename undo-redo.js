// Undo/Redo system

let historyStack = [];
let historyIndex = -1;
const MAX_HISTORY = 50;

/**
 * Save state to history
 */
function saveToHistory(action, data) {
    // Remove any future history if we're not at the end
    if (historyIndex < historyStack.length - 1) {
        historyStack = historyStack.slice(0, historyIndex + 1);
    }
    
    // Add new state
    historyStack.push({
        action,
        data: JSON.parse(JSON.stringify(data)), // Deep clone
        timestamp: Date.now()
    });
    
    // Limit history size
    if (historyStack.length > MAX_HISTORY) {
        historyStack.shift();
    } else {
        historyIndex++;
    }
    
    updateUndoRedoButtons();
}

/**
 * Undo last action
 */
function undo() {
    if (historyIndex < 0) {
        showToast('Nothing to undo', 'info');
        return;
    }
    
    const state = historyStack[historyIndex];
    historyIndex--;
    
    // Restore state
    if (state.action === 'items') {
        items = JSON.parse(JSON.stringify(state.data));
        saveItems();
        renderItems();
        updateStats();
        updateCategoryFilter();
        showToast('Undone', 'success');
    }
    
    updateUndoRedoButtons();
}

/**
 * Redo last undone action
 */
function redo() {
    if (historyIndex >= historyStack.length - 1) {
        showToast('Nothing to redo', 'info');
        return;
    }
    
    historyIndex++;
    const state = historyStack[historyIndex];
    
    // Restore state
    if (state.action === 'items') {
        items = JSON.parse(JSON.stringify(state.data));
        saveItems();
        renderItems();
        updateStats();
        updateCategoryFilter();
        showToast('Redone', 'success');
    }
    
    updateUndoRedoButtons();
}

/**
 * Update undo/redo button states
 */
function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    
    if (undoBtn) {
        undoBtn.disabled = historyIndex < 0;
        undoBtn.style.opacity = historyIndex < 0 ? '0.5' : '1';
    }
    
    if (redoBtn) {
        redoBtn.disabled = historyIndex >= historyStack.length - 1;
        redoBtn.style.opacity = historyIndex >= historyStack.length - 1 ? '0.5' : '1';
    }
}

/**
 * Initialize undo/redo
 */
function initUndoRedo() {
    // Save initial state
    saveToHistory('items', items);
}
