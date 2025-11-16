'use client'
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import foodfastLogo from "@/assets/foodfast_(white_bg_horizontal).png";

const Footer = () => {
    const [email, setEmail] = useState('');

    const handleSubscribe = (e) => {
        e.preventDefault();
        console.log('Subscribe:', email);
        setEmail('');
    };

    return (
        <footer className="w-full bg-neutral-300/60 mt-16">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                    {/* Logo and App Downloads */}
                    <div className="flex flex-col items-center md:items-start">
                        <Image
                            src={foodfastLogo}
                            alt="FoodFast Logo"
                            className="h-20 w-auto mb-6"
                            priority
                        />
                        <img 
                            src="https://api.builder.io/api/v1/image/assets/TEMP/c45cf931a97541dc722da70c06dc0e8cbcc5cafb?width=722" 
                            alt="App Store Badges" 
                            className="w-full max-w-[280px]"
                        />
                    </div>

                    {/* Newsletter */}
                    <div className="flex flex-col items-center md:items-start lg:col-span-1">
                        <h3 className="text-[#FC8A06] text-lg font-bold mb-6 text-center md:text-left">
                            Get Exclusive Deals in your Inbox
                        </h3>
                        <form onSubmit={handleSubscribe} className="w-full max-w-md mb-4">
                            <div className="flex items-center rounded-full overflow-hidden bg-neutral-300">
                                <input 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="youremail@gmail.com"
                                    className="flex-1 px-6 py-4 bg-transparent text-black/60 placeholder-black/60 outline-none text-sm"
                                    required
                                />
                                <button 
                                    type="submit"
                                    className="bg-[#366055] text-white px-8 py-4 font-medium hover:bg-[#2d5046] transition whitespace-nowrap text-lg"
                                >
                                    Subscribe
                                </button>
                            </div>
                        </form>
                        <p className="text-[#FC8A06] text-xs text-center md:text-left">
                            we wont spam, read our <Link href="/" className="underline">email policy</Link>
                        </p>
                        
                        {/* Social Icons */}
                        <div className="flex gap-3 mt-6">
                            <Link href="https://facebook.com" className="hover:opacity-80 transition" target="_blank">
                                <img 
                                    src="https://api.builder.io/api/v1/image/assets/TEMP/546598a9b9b503092ce6f20de76f954d54c7edbe?width=90" 
                                    alt="Facebook" 
                                    className="w-11 h-11"
                                />
                            </Link>
                            <Link href="https://instagram.com" className="hover:opacity-80 transition" target="_blank">
                                <img 
                                    src="https://api.builder.io/api/v1/image/assets/TEMP/e9a11a1fd1fd9c7e9a10ff69fda6862110398bbb?width=90" 
                                    alt="Instagram" 
                                    className="w-11 h-11"
                                />
                            </Link>
                            <Link href="https://tiktok.com" className="hover:opacity-80 transition" target="_blank">
                                <img 
                                    src="https://api.builder.io/api/v1/image/assets/TEMP/6f2e12421ff6e066fb67f54a303970d406273501?width=90" 
                                    alt="TikTok" 
                                    className="w-11 h-11"
                                />
                            </Link>
                            <Link href="https://snapchat.com" className="hover:opacity-80 transition" target="_blank">
                                <img 
                                    src="https://api.builder.io/api/v1/image/assets/TEMP/e7313f7675962f1acfec729475a985a836943995?width=90" 
                                    alt="Snapchat" 
                                    className="w-11 h-11"
                                />
                            </Link>
                        </div>
                    </div>

                    {/* Legal Pages */}
                    <div className="text-center md:text-left">
                        <h3 className="text-[#FC8A06] text-lg font-bold mb-6">Legal Pages</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/" className="text-black underline hover:text-[#FC8A06] transition">
                                    Terms and conditions
                                </Link>
                            </li>
                            <li>
                                <Link href="/" className="text-black underline hover:text-[#FC8A06] transition">
                                    Privacy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Important Links */}
                    <div className="text-center md:text-left">
                        <h3 className="text-[#FC8A06] text-lg font-bold mb-6">Important Links</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <Link href="/" className="text-black underline hover:text-[#FC8A06] transition">
                                    Get help
                                </Link>
                            </li>
                            <li>
                                <Link href="/create-store" className="text-black underline hover:text-[#FC8A06] transition">
                                    Add your restaurant
                                </Link>
                            </li>
                            <li>
                                <Link href="/create-store" className="text-black underline hover:text-[#FC8A06] transition">
                                    Create a business account
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="bg-[#366055] w-full">
                <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-white text-sm text-center md:text-left">
                        FoodFast Copyright 2025, All Rights Reserved.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-white text-sm">
                        <Link href="/" className="hover:underline">Privacy Policy</Link>
                        <Link href="/" className="hover:underline">Terms</Link>
                        <Link href="/pricing" className="hover:underline">Pricing</Link>
                        <Link href="/" className="hover:underline whitespace-nowrap">Do not sell or share my personal information</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
