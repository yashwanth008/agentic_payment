
import { GoogleGenAI, Chat, Part, FunctionDeclaration, Type } from "@google/genai";
import { CartItem } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are Agent 2, a payment and fulfillment specialist. Your goal is to conduct a secure checkout using Stripe and provide the user with a proof-of-purchase NFT receipt via Coinbase.

1.  Your first message, which acknowledges the user's cart and total, is pre-written for you.
2.  Your first action MUST be to use the 'initiateStripePayment' function. This will present the user with a secure payment form. Do not ask for confirmation, just call the function.
3.  The system will notify you when the payment is successful by sending you a function response with a Stripe transaction ID.
4.  After receiving a successful payment confirmation, your final action MUST be to use the 'mintReceiptNFT' function. You will provide this function with the Stripe transaction ID and a summary of the order.
5.  After calling 'mintReceiptNFT', your job is done. The system will display the NFT receipt to the user. Do not add any conversational text after calling the final function.
6.  If the user wants to cancel at any point before payment is complete, acknowledge it and state that you are returning them to the shopping assistant. Do not use any functions.
`;

const initiateStripePaymentFunctionDeclaration: FunctionDeclaration = {
    name: 'initiateStripePayment',
    parameters: {
        type: Type.OBJECT,
        description: 'Presents the user with a secure Stripe form to complete their payment.',
        properties: {},
    }
};

const mintReceiptNFTFunctionDeclaration: FunctionDeclaration = {
    name: 'mintReceiptNFT',
    parameters: {
        type: Type.OBJECT,
        description: 'Mints a proof-of-purchase NFT receipt on Coinbase after a successful Stripe payment. This is the final step.',
        properties: {
             transactionId: {
                 type: Type.STRING,
                 description: 'The Stripe transaction ID for the completed payment.'
             },
             orderSummary: {
                 type: Type.STRING,
                 description: 'A brief summary of the items purchased, e.g., "MacBook Pro 14\\" (x1), iPhone 15 Pro (x1)".'
             },
             total: {
                 type: Type.NUMBER,
                 description: 'The final total amount of the purchase.'
             }
        },
        required: ['transactionId', 'orderSummary', 'total']
    }
};


export const getAgent2Chat = (cart: CartItem[]): { chat: Chat; initialMessage: string; } => {
    const total = cart.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const productNames = cart.map(p => `${p.name} (x${p.quantity})`).join(', ');
    const initialMessage = `I'm Agent 2, your payment specialist. I see you'd like to purchase: ${productNames} for a total of $${total.toFixed(2)}. Please standby while I prepare the secure Stripe payment form.`;

    const chat = ai.chats.create({
        model: 'gemini-flash-lite-latest',
        config: {
            systemInstruction: systemInstruction,
            tools: [{ functionDeclarations: [initiateStripePaymentFunctionDeclaration, mintReceiptNFTFunctionDeclaration] }]
        },
        history: [
            {
                role: 'user',
                parts: [{ text: `The user is ready to check out. Cart: [${productNames}]. Total: $${total}.` }]
            },
            {
                role: 'model',
                parts: [{ text: initialMessage }]
            }
        ]
    });
    return { chat, initialMessage };
};

export const sendMessageToAgent2 = async (message: Part[], chatSession: Chat) => {
    const result = await chatSession.sendMessage({ message });
    return result;
};