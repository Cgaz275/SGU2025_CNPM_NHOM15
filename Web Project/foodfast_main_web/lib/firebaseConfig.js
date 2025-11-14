// Import các hàm cần thiết từ SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";


// Cấu hình web app của bạn
const firebaseConfig = {
  apiKey: "AIzaSyDgS3Ux6yWwtY6QvAkagNzW7FWE_d1nILc",
  authDomain: "foodfast-e293b.firebaseapp.com",
  databaseURL: "https://foodfast-e293b-default-rtdb.firebaseio.com",
  projectId: "foodfast-e293b",
  storageBucket: "foodfast-e293b.firebasestorage.app",
  messagingSenderId: "1081475813043",
  appId: "1:1081475813043:web:952fb6260de7142b4f6ac6",
  measurementId: "G-MLE014NM90"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

let analytics;
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
}

// Khởi tạo và EXPORT đối tượng Auth
export const auth = getAuth(app); 

//Khởi tạo và EXPORT đối tượng Firestore
export const db = getFirestore(app);

export default app;