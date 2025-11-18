import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/FirebaseConfig';

const useMerchantsWithRestaurants = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMerchantsWithRestaurants = async () => {
      try {
        // First, fetch all merchants (users with role = 'merchant')
        const userCollectionRef = collection(db, 'user');
        const merchantQuery = query(userCollectionRef, where('role', '==', 'merchant'));
        const merchantSnapshot = await getDocs(merchantQuery);

        const merchants = [];
        const restaurantsCollectionRef = collection(db, 'restaurants');

        // For each merchant, fetch their restaurants
        for (const merchantDoc of merchantSnapshot.docs) {
          const merchantData = {
            id: merchantDoc.id,
            ...merchantDoc.data()
          };

          // Fetch restaurants owned by this merchant
          const restaurantQuery = query(restaurantsCollectionRef, where('userId', '==', merchantDoc.id));
          const restaurantSnapshot = await getDocs(restaurantQuery);

          const restaurants = restaurantSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          merchants.push({
            ...merchantData,
            restaurants: restaurants
          });
        }

        setData(merchants);
        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error fetching merchants with restaurants:', err);
        setError(err);
        setLoading(false);
      }
    };

    fetchMerchantsWithRestaurants();
  }, []);

  return { data, loading, error };
};

export default useMerchantsWithRestaurants;
