
import React from 'react';
import { Product, CartItem } from '../types';
import SearchResultCard from './SearchResultCard';

interface SearchResultsDisplayProps {
    products: Product[];
    onAddToCart: (item: CartItem) => void;
    disabled: boolean;
}

const SearchResultsDisplay: React.FC<SearchResultsDisplayProps> = ({ products, onAddToCart, disabled }) => {
    if (!products || products.length === 0) {
        return <p className="text-gray-400 italic">No products found.</p>;
    }
    
    return (
        <div className="space-y-3 pt-2">
            {products.map(product => (
                <SearchResultCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    disabled={disabled}
                />
            ))}
        </div>
    );
};

export default SearchResultsDisplay;