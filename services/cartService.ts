
import { Cart } from '../types';

const CART_KEY_PREFIX = 'agentic-checkout-cart-';

export const loadCart = (userId: string): Cart => {
    if (!userId || userId.startsWith('guest-')) {
        return { products: [] };
    }
    try {
        const data = localStorage.getItem(CART_KEY_PREFIX + userId);
        return data ? JSON.parse(data) : { products: [] };
    } catch (error) {
        console.error("Failed to load cart from localStorage", error);
        return { products: [] };
    }
};

export const saveCart = (userId: string, cart: Cart): void => {
    if (!userId || userId.startsWith('guest-')) {
        return;
    }
    try {
        localStorage.setItem(CART_KEY_PREFIX + userId, JSON.stringify(cart));
    } catch (error) {
        console.error("Failed to save cart to localStorage", error);
    }
};
