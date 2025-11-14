'use client'

import { User, Menu, X, ShoppingBasket } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useSelector } from "react-redux";
import { usePathname } from 'next/navigation'; // <-- Import Hook để lấy đường dẫn hiện tại

// Đảm bảo import AuthModal đúng đường dẫn
import AuthModal from './AuthModal'; 


const Navbar = () => {
    const pathname = usePathname(); // Lấy đường dẫn hiện tại
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); 

    const cartCount = useSelector(state => state.cart.total); 


    const navLinks = [
        { name: 'Home', href: '/', active: true },
        { name: 'Special Offers', href: '/pricing' },
        { name: 'Restaurants', href: '/shop' },
    ];


    // Component CartLink tái sử dụng (giữ nguyên)
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
    
    // Hàm kiểm tra link active
    const isActive = (href) => {
        // Kiểm tra đường dẫn chính xác hoặc bắt đầu bằng (ví dụ: /shop và /shop/details)
        if (href === '/') {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };


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
                            />
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center gap-8">
                            {navLinks.map((link) => {
                                const active = isActive(link.href);
                                
                                return (
                                    <div 
                                        key={link.name}
                                        // Áp dụng style nổi bật nếu active
                                        className={active ? 'bg-[#366055] rounded-full px-6 py-3 transition' : ''}
                                    >
                                        <Link 
                                            href={link.href} 
                                            className={`text-lg font-medium transition 
                                                ${active 
                                                    ? 'text-white' // Màu trắng cho link active (có background)
                                                    : 'text-black hover:text-[#FC8A06]' // Màu đen cho link thường
                                                }
                                            `}
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

                            {/* Login Button */}
                            <button 
                                onClick={() => setIsAuthModalOpen(true)}
                                className="bg-[#366055] rounded-full px-4 md:px-8 py-2 md:py-4 flex items-center gap-2 md:gap-3 hover:bg-[#e87d05] transition"
                            >
                                <User className="w-5 h-5 md:w-8 md:h-8 text-white" />
                                <span className="text-white text-sm md:text-lg font-medium hidden sm:inline">
                                    Login/Signup
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
                                        // Sử dụng isActive cho menu mobile
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