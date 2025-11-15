// Import các hàm cần thiết từ SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; 
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";


// Cấu hình web app của bạn
const firebaseConfig = {
  apiKey:  process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:  process.env.NEXT_PUBLIC_AUTH_DOMAIN,
  databaseURL:  process.env.NEXT_PUBLIC_DATABASE_URL,
  projectId:  process.env.NEXT_PUBLIC_PROJECT_ID,
  storageBucket:  process.env.NEXT_PUBLIC_STORAGE_BUCKET,
  messagingSenderId:  process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
  appId:  process.env.NEXT_PUBLIC_APP_ID,
  measurementId:  process.env.NEXT_PUBLIC_MEASUREMENT_ID,
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