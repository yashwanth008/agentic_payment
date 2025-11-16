import { Message, Role } from './types';

export const INITIAL_MESSAGES: Message[] = [
    {
        id: '1',
        role: Role.AGENT_1,
        content: "Hello! I'm your shopping assistant. What are you looking for today? I can search for products like laptops, phones, headphones, and more.",
    }
];
