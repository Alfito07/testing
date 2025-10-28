/**
 * Utility functions for the application
 */

class Utils {
    /**
     * Debounce function to limit function execution
     */
    static debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }

    /**
     * Throttle function to limit function execution rate
     */
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Sanitize input to prevent XSS
     */
    static sanitizeInput(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Validate ticket number format
     */
    static isValidTicket(ticket) {
        if (!ticket || typeof ticket !== 'string') return false;
        
        const trimmed = ticket.trim();
        if (trimmed.length < 6 || trimmed.length > 12) return false;
        
        // Ticket format: alphanumeric, usually uppercase
        return /^[A-Z0-9]+$/.test(trimmed);
    }

    /**
     * Get time-based greeting
     */
    static getTimeBasedGreeting() {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 11) return "Selamat pagi";
        if (hour >= 11 && hour < 15) return "Selamat siang";
        if (hour >= 15 && hour < 19) return "Selamat sore";
        return "Selamat malam";
    }

    /**
     * Format date to Indonesian format
     */
    static formatDate(date) {
        return new Date(date).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Format time to Indonesian format
     */
    static formatTime(date) {
        return new Date(date).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Show loading spinner
     */
    static showLoading() {
        document.getElementById('loadingSpinner').classList.remove('hidden');
    }

    /**
     * Hide loading spinner
     */
    static hideLoading() {
        document.getElementById('loadingSpinner').classList.add('hidden');
    }

    /**
     * Show notification toast
     */
    static showToast(message, type = 'success', duration = 3000) {
        // Remove existing toast
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast-notification fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 slide-in ${
            type === 'success' ? 'bg-green-600 text-white' :
            type === 'error' ? 'bg-red-600 text-white' :
            type === 'warning' ? 'bg-yellow-600 text-white' :
            'bg-blue-600 text-white'
        }`;
        
        toast.innerHTML = `
            <div class="flex items-center gap-2">
                <i class="fas ${
                    type === 'success' ? 'fa-check-circle' :
                    type === 'error' ? 'fa-exclamation-circle' :
                    type === 'warning' ? 'fa-exclamation-triangle' :
                    'fa-info-circle'
                }"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            toast.remove();
        }, duration);
    }

    /**
     * Copy text to clipboard with fallback
     */
    static async copyToClipboard(text) {
        // Tambahkan handling untuk text yang kosong
        if (!text || text.trim() === '') {
            console.warn('Attempted to copy empty text');
            return false;
        }

        try {
            // Method modern
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                // Fallback method
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.top = '0';
                textArea.style.left = '0';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                const success = document.execCommand('copy');
                document.body.removeChild(textArea);
                
                if (!success) {
                    throw new Error('Fallback copy method failed');
                }
                return true;
            }
        } catch (err) {
            console.error('Copy to clipboard failed:', err);
            
            // Last resort: show text to user
            alert(`Gagal menyalin otomatis. Silakan salin manual:\n\n${text}`);
            return false;
        }
    }

    /**
     * Download data as file
     */
    static downloadFile(content, filename, contentType = 'text/plain') {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Generate unique ID
     */
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Validate email format
     */
    static isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    /**
     * Calculate percentage
     */
    static calculatePercentage(part, total) {
        return total > 0 ? Math.round((part / total) * 100) : 0;
    }

    /**
     * Format number with thousands separator
     */
    static formatNumber(num) {
        return new Intl.NumberFormat('id-ID').format(num);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}