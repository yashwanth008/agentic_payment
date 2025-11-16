import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Message, Role, Product, Cart, Agent, CartItem, Transaction, NFTReceiptData, Supplier, AppUser, SearchResultsData } from '../types';
import { INITIAL_MESSAGES } from '../constants';
import { sendMessageToAgent1 } from '../services/geminiService';
import { getAgent2Chat, sendMessageToAgent2 } from '../services/paymentService';
import { searchProducts } from '../services/bestbuyService';
import { mintReceiptNFT } from '../services/coinbaseService';
import { loadTransactions, saveTransaction } from '../services/transactionService';
import { loadCart, saveCart } from '../services/cartService';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';
import CartSidebar from './CartSidebar';
import PurchaseHistoryModal from './PurchaseHistoryModal';
import StripePaymentForm from './StripePaymentForm';
import MockEmail from './MockEmail';
import { GenerateContentResponse, Chat, Part } from '@google/genai';
import { useAuth } from '../context/AuthContext';

// Fix: Add type definitions for the Web Speech API to resolve TypeScript errors.
// This API is not part of the standard DOM typings.
interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    start(): void;
    stop(): void;
}

interface SpeechRecognitionStatic {
    new (): SpeechRecognition;
}

interface ShoppingPageProps {
    user: AppUser;
}

// Extend window type for webkitSpeechRecognition
declare global {
    interface Window {
        // Fix: Use the defined SpeechRecognitionStatic interface for the constructor.
        SpeechRecognition: SpeechRecognitionStatic;
        webkitSpeechRecognition: SpeechRecognitionStatic;
    }
}

