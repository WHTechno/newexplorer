import networkStore from '../stores/networkStore';
import { NETWORKS } from '../config/networks';

class NetworkSwitcher {
    constructor() {
        this.element = document.getElementById('network-switcher');
        this.availableNetworks = Object.values(NETWORKS)
            .flatMap(n => [n.testnet, n.mainnet].filter(Boolean));
        
        this.render();
        this.setupEvents();
    }

    render() {
        this.element.innerHTML = `
            <select class="network-select">
                ${this.availableNetworks.map(network => `
                    <option value="${network.id}" ${network.id === networkStore.getCurrentNetwork().id ? 'selected' : ''}>
                        ${network.name}
                    </option>
                `).join('')}
            </select>
        `;
    }

    setupEvents() {
        this.element.querySelector('.network-select').addEventListener('change', async (e) => {
            try {
                await networkStore.switchNetwork(e.target.value);
                document.getElementById('page-title').textContent = `${networkStore.getCurrentNetwork().name} Explorer`;
                document.title = `${networkStore.getCurrentNetwork().name} Explorer`;
            } catch (error) {
                console.error('Failed to switch network:', error);
                this.showError(error.message);
            }
        });
    }

    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.getElementById('toast-container').appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

export default NetworkSwitcher;