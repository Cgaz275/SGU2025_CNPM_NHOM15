import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../config/FirebaseConfig'; 


const useRestaurants = () => {
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

useEffect(() => {
 // Thay đổi tên collection thành 'restaurants' (hoặc tên collection chứa data quán ăn)
 const restaurantsCollectionRef = collection(db, 'restaurants'); 
 //  Sắp xếp theo 'rating' giảm dần hoặc 'name'
const q = query(restaurantsCollectionRef, orderBy('rating', 'asc')); 

 // Lắng nghe thay đổi theo thời gian thực (real-time)
 const unsubscribe = onSnapshot(
 q, 
(snapshot) => {
 // Lặp qua các documents và gộp ID cùng dữ liệu
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

// Dọn dẹp (cleanup) listener khi component unmount
 return () => unsubscribe();
 }, []); 

 return { data, loading, error };
};

export default useRestaurants;