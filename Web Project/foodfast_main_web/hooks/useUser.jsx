import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../config/FirebaseConfig';

const useUser = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Truy vấn collection 'user'
    const userCollectionRef = collection(db, 'user');

    // Sắp xếp theo trường 'name'
    const q = query(userCollectionRef, orderBy('name', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const userData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setData(userData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firestore Error fetching users:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { data, loading, error };
};

export default useUser;
