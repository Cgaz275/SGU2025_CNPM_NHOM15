'use client'

import { useState } from 'react';
import { X } from 'lucide-react';

// Dữ liệu cho form
const initialSignInData = { email: '', password: '' };
const initialSignUpData = { name: '', email: '', password: '', confirmPassword: '' };

const AuthModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('signin'); // 'signin' hoặc 'signup'
    const [signInData, setSignInData] = useState(initialSignInData);
    const [signUpData, setSignUpData] = useState(initialSignUpData);

    if (!isOpen) return null;

    // --- Xử lý cho form Đăng nhập ---
    const handleSignInChange = (e) => {
        const { name, value } = e.target;
        setSignInData(prev => ({ ...prev, [name]: value }));
    };

    const handleSignInSubmit = (e) => {
        e.preventDefault();
        console.log("Sign In Data:", signInData);
        // Thêm logic API Đăng nhập ở đây
        alert('Successfully Sign In');
        onClose(); 
    };

    // --- Xử lý cho form Đăng ký ---
    const handleSignUpChange = (e) => {
        const { name, value } = e.target;
        setSignUpData(prev => ({ ...prev, [name]: value }));
    };

    const handleSignUpSubmit = (e) => {
        e.preventDefault();
        if (signUpData.password !== signUpData.confirmPassword) {
            alert('Password and Verifying password is invalid!');
            return;
        }
        console.log("Sign up data:", signUpData);
        // Thêm logic API Đăng ký ở đây
        alert('Sign Up successfully!');
        onClose(); 
    };

    // --- Component Form Đăng nhập ---
    const SignInForm = () => (
        <form className="space-y-4" onSubmit={handleSignInSubmit}>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                    type="email"
                    name="email"
                    value={signInData.email}
                    onChange={handleSignInChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#FC8A06] focus:border-[#FC8A06] outline-none"
                    placeholder="example@email.com"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                    type="password"
                    name="password"
                    value={signInData.password}
                    onChange={handleSignInChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#FC8A06] focus:border-[#FC8A06] outline-none"
                    placeholder="Enter your password"
                />
            </div>
            <div className="flex justify-end text-sm">
                <a href="#" className="text-[#366055] hover:text-[#FC8A06]">Forget Password?</a>
            </div>
            <button
                type="submit"
                className="w-full bg-[#FC8A06] text-white py-3 rounded-lg font-semibold text-lg hover:bg-[#e87d05] transition duration-300 shadow-md"
            >
                Sign In
            </button>
        </form>
    );

    // --- Component Form Đăng ký ---
    const SignUpForm = () => (
        <form className="space-y-4" onSubmit={handleSignUpSubmit}>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your full name</label>
                <input
                    type="text"
                    name="name"
                    value={signUpData.name}
                    onChange={handleSignUpChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#FC8A06] focus:border-[#FC8A06] outline-none"
                    placeholder="Nguyen Van A"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                    type="email"
                    name="email"
                    value={signUpData.email}
                    onChange={handleSignUpChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#FC8A06] focus:border-[#FC8A06] outline-none"
                    placeholder="example@email.com"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                    type="password"
                    name="password"
                    value={signUpData.password}
                    onChange={handleSignUpChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#FC8A06] focus:border-[#FC8A06] outline-none"
                    placeholder="Minimum 6-character password"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Verify password</label>
                <input
                    type="password"
                    name="confirmPassword"
                    value={signUpData.confirmPassword}
                    onChange={handleSignUpChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#FC8A06] focus:border-[#FC8A06] outline-none"
                    placeholder="Re-Input password"
                />
            </div>
            <button
                type="submit"
                className="w-full bg-[#366055] text-white py-3 rounded-lg font-semibold text-lg hover:bg-[#2b4c44] transition duration-300 shadow-md"
            >
                Sign Up Account
            </button>
        </form>
    );

    return (
        // Overlay nền mờ + Hiệu ứng làm mờ nội dung phía sau (backdrop-blur-sm)
        <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose} // Đóng khi click ra ngoài
        >
            {/* Modal Content */}
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative transform transition-all duration-300 scale-100"
                onClick={e => e.stopPropagation()} // Ngăn chặn sự kiện click lan ra ngoài (để không bị đóng modal)
            >
                {/* Nút đóng */}
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
                >
                    <X className="w-6 h-6" />
                </button>

                <h2 className="text-3xl font-bold text-center text-[#366055] mb-6">
                    {activeTab === 'signin' ? 'Welcome back' : 'Sign up for new account'}
                </h2>

                {/* Tab Header */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        className={`flex-1 py-3 text-lg font-medium transition duration-300 ${
                            activeTab === 'signin' 
                                ? 'text-[#FC8A06] border-b-2 border-[#FC8A06]' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('signin')}
                    >
                        Sign In
                    </button>
                    <button
                        className={`flex-1 py-3 text-lg font-medium transition duration-300 ${
                            activeTab === 'signup' 
                                ? 'text-[#FC8A06] border-b-2 border-[#FC8A06]' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                        onClick={() => setActiveTab('signup')}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'signin' ? <SignInForm /> : <SignUpForm />}
                </div>
            </div>
        </div>
    );
};

export default AuthModal;