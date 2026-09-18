export {};

declare global {
  interface Window {
    ethereum?: {
      isRabby?: boolean;
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      isOkxWallet?: boolean;
      isBraveWallet?: boolean;
    };
  }
}
