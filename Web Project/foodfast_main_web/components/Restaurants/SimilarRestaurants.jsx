'use client'
import Link from 'next/link'

export default function SimilarRestaurants({ restaurants }) {
    return (
        <section className="w-full max-w-7xl mx-auto px-4 md:px-6 mb-12 md:mb-16">
            <h2 className="text-black text-2xl md:text-3xl lg:text-[32px] font-bold mb-6 md:mb-12">
                Similar Restaurants
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                {restaurants.map((restaurant) => (
                    <Link 
                        key={restaurant.id}
                        href={`/restaurant/${restaurant.id}`}
                        className="group"
                    >
                        <div className="bg-[#FC8A06] rounded-xl overflow-hidden hover:shadow-lg transition">
                            <div className="relative w-full aspect-[238/203]">
                                <img 
                                    src={restaurant.image}
                                    alt={restaurant.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                />
                            </div>
                            <div className="p-3 md:p-4">
                                <h3 className="text-white text-sm md:text-base lg:text-lg font-bold text-center">
                                    {restaurant.name}
                                </h3>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
