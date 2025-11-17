import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/config/FirebaseConfig';

const useRestaurantRatings = (restaurantId) => {
  const [ratings, setRatings] = useState([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!restaurantId) {
      setRatings([]);
      setAverage(0);
      setCount(0);
      return;
    }

    const fetchRatings = async () => {
      setLoading(true);
      try {
        const ratingsRef = collection(db, 'ratings');
        const q = query(ratingsRef, where('restaurantId', '==', restaurantId));
        const querySnapshot = await getDocs(q);

        const ratingValues = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.rating && data.rating > 0) {
            ratingValues.push(data.rating);
          }
        });

        setRatings(ratingValues);
        setCount(ratingValues.length);

        // Calculate average
        if (ratingValues.length > 0) {
          const sum = ratingValues.reduce((acc, val) => acc + val, 0);
          const avg = Math.round((sum / ratingValues.length) * 10) / 10;
          setAverage(avg);
        } else {
          setAverage(0);
        }

        setError(null);
      } catch (err) {
        console.error('Error fetching ratings:', err);
        setError(err);
        setRatings([]);
        setAverage(0);
        setCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRatings();
  }, [restaurantId]);

  return { ratings, average, count, loading, error };
};

export default useRestaurantRatings;
