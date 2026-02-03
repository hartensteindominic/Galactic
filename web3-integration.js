// Web3 integration code

async function connectToMetaMask() {
    if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('Connected to', accounts[0]);
    }
}

async function processPayment(amount) {
    // Ethereum payment logic here
}

function manageSubscription() {
    // Subscription management logic
}

// Event handlers for modal control and account change
window.ethereum.on('accountsChanged', manageSubscription);
