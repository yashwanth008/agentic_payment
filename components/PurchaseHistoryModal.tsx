
import React from 'react';
import { Transaction } from '../types';
import { generateAndDownloadCSV } from '../services/transactionService';

interface PurchaseHistoryModalProps {
  transactions: Transaction[];
  onClose: () => void;
  userId: string; // To handle user-specific actions if needed in future
}

const PurchaseHistoryModal: React.FC<PurchaseHistoryModalProps> = ({ transactions, onClose }) => {

    const handleDownload = () => {
        generateAndDownloadCSV(transactions);
    }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-w-2xl w-full text-white font-sans flex flex-col max-h-[80vh]">
        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-200">Purchase History</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-2xl"
            aria-label="Close history"
          >
            &times;
          </button>
        </header>
        <div className="p-5 overflow-y-auto flex-1">
          {transactions.length === 0 ? (
             <div className="text-center text-gray-400 py-10">
                <p>You have no past transactions.</p>
             </div>
          ) : (
            <div className="space-y-6">
                {transactions.slice().reverse().map(tx => (
                    <div key={tx.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <div className="flex justify-between items-baseline mb-3 border-b border-gray-600 pb-2">
                            <div>
                                <p className="font-semibold text-gray-300">Order Placed</p>
                                <p className="text-sm text-gray-400">{new Date(tx.timestamp).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-gray-300">Total</p>
                                <p className="text-lg font-bold text-indigo-400">${tx.total.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {tx.products.map(product => (
                                <div key={product.id} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-3">
                                        <img src={product.image} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                                        <div>
                                            <p className="text-white">{product.name}</p>
                                            <p className="text-gray-400 text-xs">{product.quantity} x ${product.price.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <p className="font-semibold text-gray-300">${(product.price * product.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
          )}
        </div>
        <footer className="p-4 border-t border-gray-700 flex-shrink-0 text-right">
             <button
                onClick={handleDownload}
                disabled={transactions.length === 0}
                className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                Download History (CSV)
            </button>
        </footer>
      </div>
    </div>
  );
};

export default PurchaseHistoryModal;