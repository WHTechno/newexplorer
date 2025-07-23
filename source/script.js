// Configuration
const CONFIG = {
    RPC_BASE_URL: 'https://warden-testnet-rpc.itrocket.net',
    API_BASE_URL: 'https://warden-testnet-api.itrocket.net',
    REFRESH_INTERVAL: 30000, // 30 seconds
    MAX_BLOCKS: 20,
    MAX_TRANSACTIONS: 20
};

// Global state
let currentPage = 'overview';
let refreshIntervals = {};

// Utility functions
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function formatHash(hash, length = 8) {
    if (!hash) return 'N/A';
    return hash.length > length ? `${hash.substring(0, length)}...` : hash;
}

function formatTime(timestamp) {
    try {
        const date = new Date(timestamp);
        return date.toLocaleString();
    } catch (e) {
        return 'Invalid Date';
    }
}

function formatTimeAgo(timestamp) {
    try {
        const now = new Date();
        const date = new Date(timestamp);
        const diffMs = now - date;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `${diffDays}d ago`;
        if (diffHours > 0) return `${diffHours}h ago`;
        if (diffMins > 0) return `${diffMins}m ago`;
        return `${diffSecs}s ago`;
    } catch (e) {
        return 'Unknown';
    }
}

// API functions
async function fetchWithTimeout(url, timeout = 10000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
            }
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error('Request timeout');
        }
        throw error;
    }
}

async function fetchNodeStatus() {
    try {
        const data = await fetchWithTimeout(`${CONFIG.RPC_BASE_URL}/status`);
        return data.result;
    } catch (error) {
        console.error('Error fetching node status:', error);
        return null;
    }
}

async function fetchLatestBlocks(limit = CONFIG.MAX_BLOCKS) {
    try {
        const status = await fetchNodeStatus();
        if (!status) return [];

        const latestHeight = parseInt(status.sync_info.latest_block_height);
        const minHeight = Math.max(1, latestHeight - limit + 1);
        
        const data = await fetchWithTimeout(
            `${CONFIG.RPC_BASE_URL}/blockchain?minHeight=${minHeight}&maxHeight=${latestHeight}`
        );
        
        if (data.result && data.result.block_metas) {
            return data.result.block_metas.reverse(); // Show latest first
        }
        return [];
    } catch (error) {
        console.error('Error fetching blocks:', error);
        return [];
    }
}

async function fetchValidators() {
    try {
        const data = await fetchWithTimeout(`${CONFIG.RPC_BASE_URL}/validators`);
        if (data.result && data.result.validators) {
            return data.result.validators;
        }
        return [];
    } catch (error) {
        console.error('Error fetching validators:', error);
        return [];
    }
}

