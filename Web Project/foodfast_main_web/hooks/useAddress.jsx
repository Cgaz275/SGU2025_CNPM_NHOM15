import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../config/FirebaseConfig';

const useAddress = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Truy vấn collection 'user_addresses'
    const addressCollectionRef = collection(db, 'user_addresses');

    // Sắp xếp theo trường 'name'
    const q = query(addressCollectionRef, orderBy('name', 'asc'));

    // Lắng nghe real-time Firestore
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const addressData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(), 
        }));

        setData(addressData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore Error fetching address:", err);
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup listener
    return () => unsubscribe();
  }, []);

  return { data, loading, error };
};

export default useAddress;
