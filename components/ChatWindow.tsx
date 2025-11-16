
import React, { useEffect, useRef } from 'react';
import { Message as MessageType, Role, CartItem } from '../types';
import Message from './Message';

interface ChatWindowProps {
    messages: MessageType[];
    isLoading: boolean;
    onAddToCart: (item: CartItem) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, onAddToCart }) => {
    const endOfMessagesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {messages.map((msg) => (
                <Message 
                    key={msg.id} 
                    message={msg} 
                    onAddToCart={onAddToCart}
                    disabled={isLoading}
                />
            ))}
            {isLoading && (
                 <div className="flex items-center space-x-2 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0"></div>
                    <div className="p-3 bg-gray-700 rounded-lg max-w-sm">
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                </div>
            )}
            <div ref={endOfMessagesRef} />
        </div>
    );
};

export default ChatWindow;