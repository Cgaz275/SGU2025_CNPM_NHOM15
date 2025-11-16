'use client'

import { User, Menu, X, ShoppingBasket, LogOut } from "lucide-react"; // 🚨 Thêm LogOut
import Link from "next/link";
import { useState } from "react";
import { useSelector } from "react-redux";
import { usePathname } from 'next/navigation';
import AuthModal from '../Modals/AuthModal'; 

// 🚨 Import Firebase Auth và Router
import { auth } from "../../lib/FirebaseConfig";
import { signOut } from "firebase/auth";
import { useRouter } from 'next/navigation'; // Nếu bạn muốn chuyển hướng sau khi logout

const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter(); // Khởi tạo router
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); 

    const cartCount = useSelector(state => state.cart.total); 
    const user = useSelector(state => state.auth.user); // get logged-in user

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'Discovery', href: '/shop' },
        { name: 'Partner With Us', href: '/create-store' },

    ];

    // --- Chức năng Logout ---
    const handleLogout = async () => {
        try {
            await signOut(auth);
            // Tùy chọn: chuyển hướng về trang chủ hoặc trang đăng nhập
            // router.push('/'); 
            console.log("Đăng xuất thành công!");
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error);
            // Có thể hiển thị thông báo lỗi cho người dùng
        }
    };
    // ------------------------

    const CartLink = ({ isMobile = false }) => (
        <Link
            href="/cart"
            className={`relative flex items-center justify-center p-2 
                ${isMobile ? 'lg:hidden' : 'hidden lg:flex'} 
                hover:bg-gray-100 rounded-full transition`}
        >
            <ShoppingBasket className={`w-6 h-6 ${isMobile ? 'text-[#366055]' : 'text-black'}`} />
            {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FC8A06] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                </span>
            )}
        </Link>
    );

    const isActive = (href) => href === '/' ? pathname === href : pathname.startsWith(href);

    return (
        <>
            <nav className="relative bg-white border-b border-black/10">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex-shrink-0">
                            <img 
                                src="https://api.builder.io/api/v1/image/assets/TEMP/21fb37881c8a700a2aff3a03c52250c97364baa5?width=676" 
                                alt="FoodFast Logo" 
                                className="h-12 md:h-16 w-auto"
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x48/366055/ffffff?text=FOODFAST" }} // Fallback image
                            />
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-8">
                            {navLinks.map((link) => {
                                const active = isActive(link.href);
                                return (
                                    <div 
                                        key={link.name}
                                        className={active ? 'bg-[#366055] rounded-full px-6 py-3 transition' : ''}
                                    >
                                        <Link 
                                            href={link.href} 
                                            className={`text-lg font-medium transition 
                                                ${active ? 'text-white' : 'text-black hover:text-[#FC8A06]'}`}
                                        >
                                            {link.name}
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 md:gap-4">
                            <CartLink isMobile={false} />
                            <CartLink isMobile={true} />

                            {/* Login / User / Logout Button */}
                            <button 
                                // Nếu có user, gọi handleLogout, ngược lại mở AuthModal
                                onClick={user ? handleLogout : () => setIsAuthModalOpen(true)}
                                className="bg-[#366055] rounded-full px-4 md:px-8 py-2 md:py-4 flex items-center gap-2 md:gap-3 hover:bg-[#e87d05] transition"
                            >
                                {user ? (
                                    // 🚨 Nếu đã đăng nhập, hiển thị icon Logout
                                    <LogOut className="w-5 h-5 md:w-8 md:h-8 text-white" />
                                ) : (
                                    // Nếu chưa đăng nhập, hiển thị icon User
                                    <User className="w-5 h-5 md:w-8 md:h-8 text-white" />
                                )}
                                <span className="text-white text-sm md:text-lg font-medium hidden sm:inline">
                                    {/* 🚨 Hiển thị tên người dùng hoặc nút Logout */}
                                    {user ? (user.name || 'User') : 'Login/Signup'}
                                </span>
                            </button>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="lg:hidden p-2"
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-6 h-6" />
                                ) : (
                                    <Menu className="w-6 h-6" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="lg:hidden mt-4 pb-4 border-t border-black/10 pt-4">
                            <div className="flex flex-col gap-4">
                                {navLinks.map((link) => (
                                    <Link 
                                        key={link.name} 
                                        href={link.href} 
                                        className={`text-lg font-medium ${isActive(link.href) ? 'text-[#FC8A06]' : 'text-black'}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </nav>
            
            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
            />
        </>
    );
}

export default Navbar;