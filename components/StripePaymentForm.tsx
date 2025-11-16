import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { Cart } from '../types';
import emailjs from '@emailjs/browser';

interface StripePaymentFormProps {
  user: User;
  cart: Cart;
  onPaymentSuccess: (transactionId: string) => void;
  onClose: () => void;
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({ 
  user, 
  cart, 
  onPaymentSuccess, 
  onClose 
}) => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  const total = cart.products.reduce((sum, p) => sum + (p.price * p.quantity), 0);

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Format expiry as MM / YY
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + ' / ' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 16) {
      setCardNumber(formatted);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    if (formatted.replace(/\s+\/\s+/g, '').length <= 4) {
      setExpiry(formatted);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/gi, '');
    if (value.length <= 4) {
      setCvc(value);
    }
  };

  // Validate card using Stripe test card rules
  const validateCard = () => {
    const cleanCard = cardNumber.replace(/\s/g, '');
    const cleanExpiry = expiry.replace(/\s+\/\s+/g, '');
    
    // Check if fields are filled
    if (!cleanCard || !cleanExpiry || !cvc) {
      return { valid: false, error: 'Please fill in all card details' };
    }

    // Check card number length
    if (cleanCard.length < 13 || cleanCard.length > 16) {
      return { valid: false, error: 'Invalid card number length' };
    }

    // Check expiry format
    if (cleanExpiry.length !== 4) {
      return { valid: false, error: 'Invalid expiry date' };
    }

    const month = parseInt(cleanExpiry.substring(0, 2));
    const year = parseInt(cleanExpiry.substring(2, 4));
    
    if (month < 1 || month > 12) {
      return { valid: false, error: 'Invalid expiry month' };
    }

    // Check if card is expired
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return { valid: false, error: 'Card has expired' };
    }

    // Check CVC length
    if (cvc.length < 3 || cvc.length > 4) {
      return { valid: false, error: 'Invalid CVC' };
    }

    // Stripe test card behaviors
    const testCards: { [key: string]: { success: boolean; error?: string } } = {
      '4242424242424242': { success: true }, // Success
      '4000000000000002': { success: false, error: 'Card was declined' },
      '4000000000009995': { success: false, error: 'Insufficient funds' },
      '4000000000009987': { success: false, error: 'Lost card' },
      '4000000000009979': { success: false, error: 'Stolen card' },
      '4000000000000069': { success: false, error: 'Card has expired' },
      '4000000000000127': { success: false, error: 'Incorrect CVC' },
      '4000000000000119': { success: false, error: 'Processing error' },
    };

    const cardBehavior = testCards[cleanCard];
    
    return { valid: true, cardBehavior };
  };

  const simulateStripePayment = async (): Promise<{ success: boolean; transactionId?: string; error?: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    const validation = validateCard();
    
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Check test card behavior
    if (validation.cardBehavior) {
      if (validation.cardBehavior.success) {
        const transactionId = `pi_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        return { success: true, transactionId };
      } else {
        return { success: false, error: validation.cardBehavior.error };
      }
    }

    // For any other card number, treat as success in test mode
    const transactionId = `pi_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    return { success: true, transactionId };
  };

  const sendConfirmationEmail = async (transactionId: string) => {
    try {
      // Format order items for email
      const orderItems = cart.products.map(item => 
        `${item.name} (x${item.quantity}) - $${(item.price * item.quantity).toFixed(2)}`
      ).join('\n');

      const emailParams = {
        to_email: user.email,
        to_name: user.displayName || user.email?.split('@')[0] || 'Customer',
        transaction_id: transactionId,
        order_date: new Date().toLocaleString(),
        order_items: orderItems,
        total_amount: total.toFixed(2),
      };

      // REPLACE THESE WITH YOUR EMAILJS CREDENTIALS
      await emailjs.send(
        'service_9mvsx0i',      // Replace with your Service ID (e.g., 'service_abc123')
        'template_95nyhq9',     // Replace with your Template ID (e.g., 'template_xyz789')
        emailParams,
        'LGum4NBX-KMVb2PR4'       // Replace with your Public Key (e.g., 'abcDEF123xyz')
      );
      
      console.log('✅ Confirmation email sent successfully to:', user.email);
      return true;
    } catch (emailError) {
      console.error('❌ Failed to send email:', emailError);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('processing');
    setErrorMessage('');

    try {
      // Process payment
      const result = await simulateStripePayment();
      
      if (result.success && result.transactionId) {
        setStatus('success');
        
        // Send confirmation email
        await sendConfirmationEmail(result.transactionId);
        
        // Wait a moment to show success message
        setTimeout(() => {
          onPaymentSuccess(result.transactionId!);
        }, 1500);
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'Payment failed');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'Payment failed. Please try again.');
    }
  };

  const getCardBrand = () => {
    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.startsWith('4')) return '💳 Visa';
    if (cleanCard.startsWith('5')) return '💳 Mastercard';
    if (cleanCard.startsWith('3')) return '💳 Amex';
    return '💳 Card';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-w-sm w-full text-white font-sans animate-slide-up relative">
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-200">Stripe Test Mode</h2>
            <span className="bg-yellow-600/20 text-yellow-400 text-xs px-2 py-1 rounded">TEST</span>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white transition-colors text-2xl" 
            aria-label="Close payment"
            disabled={status === 'processing'}
          >
            &times;
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-400">Email</label>
              <input 
                type="email" 
                value={user.email || ''} 
                readOnly 
                className="mt-1 w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white/50 cursor-not-allowed" 
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-400 block mb-2">
                Card information
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <input 
                    type="text" 
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="1234 5678 9012 3456"
                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-3 pr-16 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  {cardNumber && (
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm">
                      {getCardBrand()}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={expiry}
                    onChange={handleExpiryChange}
                    placeholder="MM / YY"
                    className="w-1/2 bg-gray-700 border border-gray-600 rounded-md p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <input 
                    type="text" 
                    value={cvc}
                    onChange={handleCvcChange}
                    placeholder="CVC"
                    className="w-1/2 bg-gray-700 border border-gray-600 rounded-md p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Test Cards Info */}
            <div className="bg-gray-900/50 border border-gray-700 rounded-md p-3 text-xs">
              <p className="text-gray-400 font-semibold mb-2">Test Cards:</p>
              <div className="space-y-1 text-gray-500">
                <p>✓ <span className="text-green-400">4242 4242 4242 4242</span> - Success</p>
                <p>✗ <span className="text-red-400">4000 0000 0000 9995</span> - Insufficient funds</p>
                <p>✗ <span className="text-red-400">4000 0000 0000 0002</span> - Declined</p>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-900/30 border border-red-700 text-red-200 px-4 py-3 rounded-md text-sm flex items-start gap-2">
                <span>⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {status === 'success' && (
              <div className="bg-green-900/30 border border-green-700 text-green-200 px-4 py-3 rounded-md text-sm flex items-start gap-2">
                <span>✓</span>
                <span>Payment successful! Confirmation email sent to {user.email}</span>
              </div>
            )}

            <div className="border-t border-gray-600 pt-4">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'processing' || status === 'success'}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg mt-2 hover:bg-indigo-500 transition-colors flex items-center justify-center disabled:bg-indigo-800 disabled:cursor-not-allowed"
            >
              {status === 'processing' && <div className="spinner mr-3"></div>}
              {status === 'processing' 
                ? 'Processing...' 
                : status === 'success' 
                ? '✓ Success!' 
                : `Pay $${total.toFixed(2)}`}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes slide-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
        .spinner {
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid #fff;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default StripePaymentForm;