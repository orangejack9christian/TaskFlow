// Storage management for tasks and ideas using LocalStorage

const STORAGE_KEY = 'taskManagerData';

/**
 * Save items to LocalStorage
 * @param {Array} items - Array of task/idea objects
 */
function saveToStorage(items) {
    try {
        const data = {
            items: items,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to storage:', error);
        return false;
    }
}

/**
 * Load items from LocalStorage
 * @returns {Array} Array of task/idea objects
 */
function loadFromStorage() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            return [];
        }
        const parsed = JSON.parse(data);
        return parsed.items || [];
    } catch (error) {
        console.error('Error loading from storage:', error);
        return [];
    }
}

/**
 * Export data as JSON string
 * @returns {string} JSON string of all data
 */
function exportData() {
    const items = loadFromStorage();
    const data = {
        items: items,
        exportedAt: new Date().toISOString(),
        version: '1.0'
    };
    return JSON.stringify(data, null, 2);
}

/**
 * Import data from JSON string
 * @param {string} jsonString - JSON string to import
 * @returns {boolean} Success status
 */
function importData(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        if (data.items && Array.isArray(data.items)) {
            // Validate items structure
            const validItems = data.items.filter(item => 
                item.id && item.title && item.type
            );
            saveToStorage(validItems);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error importing data:', error);
        return false;
    }
}

/**
 * Clear all data from storage
 */
function clearStorage() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        return true;
    } catch (error) {
        console.error('Error clearing storage:', error);
        return false;
    }
}
