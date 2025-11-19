import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/FirebaseConfig';
import { sortDesc } from '@/utils/sortUtils';

const useMerchantOrders = (restaurantId) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!restaurantId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('restaurantId', '==', restaurantId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const sortedOrders = sortDesc(ordersData, 'createdAt');

        setOrders(sortedOrders);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching merchant orders:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [restaurantId]);

  return { orders, loading, error };
};

export default useMerchantOrders;
