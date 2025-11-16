
import React from 'react';
import { CartItem } from '../types';
import TrashIcon from './icons/TrashIcon';

interface ProductCardProps {
    product: CartItem;
    onQuantityChange: (productId: string, newQuantity: number) => void;
    disabled: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onQuantityChange, disabled }) => {

    const handleDecrement = () => {
        onQuantityChange(product.id, product.quantity - 1);
    };

    const handleIncrement = () => {
        onQuantityChange(product.id, product.quantity + 1);
    };

    const handleRemove = () => {
        onQuantityChange(product.id, 0);
    };

    return (
        <div className={`flex items-center bg-gray-800/50 p-2 rounded-lg gap-3 ${disabled ? 'opacity-60' : ''}`}>
            <img src={product.image} alt={product.name} className="w-14 h-14 rounded-md object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-white truncate">{product.name}</p>
                <p className="text-xs text-gray-400 mt-1">${product.price.toFixed(2)} ea. from <span className="font-medium text-gray-300">{product.supplier}</span></p>
            </div>
            <div className="flex flex-col items-end">
                <div className="font-semibold text-white text-sm w-16 text-right mb-1">
                    ${(product.price * product.quantity).toFixed(2)}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDecrement}
                        disabled={disabled}
                        className="bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-gray-300 hover:bg-gray-600 transition-colors disabled:cursor-not-allowed"
                        aria-label={`Decrease quantity of ${product.name}`}
                    >
                        -
                    </button>
                    <span className="text-sm text-white font-medium w-4 text-center">{product.quantity}</span>
                    <button
                        onClick={handleIncrement}
                        disabled={disabled}
                        className="bg-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-gray-300 hover:bg-gray-600 transition-colors disabled:cursor-not-allowed"
                        aria-label={`Increase quantity of ${product.name}`}
                    >
                        +
                    </button>
                    <button
                        onClick={handleRemove}
                        disabled={disabled}
                        className="text-gray-500 hover:text-red-400 transition-colors w-6 h-6 flex items-center justify-center disabled:cursor-not-allowed disabled:hover:text-gray-500"
                        aria-label={`Remove ${product.name} from cart`}
                    >
                        <TrashIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;