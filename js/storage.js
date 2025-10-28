
/**
 * Storage management with enhanced error handling and fallbacks
 */

class StorageManager {
    constructor() {
        this.prefix = 'msg_generator_';
        this.isAvailable = this.checkStorageAvailability();
        this.fallbackStorage = new Map(); // In-memory fallback
    }

    /**
     * Check if localStorage is available
     */
    checkStorageAvailability() {
        try {
            const test = 'test';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage is not available, using in-memory storage:', e);
            return false;
        }
    }

    /**
     * Get item from storage with namespace and enhanced error handling
     */
    get(key, defaultValue = null) {
        if (!this.isAvailable) {
            return this.fallbackStorage.has(key) ? this.fallbackStorage.get(key) : defaultValue;
        }

        try {
            const fullKey = this.prefix + key;
            const item = localStorage.getItem(fullKey);
            
            if (item === null) return defaultValue;
            
            return JSON.parse(item);
        } catch (error) {
            console.error(`Error reading from storage (${key}):`, error);
            
            // Try to recover from corrupted data
            try {
                this.remove(key);
            } catch (e) {
                console.error('Failed to remove corrupted data:', e);
            }
            
            return defaultValue;
        }
    }

    /**
     * Set item to storage with namespace and enhanced error handling
     */
    set(key, value) {
        const fullKey = this.prefix + key;
        
        if (!this.isAvailable) {
            this.fallbackStorage.set(fullKey, value);
            return true;
        }

        try {
            // Check if storage is full
            const testData = 'test';
            localStorage.setItem(testData, testData);
            localStorage.removeItem(testData);
            
            localStorage.setItem(fullKey, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error(`Error writing to storage (${key}):`, error);
            
            if (error.name === 'QuotaExceededError') {
                Utils.showToast('Penyimpanan penuh, menghapus data lama...', 'warning');
                this.clearOldData();
                
                // Retry once
                try {
                    localStorage.setItem(fullKey, JSON.stringify(value));
                    return true;
                } catch (retryError) {
                    console.error('Retry failed:', retryError);
                    this.fallbackStorage.set(fullKey, value);
                    return false;
                }
            }
            
            this.fallbackStorage.set(fullKey, value);
            return false;
        }
    }

    /**
     * Remove item from storage
     */
    remove(key) {
        const fullKey = this.prefix + key;
        
        if (!this.isAvailable) {
            this.fallbackStorage.delete(fullKey);
            return true;
        }

        try {
            localStorage.removeItem(fullKey);
            this.fallbackStorage.delete(fullKey);
            return true;
        } catch (error) {
            console.error(`Error removing from storage (${key}):`, error);
            return false;
        }
    }

    /**
     * Clear all app data from storage
     */
    clear() {
        if (!this.isAvailable) {
            this.fallbackStorage.clear();
            return true;
        }

        try {
            const keys = this.getAllKeys();
            keys.forEach(key => this.remove(key));
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            return false;
        }
    }

    /**
     * Clear old data to free up space
     */
    clearOldData() {
        if (!this.isAvailable) return;

        try {
            const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
            const keys = this.getAllKeys();
            
            keys.forEach(key => {
                if (key.startsWith('progress_')) {
                    const dateStr = key.replace('progress_', '');
                    const date = new Date(dateStr);
                    
                    if (date.getTime() < oneWeekAgo) {
                        this.remove(key);
                    }
                }
            });
        } catch (error) {
            console.error('Error clearing old data:', error);
        }
    }

    /**
     * Get all keys with app prefix
     */
    getAllKeys() {
        if (!this.isAvailable) {
            return Array.from(this.fallbackStorage.keys())
                .map(key => key.replace(this.prefix, ''));
        }

        try {
            return Object.keys(localStorage)
                .filter(key => key.startsWith(this.prefix))
                .map(key => key.replace(this.prefix, ''));
        } catch (error) {
            console.error('Error getting storage keys:', error);
            return [];
        }
    }

    /**
     * Get storage usage information
     */
    getStorageInfo() {
        if (!this.isAvailable) return { used: 0, total: 0, percent: 0 };

        try {
            let total = 0;
            const appKeys = this.getAllKeys();

            appKeys.forEach(key => {
                const value = localStorage.getItem(this.prefix + key);
                total += key.length + (value ? value.length : 0);
            });

            // Approximate total storage (most browsers have 5MB limit)
            const totalStorage = 5 * 1024 * 1024; // 5MB in bytes
            const percent = Utils.calculatePercentage(total, totalStorage);

            return {
                used: total,
                total: totalStorage,
                percent: percent
            };
        } catch (error) {
            console.error('Error getting storage info:', error);
            return { used: 0, total: 0, percent: 0 };
        }
    }
}

// Create global instance
const storageManager = new StorageManager();
