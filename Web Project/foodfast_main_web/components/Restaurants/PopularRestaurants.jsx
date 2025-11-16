import React from 'react';
import Link from 'next/link';
// 1. Import custom hook đã tạo
import useRestaurants from '../../hooks/useRestaurant'; 

export default function PopularRestaurants() {
    // 2. Sử dụng hook để lấy dữ liệu và trạng thái
    const { 
        data: restaurants, 
        loading, 
        error 
    } = useRestaurants();

    // --- 3. Xử lý trạng thái Loading ---
    if (loading) {
        return (
            <section className="w-full max-w-7xl mx-auto px-6 my-16 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-8">
                    Popular Restaurants
                </h2>
                <div className="text-xl text-white flex items-center justify-center p-12 bg-[#366055] rounded-xl">
                    {/* Sử dụng Spinner */}
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading popular restaurants...
                </div>
            </section>
        );
    }

    // --- 3. Xử lý trạng thái Error ---
    if (error) {
        return (
            <section className="w-full max-w-7xl mx-auto px-6 my-16">
                <h2 className="text-2xl md:text-3xl font-bold mb-8 text-red-600">
                    Data fetching errors
                </h2>
                <p className="text-red-500 bg-red-100 p-4 rounded-lg border border-red-300">
                    Cannot download data from Firestore: **{error.message || 'Unknown error'}**
                </p>
            </section>
        );
    }

    // --- 4. Hiển thị dữ liệu khi đã tải xong (thêm rating) ---
    return (
        <section className="w-full max-w-7xl mx-auto px-6 my-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">
                Popular Restaurants
            </h2>
            
            {restaurants.length === 0 ? (
                <div className="text-center p-12 bg-yellow-50 rounded-xl">
                    <p className="text-xl text-yellow-700">No popular restaurants found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {/* Lặp qua mảng restaurants lấy từ Firestore */}
                    {restaurants.map((restaurant) => (
                        <Link
                            key={restaurant.id}
                            href={`/restaurant/${restaurant.id}`}
                            className="group"
                        >
                            <div className="bg-neutral-100 rounded-xl overflow-hidden hover:shadow-xl transition cursor-pointer h-full">
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={restaurant.image || restaurant.imageUrl}
                                        alt={restaurant.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                        onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png' }}
                                    />
                                </div>
                                <div className="p-4 text-center">
                                    <h3 className="text-[#366055] text-lg font-bold mb-1">
                                        {/* Hiển thị tên nhà hàng */}
                                        {restaurant.name}
                                    </h3>
                                    <div className="flex items-center justify-center text-sm text-yellow-400">
                                        ⭐
                                        <span className="font-semibold text-[#FC8A06] ml-1">
                                            {/* Đảm bảo rating là số trước khi gọi toFixed */}
                                            {
                                                !isNaN(parseFloat(restaurant.rating)) && restaurant.rating !== null
                                                    ? parseFloat(restaurant.rating).toFixed(1)
                                                    : 'N/A'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}
