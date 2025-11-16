'use client'
import { useRouter } from 'next/navigation';
import usePromotionalDishes from '@/hooks/usePromotionalDishes';

export default function ExclusiveDeals() {
    const router = useRouter();
    const { data: deals, loading, error } = usePromotionalDishes(6);

    const categories = ['Vegan', 'Sushi', 'Pizza & Fast food', 'others'];

    const handleDealClick = (restaurantId) => {
        if (restaurantId) {
            router.push(`/restaurant/${restaurantId}`);
        }
    };

    if (error) {
        return (
            <section className="w-full max-w-7xl mx-auto px-6 my-16">
                <h2 className="text-2xl md:text-3xl font-bold mb-8">
                    Hot Deals Today !
                </h2>
                <p className="text-red-600">Failed to load promotional deals</p>
            </section>
        );
    }

    return (
        <section className="w-full max-w-7xl mx-auto px-6 my-16">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <h2 className="text-2xl md:text-3xl font-bold">
                    Up to -40% FoodFast exclusive deals
                </h2>
                <div className="flex items-center gap-4 md:gap-8 flex-wrap">
                    {categories.map((category, index) => (
                        <button 
                            key={index}
                            className={`text-sm md:text-base ${
                                category === 'Pizza & Fast food' 
                                    ? 'font-semibold text-[#366055] border border-[#366055] rounded-full px-6 py-3' 
                                    : 'text-black'
                            } hover:text-[#366055] transition`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FC8A06] mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading exclusive deals...</p>
                    </div>
                ) : deals.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <p className="text-gray-600">No promotional deals available</p>
                    </div>
                ) : (
                    deals.map((deal) => (
                        <div
                            key={deal.id}
                            className="relative rounded-xl overflow-hidden group cursor-pointer hover:shadow-xl transition"
                            onClick={() => handleDealClick(deal.restaurantId)}
                        >
                            {/* Image */}
                            <div className="relative h-80">
                                <img
                                    src={deal.imageUrl}
                                    alt={deal.dishName}
                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                />
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[rgba(3,8,31,0.19)] to-[rgba(3,8,31,0.89)]"></div>
                            </div>

                            {/* Discount Badge */}
                            <div className="absolute top-0 right-0 bg-[#FC8A06] rounded-bl-xl px-6 py-5">
                                <span className="text-white text-lg font-bold">-{deal.discount_percentage}%</span>
                            </div>

                            {/* Dish Info */}
                            <div className="absolute bottom-0 left-0 p-8">
                                <p className="text-[#FFFFFF] text-lg font-medium mb-2">Special Offer</p>
                                <h3 className="text-white text-2xl font-bold">{deal.dishName}</h3>
                                {deal.minPrice && (
                                    <p className="text-white text-sm mt-2">Condition order min price: {deal.minPrice.toLocaleString()} VND</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </section>
    );
}
