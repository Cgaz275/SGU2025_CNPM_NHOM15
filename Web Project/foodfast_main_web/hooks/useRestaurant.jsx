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
 // Filter by is_enable = true (no orderBy to avoid composite index requirement)
const q = query(
   restaurantsCollectionRef,
   where('is_enable', '==', true)
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

 // Sort by rating client-side to avoid requiring composite index
 restaurantsData.sort((a, b) => (b.rating || 0) - (a.rating || 0));

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
