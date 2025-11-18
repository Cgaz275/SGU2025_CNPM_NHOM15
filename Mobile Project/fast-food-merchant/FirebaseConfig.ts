// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getAnalytics } from 'firebase/analytics';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDgS3Ux6yWwtY6QvAkagNzW7FWE_d1nILc',
  authDomain: 'foodfast-e293b.firebaseapp.com',
  databaseURL: 'https://foodfast-e293b-default-rtdb.firebaseio.com',
  projectId: 'foodfast-e293b',
  storageBucket: 'foodfast-e293b.firebasestorage.app',
  messagingSenderId: '1081475813043',
  appId: '1:1081475813043:web:046f3fa14135f0144f6ac6',
  measurementId: 'G-ZJXW7GFE14',
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

export const db = getFirestore(app);
