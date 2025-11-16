
export enum Role {
  USER = 'user',
  AGENT_1 = 'agent1',
  AGENT_2 = 'agent2',
  SYSTEM = 'system',
}

export enum Agent {
  AGENT_1 = 'AGENT_1',
  AGENT_2 = 'AGENT_2',
}

export interface Supplier {
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  image: string;
  suppliers: Supplier[];
}

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    supplier: string;
}

export interface Cart {
  products: CartItem[];
}

export interface NFTReceiptData {
  type: 'NFT_RECEIPT';
  orderSummary: string;
  total: number;
  transactionId: string;
  nftUrl: string; 
  explorerUrl: string;
}

export interface SearchResultsData {
  type: 'SEARCH_RESULTS';
  products: Product[];
}

export interface Message {
  id: string;
  role: Role;
  content: string | NFTReceiptData | SearchResultsData;
}

export interface Transaction {
  id: string;
  timestamp: number;
  products: CartItem[];
  total: number;
}

export interface AppUser {
  uid: string;
  isAnonymous: boolean;
  displayName: string | null;
  email: string | null;
}