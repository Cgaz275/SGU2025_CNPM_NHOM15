'use client'
import Link from 'next/link'
import { lazyLoadProps } from '../../utils/imageUtils'

export default function SimilarRestaurants({ restaurants, categoryId }) {
    if (!restaurants || restaurants.length === 0) {
        return null
    }

    const displayedRestaurants = restaurants.slice(0, 6)
    const hasMore = restaurants.length > 6

    return (
        <section className="w-full max-w-7xl mx-auto px-4 md:px-6 mb-12 md:mb-16">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <h2 className="text-black text-2xl md:text-3xl lg:text-[32px] font-bold">
                    Similar Restaurants
                </h2>
                {hasMore && categoryId && (
                    <Link
                        href={`/AllResturant?category=${categoryId}`}
                        className="text-[#FC8A06] font-semibold hover:text-[#e87d05] transition text-lg md:text-base"
                    >
                        See All →
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                {displayedRestaurants.map((restaurant) => (
                    <Link
                        key={restaurant.id}
                        href={`/restaurant/${restaurant.id}`}
                        className="group"
                    >
                        <div className="bg-neutral-100 rounded-xl overflow-hidden hover:shadow-lg transition h-full">
                            <div className="relative w-full aspect-square">
                                <img
                                    src={restaurant.image || restaurant.imageUrl}
                                    alt={restaurant.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                    {...lazyLoadProps}
                                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.png' }}
                                />
                            </div>
                            <div className="p-3 md:p-4 text-center">
                                <h3 className="text-[#366055] text-sm md:text-base font-bold line-clamp-2">
                                    {restaurant.name}
                                </h3>
                                {/* {restaurant.rating && (
                                    <div className="flex items-center justify-center text-xs md:text-sm text-yellow-400 mt-1">
                                        ⭐
                                        <span className="font-semibold text-[#FC8A06] ml-1">
                                            {parseFloat(restaurant.rating).toFixed(1)}
                                        </span>
                                    </div>
                                )} */}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
