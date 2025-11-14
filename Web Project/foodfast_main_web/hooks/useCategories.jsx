import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebaseConfig'; // Thay bằng đường dẫn file config của bạn

const useCategories = () => {
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
 // Tạo query để truy vấn collection 'categories' và sắp xếp theo tên
const categoriesCollectionRef = collection(db, 'categories');
 // Sắp xếp theo trường 'name' (giả định đây là trường mong muốn)
const q = query(categoriesCollectionRef, orderBy('name', 'asc')); 

 // Lắng nghe thay đổi theo thời gian thực (real-time)
const unsubscribe = onSnapshot(
 q, 
(snapshot) => {
 const categoriesData = snapshot.docs.map(doc => ({
 id: doc.id,
 ...doc.data(), // Lấy các trường imageUrl và name
 }));
        setData(categoriesData);
        setLoading(false);
        setError(null);
        },
        (err) => {
        console.error("Firestore Error fetching categories:", err);
        setError(err);
        setLoading(false);
 }
 );

 // Dọn dẹp (cleanup) listener khi component unmount
 return () => unsubscribe();
 }, []); 

return { data, loading, error };
};

export default useCategories;