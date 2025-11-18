import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../config/FirebaseConfig';


const useRestaurants = () => {
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

useEffect(() => {
 // Fetch only enabled restaurants for customer view
 const restaurantsCollectionRef = collection(db, 'restaurants');
 // Filter by is_enable = true and sort by rating
const q = query(
   restaurantsCollectionRef,
   where('is_enable', '==', true),
   orderBy('rating', 'desc')
 );

 // Listen for real-time changes
 const unsubscribe = onSnapshot(
 q,
(snapshot) => {
 // Map documents to include ID and data
 const restaurantsData = snapshot.docs.map(doc => ({
 id: doc.id,
 ...doc.data(),
 }));

 setData(restaurantsData);
 setLoading(false);
 setError(null);
 },
(err) => {
 console.error("Firestore Error fetching restaurants:", err);
 setError(err);
 setLoading(false);
}
);

// Cleanup listener on unmount
 return () => unsubscribe();
 }, []);

 return { data, loading, error };
};

export default useRestaurants;
