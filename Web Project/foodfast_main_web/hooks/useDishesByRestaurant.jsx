import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../lib/FirebaseConfig';

const useDishesByRestaurant = (restaurantId) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!restaurantId) {
            setLoading(false);
            return;
        }

        const dishesCollectionRef = collection(db, 'dishes');
        const q = query(dishesCollectionRef, where('restaurantId', '==', restaurantId));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const dishesData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
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
    }, [restaurantId]);

    return { data, loading, error };
};

export default useDishesByRestaurant;
