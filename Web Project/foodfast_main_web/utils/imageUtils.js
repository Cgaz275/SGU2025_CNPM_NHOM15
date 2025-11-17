/**
 * Common lazy loading attributes for img elements
 * Usage: <img src="..." {...lazyLoadProps} />
 */
export const lazyLoadProps = {
  loading: 'lazy',
};

/**
 * Get image props with lazy loading enabled
 * @param {Object} additionalProps - Additional props to merge with lazy loading
 * @returns {Object} Image element props including lazy loading
 */
export const getImageProps = (additionalProps = {}) => ({
  ...lazyLoadProps,
  ...additionalProps,
});
