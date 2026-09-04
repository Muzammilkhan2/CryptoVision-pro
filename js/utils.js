/* ============================================
   CryptoVision Pro - Utility Functions
   Helper functions for data manipulation and UI
   ============================================ */

// ============================================
// Number Formatting Utilities
// ============================================

/**
 * Format large numbers with K, M, B, T suffixes
 */
function formatLargeNumber(num) {
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toFixed(2);
}

/**
 * Format currency with $ and commas
 */
function formatCurrency(num, decimals = 2) {
    return '$' + num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format percentage with + or - sign
 */
function formatPercentage(num, decimals = 2) {
    const sign = num >= 0 ? '+' : '';
    return sign + num.toFixed(decimals) + '%';
}

/**
 * Animate number counter
 */
function animateNumber(element, start, end, duration = 1000) {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// ============================================
// Wallet Address Utilities
// ============================================

/**
 * Shorten wallet address (0x1a2b...c3d4)
 */
function shortenAddress(address, startChars = 6, endChars = 4) {
    if (!address) return '';
    if (address.length <= startChars + endChars) return address;
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

// ============================================
// Time Utilities
// ============================================

/**
 * Format timestamp to relative time
 */
function formatTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

/**
 * Format timestamp to readable date
 */
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============================================
// Toast Notification System
// ============================================

const ToastManager = {
    container: null,
    
    init() {
        this.container = document.getElementById('toastContainer');
    },
    
    show(message, type = 'success', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' 
            ? '<i class="fas fa-check-circle"></i>'
            : '<i class="fas fa-exclamation-circle"></i>';
        
        toast.innerHTML = `
            ${icon}
            <div class="toast-message">${message}</div>
        `;
        
        this.container.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },
    
    success(message, duration) {
        this.show(message, 'success', duration);
    },
    
    error(message, duration) {
        this.show(message, 'error', duration);
    }
};

// ============================================
// Loading Overlay Control
// ============================================

const LoadingManager = {
    overlay: null,
    
    init() {
        this.overlay = document.getElementById('loadingOverlay');
    },
    
    show() {
        this.overlay.classList.remove('hidden');
    },
    
    hide() {
        this.overlay.classList.add('hidden');
    }
};

// ============================================
// Data Generation for Demo
// ============================================

/**
 * Generate mock price data for charts
 */
function generatePriceData(days = 30, basePrice = 50000, volatility = 0.03) {
    const data = [];
    let price = basePrice;
    const now = Date.now();
    
    for (let i = days; i >= 0; i--) {
        const timestamp = now - (i * 24 * 60 * 60 * 1000);
        const change = (Math.random() - 0.5) * 2 * volatility;
        price = price * (1 + change);
        
        const open = price;
        const close = price * (1 + (Math.random() - 0.5) * 0.02);
        const high = Math.max(open, close) * (1 + Math.random() * 0.01);
        const low = Math.min(open, close) * (1 - Math.random() * 0.01);
        const volume = Math.random() * 1000000000 + 500000000;
        
        data.push({
            timestamp,
            date: new Date(timestamp).toISOString().split('T')[0],
            open: parseFloat(open.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            close: parseFloat(close.toFixed(2)),
            volume: parseFloat(volume.toFixed(0))
        });
    }
    
    return data;
}

/**
 * Generate DeFi protocol TVL data
 */
function generateDeFiData() {
    const protocols = [
        { name: 'Aave', logo: '🏦', chains: ['Ethereum', 'Polygon', 'Avalanche'] },
        { name: 'Uniswap', logo: '🦄', chains: ['Ethereum', 'Polygon', 'Arbitrum'] },
        { name: 'Curve', logo: '🌊', chains: ['Ethereum', 'Polygon'] },
        { name: 'MakerDAO', logo: '🏛️', chains: ['Ethereum'] },
        { name: 'Lido', logo: '🔱', chains: ['Ethereum'] },
        { name: 'Compound', logo: '🧮', chains: ['Ethereum'] },
        { name: 'PancakeSwap', logo: '🥞', chains: ['BSC'] },
        { name: 'JustLend', logo: '💎', chains: ['Tron'] },
        { name: 'Instadapp', logo: '⚡', chains: ['Ethereum', 'Polygon'] },
        { name: 'Balancer', logo: '⚖️', chains: ['Ethereum', 'Polygon'] }
    ];
    
    return protocols.map((protocol, index) => ({
        ...protocol,
        tvl: (15000000000 - index * 1200000000) + Math.random() * 500000000,
        change24h: (Math.random() - 0.5) * 10
    })).sort((a, b) => b.tvl - a.tvl);
}

/**
 * Generate on-chain data
 */
function generateOnChainData(days = 30) {
    const data = [];
    const now = Date.now();
    
    for (let i = days; i >= 0; i--) {
        const timestamp = now - (i * 24 * 60 * 60 * 1000);
        data.push({
            date: new Date(timestamp).toISOString().split('T')[0],
            volume: (Math.random() * 5 + 8) * 1e9, // 8-13B
            activeAddresses: (Math.random() * 200 + 400) * 1000, // 400-600k
            gasPrice: Math.random() * 50 + 20, // 20-70 Gwei
            transactions: Math.random() * 500000 + 1000000 // 1-1.5M
        });
    }
    
    return data;
}

/**
 * Generate whale transaction data
 */
function generateWhaleTransaction() {
    const types = ['buy', 'sell', 'transfer'];
    const currencies = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'ADA', 'MATIC'];
    const type = types[Math.floor(Math.random() * types.length)];
    const currency = currencies[Math.floor(Math.random() * currencies.length)];
    
    const basePrices = {
        'BTC': 67000,
        'ETH': 3400,
        'USDT': 1,
        'BNB': 590,
        'SOL': 152,
        'ADA': 0.6,
        'MATIC': 0.8
    };
    
    const amount = Math.random() * 1000 + 100;
    const price = basePrices[currency];
    const usdValue = amount * price;
    
    return {
        id: Date.now() + Math.random(),
        address: '0x' + Math.random().toString(16).substr(2, 40),
        type,
        currency,
        amount: amount.toFixed(2),
        usdValue,
        timestamp: Date.now(),
        isLarge: usdValue > 1000000
    };
}

/**
 * Generate market cap data
 */
function generateMarketCapData() {
    const cryptos = [
        { name: 'Bitcoin', symbol: 'BTC', color: '#F7931A' },
        { name: 'Ethereum', symbol: 'ETH', color: '#627EEA' },
        { name: 'Tether', symbol: 'USDT', color: '#26A17B' },
        { name: 'BNB', symbol: 'BNB', color: '#F3BA2F' },
        { name: 'Solana', symbol: 'SOL', color: '#14F195' },
        { name: 'XRP', symbol: 'XRP', color: '#23292F' },
        { name: 'Cardano', symbol: 'ADA', color: '#0033AD' },
        { name: 'Dogecoin', symbol: 'DOGE', color: '#C2A633' },
        { name: 'Polygon', symbol: 'MATIC', color: '#8247E5' },
        { name: 'Polkadot', symbol: 'DOT', color: '#E6007A' }
    ];
    
    return cryptos.map((crypto, index) => ({
        ...crypto,
        marketCap: (900000000000 - index * 75000000000) + Math.random() * 10000000000,
        change24h: (Math.random() - 0.5) * 8
    }));
}

/**
 * Calculate Fear & Greed Index (mock)
 */
function calculateFearGreedIndex() {
    // In production, this would call an API
    return Math.floor(Math.random() * 100);
}

// ============================================
// Color Utilities
// ============================================

/**
 * Get color based on percentage change
 */
function getChangeColor(change) {
    return change >= 0 ? '#10b981' : '#ff0055';
}

/**
 * Get Fear & Greed color
 */
function getFearGreedColor(value) {
    if (value <= 25) return '#ff0055'; // Extreme Fear
    if (value <= 45) return '#ff6b35'; // Fear
    if (value <= 55) return '#fbbf24'; // Neutral
    if (value <= 75) return '#10b981'; // Greed
    return '#059669'; // Extreme Greed
}

/**
 * Get Fear & Greed label
 */
function getFearGreedLabel(value) {
    if (value <= 25) return 'Extreme Fear';
    if (value <= 45) return 'Fear';
    if (value <= 55) return 'Neutral';
    if (value <= 75) return 'Greed';
    return 'Extreme Greed';
}

// ============================================
// Local Storage Utilities
// ============================================

const StorageManager = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Error removing from localStorage:', e);
        }
    }
};

// ============================================
// Debounce & Throttle
// ============================================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// Export for use in other scripts
// ============================================

window.CryptoUtils = {
    formatLargeNumber,
    formatCurrency,
    formatPercentage,
    animateNumber,
    shortenAddress,
    formatTimeAgo,
    formatDate,
    generatePriceData,
    generateDeFiData,
    generateOnChainData,
    generateWhaleTransaction,
    generateMarketCapData,
    calculateFearGreedIndex,
    getChangeColor,
    getFearGreedColor,
    getFearGreedLabel,
    ToastManager,
    LoadingManager,
    StorageManager,
    debounce,
    throttle
};
