
import React from 'react';
import { Product, CartItem, Supplier } from '../types';
import AddToCartIcon from './icons/AddToCartIcon';

interface SearchResultCardProps {
    product: Product;
    onAddToCart: (item: CartItem) => void;
    disabled: boolean;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({ product, onAddToCart, disabled }) => {
    
    const findCheapestSupplier = (suppliers: Supplier[]): Supplier => {
        if (!suppliers || suppliers.length === 0) {
            return { name: 'N/A', price: 0 };
        }
        return suppliers.reduce((cheapest, current) => current.price < cheapest.price ? current : cheapest, suppliers[0]);
    };

    const cheapestSupplier = findCheapestSupplier(product.suppliers);

    const handleAddToCart = () => {
        const cartItem: CartItem = {
            id: product.id,
            name: product.name,
            price: cheapestSupplier.price,
            image: product.image,
            quantity: 1, // Quick add adds 1
            supplier: cheapestSupplier.name,
        };
        onAddToCart(cartItem);
    };

    return (
        <div className="flex items-center bg-gray-800/50 p-3 rounded-lg gap-4">
            <img src={product.image} alt={product.name} className="w-20 h-20 rounded-md object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{product.name}</p>
                <p className="text-sm text-gray-300 mt-1">
                    Best price: <span className="font-bold text-lg text-indigo-400">${cheapestSupplier.price.toFixed(2)}</span>
                </p>
                 <p className="text-xs text-gray-400">from {cheapestSupplier.name}</p>
            </div>
            <button
                onClick={handleAddToCart}
                disabled={disabled}
                className="bg-indigo-600 text-white font-bold py-2 px-3 rounded-lg hover:bg-indigo-500 transition-colors flex items-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
                aria-label={`Add ${product.name} to cart`}
            >
                <AddToCartIcon />
                <span>Add</span>
            </button>
        </div>
    );
};

export default SearchResultCard;