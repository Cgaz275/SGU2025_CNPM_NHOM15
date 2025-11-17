'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/config/FirebaseConfig';
import { setUser } from '@/lib/features/auth/authSlice';
import toast from 'react-hot-toast';

export default function AdminSignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const handleSignIn = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error('Please enter a valid email');
            return;
        }

        setLoading(true);

        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            const userRef = doc(db, 'user', result.user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();

                if (userData.role !== 'admin') {
                    toast.error('You do not have admin access');
                    await auth.signOut();
                    setLoading(false);
                    return;
                }

                const createdAtValue = userData.createdAt
                    ? (userData.createdAt.toDate?.() || userData.createdAt).toISOString?.() || userData.createdAt
                    : null;

                dispatch(setUser({
                    uid: result.user.uid,
                    email: result.user.email,
                    name: userData.name,
                    role: userData.role,
                    ...userData,
                    createdAt: createdAtValue
                }));

                toast.success('Signed in successfully');
            } else {
                toast.error('User data not found');
                await auth.signOut();
            }
        } catch (error) {
            console.error('Sign in error:', error);
            if (error.code === 'auth/user-not-found') {
                toast.error('Email not found');
            } else if (error.code === 'auth/wrong-password') {
                toast.error('Incorrect password');
            } else if (error.code === 'auth/invalid-email') {
                toast.error('Invalid email format');
            } else {
                toast.error('Sign in failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#366055] to-[#2a4d42] px-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-[#366055] mb-2">
                            FoodFast
                        </h1>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                            Admin Portal
                        </h2>
                        <p className="text-gray-600 text-sm">
                            Sign in to access the admin dashboard
                        </p>
                    </div>

                    <form onSubmit={handleSignIn} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                disabled={loading}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#366055] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                disabled={loading}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#366055] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-[#366055] text-white font-semibold rounded-lg hover:bg-[#2a4d42] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <p className="text-center text-gray-600 text-xs mt-6 pt-6 border-t border-gray-200">
                        This is a secure admin portal. Only authorized administrators can access.
                    </p>
                </div>

                <p className="text-center text-white text-sm mt-6 opacity-75">
                    © {new Date().getFullYear()} FoodFast Admin. All rights reserved.
                </p>
            </div>
        </div>
    );
}
