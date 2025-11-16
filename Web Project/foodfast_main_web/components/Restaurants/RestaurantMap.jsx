'use client'
import { MapPin } from 'lucide-react'

export default function RestaurantMap({ restaurant }) {
    return (
        <section className="w-full max-w-7xl mx-auto px-4 md:px-6 mb-12 md:mb-16">
            <div className="relative rounded-xl overflow-hidden shadow-[5px_5px_14px_0_rgba(0,0,0,0.25)] h-[400px] md:h-[500px] lg:h-[659px]">
                {/* Map Image/Embed */}
                <img 
                    src={restaurant?.mapImage || 'https://api.builder.io/api/v1/image/assets/TEMP/fe5250591578f16a6371067f4b2bad1265fec013?width=3056'}
                    alt="Restaurant Location"
                    className="w-full h-full object-cover"
                />

                {/* Info Card - Desktop */}
                <div className="hidden md:block absolute bottom-8 left-8 bg-[rgba(3,8,31,0.97)] rounded-xl p-6 md:p-8 max-w-[466px]">
                    <h3 className="text-white text-2xl md:text-3xl font-bold mb-2">
                        McDonald's
                    </h3>
                    <p className="text-[#FC8A06] text-lg md:text-xl font-semibold mb-4">
                        Phuong Ben Nghe
                    </p>
                    
                    <div className="space-y-2 text-white text-base md:text-lg">
                        <p>{restaurant?.address || 'Ben Nghe Ward, Ho Chi Minh City, Vietnam'}</p>
                        <p className="font-bold">Phone number</p>
                        <p className="text-[#FC8A06] text-xl md:text-2xl">
                            {restaurant?.phone || '+88888'}
                        </p>
                    </div>
                </div>

                {/* Location Marker - Desktop */}
                <div className="hidden md:flex absolute top-1/2 right-1/3 transform -translate-y-1/2 items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-lg">
                    <div className="bg-[#366055] rounded-full p-3">
                        <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-[#366055] font-semibold text-sm">McDonald's</p>
                        <p className="text-[#366055] text-xs">Ben Nghe</p>
                    </div>
                </div>
            </div>

            {/* Info Card - Mobile */}
            <div className="md:hidden mt-4 bg-[rgba(3,8,31,0.97)] rounded-xl p-6">
                <h3 className="text-white text-xl font-bold mb-2">
                    McDonald's
                </h3>
                <p className="text-[#FC8A06] text-lg font-semibold mb-4">
                    Phuong Ben Nghe
                </p>
                
                <div className="space-y-2 text-white text-sm">
                    <p>{restaurant?.address || 'Ben Nghe Ward, Ho Chi Minh City, Vietnam'}</p>
                    <p className="font-bold">Phone number</p>
                    <p className="text-[#FC8A06] text-lg">
                        {restaurant?.phone || '+88888'}
                    </p>
                </div>
            </div>
        </section>
    )
}
