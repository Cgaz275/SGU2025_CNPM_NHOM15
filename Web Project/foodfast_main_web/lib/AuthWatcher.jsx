"use client";

import { useEffect } from "react";
// 🚨 Import signout cho AuthWatcher (mặc dù logout sẽ được gọi trong Navbar, nhưng đây là nơi quản lý state)
import { onAuthStateChanged, signOut } from "firebase/auth"; 
// 🚨 Import doc và getDoc từ firestore
import { doc, getDoc } from "firebase/firestore"; 
import { useDispatch } from "react-redux";
// 🚨 Import 'db' từ file cấu hình
import { auth, db } from "../config/FirebaseConfig"; 
import { setUser, clearUser } from "./features/auth/authSlice";

export default function AuthWatcher() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Lắng nghe trạng thái Auth
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // --- 1. Lấy dữ liệu người dùng từ Firestore ---
        // Collection là 'user', Document ID là user.uid
        const userRef = doc(db, "user", user.uid);
        
        try {
            const userSnap = await getDoc(userRef);

            let firestoreUserData = {};
            if (userSnap.exists()) {
                firestoreUserData = userSnap.data();
            } else {
                console.warn("Not found documents for user with UID:", user.uid);
            }
            
            // --- 2. Dispatch dữ liệu kết hợp vào Redux ---
            // Convert Firestore Timestamp to ISO string to avoid non-serializable error
            const createdAtValue = firestoreUserData.createdAt
              ? (firestoreUserData.createdAt.toDate?.() || firestoreUserData.createdAt).toISOString?.() || firestoreUserData.createdAt
              : null;

            dispatch(
                setUser({
                    uid: user.uid,
                    email: user.email,
                    // Dùng tên từ Firestore nếu có, nếu không thì dùng displayName từ Auth
                    name: firestoreUserData.name || user.displayName,
                    isAnonymous: user.isAnonymous,
                    // Thêm toàn bộ các trường khác từ Firestore (phone, role, defaultAddress, v.v.)
                    ...firestoreUserData,
                    // Override createdAt with serializable string
                    createdAt: createdAtValue,
                })
            );

        } catch (error) {
            console.error("Error while fetching user:", error);
            // Vẫn dispatch dữ liệu Auth cơ bản nếu lỗi
            dispatch(
                setUser({
                    uid: user.uid,
                    email: user.email,
                    name: user.displayName,
                    isAnonymous: user.isAnonymous,
                })
            );
        }

      } else {
        // Người dùng đã đăng xuất
        dispatch(clearUser());
      }
    });

    return () => unsub();
  }, [dispatch]);

  return null;
}
