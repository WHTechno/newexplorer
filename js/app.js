import NetworkSwitcher from './components/NetworkSwitcher';
import Toast from './components/Toast';
import networkStore from './stores/networkStore';

class App {
    constructor() {
        this.currentPage = 'overview';
        this.initComponents();
        this.setupEventListeners();
        this.loadInitialData();
        this.setupNetworkListener();
    }

    initComponents() {
        this.networkSwitcher = new NetworkSwitcher();
        this.toast = new Toast();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                this.showPage(page);
            });
        });

        // Refresh buttons
        document.getElementById('refresh-blocks')?.addEventListener('click', () => this.loadBlocks());
        document.getElementById('refresh-txs')?.addEventListener('click', () => this.loadTransactions());
        document.getElementById('refresh-validators')?.addEventListener('click', () => this.loadValidators());

        // Search
        document.getElementById('global-search')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleSearch(e.target.value.trim());
            }
        });
    }

    setupNetworkListener() {
        networkStore.subscribe((network) => {
            this.updateNetworkInfo();
            this.loadPageData(this.currentPage);
        });
    }

    async loadInitialData() {
        try {
            await this.updateNetworkInfo();
            this.loadPageData(this.currentPage);
        } catch (error) {
            console.error('Initial data load failed:', error);
            this.toast.show('Failed to load initial data', 'error');
        }
    }

    async updateNetworkInfo() {
        const network = networkStore.getCurrentNetwork();
        const networkNameEl = document.getElementById('network-name');
        const latestBlockEl = document.getElementById('latest-block');
        const validatorsCountEl = document.getElementById('validators-count');
        
        if (!networkNameEl || !latestBlockEl || !validatorsCountEl) {
            console.error('Required DOM elements not found');
            return;
        }

        networkNameEl.textContent = network.name;
        
        try {
            const api = networkStore.getApiService();
            
            if (network.type === 'cosmos') {
                const status = await api.getStatus();
                if (!status?.sync_info?.latest_block_height) {
                    throw new Error('Invalid status response');
                }
                latestBlockEl.textContent = status.sync_info.latest_block_height;
                
                const validators = await api.getValidators();
                validatorsCountEl.textContent = validators?.length ?? 'N/A';
            } else {
                const blockNumber = await api.getLatestBlockNumber();
                latestBlockEl.textContent = blockNumber ? parseInt(blockNumber, 16) : 'N/A';
                validatorsCountEl.textContent = 'N/A';
            }
        } catch (error) {
            console.error('Error updating network info:', error);
            latestBlockEl.textContent = 'Error';
            validatorsCountEl.textContent = 'Error';
            this.toast.show('Failed to update network info', 'error');
        }
    }

    showPage(page) {
        if (!page) return;
        
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        
        // Show selected page
        const pageEl = document.getElementById(`${page}-page`);
        if (pageEl) {
            pageEl.classList.add('active');
        }
        
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`.nav-item[data-page="${page}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
        
        // Update current page and load data
        this.currentPage = page;
        this.loadPageData(page);
    }

    loadPageData(page) {
        if (!page) return;

        switch (page) {
            case 'overview':
                this.updateNetworkInfo();
                break;
            case 'blocks':
                this.loadBlocks();
                break;
            case 'transactions':
                this.loadTransactions();
                break;
            case 'validators':
                this.loadValidators();
                break;
            default:
                console.warn(`Unknown page: ${page}`);
        }
    }

    async loadBlocks() {
        const tbody = document.getElementById('blocks-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="4" class="loading">Loading blocks...</td></tr>';
        
        try {
            const api = networkStore.getApiService();
            const network = networkStore.getCurrentNetwork();
            
            if (network.type === 'cosmos') {
                const blocks = await api.getLatestBlocks(20);
                
                if (!blocks || !Array.isArray(blocks)) {
                    throw new Error('Invalid blocks data');
                }

                tbody.innerHTML = blocks.map(block => `
                    <tr>
                        <td>${block.header?.height ?? 'N/A'}</td>
                        <td>${this.formatHash(block.block_id?.hash)}</td>
                        <td>${this.formatTime(block.header?.time)}</td>
                        <td>${block.num_txs ?? 0}</td>
                    </tr>
                `).join('');
            } else {
                const blockNumber = await api.getLatestBlockNumber();
                if (!blockNumber) {
                    throw new Error('Failed to get block number');
                }
                
                const block = await api.getBlockByNumber(blockNumber, false);
                if (!block) {
                    throw new Error('Failed to get block data');
                }

                tbody.innerHTML = `
                    <tr>
                        <td>${block.number ? parseInt(block.number, 16) : 'N/A'}</td>
                        <td>${this.formatHash(block.hash)}</td>
                        <td>${this.formatTime(block.timestamp ? parseInt(block.timestamp, 16) * 1000 : null)}</td>
                        <td>${block.transactions?.length ?? 0}</td>
                    </tr>
                `;
            }
        } catch (error) {
            console.error('Error loading blocks:', error);
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="error">
                        Failed to load blocks. 
                        <button class="retry-btn" onclick="app.loadBlocks()">Retry</button>
                        <div class="error-detail">${error.message}</div>
                    </td>
                </tr>
            `;
            this.toast.show('Failed to load blocks', 'error');
        }
    }

    async loadTransactions() {
        const tbody = document.getElementById('transactions-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="4" class="loading">Loading transactions...</td></tr>';
        
        try {
            const api = networkStore.getApiService();
            const network = networkStore.getCurrentNetwork();
            
            if (network.type === 'cosmos') {
                const blocks = await api.getLatestBlocks(5);
                let transactions = [];
                
                for (const block of blocks) {
                    if (block.num_txs > 0) {
                        const blockData = await api.getBlock(block.header.height);
                        if (blockData?.block?.data?.txs) {
                            transactions.push(...blockData.block.data.txs.map(tx => ({
                                hash: tx,
                                height: block.header.height,
                                time: block.header.time
                            })));
                        }
                    }
                }
                
                tbody.innerHTML = transactions.slice(0, 20).map(tx => `
                    <tr>
                        <td>${this.formatHash(tx.hash)}</td>
                        <td>${tx.height}</td>
                        <td>${this.formatTime(tx.time)}</td>
                        <td>Transfer</td>
                    </tr>
                `).join('');
            } else {
                const blockNumber = await api.getLatestBlockNumber();
                if (!blockNumber) {
                    throw new Error('Failed to get block number');
                }
                
                const block = await api.getBlockByNumber(blockNumber, true);
                if (!block?.transactions) {
                    throw new Error('No transactions found');
                }

                tbody.innerHTML = block.transactions.slice(0, 20).map(tx => `
                    <tr>
                        <td>${this.formatHash(tx.hash)}</td>
                        <td>${block.number ? parseInt(block.number, 16) : 'N/A'}</td>
                        <td>${this.formatTime(block.timestamp ? parseInt(block.timestamp, 16) * 1000 : null)}</td>
                        <td>${tx.value ? `${tx.value} ${network.currency.symbol}` : 'N/A'}</td>
                    </tr>
                `).join('');
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="error">
                        Failed to load transactions. 
                        <button class="retry-btn" onclick="app.loadTransactions()">Retry</button>
                        <div class="error-detail">${error.message}</div>
                    </td>
                </tr>
            `;
            this.toast.show('Failed to load transactions', 'error');
        }
    }

    async loadValidators() {
        const tbody = document.getElementById('validators-table-body');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="4" class="loading">Loading validators...</td></tr>';
        
        try {
            const api = networkStore.getApiService();
            const network = networkStore.getCurrentNetwork();
            
            if (network.type === 'cosmos') {
                const validators = await api.getValidators();
                
                if (!validators || !Array.isArray(validators)) {
                    throw new Error('Invalid validators data');
                }

                tbody.innerHTML = validators.map((validator, index) => `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${this.formatHash(validator.address)}</td>
                        <td>${validator.voting_power ? parseInt(validator.voting_power) : 'N/A'}</td>
                        <td>${validator.commission?.commission_rates?.rate ? 
                            `${parseFloat(validator.commission.commission_rates.rate) * 100}%` : '0%'}</td>
                    </tr>
                `).join('');
            } else {
                tbody.innerHTML = '<tr><td colspan="4" class="info">Validators not available for EVM chains</td></tr>';
            }
        } catch (error) {
            console.error('Error loading validators:', error);
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="error">
                        Failed to load validators. 
                        <button class="retry-btn" onclick="app.loadValidators()">Retry</button>
                        <div class="error-detail">${error.message}</div>
                    </td>
                </tr>
            `;
            this.toast.show('Failed to load validators', 'error');
        }
    }

    handleSearch(query) {
        if (!query) {
            this.toast.show('Please enter a search query', 'warning');
            return;
        }

        const network = networkStore.getCurrentNetwork();
        
        if (/^\d+$/.test(query)) {
            this.showBlock(query);
        } else if (/^0x[a-fA-F0-9]{64}$/.test(query)) {
            this.showTransaction(query);
        } else if (/^[a-zA-Z0-9]{40,64}$/.test(query)) {
            this.showAddress(query);
        } else {
            this.toast.show('Invalid search query. Please enter a block height, transaction hash, or address.', 'error');
        }
    }

    async showBlock(height) {
        try {
            const block = await networkStore.getApiService().getBlock(height);
            if (!block) {
                throw new Error('Block not found');
            }
            // Implement block detail view here
            console.log('Block details:', block);
            this.toast.show(`Block ${height} details loaded`, 'success');
        } catch (error) {
            console.error('Error showing block:', error);
            this.toast.show(`Failed to load block ${height}: ${error.message}`, 'error');
        }
    }

    async showTransaction(hash) {
        try {
            let tx;
            const network = networkStore.getCurrentNetwork();
            
            if (network.type === 'cosmos') {
                tx = await networkStore.getApiService().getTransaction(hash);
            } else {
                tx = await networkStore.getApiService().getTransactionReceipt(hash);
            }
            
            if (!tx) {
                throw new Error('Transaction not found');
            }
            
            // Implement transaction detail view here
            console.log('Transaction details:', tx);
            this.toast.show(`Transaction ${this.formatHash(hash)} details loaded`, 'success');
        } catch (error) {
            console.error('Error showing transaction:', error);
            this.toast.show(`Failed to load transaction ${this.formatHash(hash)}: ${error.message}`, 'error');
        }
    }

    async showAddress(address) {
        try {
            let account;
            const network = networkStore.getCurrentNetwork();
            
            if (network.type === 'cosmos') {
                account = await networkStore.getApiService().getAccount(address);
            } else {
                const balance = await networkStore.getApiService().getAccountBalance(address);
                account = { address, balance };
            }
            
            if (!account) {
                throw new Error('Account not found');
            }
            
            // Implement account detail view here
            console.log('Account details:', account);
            this.toast.show(`Account ${this.formatHash(address)} details loaded`, 'success');
        } catch (error) {
            console.error('Error showing address:', error);
            this.toast.show(`Failed to load account ${this.formatHash(address)}: ${error.message}`, 'error');
        }
    }

    formatHash(hash, length = 8) {
        if (!hash) return 'N/A';
        const hexStr = hash.startsWith('0x') ? hash.substring(2) : hash;
        return hexStr.length > length * 2 ? 
            `0x${hexStr.substring(0, length)}...${hexStr.substring(hexStr.length - length)}` : 
            `0x${hexStr}`;
    }

    formatTime(timestamp) {
        if (!timestamp) return 'N/A';
        
        try {
            const date = new Date(timestamp);
            if (isNaN(date.getTime())) {
                return 'N/A';
            }
            return date.toLocaleString();
        } catch (e) {
            return 'N/A';
        }
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});