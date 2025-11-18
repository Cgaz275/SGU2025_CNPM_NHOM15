import { convertToDate } from './timestampUtils';

/**
 * Sorts an array of objects by a field in ascending order
 * @param {Array} items - Array of objects to sort
 * @param {string} fieldName - Field name to sort by
 * @returns {Array} Sorted array
 */
export const sortAsc = (items, fieldName) => {
  return [...items].sort((a, b) => {
    const valueA = a[fieldName];
    const valueB = b[fieldName];

    const dateA = convertToDate(valueA);
    const dateB = convertToDate(valueB);

    return dateA - dateB;
  });
};

/**
 * Sorts an array of objects by a field in descending order
 * @param {Array} items - Array of objects to sort
 * @param {string} fieldName - Field name to sort by
 * @returns {Array} Sorted array
 */
export const sortDesc = (items, fieldName) => {
  return [...items].sort((a, b) => {
    const valueA = a[fieldName];
    const valueB = b[fieldName];

    const dateA = convertToDate(valueA);
    const dateB = convertToDate(valueB);

    return dateB - dateA;
  });
};

/**
 * Sorts an array by multiple fields
 * @param {Array} items - Array of objects to sort
 * @param {Array} sortConfig - Array of sort configurations [{ fieldName, order: 'asc' | 'desc' }]
 * @returns {Array} Sorted array
 */
export const sortByMultiple = (items, sortConfig) => {
  return [...items].sort((a, b) => {
    for (const config of sortConfig) {
      const { fieldName, order = 'asc' } = config;
      const valueA = a[fieldName];
      const valueB = b[fieldName];

      const dateA = convertToDate(valueA);
      const dateB = convertToDate(valueB);

      if (dateA !== dateB) {
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      }
    }
    return 0;
  });
};
