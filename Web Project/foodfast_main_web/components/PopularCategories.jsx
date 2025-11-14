import React from 'react';
// 1. Import custom hook đã tạo
import useCategories from '../hooks/useCategories'; 

export default function PopularCategories() {
    // 2. Sử dụng hook để lấy dữ liệu và trạng thái
    const { 
        data: categories, 
        loading, 
        error 
    } = useCategories();

    // --- 3. Xử lý trạng thái Loading ---
    if (loading) {
        return (
            <section className="w-full max-w-7xl mx-auto px-6 my-16 text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-8">
                    FoodFast Popular Categories
                </h2>
                <div className="text-xl text-[#FC8A06] flex items-center justify-center p-12 bg-neutral-100 rounded-xl">
                    {/* Sử dụng Spinner */}
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#FC8A06]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading popular categories...
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
    
    // --- 4. Hiển thị dữ liệu khi đã tải xong ---
    return (
        <section className="w-full max-w-7xl mx-auto px-6 my-16">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">
                FoodFast Popular Categories ({categories.length} found)
            </h2>

            {categories.length === 0 ? (
                <div className="text-center p-12 bg-yellow-50 rounded-xl">
                    <p className="text-xl text-yellow-700">No categories found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    {/* Lặp qua mảng categories lấy từ Firestore */}
                    {categories.map((category) => (
                        <div 
                            key={category.id}
                            className="bg-neutral-100 rounded-xl border border-black/10 overflow-hidden hover:shadow-lg transition cursor-pointer group"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img 
                                    src={category.imageUrl} 
                                    alt={category.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                                    onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder.png' }}
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="text-[#366055] text-lg font-bold mb-1">
                                    {category.name}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}