# Agentic Checkout - Anthropic Edition

A human-in-the-loop e-commerce chat application powered by Claude (Anthropic) featuring two specialized AI agents for shopping and payment processing.

## Overview

This application demonstrates a multi-agent workflow where:
- **Agent 1 (Shopping Assistant)**: Helps users search for products and manage their cart using Claude
- **Agent 2 (Payment Specialist)**: Handles secure checkout with email verification using Claude

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- An Anthropic API key ([Get one here](https://console.anthropic.com/))
- Firebase project (for Google authentication)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd agentic-checkout
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

4. Configure Firebase:

Update `firebaseConfig.ts` with your Firebase project credentials:
```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

5. Run the development server:
```bash
npm run dev
```

6. Open your browser to `http://localhost:3000`

##  Architecture

### Multi-Agent System

```
User Input
    ↓
Agent 1 (Shopping Assistant)
    ├─ Product Search (via searchBestBuy tool)
    ├─ Cart Management (via updateCartItem tool)
    └─ Checkout Initiation (via startCheckout tool)
    ↓
Agent 2 (Payment Specialist)
    ├─ Email Verification (via sendCodeToEmail tool)
    └─ Payment Processing (via verifyCodeAndPay tool)
    ↓
Transaction Complete
```

### Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **AI**: Anthropic Claude API (Sonnet 4)
- **Authentication**: Firebase Auth (Google Sign-In)
- **State Management**: React Hooks
- **Build Tool**: Vite

##  Project Structure

```
agentic-checkout/
├── components/
│   ├── CartSidebar.tsx           # Shopping cart UI
│   ├── ChatInput.tsx             # User input component
│   ├── ChatWindow.tsx            # Message display
│   ├── Login.tsx                 # Google authentication
│   ├── MockEmail.tsx             # Simulated email verification
│   ├── ProductCard.tsx           # Cart item display
│   ├── PurchaseHistoryModal.tsx  # Transaction history
│   ├── ShoppingPage.tsx          # Main application (USES ANTHROPIC)
│   └── icons/                    # SVG icon components
├── services/
│   ├── anthropicService.ts       # Agent 1 (Shopping) - Claude integration
│   ├── paymentServiceAnthropic.ts # Agent 2 (Payment) - Claude integration
│   ├── bestbuyService.ts         # Mock product database
│   ├── cartService.ts            # Cart persistence
│   └── transactionService.ts     # Transaction history
├── context/
│   └── AuthContext.tsx           # Firebase authentication context
├── types.ts                      # TypeScript type definitions
├── constants.ts                  # App constants
├── firebaseConfig.ts             # Firebase configuration
└── App.tsx                       # Root component
```

##  Key Features

### Agent 1: Shopping Assistant

**Capabilities:**
- Natural language product search
- Intelligent cart management
- Multi-item cart operations
- Contextual product recommendations

**Example Interactions:**
```
User: "I'm looking for a laptop"
Agent 1: [Searches and displays options]

User: "Add the MacBook Pro"
Agent 1: [Adds to cart]

User: "Actually, add 2 more"
Agent 1: [Updates quantity to 3]
```

### Agent 2: Payment Specialist

**Security Features:**
- Email-based verification
- Simulated payment processing
- Transaction history tracking

**Workflow:**
1. User initiates checkout
2. Agent 2 requests email address
3. System sends verification code (simulated)
4. User enters code
5. Payment processed
6. Transaction saved

### User Features

- **Google Sign-In**: Secure authentication via Firebase
- **Cart Management**: Add, remove, update quantities
- **Purchase History**: View past transactions
- **CSV Export**: Download transaction history
- **Responsive Design**: Mobile and desktop friendly

## Configuration

### Anthropic API Settings

The app uses Claude Sonnet 4 by default. To change models, update:

```typescript
// In anthropicService.ts or paymentServiceAnthropic.ts
const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514', // Change this
    max_tokens: 4096,
    // ...
});
```

Available models:
- `claude-sonnet-4-20250514` (Default - Best balance)
- `claude-opus-4-20250514` (Highest quality, slower)
- `claude-3-5-haiku-20241022` (Fastest, lower cost)

### Conversation History Management

Agent 1 maintains a global conversation history that persists throughout the shopping session:

```typescript
// Reset when starting new order
resetAgent1Chat();
```

Agent 2 creates a new history for each checkout session:

```typescript
const chatSession = getAgent2Chat(cart.products);
```

## Development

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Important Notes

### Security Warning

**DO NOT USE IN PRODUCTION AS-IS**

This app uses `dangerouslyAllowBrowser: true` which exposes your API key in the browser. For production:

1. Create a backend API
2. Move all Anthropic API calls to the server
3. Never expose API keys to the client

Example backend structure:
```
Frontend → Your Backend API → Anthropic API
         (authenticated)    (API key on server)
```

### Rate Limits

Monitor your Anthropic API usage at: https://console.anthropic.com/

Implement proper error handling for rate limits:
```typescript
catch (error) {
    if (error.status === 429) {
        // Handle rate limit
    }
}
```

### Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Cookies/LocalStorage enabled for authentication

## Data Persistence

The app uses browser LocalStorage for:
- Shopping cart (per user)
- Transaction history (per user)
- Authentication state (Firebase)

Data is stored with user-specific keys:
```typescript
localStorage.getItem('agentic-checkout-cart-{userId}')
localStorage.getItem('agentic-checkout-transactions-{userId}')
```

## Customization

### Modify Product Database

Edit `services/bestbuyService.ts`:
```typescript
const MOCK_BESTBUY_PRODUCTS: Product[] = [
    { 
        id: 'prod_custom',
        name: 'Your Product',
        price: 99.99,
        image: 'https://...'
    },
    // Add more products
];
```

### Change System Instructions

Agent behaviors are defined in their respective service files:

**Agent 1** (`anthropicService.ts`):
```typescript
const systemInstruction = `You are Agent 1, a friendly...`;
```

**Agent 2** (`paymentServiceAnthropic.ts`):
```typescript
const systemInstruction = `You are Agent 2, a friendly...`;
```

### Styling

The app uses Tailwind CSS. Modify styles directly in components:
```tsx
<div className="bg-gray-900 text-white p-4">
    {/* Your content */}
</div>
```

## Troubleshooting

### "ANTHROPIC_API_KEY environment variable not set"
- Ensure `.env.local` exists in the root directory
- Restart the dev server after adding the key

### Agent not responding
- Check browser console for errors
- Verify API key is valid
- Check Anthropic API status: https://status.anthropic.com/

### Firebase authentication fails
- Verify Firebase configuration in `firebaseConfig.ts`
- Check Firebase console for project settings
- Ensure Google sign-in is enabled in Firebase

### Tool calls not working
- Verify tool definitions use `input_schema` (not `parameters`)
- Check that tool results include correct `tool_use_id`
- Review browser console for detailed errors

## Performance Tips

### Conversation History Management

For long conversations, trim history to prevent token limits:

```typescript
if (conversationHistory.length > 40) {
    // Keep system context + last 20 exchanges
    conversationHistory = conversationHistory.slice(-40);
}
```

### Caching

Consider implementing response caching for repeated queries:
- Product searches
- Common questions
- FAQ responses


Key changes:
- Stateless API (you manage conversation history)
- Different tool definition format
- Separate functions for tool results
- Content blocks instead of simple response properties

##  Resources

- [Anthropic Documentation](https://docs.anthropic.com/)
- [Claude API Reference](https://docs.anthropic.com/en/api)
- [Tool Use Guide](https://docs.anthropic.com/en/docs/build-with-claude/tool-use)
- [Prompt Engineering](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


##  Acknowledgments

- Anthropic for the Claude API
- Firebase for authentication services
- The React and Vite communities

## Support

For issues and questions:
- Open an issue on GitHub
- Check the troubleshooting section
- Review Anthropic documentation
- Check Firebase documentation

---