const ShoppingPage: React.FC<ShoppingPageProps> = ({ user }) => {
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [cart, setCart] = useState<Cart>({ products: [] });
    const [currentAgent, setCurrentAgent] = useState<Agent>(Agent.AGENT_1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [agent2Chat, setAgent2Chat] = useState<Chat | null>(null);
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isOrderCompleted, setIsOrderCompleted] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [showEmailNotification, setShowEmailNotification] = useState(false);
    const [lastCompletedTransaction, setLastCompletedTransaction] = useState<Transaction | null>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const { logout } = useAuth();
    
    // Ref to hold the latest handleSubmit function to avoid stale closures in event handlers
    // FIX: Explicitly initialize useRef with null to avoid ambiguity with function overloads which can cause a TypeScript error.
    const handleSubmitRef = useRef<((input: string) => void) | null>(null);

    useEffect(() => {
        setTransactions(loadTransactions(user.uid));
        setCart(loadCart(user.uid));
    }, [user.uid]);

    useEffect(() => {
        if (!isOrderCompleted) {
             saveCart(user.uid, cart);
        }
    }, [cart, user.uid, isOrderCompleted]);

    const addMessage = (role: Role, content: string | NFTReceiptData | SearchResultsData) => {
        setMessages(prev => [...prev, { id: Date.now().toString() + Math.random(), role, content }]);
    };
    
    const resetApp = useCallback(() => {
        setMessages(INITIAL_MESSAGES);
        setCart({ products: [] });
        setCurrentAgent(Agent.AGENT_1);
        setIsLoading(false);
        setAgent2Chat(null);
        setSearchResults([]);
        setIsOrderCompleted(false);
        setShowEmailNotification(false);
        setLastCompletedTransaction(null);
    }, []);

    const handleQuantityChange = (productId: string, newQuantity: number) => {
        setCart(prevCart => {
            const newProducts = [...prevCart.products];
            const productIndex = newProducts.findIndex(p => p.id === productId);

            if (productIndex > -1) {
                if (newQuantity > 0) {
                    newProducts[productIndex].quantity = newQuantity;
                } else {
                    newProducts.splice(productIndex, 1);
                }
            }
            return { products: newProducts };
        });
    };

    const handleCancelPayment = () => {
        setCurrentAgent(Agent.AGENT_1);
        setAgent2Chat(null);
        setIsPaymentModalOpen(false);
        addMessage(Role.SYSTEM, "Payment cancelled. You can continue shopping.");
    };

    const processAgent2FunctionCall = useCallback(async (response: GenerateContentResponse) => {
        if (!response.functionCalls || response.functionCalls.length === 0) {
            if (response.text) {
                addMessage(Role.AGENT_2, response.text);
            }
            setIsLoading(false);
            return;
        }
    
        const functionCall = response.functionCalls[0];
    
        if (functionCall.name === 'initiateStripePayment') {
            setIsPaymentModalOpen(true);
            // Loading state will be managed by the modal interaction
        } else if (functionCall.name === 'mintReceiptNFT') {
            const { transactionId, orderSummary, total } = functionCall.args;
            addMessage(Role.SYSTEM, 'Minting your proof-of-purchase NFT receipt...');

            const nftDetails = await mintReceiptNFT(transactionId as string, orderSummary as string, total as number);
            
            const nftReceiptMessage: NFTReceiptData = {
                type: 'NFT_RECEIPT',
                orderSummary: orderSummary as string,
                total: total as number,
                transactionId: transactionId as string,
                ...nftDetails
            };
            
            addMessage(Role.AGENT_2, nftReceiptMessage);

            const newTransaction: Transaction = {
                id: transactionId as string,
                timestamp: Date.now(),
                products: cart.products,
                total: total as number,
            };

            if (user.isAnonymous) {
                setTransactions(prev => [...prev, newTransaction]);
            } else {
                const updatedTransactions = saveTransaction(user.uid, newTransaction);
                setTransactions(updatedTransactions);
            }
            setLastCompletedTransaction(newTransaction);
            setShowEmailNotification(true);
            setCart({ products: [] }); 
            saveCart(user.uid, { products: [] });
            setIsOrderCompleted(true);
            setAgent2Chat(null);
            setIsLoading(false);
        }
    
    }, [cart.products, user.uid, user.isAnonymous]);

    const handleStripePaymentSuccess = async (stripeTxId: string) => {
        setIsPaymentModalOpen(false);
        setIsLoading(true);
        addMessage(Role.SYSTEM, 'Stripe payment successful. Finalizing order...');

        const functionResponsePart: Part = {
            functionResponse: {
                name: 'initiateStripePayment',
                response: { status: 'success', transactionId: stripeTxId }
            }
        };

        if (agent2Chat) {
            try {
                const nextResponse = await sendMessageToAgent2([functionResponsePart], agent2Chat);
                await processAgent2FunctionCall(nextResponse);
            } catch (error) {
                 console.error("Error processing post-payment step:", error);
                 addMessage(Role.SYSTEM, "There was an error finalizing your order after payment. Please contact support.");
                 setIsLoading(false);
            }
        }
    }

    const handleCheckout = useCallback(async () => {
        setIsLoading(true);
        addMessage(Role.SYSTEM, 'Transferring to secure payment agent...');

        const { chat, initialMessage } = getAgent2Chat(cart.products);
        setAgent2Chat(chat);
        addMessage(Role.AGENT_2, initialMessage);
        setCurrentAgent(Agent.AGENT_2);

        // Agent 2's first move is always to call a function. We kick it off.
        const firstMessage: Part[] = [{ text: "Proceed with checkout." }];
        try {
            const response = await sendMessageToAgent2(firstMessage, chat);
            await processAgent2FunctionCall(response);
        } catch (error) {
            console.error("Error initiating checkout:", error);
            addMessage(Role.SYSTEM, "Could not start the payment process. Please try again.");
            setIsLoading(false);
        }
    }, [cart.products, processAgent2FunctionCall]);

    const findCheapestSupplier = (suppliers: Supplier[]): Supplier => {
       return suppliers.reduce((cheapest, current) => current.price < cheapest.price ? current : cheapest, suppliers[0]);
    };

    const processAgent1FunctionCall = useCallback(async (response: GenerateContentResponse) => {
        if (!response.functionCalls || response.functionCalls.length === 0) {
            if (response.text) {
                addMessage(Role.AGENT_1, response.text);
            }
            return;
        }
    
        const hasSearchCall = response.functionCalls.some(fc => fc.name === 'searchBestBuy');
        if (hasSearchCall) {
            const searchCall = response.functionCalls.find(fc => fc.name === 'searchBestBuy')!;
            const query = searchCall.args.query as string;
            addMessage(Role.SYSTEM, `Searching for "${query}"...`);
            const products = searchProducts(query);
            setSearchResults(products);
            
            if (products.length > 0) {
                addMessage(Role.AGENT_1, { type: 'SEARCH_RESULTS', products });
            }
    
            const functionResponsePart: Part = {
                functionResponse: {
                    name: 'searchBestBuy',
                    response: { products: products.map(({ id, name, suppliers }) => ({ id, name, bestPrice: findCheapestSupplier(suppliers).price })) }
                }
            };
            
            const nextResponse = await sendMessageToAgent1([functionResponsePart], cart.products, products);
            await processAgent1FunctionCall(nextResponse);
            return;
        }
    
        if (response.functionCalls.some(fc => fc.name === 'startCheckout')) {
            await handleCheckout();
            setSearchResults([]);
            return;
        }
    
        const cartUpdateCalls = response.functionCalls.filter(fc => fc.name === 'updateCartItem');
        if (cartUpdateCalls.length > 0) {
            const newCartProducts = [...cart.products];
            let confirmationMessage = '';

            for (const fc of cartUpdateCalls) {
                const itemToUpdate = fc.args as unknown as CartItem;
                const existingItemIndex = newCartProducts.findIndex(p => p.id === itemToUpdate.id);
                const newQuantity = itemToUpdate.quantity;

                if (existingItemIndex > -1) {
                    if (newQuantity > 0) {
                        newCartProducts[existingItemIndex].quantity = newQuantity;
                        confirmationMessage = `Updated ${itemToUpdate.name} quantity to ${newQuantity}.`;
                    } else {
                        newCartProducts.splice(existingItemIndex, 1);
                        confirmationMessage = `Removed ${itemToUpdate.name} from your cart.`
                    }
                } else if (newQuantity > 0) {
                    newCartProducts.push({ ...itemToUpdate, quantity: newQuantity });
                    confirmationMessage = `I've added ${itemToUpdate.name} to your cart from ${itemToUpdate.supplier} for $${itemToUpdate.price.toFixed(2)}.`;
                }
            }
            
            setCart({ products: newCartProducts });
            addMessage(Role.AGENT_1, confirmationMessage);
            setSearchResults([]);
        }
    
    }, [handleCheckout, cart.products]);
    
    const handleAddToCartFromSearch = (item: CartItem) => {
        setCart(prevCart => {
            const newCartProducts = [...prevCart.products];
            const existingItemIndex = newCartProducts.findIndex(p => p.id === item.id);

            if (existingItemIndex > -1) {
                newCartProducts[existingItemIndex].quantity += 1;
            } else {
                newCartProducts.push({ ...item, quantity: 1 });
            }
            return { products: newCartProducts };
        });
        
        addMessage(Role.SYSTEM, `Added ${item.name} to your cart.`);
        setSearchResults([]); // Clear search results from agent context
    };

    const handleAgent1Submit = useCallback(async (input: string) => {
        setIsLoading(true);
        addMessage(Role.USER, input);
        try {
            const response = await sendMessageToAgent1(input, cart.products, searchResults);
            await processAgent1FunctionCall(response);
        } catch (error) {
            console.error("Error sending message to Agent 1:", error);
            addMessage(Role.SYSTEM, "Sorry, an unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [cart.products, searchResults, processAgent1FunctionCall]);

    const handleSubmit = useCallback((input: string) => {
        if (isLoading || !input.trim()) return;
        
        setInputValue('');

        if (isOrderCompleted) {
            if (input.toLowerCase() === 'next') {
                resetApp();
            }
            return;
        }

        if (currentAgent === Agent.AGENT_1) {
            handleAgent1Submit(input);
        }
        // Agent 2 interaction is handled by functions, no text input needed
    }, [isLoading, isOrderCompleted, currentAgent, handleAgent1Submit, resetApp]);
    
    // Keep the ref updated with the latest handleSubmit function
    useEffect(() => {
        handleSubmitRef.current = handleSubmit;
    }, [handleSubmit]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognitionInstance = new SpeechRecognition();
            recognitionInstance.continuous = false;
            recognitionInstance.interimResults = false;
            recognitionInstance.lang = 'en-US';

            recognitionInstance.onstart = () => setIsListening(true);
            recognitionInstance.onend = () => setIsListening(false);
            recognitionInstance.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };
            recognitionInstance.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                if (transcript.trim()) {
                    // Use the ref to call the latest version of handleSubmit
                    handleSubmitRef.current?.(transcript.trim());
                }
            };
            recognitionRef.current = recognitionInstance;
        } else {
            console.warn("Speech recognition not supported by this browser.");
        }
        return () => {
            recognitionRef.current?.stop();
        };
    }, []); // Empty dependency array ensures this runs only once

    const handleMicClick = () => {
        if (isLoading || (currentAgent === Agent.AGENT_2 && !isOrderCompleted) || !recognitionRef.current) {
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };


    const getInputPlaceholder = () => {
        if (isListening) return "Listening...";
        if (isLoading) return "Agent is thinking...";
        if (isOrderCompleted) return "Type 'next' to start a new order.";
        if (currentAgent === Agent.AGENT_2) return 'Please complete payment using the Stripe form...';
        return 'What are you looking for today?';
    };
    
    return (
        <div className="bg-gray-900 text-white flex flex-col h-screen font-sans">
            {isHistoryModalOpen && (
                <PurchaseHistoryModal 
                    transactions={transactions} 
                    onClose={() => setIsHistoryModalOpen(false)}
                    userId={user.uid}
                />
            )}
            {isPaymentModalOpen && (
                <StripePaymentForm 
                    user={user}
                    cart={cart}
                    onPaymentSuccess={handleStripePaymentSuccess}
                    onClose={handleCancelPayment}
                />
            )}
            {showEmailNotification && lastCompletedTransaction && (
                <MockEmail
                    transaction={lastCompletedTransaction}
                    user={user}
                    onClose={() => setShowEmailNotification(false)}
                />
            )}
            <header className="bg-gray-800 p-4 shadow-md z-10">
                 <div className="flex justify-between items-center max-w-7xl mx-auto">
                    <div className="text-left">
                         <h1 className="text-xl font-bold text-indigo-400">Agentic Checkout</h1>
                         <p className="text-xs text-gray-400 mt-1">
                            Current Agent: <span className="font-semibold text-white">{currentAgent === Agent.AGENT_1 ? 'Shopping Assistant' : 'Payment Specialist'}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-gray-300">
                             Welcome, <span className="font-semibold text-white">{user.isAnonymous ? 'Guest' : user.displayName || user.email}</span>
                        </p>
                        <button
                            onClick={logout}
                            className={`${user.isAnonymous ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-red-600 hover:bg-red-500'} text-white text-xs font-bold py-1 px-3 rounded-md transition-colors`}
                            aria-label={user.isAnonymous ? 'Sign In' : 'Logout'}
                        >
                            {user.isAnonymous ? 'Sign In' : 'Logout'}
                        </button>
                    </div>
                </div>
            </header>
            <main className="flex flex-1 min-h-0">
                <div className="flex-1 flex flex-col">
                    <ChatWindow 
                        messages={messages} 
                        isLoading={isLoading} 
                        onAddToCart={handleAddToCartFromSearch}
                    />
                    <ChatInput
                        onSubmit={handleSubmit}
                        value={inputValue}
                        onValueChange={setInputValue}
                        disabled={isLoading || (currentAgent === Agent.AGENT_2 && !isOrderCompleted)}
                        placeholder={getInputPlaceholder()}
                        error={""}
                        isListening={isListening}
                        onMicClick={handleMicClick}
                    />
                </div>
                <aside className="w-full md:w-1/3 max-w-sm flex-shrink-0 hidden md:flex">
                    <CartSidebar 
                        cart={cart} 
                        onCheckout={handleCheckout} 
                        isCheckoutActive={currentAgent === Agent.AGENT_2}
                        onCancelPayment={handleCancelPayment}
                        onQuantityChange={handleQuantityChange}
                        onViewHistory={() => setIsHistoryModalOpen(true)}
                    />
                </aside>
            </main>
        </div>
    );
};

export default ShoppingPage;