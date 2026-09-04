/* ============================================
   CryptoVision Pro - Main Application Logic
   Initialization and Event Handlers
   ============================================ */

// ============================================
// Application State
// ============================================
const AppState = {
    isInitialized: false,
    whaleTransactions: [],
    updateIntervals: {},
    currentCurrency: 'BTC',
    currentTimeframe: '1D'
};

// ============================================
// Initialize Application
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Show loading overlay
        CryptoUtils.LoadingManager.init();
        CryptoUtils.LoadingManager.show();
        
        // Initialize toast manager
        CryptoUtils.ToastManager.init();
        
        // Simulate API loading delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Initialize all charts
        ChartManager.init();
        
        // Initialize whale feed
        initWhaleFeed();
        
        // Setup event listeners
        setupEventListeners();
        
        // Start real-time updates
        startRealTimeUpdates();
        
        // Hide loading overlay
        CryptoUtils.LoadingManager.hide();
        
        // Show success message
        CryptoUtils.ToastManager.success('Market data loaded successfully!');
        
        AppState.isInitialized = true;
        
    } catch (error) {
        console.error('Initialization error:', error);
        CryptoUtils.LoadingManager.hide();
        CryptoUtils.ToastManager.error('Failed to load market data. Please refresh.');
    }
});

// ============================================
// Setup Event Listeners
// ============================================
function setupEventListeners() {
    // Currency selector
    const currencyBtns = document.querySelectorAll('.currency-btn');
    currencyBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            currencyBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const currency = this.dataset.currency;
            AppState.currentCurrency = currency;
            ChartManager.updatePriceChart(currency, AppState.currentTimeframe);
            
            CryptoUtils.ToastManager.success(`Switched to ${currency}`);
        });
    });
    
    // Timeframe selector
    const timeBtns = document.querySelectorAll('.time-btn');
    timeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            timeBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const timeframe = this.dataset.timeframe;
            AppState.currentTimeframe = timeframe;
            ChartManager.updatePriceChart(AppState.currentCurrency, timeframe);
            
            CryptoUtils.ToastManager.success(`Timeframe: ${timeframe}`);
        });
    });
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    refreshBtn.addEventListener('click', function() {
        this.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            this.style.transform = '';
        }, 500);
        
        refreshAllData();
    });
    
    // Navigation items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Settings button
    const settingsBtn = document.getElementById('settingsBtn');
    settingsBtn.addEventListener('click', () => {
        CryptoUtils.ToastManager.success('Settings panel coming soon!');
    });
}

// ============================================
// Whale Feed Management
// ============================================
function initWhaleFeed() {
    const whaleFeed = document.getElementById('whaleFeed');
    
    // Generate initial transactions
    for (let i = 0; i < 15; i++) {
        const transaction = CryptoUtils.generateWhaleTransaction();
        transaction.timestamp -= i * 60000 * Math.random() * 30; // Spread over last 30 mins
        AppState.whaleTransactions.push(transaction);
    }
    
    // Sort by timestamp (newest first)
    AppState.whaleTransactions.sort((a, b) => b.timestamp - a.timestamp);
    
    // Render transactions
    renderWhaleTransactions();
}

function renderWhaleTransactions() {
    const whaleFeed = document.getElementById('whaleFeed');
    whaleFeed.innerHTML = '';
    
    // Show latest 20 transactions
    const recentTransactions = AppState.whaleTransactions.slice(0, 20);
    
    recentTransactions.forEach((tx, index) => {
        const txElement = createWhaleTransactionElement(tx);
        
        // Add slight delay for staggered animation
        setTimeout(() => {
            whaleFeed.appendChild(txElement);
        }, index * 50);
    });
}

function createWhaleTransactionElement(tx) {
    const div = document.createElement('div');
    div.className = `whale-transaction ${tx.type}`;
    if (tx.isLarge) {
        div.classList.add('large');
    }
    
    const actionIcon = {
        'buy': '<i class="fas fa-arrow-up"></i>',
        'sell': '<i class="fas fa-arrow-down"></i>',
        'transfer': '<i class="fas fa-exchange-alt"></i>'
    }[tx.type];
    
    const actionText = tx.type.charAt(0).toUpperCase() + tx.type.slice(1);
    const actionClass = tx.type === 'buy' ? 'buy' : 'sell';
    
    div.innerHTML = `
        <div class="whale-header">
            <div class="whale-address">${CryptoUtils.shortenAddress(tx.address)}</div>
            <div class="whale-time">${CryptoUtils.formatTimeAgo(tx.timestamp)}</div>
        </div>
        <div class="whale-action">
            <div class="action-type ${actionClass}">
                ${actionIcon}
                ${actionText}
            </div>
            <div class="whale-amount">
                <span class="amount-crypto">${tx.amount} ${tx.currency}</span>
                <span class="amount-usd">${CryptoUtils.formatCurrency(tx.usdValue, 0)}</span>
            </div>
        </div>
    `;
    
    return div;
}

function addWhaleTransaction() {
    const newTx = CryptoUtils.generateWhaleTransaction();
    
    // Add to beginning of array
    AppState.whaleTransactions.unshift(newTx);
    
    // Keep only latest 50
    if (AppState.whaleTransactions.length > 50) {
        AppState.whaleTransactions = AppState.whaleTransactions.slice(0, 50);
    }
    
    // Re-render feed
    renderWhaleTransactions();
    
    // Show notification for large transactions
    if (newTx.isLarge) {
        const actionText = newTx.type.toUpperCase();
        const message = `🐋 Large ${actionText}: ${newTx.amount} ${newTx.currency} (${CryptoUtils.formatCurrency(newTx.usdValue, 0)})`;
        CryptoUtils.ToastManager.success(message, 5000);
    }
}

