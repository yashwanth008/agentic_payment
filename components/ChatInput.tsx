
import React from 'react';
import SendIcon from './icons/SendIcon';
import MicrophoneIcon from './icons/MicrophoneIcon';

interface ChatInputProps {
    onSubmit: (input: string) => void;
    value: string;
    onValueChange: (value: string) => void;
    disabled: boolean;
    placeholder: string;
    error?: string;
    isListening: boolean;
    onMicClick: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSubmit, value, onValueChange, disabled, placeholder, error, isListening, onMicClick }) => {

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(value);
    };

    return (
        <div className="bg-gray-800 p-4 border-t border-gray-700">
            <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onValueChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-full py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
                 <button
                    type="button"
                    onClick={onMicClick}
                    disabled={disabled}
                    className={`p-3 rounded-full transition-colors duration-200 ${isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-gray-600 text-white hover:bg-gray-500'} disabled:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50`}
                    aria-label={isListening ? 'Stop listening' : 'Start listening'}
                >
                    <MicrophoneIcon />
                </button>
                <button
                    type="submit"
                    disabled={disabled || !value.trim()}
                    className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                >
                    <SendIcon />
                </button>
            </form>
             {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
        </div>
    );
};

export default ChatInput;