async function fetchTransactions() {
    try {
        // Since we can't get transactions directly from basic RPC, 
        // we'll fetch recent blocks and extract transactions
        const blocks = await fetchLatestBlocks(10);
        const transactions = [];
        
        for (const block of blocks.slice(0, 5)) { // Check last 5 blocks
            try {
                const blockData = await fetchWithTimeout(
                    `${CONFIG.RPC_BASE_URL}/block?height=${block.header.height}`
                );
                
                if (blockData.result && blockData.result.block && blockData.result.block.data.txs) {
                    const txs = blockData.result.block.data.txs;
                    for (let i = 0; i < txs.length && transactions.length < CONFIG.MAX_TRANSACTIONS; i++) {
                        transactions.push({
                            hash: formatHash(txs[i], 16),
                            height: block.header.height,
                            time: block.header.time,
                            type: 'Transfer', // Default type since we can't decode
                            status: 'Success' // Assume success if in block
                        });
                    }
                }
            } catch (e) {
                console.warn(`Error fetching block ${block.header.height}:`, e);
            }
        }
        
        return transactions;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
}

// UI Update functions
function updateOverviewStats() {
    fetchNodeStatus().then(status => {
        if (status) {
            // Update basic stats with available data
            document.getElementById('apr-value').textContent = '12.5%'; // Mock data
            document.getElementById('bonded-value').textContent = '45.2M / 100M'; // Mock data
            document.getElementById('validators-value').textContent = status.validator_info ? '1' : '100'; // Mock data
            document.getElementById('gas-value').textContent = '0.025 uward'; // Mock data
        } else {
            // Show error state
            document.getElementById('apr-value').textContent = 'Error';
            document.getElementById('bonded-value').textContent = 'Error';
            document.getElementById('validators-value').textContent = 'Error';
            document.getElementById('gas-value').textContent = 'Error';
        }
    });

    // Update transaction count (mock data with some randomness)
    const baseCount = 10770;
    const randomVariation = Math.floor(Math.random() * 100);
    const txCount = baseCount + randomVariation;
    document.getElementById('tx-count').textContent = formatNumber(txCount);
    
    // Draw simple chart
    drawTransactionChart();
}

function drawTransactionChart() {
    const canvas = document.getElementById('transactionChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Generate mock data points
    const points = [];
    const numPoints = 50;
    const baseValue = 10500;
    
    for (let i = 0; i < numPoints; i++) {
        const x = (i / (numPoints - 1)) * width;
        const variation = Math.sin(i * 0.2) * 200 + Math.random() * 100 - 50;
        const y = height - ((baseValue + variation - 10000) / 1000) * height;
        points.push({ x, y });
    }
    
    // Draw line
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    points.forEach((point, index) => {
        if (index === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    });
    
    ctx.stroke();
    
    // Draw area under curve
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.beginPath();
    ctx.moveTo(points[0].x, height);
    points.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.lineTo(points[points.length - 1].x, height);
    ctx.closePath();
    ctx.fill();
}

function updateBlocksTable() {
    const tbody = document.getElementById('blocks-table-body');
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Loading blocks...</td></tr>';
    
    fetchLatestBlocks().then(blocks => {
        if (blocks.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="loading">No blocks found or error loading data</td></tr>';
            return;
        }
        
        tbody.innerHTML = blocks.map(block => `
            <tr>
                <td><strong>${block.header.height}</strong></td>
                <td><code>${formatHash(block.block_id.hash)}</code></td>
                <td>${formatTimeAgo(block.header.time)}</td>
                <td>${block.num_txs || 0}</td>
                <td>${formatHash(block.header.proposer_address)}</td>
            </tr>
        `).join('');
    }).catch(error => {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">Error loading blocks</td></tr>';
        console.error('Error updating blocks table:', error);
    });
}

function updateTransactionsTable() {
    const tbody = document.getElementById('transactions-table-body');
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Loading transactions...</td></tr>';
    
    fetchTransactions().then(transactions => {
        if (transactions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="loading">No recent transactions found</td></tr>';
            return;
        }
        
        tbody.innerHTML = transactions.map(tx => `
            <tr>
                <td><code>${tx.hash}</code></td>
                <td>${tx.height}</td>
                <td>${formatTimeAgo(tx.time)}</td>
                <td><span class="badge">${tx.type}</span></td>
                <td><span class="status-success">${tx.status}</span></td>
            </tr>
        `).join('');
    }).catch(error => {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">Error loading transactions</td></tr>';
        console.error('Error updating transactions table:', error);
    });
}

function updateValidatorsTable() {
    const tbody = document.getElementById('validators-table-body');
    tbody.innerHTML = '<tr><td colspan="5" class="loading">Loading validators...</td></tr>';
    
    fetchValidators().then(validators => {
        if (validators.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="loading">No validators found or error loading data</td></tr>';
            return;
        }
        
        tbody.innerHTML = validators.map((validator, index) => `
            <tr>
                <td><strong>${index + 1}</strong></td>
                <td>${formatHash(validator.address)}</td>
                <td>${formatNumber(parseInt(validator.voting_power) || 0)}</td>
                <td>5%</td>
                <td><span class="status-active">Active</span></td>
            </tr>
        `).join('');
    }).catch(error => {
        tbody.innerHTML = '<tr><td colspan="5" class="loading">Error loading validators</td></tr>';
        console.error('Error updating validators table:', error);
    });
}

// Navigation functions
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeNavItem = document.querySelector(`[data-page="${pageId}"]`);
    if (activeNavItem) {
        activeNavItem.classList.add('active');
    }
    
    currentPage = pageId;
    
    // Load page-specific data
    loadPageData(pageId);
    
    // Clear existing intervals
    Object.values(refreshIntervals).forEach(interval => clearInterval(interval));
    refreshIntervals = {};
    
    // Set up auto-refresh for data pages
    if (pageId === 'overview') {
        refreshIntervals.overview = setInterval(updateOverviewStats, CONFIG.REFRESH_INTERVAL);
    } else if (pageId === 'blocks') {
        refreshIntervals.blocks = setInterval(updateBlocksTable, CONFIG.REFRESH_INTERVAL);
    } else if (pageId === 'transactions') {
        refreshIntervals.transactions = setInterval(updateTransactionsTable, CONFIG.REFRESH_INTERVAL);
    } else if (pageId === 'validators') {
        refreshIntervals.validators = setInterval(updateValidatorsTable, CONFIG.REFRESH_INTERVAL);
    }
}

function loadPageData(pageId) {
    switch (pageId) {
        case 'overview':
            updateOverviewStats();
            break;
        case 'blocks':
            updateBlocksTable();
            break;
        case 'transactions':
            updateTransactionsTable();
            break;
        case 'validators':
            updateValidatorsTable();
            break;
    }
}

// Utility tab functions
function showUtilityTab(tabId) {
    // Hide all tabs
    document.querySelectorAll('.utility-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    const targetTab = document.getElementById(`${tabId}-tab`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
}

// Manual refresh functions
function loadBlocks() {
    updateBlocksTable();
}

function loadTransactions() {
    updateTransactionsTable();
}

function loadValidators() {
    updateValidatorsTable();
}

// Search functionality
function setupSearch() {
    const searchInputs = document.querySelectorAll('.search-input, .header-search-input');
    
    searchInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    performSearch(query);
                }
            }
        });
    });
    
    // Search button click
    document.querySelector('.search-btn')?.addEventListener('click', function() {
        const input = document.querySelector('.header-search-input');
        const query = input.value.trim();
        if (query) {
            performSearch(query);
        }
    });
}

