'use client'
import { Search } from 'lucide-react';
import { useState } from 'react';
import { lazyLoadProps } from '../../utils/imageUtils';

export default function Hero() {
    const [location, setLocation] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        console.log('Searching for:', location);
    };

    return (
        <section className="relative w-full max-w-7xl mx-auto px-6 my-12">
            <div className="relative rounded-xl border border-black/20 overflow-hidden">
                {/* Background Image */}
                <div className="relative h-[400px] md:h-[500px] lg:h-[600px]">
                    <img
                        src="https://api.builder.io/api/v1/image/assets/TEMP/bf0976056c427ef734d611f6a1e604c1d394dcd7?width=3056"
                        alt="Drone Delivery"
                        className="w-full h-full object-cover"
                        {...lazyLoadProps}
                    />
                    {/* Overlay for better text readability */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
                </div>

                {/* Content Overlay */}
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full max-w-2xl px-6 md:px-12 lg:px-20">
                        {/* Tagline */}
                        <p className="text-white text-base md:text-lg mb-4">
                            Order Restaurant food, takeaway and groceries.
                        </p>

                        {/* Main Heading */}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold mb-8 leading-tight">
                            <span className="text-[#F79B31]">Drone Delivery,</span>
                            <br />
                            <span className="text-white">Fast and Fresh</span>
                        </h1>

                        {/* Search Form */}
                        <div>
                            <label className="text-white text-sm mb-2 block">
                                Searching for location
                            </label>
                            <form onSubmit={handleSearch} className="flex rounded-full overflow-hidden max-w-md bg-white border border-black/40">
                                <input 
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    placeholder="Ho Chi Minh city..."
                                    className="flex-1 px-6 py-4 text-black/80 placeholder-black/80 outline-none"
                                />
                                <button 
                                    type="submit"
                                    className="bg-[#F79B31] text-white px-8 py-4 font-bold flex items-center gap-2 hover:bg-[#e88c2a] transition"
                                >
                                    <Search className="w-5 h-5" />
                                    <span className="hidden sm:inline">Search</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
