
import React from 'react';
import { Cart } from '../types';
import ProductCard from './ProductCard';

interface CartSidebarProps {
    cart: Cart;
    onCheckout: () => void;
    onCancelPayment: () => void;
    isCheckoutActive: boolean;
    onQuantityChange: (productId: string, newQuantity: number) => void;
    onViewHistory: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ cart, onCheckout, onCancelPayment, isCheckoutActive, onQuantityChange, onViewHistory }) => {
    const total = cart.products.reduce((sum, product) => sum + (product.price * product.quantity), 0);

    return (
        <div className="w-full h-full bg-gray-800 border-l border-gray-700 flex flex-col p-4">
            <div className="flex justify-between items-center mb-4 border-b border-gray-600 pb-3">
                 <h2 className="text-xl font-bold text-gray-200">
                    Your Cart
                </h2>
                <button
                    onClick={onViewHistory}
                    className="text-sm text-indigo-400 hover:text-indigo-300 font-semibold"
                    title="View purchase history"
                >
                    View History
                </button>
            </div>
           
            {cart.products.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="font-semibold">Your cart is empty</p>
                    <p className="text-sm">Start a conversation to add items.</p>
                </div>
            ) : (
                <>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 -mr-2">
                        {cart.products.map((product) => (
                            <ProductCard 
                                key={product.id} 
                                product={product} 
                                onQuantityChange={onQuantityChange}
                                disabled={isCheckoutActive}
                            />
                        ))}
                    </div>
                    <div className="border-t border-gray-600 mt-4 pt-4">
                        <div className="flex justify-between items-center text-gray-300 mb-2">
                            <span>Subtotal</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center font-bold text-white text-lg">
                            <span>Total</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        {isCheckoutActive ? (
                             <button
                                onClick={onCancelPayment}
                                className="w-full bg-red-600 text-white font-bold py-3 rounded-lg mt-4 hover:bg-red-500 transition-colors"
                            >
                                Cancel Payment
                            </button>
                        ) : (
                            <button
                                onClick={onCheckout}
                                disabled={cart.products.length === 0}
                                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg mt-4 hover:bg-indigo-500 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Proceed to Checkout
                            </button>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default CartSidebar;
