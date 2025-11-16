
import React from 'react';
import { NFTReceiptData } from '../types';
import CoinbaseIcon from './icons/CoinbaseIcon';

interface NFTReceiptProps {
  receipt: NFTReceiptData;
}

const NFTReceipt: React.FC<NFTReceiptProps> = ({ receipt }) => {
  return (
    <div className="flex justify-start my-4">
        <div className="bg-gray-700 rounded-2xl rounded-bl-none max-w-sm w-full overflow-hidden shadow-lg border border-gray-600/50">
            <div className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex-shrink-0 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Purchase Confirmed!</h3>
                        <p className="text-sm text-gray-300">Your NFT receipt has been minted.</p>
                    </div>
                </div>
            </div>
            <img src={receipt.nftUrl} alt="NFT Receipt" className="w-full h-auto object-cover aspect-square bg-gray-800" />
             <div className="p-4 space-y-3 text-sm">
                <p className="text-gray-200 font-medium">{receipt.orderSummary}</p>
                 <div className="flex justify-between items-center text-gray-300">
                    <span>Total Paid</span>
                    <span className="font-bold text-white text-base">${receipt.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-300">
                    <span>Stripe TX ID</span>
                    <span className="font-mono text-xs bg-gray-800 px-1 py-0.5 rounded">{receipt.transactionId.slice(0, 10)}...</span>
                </div>
                 <div className="pt-2 border-t border-gray-600 flex items-center gap-3">
                    <a href={receipt.explorerUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-md transition-colors text-xs">
                        View Transaction
                    </a>
                    <a href={receipt.nftUrl} target="_blank" rel="noopener noreferrer" className="flex-1 text-center bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2 text-xs">
                       <CoinbaseIcon /> View on Coinbase
                    </a>
                </div>
            </div>
        </div>
    </div>
  );
};

export default NFTReceipt;
