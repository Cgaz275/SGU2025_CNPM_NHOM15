import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/FirebaseConfig';

/**
 * Calculate average rating from a list of rating values
 * @param {number[]} ratings - Array of rating values
 * @returns {number} - Average rating rounded to 1 decimal place
 */
export const calculateAverageRating = (ratings) => {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  const average = sum / ratings.length;
  return Math.round(average * 10) / 10;
};

/**
 * Get all ratings for a specific restaurant
 * @param {string} restaurantId - The restaurant ID
 * @returns {Promise<number[]>} - Array of rating values
 */
export const getRestaurantRatings = async (restaurantId) => {
  try {
    const ratingsRef = collection(db, 'ratings');
    const q = query(ratingsRef, where('restaurantId', '==', restaurantId));
    const querySnapshot = await getDocs(q);
    
    const ratings = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.rating && data.rating > 0) {
        ratings.push(data.rating);
      }
    });
    
    return ratings;
  } catch (error) {
    console.error('Error fetching restaurant ratings:', error);
    return [];
  }
};

/**
 * Save a user rating for an order and update restaurant rating
 * @param {string} orderId - The order ID
 * @param {string} restaurantId - The restaurant ID
 * @param {string} userId - The user ID
 * @param {number} rating - The rating value (1-5)
 * @param {string} review - The review text
 * @returns {Promise<void>}
 */
export const submitOrderRating = async (orderId, restaurantId, userId, rating, review) => {
  try {
    // Save the rating to Firestore
    const ratingsRef = collection(db, 'ratings');
    await addDoc(ratingsRef, {
      orderId,
      restaurantId,
      userId,
      rating,
      review,
      createdAt: serverTimestamp(),
    });

    // Update the restaurant's average rating
    await updateRestaurantRating(restaurantId);
  } catch (error) {
    console.error('Error submitting rating:', error);
    throw error;
  }
};

/**
 * Update restaurant's average rating based on all user ratings
 * @param {string} restaurantId - The restaurant ID
 * @returns {Promise<void>}
 */
export const updateRestaurantRating = async (restaurantId) => {
  try {
    // Get all ratings for this restaurant
    const ratings = await getRestaurantRatings(restaurantId);
    
    // Calculate average rating
    const averageRating = calculateAverageRating(ratings);
    
    // Update the restaurant document
    const restaurantRef = doc(db, 'restaurants', restaurantId);
    await updateDoc(restaurantRef, {
      rating: averageRating,
      ratingCount: ratings.length,
      lastRatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating restaurant rating:', error);
    throw error;
  }
};
