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

/**
 * Convert Firestore Timestamp to JavaScript Date
 * Handles Firestore Timestamp objects, ISO strings, Date objects, and numbers
 * @param {any} timestamp - The timestamp to convert
 * @returns {Date} JavaScript Date object
 */
export const convertToDate = (timestamp) => {
    if (!timestamp) return new Date();

    // If it's a Firestore Timestamp object with toDate method
    if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
    }

    // If it's already a Date object
    if (timestamp instanceof Date) {
        return timestamp;
    }

    // If it's an ISO string
    if (typeof timestamp === 'string') {
        return new Date(timestamp);
    }

    // If it's a number (milliseconds)
    if (typeof timestamp === 'number') {
        return new Date(timestamp);
    }

    // Fallback: try to create a Date from it
    try {
        const date = new Date(timestamp);
        if (!isNaN(date.getTime())) {
            return date;
        }
    } catch (e) {
        console.error('Error converting timestamp:', timestamp, e);
    }

    return new Date();
};
