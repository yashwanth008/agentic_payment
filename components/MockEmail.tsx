import React from 'react';
import { Transaction, AppUser } from '../types';

interface MockEmailProps {
  transaction: Transaction;
  user: AppUser;
  onClose: () => void;
}

const MockEmail: React.FC<MockEmailProps> = ({ transaction, user, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fade-in-slow">
      <div className="bg-gray-200 rounded-lg shadow-2xl max-w-2xl w-full text-gray-900 font-sans flex flex-col max-h-[90vh] animate-slide-up-slow">
        <header className="bg-gray-300 p-3 flex items-center justify-between rounded-t-lg border-b border-gray-400">
           <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
           </div>
           <p className="text-sm text-gray-600 font-medium">New Message</p>
           <div className="w-12"></div>
        </header>

        <div className="p-6 border-b border-gray-300">
            <p className="text-sm text-gray-600">
                <span className="font-semibold">From:</span> Agentic Checkout &lt;orders@agentic.dev&gt;
            </p>
            <p className="text-sm text-gray-600 mt-1">
                <span className="font-semibold">To:</span> {user.displayName || 'Valued Customer'} &lt;{user.email || 'customer@email.com'}&gt;
            </p>
            <h2 className="text-2xl font-bold text-gray-800 mt-4">
                Subject: Your Agentic Checkout Order is Confirmed!
            </h2>
             <p className="text-sm text-gray-600 mt-1">
                Transaction ID: <span className="font-mono text-gray-800">{transaction.id}</span>
            </p>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-white">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Thank you for your purchase!</h3>
          <p className="text-gray-700 mb-6">
            We've received your order and our agents are preparing it for an entirely simulated delivery. You can view your NFT receipt in the chat.
          </p>
          
          <div className="border border-gray-300 rounded-lg">
            <h4 className="font-semibold p-3 bg-gray-100 border-b border-gray-300 rounded-t-lg">Order Summary</h4>
            <div className="space-y-3 p-4">
              {transaction.products.map(product => (
                <div key={product.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <img src={product.image} alt={product.name} className="w-12 h-12 rounded-md object-cover border border-gray-200" />
                    <div>
                      <p className="font-semibold text-gray-800">{product.name}</p>
                      <p className="text-gray-600">{product.quantity} x ${product.price.toFixed(2)}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-800">${(product.price * product.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center p-4 bg-gray-100 border-t border-gray-300 rounded-b-lg">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-lg text-indigo-600">${transaction.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <footer className="p-4 border-t border-gray-300 text-right bg-gray-200 rounded-b-lg">
          <button
            onClick={onClose}
            className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Close
          </button>
        </footer>
      </div>
       <style>{`
            @keyframes fade-in-slow { from { opacity: 0; } to { opacity: 1; } }
            .animate-fade-in-slow { animation: fade-in-slow 0.5s ease-out forwards; }
            @keyframes slide-up-slow { from { transform: translateY(30px) scale(0.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
            .animate-slide-up-slow { animation: slide-up-slow 0.6s ease-out forwards; }
        `}</style>
    </div>
  );
};

export default MockEmail;
