import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/FirebaseConfig';

const useDishes = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Truy vấn collection 'dishes'
    const dishesCollectionRef = collection(db, 'dishes');

    const q = query(dishesCollectionRef, orderBy('name', 'asc'));

    // Listener real-time
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const dishesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(), // gồm name, price, imageUrl, description,...
        }));

        setData(dishesData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore Error fetching dishes:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { data, loading, error };
};

export default useDishes;
