import { toNano, fromNano } from "@ton/ton";

/**
 * Calculate the expected output amount with slippage
 * @param {number} amount - Amount to swap
 * @param {number} rate - Exchange rate
 * @param {number} slippage - Slippage percentage
 * @returns {Object} - Expected output and minimum amount with slippage
 */
export const calculateExpectedOutput = (amount, rate, slippage = 0.5) => {
  if (!amount || isNaN(amount) || amount <= 0) {
    return { expectedOutput: 0, minAmountOut: 0 };
  }
  
  const expectedOutput = amount * rate;
  const minAmountOut = expectedOutput * (1 - slippage / 100);
  
  return { expectedOutput, minAmountOut };
};

/**
 * Format number for display
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted number
 */
export const formatNumber = (num, decimals = 6) => {
  if (num === undefined || num === null || isNaN(num)) return "0";
  
  // For very small numbers, show more decimals
  if (Math.abs(num) < 0.000001) {
    return num.toExponential(4);
  }
  
  // For normal numbers, format with comma separators and fixed decimals
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(num);
};

/**
 * Get hardcoded rate for token pairs
 * @param {string} fromAddress - From token address
 * @param {string} toAddress - To token address
 * @returns {number} - Exchange rate
 */
export const getHardcodedRate = (fromAddress, toAddress) => {
  // TON address
  const TON_ADDRESS = "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c";
  
  // Notcoin address
  const NOT_ADDRESS = "EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT";
  
  // Bolt address
  const BOLT_ADDRESS = "EQB-MPwrd1G6WKNkLz_VnV7-yWQQvB2i-RoVxTnv_lQJjNxB";
  
  // TON to NOT
  if (fromAddress === TON_ADDRESS && toAddress === NOT_ADDRESS) {
    return 2500; // 1 TON = 2500 NOT
  }
  
  // NOT to TON
  if (fromAddress === NOT_ADDRESS && toAddress === TON_ADDRESS) {
    return 0.0004; // 1 NOT = 0.0004 TON
  }
  
  // TON to BOLT
  if (fromAddress === TON_ADDRESS && toAddress === BOLT_ADDRESS) {
    return 30; // 1 TON = 30 BOLT
  }
  
  // BOLT to TON
  if (fromAddress === BOLT_ADDRESS && toAddress === TON_ADDRESS) {
    return 0.033; // 1 BOLT = 0.033 TON
  }
  
  // Default rate
  return 1.0;
};

/**
 * Calculate gas fee for a swap
 * @param {string} fromTokenSymbol - From token symbol
 * @param {string} toTokenSymbol - To token symbol
 * @param {number} amount - Amount to swap
 * @returns {Object} - Gas fee in TON
 */
export const calculateGasFee = (fromTokenSymbol, toTokenSymbol, amount) => {
  // Base fee for all transactions
  let baseFee = 0.05;
  
  // Additional fee based on swap type
  if (fromTokenSymbol === "TON") {
    // TON to Jetton swaps are cheaper
    return { fee: baseFee + 0.1, total: baseFee + 0.1 };
  } else if (toTokenSymbol === "TON") {
    // Jetton to TON swaps
    return { fee: baseFee + 0.2, total: baseFee + 0.2 };
  } else {
    // Jetton to Jetton swaps are most expensive
    return { fee: baseFee + 0.3, total: baseFee + 0.3 };
  }
};

/**
 * Validate swap parameters
 * @param {Object} params - Swap parameters
 * @returns {Object} - Validation result
 */
export const validateSwap = ({ 
  connected, 
  fromToken, 
  toToken, 
  amount, 
  balance 
}) => {
  if (!connected) {
    return { valid: false, error: "Please connect your wallet" };
  }
  
  if (!fromToken || !toToken) {
    return { valid: false, error: "Please select tokens" };
  }
  
  if (fromToken.contractAddress === toToken.contractAddress) {
    return { valid: false, error: "Cannot swap the same token" };
  }
  
  if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    return { valid: false, error: "Please enter a valid amount" };
  }
  
  if (balance !== undefined && parseFloat(amount) > parseFloat(balance)) {
    return { valid: false, error: "Insufficient balance" };
  }
  
  return { valid: true };
};

/**
 * Get default tokens for the DEX
 * @returns {Array} - Array of default tokens
 */
export const getDefaultTokens = () => [
  {
    contractAddress: "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c",
    imageUrl: "https://assets.dedust.io/images/ton.webp",
    name: "Toncoin",
    symbol: "TON",
    decimals: 9
  },
  {
    contractAddress: "EQAvlWFDxGF2lXm67y4yzC17wYKD9A0guwPkMs1gOsM__NOT",
    imageUrl: "https://assets.dedust.io/images/not.webp",
    name: "Notcoin",
    symbol: "NOT",
    decimals: 9
  },
  {
    contractAddress: "EQB-MPwrd1G6WKNkLz_VnV7-yWQQvB2i-RoVxTnv_lQJjNxB",
    imageUrl: "https://assets.dedust.io/images/bolt.webp",
    name: "Bolt",
    symbol: "BOLT",
    decimals: 9
  }
];
