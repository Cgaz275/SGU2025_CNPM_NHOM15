'use client'
'use client'
import { useRouter } from 'next/navigation';
import usePromotionalRestaurants from '@/hooks/usePromotionalRestaurants';
import { Star } from 'lucide-react';

export default function ExclusiveDeals() {
    const router = useRouter();
    const { data: deals, loading, error } = usePromotionalRestaurants(6);

    const handleSeeAll = () => {
        router.push('/AllResturant');
    };

    const handleDealClick = (restaurantId) => {
        if (restaurantId) {
            router.push(`/restaurant/${restaurantId}`);
        }
    };

    if (error) {
        return (
            <section className="w-full max-w-7xl mx-auto px-6 my-16">
                <h2 className="text-2xl md:text-3xl font-bold mb-8">
                    Deals
                </h2>
                <p className="text-red-600">Failed to load restaurants</p>
            </section>
        );
    }

    return (
        <section className="w-full max-w-7xl mx-auto px-6 my-16">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <h2 className="text-2xl md:text-3xl font-bold">
                    Restaurant hot deals right today!
                </h2>
                <div className="flex items-center gap-4 md:gap-8 flex-wrap">
                    <button
                        onClick={handleSeeAll}
                        className='font-semibold text-[#366055] border border-[#366055] rounded-full px-6 py-3 hover:bg-[#366055] hover:text-white transition'
                    >
                        See all restaurants
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FC8A06] mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading restaurants...</p>
                    </div>
                ) : deals.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <p className="text-gray-600">No restaurants available</p>
                    </div>
                ) : (
                    deals.map((deal) => (
                        <div
                            key={deal.id}
                            className="relative rounded-xl overflow-hidden group cursor-pointer hover:shadow-xl transition"
                            onClick={() => handleDealClick(deal.restaurantId)}
                        >
                            {/* Image */}
                            <div className="relative h-80 bg-gray-200">
                                {deal.restaurantImageUrl ? (
                                    <img
                                        src={deal.restaurantImageUrl}
                                        alt={deal.restaurantName}
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                                        <p className="text-gray-600">No image available</p>
                                    </div>
                                )}
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[rgba(3,8,31,0.19)] to-[rgba(3,8,31,0.89)]"></div>
                            </div>

                            {/* Discount Badge */}
                            <div className="absolute top-0 right-0 bg-[#FC8A06] rounded-bl-xl px-6 py-5">
                                <span className="text-white text-lg font-bold">-{deal.discount_percentage}%</span>
                            </div>

                            {/* Restaurant Info */}
                            <div className="absolute bottom-0 left-0 p-8 w-full">
                                <h3 className="text-white text-2xl font-bold mb-2">{deal.restaurantName}</h3>
                                {deal.address && (
                                    <p className="text-gray-100 text-sm mb-3 line-clamp-2">{deal.address}</p>
                                )}
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 fill-[#FC8A06] text-[#FC8A06]" />
                                        <span className="text-white font-semibold">{deal.rating || 0}</span>
                                    </div>
                                    {deal.minPrice && (
                                        <span className="text-gray-200 text-sm">• Min: {deal.minPrice.toLocaleString()} VND</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
