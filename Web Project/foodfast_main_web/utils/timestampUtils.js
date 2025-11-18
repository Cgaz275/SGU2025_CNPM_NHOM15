import { format } from 'date-fns';

/**
 * Convert various timestamp formats to JavaScript Date
 * Handles: Firestore Timestamp, ISO strings, Date objects, numbers (ms)
 * @param {any} timestamp - The timestamp to convert
 * @returns {Date} JavaScript Date object
 */
export const convertToDate = (timestamp) => {
  if (!timestamp) return new Date();

  // Firestore Timestamp object with toDate method
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }

  // Already a Date object
  if (timestamp instanceof Date) {
    return timestamp;
  }

  // ISO string
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }

  // Milliseconds
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }

  // Fallback
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

/**
 * Format timestamp to display format: "November 19, 2025 at 2:48:21 AM UTC+7"
 * @param {any} timestamp - The timestamp to format
 * @returns {string} Formatted timestamp string
 */
export const formatTimestampDisplay = (timestamp) => {
  if (!timestamp) return 'N/A';

  try {
    const date = convertToDate(timestamp);
    
    // Get timezone offset
    const offset = -date.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offset) / 60);
    const offsetMinutes = Math.abs(offset) % 60;
    const sign = offset >= 0 ? '+' : '-';
    const tzString = `UTC${sign}${offsetHours}${offsetMinutes ? ':' + String(offsetMinutes).padStart(2, '0') : ''}`;

    // Format: "November 19, 2025 at 2:48:21 AM UTC+7"
    const dateStr = format(date, 'MMMM dd, yyyy \'at\' h:mm:ss a');
    return `${dateStr} ${tzString}`;
  } catch (error) {
    console.error('Error formatting timestamp:', timestamp, error);
    return 'N/A';
  }
};

/**
 * Format timestamp to date only: "dd/MM/yyyy"
 * @param {any} timestamp - The timestamp to format
 * @returns {string} Formatted date string
 */
export const formatDateOnly = (timestamp) => {
  if (!timestamp) return 'N/A';

  try {
    const date = convertToDate(timestamp);
    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    console.error('Error formatting date:', timestamp, error);
    return 'N/A';
  }
};

/**
 * Format timestamp to short format: "dd/MM/yyyy 'at' HH:mm a"
 * @param {any} timestamp - The timestamp to format
 * @returns {string} Formatted timestamp string
 */
export const formatTimestampShort = (timestamp) => {
  if (!timestamp) return 'N/A';

  try {
    const date = convertToDate(timestamp);
    return format(date, 'dd/MM/yyyy \'at\' HH:mm a');
  } catch (error) {
    console.error('Error formatting timestamp:', timestamp, error);
    return 'N/A';
  }
};

/**
 * Convert timestamp to ISO string for API/storage
 * @param {any} timestamp - The timestamp to convert
 * @returns {string} ISO string
 */
export const convertToISO = (timestamp) => {
  if (!timestamp) return new Date().toISOString();

  try {
    const date = convertToDate(timestamp);
    return date.toISOString();
  } catch (error) {
    console.error('Error converting to ISO:', timestamp, error);
    return new Date().toISOString();
  }
};

/**
 * Check if timestamp is in the past
 * @param {any} timestamp - The timestamp to check
 * @returns {boolean} True if timestamp is in the past
 */
export const isPastDate = (timestamp) => {
  try {
    const date = convertToDate(timestamp);
    return date < new Date();
  } catch (error) {
    console.error('Error checking past date:', timestamp, error);
    return false;
  }
};

/**
 * Check if timestamp is in the future
 * @param {any} timestamp - The timestamp to check
 * @returns {boolean} True if timestamp is in the future
 */
export const isFutureDate = (timestamp) => {
  try {
    const date = convertToDate(timestamp);
    return date > new Date();
  } catch (error) {
    console.error('Error checking future date:', timestamp, error);
    return false;
  }
};
