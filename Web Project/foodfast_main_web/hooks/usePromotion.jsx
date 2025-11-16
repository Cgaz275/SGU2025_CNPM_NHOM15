import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../config/FirebaseConfig';

const usePromotions = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Truy vấn collection 'promotion'
    const promotionCollectionRef = collection(db, 'promotion');

    // Sắp xếp theo trường 'name'
    const q = query(promotionCollectionRef, orderBy('name', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const promotionsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setData(promotionsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore Error fetching promotions:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { data, loading, error };
};

export default usePromotions;
