'use client'
import { Package, Bike } from 'lucide-react'
import { lazyLoadProps } from '../../utils/imageUtils'

export default function RestaurantHero({ restaurant }) {
    return (
        <section className="w-full max-w-7xl mx-auto px-4 md:px-6 my-6 md:my-8">
            <div className="relative rounded-xl overflow-hidden">
                {/* Background Image with Overlay */}
                <div className="relative h-[300px] md:h-[400px] lg:h-[477px]">
                    <img
                        src={restaurant?.bannerURL || 'https://api.builder.io/api/v1/image/assets/TEMP/ed772e77fe0179e004cc23209229d04c0333a152?width=3056'}
                        alt={restaurant?.name || 'Restaurant'}
                        className="w-full h-full object-cover"
                        {...lazyLoadProps}
                    />
                    <div className="absolute inset-0 bg-[rgba(3,8,31,0.90)]"></div>
                </div>

                {/* Content Grid */}
                <div className="absolute inset-0 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 md:p-12 lg:p-16">
                    {/* Left Side - Restaurant Info */}
                    <div className="flex flex-col justify-center">
                        {/* Tagline */}
                        <p className="text-white text-base md:text-lg lg:text-xl mb-2 md:mb-4">
                            {restaurant?.tagline || "I'm lovin' it!"}
                        </p>

                        {/* Restaurant Name */}
                        <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-semibold mb-6 md:mb-10 leading-tight">
                            {restaurant?.name || "McDonald's Phuong Ben Nghe"}
                        </h1>

                        {/* Delivery Info Badges */}
                        <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                            {/* Drone Delivery Badge */}
                            <div className="flex items-center gap-3 px-6 py-3 md:py-4 rounded-full border border-white w-fit">
                                <Package className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                <span className="text-white text-sm md:text-lg font-semibold whitespace-nowrap">
                                    Delivery by FOODFAST drone
                                </span>
                            </div>

                            {/* Delivery Time Badge */}
                            {/* <div className="flex items-center gap-3 px-6 py-3 md:py-4 rounded-full border border-white w-fit">
                                <Bike className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                <span className="text-white text-sm md:text-lg font-semibold whitespace-nowrap">
                                    Delivery in 5-15 Minutes
                                </span>
                            </div> */}
                        </div>
                    </div>

                    {/* Right Side - Featured Image */}
                    <div className="hidden lg:flex items-center justify-end">
                        <img
                            src={restaurant?.imageUrl || 'https://api.builder.io/api/v1/image/assets/TEMP/ea24ac34f918ce4abfef9346b54adcc6d958d4c1?width=1162'}
                            alt="Featured Food"
                            className="w-full max-w-[581px] h-auto rounded-xl object-cover"
                            {...lazyLoadProps}
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
