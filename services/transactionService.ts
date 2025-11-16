import { CartItem, Transaction } from '../types';

const TRANSACTIONS_KEY_PREFIX = 'agentic-checkout-transactions-';

export const loadTransactions = (userId: string): Transaction[] => {
    if (!userId || userId.startsWith('guest-')) {
        return [];
    }
    try {
        const data = localStorage.getItem(TRANSACTIONS_KEY_PREFIX + userId);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Failed to load transactions from localStorage", error);
        return [];
    }
};

export const saveTransaction = (userId: string, newTransaction: Transaction): Transaction[] => {
    if (!userId || userId.startsWith('guest-')) {
        console.warn("saveTransaction should not be called for a guest user.");
        return [];
    }
    
    const transactions = loadTransactions(userId);
    const updatedTransactions = [...transactions, newTransaction];
    
    try {
        localStorage.setItem(TRANSACTIONS_KEY_PREFIX + userId, JSON.stringify(updatedTransactions));
    } catch (error) {
        console.error("Failed to save transaction to localStorage", error);
    }
    
    return updatedTransactions;
};

export const generateAndDownloadCSV = (transactions: Transaction[]) => {
    const header = "Transaction ID,Date,Transaction Total,Product Name,Quantity,Price Per Item\n";
    const rows = transactions.flatMap(tx => 
        tx.products.map(p => 
            [
                tx.id,
                new Date(tx.timestamp).toLocaleString(),
                tx.total.toFixed(2),
                `"${p.name.replace(/"/g, '""')}"`, // Escape quotes in product name
                p.quantity,
                p.price.toFixed(2)
            ].join(',')
        )
    ).join('\n');

    const csvContent = header + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "transactions.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};