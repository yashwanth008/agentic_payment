
import { GoogleGenAI, Chat, FunctionDeclaration, Type, Part } from "@google/genai";
import { Product, CartItem, Supplier } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are Agent 1, a friendly and astute shopping assistant for an electronics store.
Your goal is to help users find products and manage their cart while finding them the best possible price.

1.  Start by asking the user what they are looking for.
2.  When the user specifies a product (e.g., "laptop"), you MUST use the 'searchBestBuy' function.
3.  The results will include multiple suppliers for each product, each with a different price. You MUST analyze these suppliers and identify the one with the lowest price.
4.  Present the search results to the user, and you can mention that you've found the best price for them.
5.  To add, update, or remove items from the cart, you MUST use the 'updateCartItem' function. When adding an item, you MUST use the product details (id, name, image) along with the price and supplier name from the CHEAPEST supplier you identified.
    - Example 1: Cart is empty. User says "add the macbook". You find the cheapest supplier is 'Supplier B' at $1949. You call 'updateCartItem' for the macbook with price: 1949, quantity: 1, and supplier: 'Supplier B'.
    - Example 2: Cart has "Headphones (x1)". User says "add another one". You call 'updateCartItem' for headphones with quantity: 2.
    - Example 3: Cart has "Headphones (x1)". User says "remove it". You call 'updateCartItem' for headphones with quantity: 0.
6.  If a user asks to perform multiple cart actions, make multiple, parallel 'updateCartItem' function calls.
7.  When the user is ready to checkout (e.g., "let's checkout"), you MUST use the 'startCheckout' function.
8.  The system will provide a single confirmation message after your requested cart updates.
9.  Do not answer questions unrelated to shopping. Gently guide users back to the shopping experience.
`;

const searchBestBuyFunctionDeclaration: FunctionDeclaration = {
    name: 'searchBestBuy',
    parameters: {
        type: Type.OBJECT,
        description: 'Searches for products based on a user\'s query.',
        properties: {
            query: {
                type: Type.STRING,
                description: 'The product or category to search for (e.g., "laptop", "iPhone").',
            }
        },
        required: ['query']
    }
};

const updateCartItemFunctionDeclaration: FunctionDeclaration = {
    name: 'updateCartItem',
    parameters: {
        type: Type.OBJECT,
        description: 'Adds, updates, or removes an item from the cart by setting its new quantity. To remove an item, set its quantity to 0.',
        properties: {
             id: { type: Type.STRING, description: 'The product ID.'},
             name: { type: Type.STRING, description: 'The product name.' },
             price: { type: Type.NUMBER, description: 'The price from the chosen supplier.'},
             image: { type: Type.STRING, description: 'URL of the product image.'},
             quantity: { type: Type.NUMBER, description: 'The new total quantity for the item. Setting it to 0 will remove the item from the cart.'},
             supplier: { type: Type.STRING, description: 'The name of the supplier chosen for the best price.'}
        },
        required: ['id', 'name', 'price', 'image', 'quantity', 'supplier']
    }
};


const startCheckoutFunctionDeclaration: FunctionDeclaration = {
    name: 'startCheckout',
    parameters: {
        type: Type.OBJECT,
        properties: {},
        description: 'Initiates the checkout process by handing over to the payment agent.'
    }
};

let chat: Chat | null = null;

export const getAgent1Chat = (): Chat => {
    if (!chat) {
        chat = ai.chats.create({
            model: 'gemini-flash-lite-latest',
            config: {
                systemInstruction: systemInstruction,
                tools: [{ functionDeclarations: [searchBestBuyFunctionDeclaration, updateCartItemFunctionDeclaration, startCheckoutFunctionDeclaration] }]
            },
        });
    }
    return chat;
};

// A helper to find the cheapest supplier
const findCheapestSupplier = (suppliers: Supplier[]): Supplier => {
    return suppliers.reduce((cheapest, current) => current.price < cheapest.price ? current : cheapest, suppliers[0]);
};

export const sendMessageToAgent1 = async (message: string | Part[], currentCart: CartItem[], searchResults: Product[]) => {
    const chatSession = getAgent1Chat();

    if (typeof message === 'string') {
        let searchContext = '';
        if (searchResults.length > 0) {
            // Give the agent the full data, including all suppliers, so it can reason about the best price.
            const fullDataForAgent = JSON.stringify(searchResults);
            
            searchContext = `IMPORTANT CONTEXT: You have just shown the user a list of products. Here is the full JSON data for those products, including all available suppliers and their prices: ${fullDataForAgent}. When the user picks an item, you MUST find the cheapest supplier from the list and use its details (name, price) for the 'updateCartItem' function call.`;
        }
        
        const prompt = `${searchContext}\n\nCurrent cart is: ${JSON.stringify(currentCart)}. User says: "${message}"`;
        
        const result = await chatSession.sendMessage({ message: prompt });
        return result;
    } else {
        // It's a function response (Part[])
        const result = await chatSession.sendMessage({ message });
        return result;
    }
};