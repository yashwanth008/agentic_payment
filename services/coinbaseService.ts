
/**
 * Simulates minting a proof-of-purchase NFT via a service like Coinbase Developer Platform Wallet.
 * In a real application, this would involve a server-side call to a wallet SDK or API.
 * @param stripeTxId The ID of the successful Stripe transaction.
 * @param orderSummary A summary of the purchased items.
 * @param total The total amount of the purchase.
 * @returns A promise that resolves to mock NFT details.
 */
export const mintReceiptNFT = async (
    stripeTxId: string,
    orderSummary: string,
    total: number
): Promise<{ nftUrl: string; explorerUrl: string; }> => {
    console.log(`[Coinbase Service] Minting NFT for order: ${orderSummary}`);
    await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate minting delay

    const randomHash = Math.random().toString(36).substring(2, 12);
    const nftId = Date.now();

    const nftUrl = `https://api.lorem.space/image/album?w=400&h=400&seed=${nftId}`;
    const explorerUrl = `https://mock-explorer.dev/tx/0x${randomHash}${Date.now()}`;

    console.log(`[Coinbase Service] Minting successful! NFT URL: ${nftUrl}, Explorer URL: ${explorerUrl}`);
    return { nftUrl, explorerUrl };
};
