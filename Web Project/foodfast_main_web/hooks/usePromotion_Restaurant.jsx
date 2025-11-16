import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../lib/FirebaseConfig';

const usePromotionRestaurant = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Truy vấn collection 'promotion_restaurant'
    const promotionCollectionRef = collection(db, 'promotion_restaurant');

    const q = query(promotionCollectionRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const promotionData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setData(promotionData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore Error fetching promotion_restaurant:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { data, loading, error };
};

export default usePromotionRestaurant;