async function performSearch(query) {
    console.log('Searching for:', query);
    
    // Determine search type based on query format
    if (/^\d+$/.test(query)) {
        // Numeric - likely block height
        await searchBlock(query);
    } else if (/^[A-Fa-f0-9]{64}$/.test(query)) {
        // 64 char hex - likely transaction hash or block hash
        await searchTransaction(query);
    } else if (/^[A-Fa-f0-9]{40}$/.test(query)) {
        // 40 char hex - likely address
        await searchAddress(query);
    } else {
        alert('Invalid search query. Please enter a block height, transaction hash, or address.');
    }
}

async function searchBlock(height) {
    try {
        const data = await fetchWithTimeout(`${CONFIG.RPC_BASE_URL}/block?height=${height}`);
        if (data.result) {
            alert(`Block ${height} found!\nHash: ${data.result.block_id.hash}\nTime: ${data.result.block.header.time}\nTransactions: ${data.result.block.data.txs.length}`);
        }
    } catch (error) {
        alert(`Block ${height} not found or error occurred.`);
    }
}

async function searchTransaction(hash) {
    try {
        const data = await fetchWithTimeout(`${CONFIG.RPC_BASE_URL}/tx?hash=${hash}`);
        if (data.result) {
            alert(`Transaction found!\nHash: ${hash}\nHeight: ${data.result.height}`);
        }
    } catch (error) {
        alert(`Transaction ${hash} not found or error occurred.`);
    }
}

async function searchAddress(address) {
    alert(`Address search for ${address} - This feature requires additional API endpoints not available in basic RPC.`);
}

// Initialize application
function init() {
    console.log('Initializing Warden Explorer...');
    
    // Set up navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const pageId = this.getAttribute('data-page');
            if (pageId) {
                showPage(pageId);
            }
        });
    });
    
    // Set up search
    setupSearch();
    
    // Load initial page
    showPage('overview');
    
    // Test connectivity
    fetchNodeStatus().then(status => {
        if (status) {
            console.log('✅ Connected to Warden testnet RPC');
            console.log('Node info:', status.node_info);
            console.log('Latest block:', status.sync_info.latest_block_height);
        } else {
            console.warn('⚠️ Could not connect to Warden testnet RPC');
        }
    });
    
    console.log('✅ Warden Explorer initialized');
}

// Start the application when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Global error handler
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

// Handle visibility change to pause/resume auto-refresh
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Pause auto-refresh when tab is not visible
        Object.values(refreshIntervals).forEach(interval => clearInterval(interval));
    } else {
        // Resume auto-refresh when tab becomes visible
        if (currentPage === 'overview') {
            refreshIntervals.overview = setInterval(updateOverviewStats, CONFIG.REFRESH_INTERVAL);
        } else if (currentPage === 'blocks') {
            refreshIntervals.blocks = setInterval(updateBlocksTable, CONFIG.REFRESH_INTERVAL);
        } else if (currentPage === 'transactions') {
            refreshIntervals.transactions = setInterval(updateTransactionsTable, CONFIG.REFRESH_INTERVAL);
        } else if (currentPage === 'validators') {
            refreshIntervals.validators = setInterval(updateValidatorsTable, CONFIG.REFRESH_INTERVAL);
        }
    }
});

// Export functions for global access
window.showUtilityTab = showUtilityTab;
window.loadBlocks = loadBlocks;
window.loadTransactions = loadTransactions;
window.loadValidators = loadValidators;
