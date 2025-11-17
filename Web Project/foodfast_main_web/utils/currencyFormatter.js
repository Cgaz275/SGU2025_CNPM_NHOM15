/**
 * Format a price to Vietnamese currency format
 * Example: 20000 => "20.000 VND"
 * @param {number} price - The price to format
 * @param {string} symbol - The currency symbol (default: "VND")
 * @returns {string} Formatted price string
 */
export const formatPrice = (price, symbol = process.env.NEXT_PUBLIC_MONEY_SYMBOL || 'VND') => {
    if (!price && price !== 0) return `0 ${symbol}`;
    
    const num = Number(price);
    if (isNaN(num)) return `0 ${symbol}`;
    
    // Format with Vietnamese locale (uses . for thousands separator)
    const formatted = num.toLocaleString('vi-VN');
    return `${formatted} ${symbol}`;
};

/**
 * Format multiple prices for display (useful for comparisons)
 * @param {number[]} prices - Array of prices
 * @param {string} symbol - The currency symbol
 * @returns {string[]} Array of formatted prices
 */
export const formatPrices = (prices, symbol = process.env.NEXT_PUBLIC_MONEY_SYMBOL || 'VND') => {
    return prices.map(price => formatPrice(price, symbol));
};
