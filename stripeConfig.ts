import { loadStripe } from '@stripe/stripe-js';

// --- IMPORTANT ---
// 1. Replace the placeholder value below with your own Stripe publishable key.
//    You can find this in your Stripe Dashboard under Developers > API keys.
//    Example: "pk_test_..."
//
// 2. NEVER expose your Stripe secret key in client-side code. The secret key is
//    only for server-side use. This application simulates the server-side logic
//    and does not require a secret key to function.
// Fix: Explicitly type STRIPE_PUBLISHABLE_KEY as string to prevent type narrowing to 'never'.
export const STRIPE_PUBLISHABLE_KEY: string = "YOUR_STRIPE_PUBLISHABLE_KEY"; 

export const isStripeConfigValid = STRIPE_PUBLISHABLE_KEY !== "YOUR_STRIPE_PUBLISHABLE_KEY" && STRIPE_PUBLISHABLE_KEY.startsWith("pk_");

export const stripePromise = isStripeConfigValid ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;