// ============================================
// Real-time Updates
// ============================================
function startRealTimeUpdates() {
    // Update whale feed every 8-15 seconds
    AppState.updateIntervals.whale = setInterval(() => {
        const delay = Math.random() * 7000 + 8000; // 8-15 seconds
        setTimeout(addWhaleTransaction, delay);
    }, 1000);
    
    // Update ticker prices every 3 seconds
    AppState.updateIntervals.ticker = setInterval(() => {
        updateTickerPrices();
    }, 3000);
    
    // Update Fear & Greed index every 60 seconds
    AppState.updateIntervals.fearGreed = setInterval(() => {
        const newValue = CryptoUtils.calculateFearGreedIndex();
        const color = CryptoUtils.getFearGreedColor(newValue);
        
        ChartManager.charts.fearGreed.setOption({
            series: [{
                pointer: {
                    itemStyle: {
                        color: color,
                        shadowColor: color
                    }
                },
                detail: {
                    rich: {
                        value: { color: color }
                    }
                },
                data: [{ value: newValue }]
            }]
        });
    }, 60000);
    
    // Duplicate ticker content for seamless scroll
    const tickerContainer = document.getElementById('tickerContainer');
    const tickerContent = tickerContainer.innerHTML;
    tickerContainer.innerHTML = tickerContent + tickerContent;
}

function updateTickerPrices() {
    const tickerItems = document.querySelectorAll('.ticker-price');
    
    tickerItems.forEach(item => {
        const currentPrice = parseFloat(item.textContent.replace(/[$,]/g, ''));
        const changePercent = (Math.random() - 0.5) * 0.5; // -0.25% to +0.25%
        const newPrice = currentPrice * (1 + changePercent / 100);
        
        // Update price
        item.textContent = CryptoUtils.formatCurrency(newPrice);
        
        // Update data attribute for animation
        item.dataset.change = changePercent >= 0 ? 'up' : 'down';
        
        // Update corresponding change element
        const changeElement = item.nextElementSibling;
        if (changeElement && changeElement.classList.contains('ticker-change')) {
            const currentChange = parseFloat(changeElement.textContent.replace(/[+%]/g, ''));
            const newChange = currentChange + changePercent;
            
            changeElement.textContent = CryptoUtils.formatPercentage(newChange);
            changeElement.className = 'ticker-change ' + (newChange >= 0 ? 'positive' : 'negative');
        }
    });
}

function refreshAllData() {
    CryptoUtils.ToastManager.success('Refreshing market data...');
    
    // Re-initialize charts with new data
    ChartManager.updatePriceChart(AppState.currentCurrency, AppState.currentTimeframe);
    ChartManager.initTVLChart();
    ChartManager.initOnChainChart();
    ChartManager.initMarketCapChart();
    
    // Add new whale transactions
    for (let i = 0; i < 3; i++) {
        setTimeout(() => addWhaleTransaction(), i * 500);
    }
    
    setTimeout(() => {
        CryptoUtils.ToastManager.success('Data refreshed successfully!');
    }, 1000);
}

// ============================================
// Cleanup on page unload
// ============================================
window.addEventListener('beforeunload', () => {
    // Clear all intervals
    Object.values(AppState.updateIntervals).forEach(interval => {
        clearInterval(interval);
    });
    
    // Dispose all charts
    Object.values(ChartManager.charts).forEach(chart => {
        if (chart && !chart.isDisposed()) {
            chart.dispose();
        }
    });
});

// ============================================
// Keyboard Shortcuts
// ============================================
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + R: Refresh data
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        refreshAllData();
    }
    
    // Number keys 1-5: Switch currency
    if (e.key >= '1' && e.key <= '5' && !e.ctrlKey && !e.metaKey) {
        const currencies = ['BTC', 'ETH', 'BNB', 'SOL', 'ADA'];
        const index = parseInt(e.key) - 1;
        const currencyBtn = document.querySelector(`.currency-btn[data-currency="${currencies[index]}"]`);
        if (currencyBtn) {
            currencyBtn.click();
        }
    }
});

// ============================================
// Performance Monitoring (Development)
// ============================================
if (window.performance && window.performance.timing) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`%c⚡ Page Load Time: ${pageLoadTime}ms`, 'color: #00d4ff; font-size: 14px; font-weight: bold;');
            
            const domReadyTime = perfData.domContentLoadedEventEnd - perfData.navigationStart;
            console.log(`%c📊 DOM Ready Time: ${domReadyTime}ms`, 'color: #10b981; font-size: 14px; font-weight: bold;');
            
            console.log('%c🚀 CryptoVision Pro initialized successfully!', 'color: #8b5cf6; font-size: 16px; font-weight: bold;');
        }, 0);
    });
}

// ============================================
// Error Handling
// ============================================
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    CryptoUtils.ToastManager.error('An error occurred. Please refresh the page.');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    CryptoUtils.ToastManager.error('Failed to load some data. Please try again.');
});

// ============================================
// Export for debugging (development only)
// ============================================
if (typeof window !== 'undefined') {
    window.CryptoVisionPro = {
        AppState,
        ChartManager,
        CryptoUtils,
        refreshAllData,
        addWhaleTransaction
    };
    
    console.log('%cCryptoVision Pro Debug Tools Available', 'color: #00d4ff; font-size: 12px;');
    console.log('%cAccess via: window.CryptoVisionPro', 'color: #94a3b8; font-size: 11px;');
}
