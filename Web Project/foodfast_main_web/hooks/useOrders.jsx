import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/FirebaseConfig';
import useCurrentUser from './useCurrentUser';
import { sortDesc } from '@/utils/sortUtils';

const useOrders = () => {
  const { user, isAuthenticated } = useCurrentUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only set up the listener if user is authenticated and has a valid uid
    if (!isAuthenticated || !user?.uid) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef,
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ordersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort by createdAt in descending order (newest first) on client-side
        const sortedOrders = sortDesc(ordersData, 'createdAt');

        setOrders(sortedOrders);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching orders:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, isAuthenticated]);

  return { orders, loading, error };
};

export default useOrders;
