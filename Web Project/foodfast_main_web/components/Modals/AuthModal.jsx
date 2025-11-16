'use client'

import { useState } from 'react';
import { X } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from "firebase/firestore"; 
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    updateProfile,
    signInAnonymously,
    GoogleAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { auth, db } from '../../config/FirebaseConfig.js'; 

// ------------------------
// SignIn Form Component
// ------------------------
const SignInForm = ({ onSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            onSuccess && onSuccess();
        } catch (err) {
            setError('Email hoặc mật khẩu không hợp lệ.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-[#FC8A06] focus:border-[#FC8A06] outline-none"
                required
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-[#FC8A06] focus:border-[#FC8A06] outline-none"
                required
            />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button
                type="submit"
                className="w-full bg-[#FC8A06] text-white py-3 rounded-lg font-semibold text-lg hover:bg-[#e87d05] transition duration-300 shadow-md"
                disabled={loading}
            >
                {loading ? 'Đang Đăng Nhập...' : 'Sign In'}
            </button>
        </form>
    );
}

// ------------------------
// SignUp Form Component
// ------------------------
const SignUpForm = ({ onSuccess }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirm) {
            setError('Mật khẩu xác nhận không khớp!');
            return;
        }

        setLoading(true);
        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            const user = res.user;
            await updateProfile(user, { displayName: name });

            if (db) {
                await setDoc(doc(db, "user", user.uid), {
                    name,
                    email,
                    phone,
                    role: "user",
                    defaultAddress: "",
                    createdAt: serverTimestamp(),
                });
            }

            onSuccess && onSuccess();
        } catch (err) {
            setError('Đã xảy ra lỗi, vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-[#FC8A06] focus:border-[#FC8A06] outline-none"
                required
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-[#FC8A06] focus:border-[#FC8A06] outline-none"
                required
            />
            <input
                type="tel"
                placeholder="Phone (Optional)"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-[#FC8A06] focus:border-[#FC8A06] outline-none"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-[#FC8A06] focus:border-[#FC8A06] outline-none"
                required
            />
            <input
                type="password"
                placeholder="Confirm Password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-[#FC8A06] focus:border-[#FC8A06] outline-none"
                required
            />
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button
                type="submit"
                className="w-full bg-[#FC8A06] text-white py-3 rounded-lg font-semibold text-lg hover:bg-[#2b4c44] transition duration-300 shadow-md"
                disabled={loading}
            >
                {loading ? 'Signing up...' : 'Sign Up'}
            </button>
        </form>
    );
}

// ------------------------
// Main Modal Component
// ------------------------
const AuthModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('signin');

    const handleGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            onClose();
        } catch (err) {
            if (err.code === 'auth/popup-closed-by-user') {
                // User closed the popup - this is expected, don't show error
                return;
            }
            // For other errors, show user feedback
            console.error('Google sign-in error:', err);
            import('react-hot-toast').then(toast => {
                toast.default.error('Failed to sign in with Google. Please try again.');
            });
        }
    }

    const handleAnonymous = async () => {
        try {
            await signInAnonymously(auth);
            onClose();
        } catch (err) {
            console.error('Anonymous sign-in error:', err);
            import('react-hot-toast').then(toast => {
                toast.default.error('Failed to continue as guest. Please try again.');
            });
        }
    }

    return (
        <div
            className={`fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative transform transition-all duration-300 scale-100"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-3xl font-bold text-center text-[#366055] mb-6">
                    {activeTab === 'signin' ? 'Welcome back' : 'Create an account'}
                </h2>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        className={`flex-1 py-3 text-lg font-medium transition duration-300 ${activeTab === 'signin' ? 'text-[#FC8A06] border-b-2 border-[#FC8A06]' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('signin')}
                    >
                        Sign In
                    </button>
                    <button
                        className={`flex-1 py-3 text-lg font-medium transition duration-300 ${activeTab === 'signup' ? 'text-[#FC8A06] border-b-2 border-[#FC8A06]' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('signup')}
                    >
                        Sign Up
                    </button>
                </div>

                {activeTab === 'signin' ? <SignInForm onSuccess={onClose} /> : <SignUpForm onSuccess={onClose} />}

                {/* Divider */}
                <div className="my-6 flex items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="px-3 text-gray-400 text-sm">hoặc</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <button onClick={handleGoogle} className="w-full border border-gray-300 py-3 rounded-lg mb-3 hover:bg-gray-50 transition duration-300 font-medium">
                    Continue with Google
                </button>

                <button onClick={handleAnonymous} className="w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition duration-300 font-medium">
                    Continue as Guest
                </button>
            </div>
        </div>
    );
}

export default AuthModal;
