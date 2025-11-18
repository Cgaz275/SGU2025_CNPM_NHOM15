'use client'

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import useRestaurants from '@/hooks/useRestaurant';
import useCategories from '@/hooks/useCategories';
import { lazyLoadProps } from '@/utils/imageUtils';

const ITEMS_PER_PAGE = 8;
const ITEMS_PER_ROW = 4;

export default function AllRestaurant() {
    const searchParams = useSearchParams();
    const { data: restaurants, loading: restaurantsLoading, error: restaurantsError } = useRestaurants();
    const { data: categories, loading: categoriesLoading } = useCategories();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [pageTitle, setPageTitle] = useState('All Restaurants');

    // Get selected category from URL params on mount
    useEffect(() => {
        const categoryParam = searchParams.get('category');
        if (categoryParam) {
            setSelectedCategory(categoryParam);
        }
    }, [searchParams]);

    // Update page title based on selected category
    useEffect(() => {
        if (selectedCategory && categories.length > 0) {
            const selectedCategoryObj = categories.find(cat => cat.id === selectedCategory);
            if (selectedCategoryObj) {
                setPageTitle(`All Restaurant - ${selectedCategoryObj.name}`);
            }
        } else {
            setPageTitle('All Restaurants');
        }
    }, [selectedCategory, categories]);

    // Filter restaurants by selected category
    const filteredRestaurants = useMemo(() => {
        if (!selectedCategory) {
            return restaurants;
        }
        return restaurants.filter(restaurant => {
            // Match restaurant by category field
            return restaurant.categories === selectedCategory;
        });
    }, [restaurants, selectedCategory]);

    // Sort by rating descending
    const sortedRestaurants = useMemo(() => {
        return [...filteredRestaurants].sort((a, b) => 
            (parseFloat(b.rating) || 0) - (parseFloat(a.rating) || 0)
        );
    }, [filteredRestaurants]);

    // Pagination
    const totalPages = Math.ceil(sortedRestaurants.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const displayedRestaurants = sortedRestaurants.slice(startIndex, endIndex);

    const handleCategoryChange = (categoryId) => {
        setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <h1 className="text-3xl md:text-4xl font-bold mb-8">{pageTitle}</h1>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar - Categories */}
                    <aside className="lg:w-64 flex-shrink-0">
                        <div className="bg-neutral-50 rounded-xl p-6 sticky top-20">
                            <h2 className="text-xl font-bold text-[#366055] mb-6">Categories</h2>

                            {categoriesLoading ? (
                                <div className="text-center py-8">
                                    <p className="text-neutral-600">Loading categories...</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <button
                                        onClick={() => handleCategoryChange(null)}
                                        className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                                            selectedCategory === null
                                                ? 'bg-[#366055] text-white'
                                                : 'text-[#366055] hover:bg-neutral-200'
                                        }`}
                                    >
                                        All Categories
                                    </button>

                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => handleCategoryChange(category.id)}
                                            className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                                                selectedCategory === category.id
                                                    ? 'bg-[#366055] text-white'
                                                    : 'text-[#366055] hover:bg-neutral-200'
                                            }`}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Main Content - Restaurants */}
                    <main className="flex-1">
                        {restaurantsLoading ? (
                            <div className="text-center py-16">
                                <div className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-[#366055]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p className="text-lg text-[#366055]">Loading restaurants...</p>
                                </div>
                            </div>
                        ) : restaurantsError ? (
                            <div className="text-center py-16 bg-red-50 rounded-lg">
                                <p className="text-red-600 font-semibold">Error loading restaurants</p>
                                <p className="text-red-500 text-sm mt-2">{restaurantsError.message}</p>
                            </div>
                        ) : displayedRestaurants.length === 0 ? (
                            <div className="text-center py-16 bg-yellow-50 rounded-lg">
                                <p className="text-xl text-yellow-700 font-semibold">No restaurants found</p>
                                <p className="text-yellow-600 mt-2">Try selecting a different category or clearing filters</p>
                            </div>
                        ) : (
                            <>
                                {/* Restaurant Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                                    {displayedRestaurants.map((restaurant) => (
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
                                                        {...lazyLoadProps}
                                                        onError={(e) => { e.target.onerror = null; e.target.src = '/images/placeholder.png' }}
                                                    />
                                                </div>
                                                <div className="p-4 text-center">
                                                    <h3 className="text-[#366055] text-lg font-bold mb-1 line-clamp-2">
                                                        {restaurant.name}
                                                    </h3>
                                                    <div className="flex items-center justify-center text-sm text-yellow-400">
                                                        ���
                                                        <span className="font-semibold text-[#FC8A06] ml-1">
                                                            {!isNaN(parseFloat(restaurant.rating)) && restaurant.rating !== null
                                                                ? parseFloat(restaurant.rating).toFixed(1)
                                                                : 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-2 mt-12">
                                        {/* Previous Button */}
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 rounded-lg border border-[#366055] text-[#366055] font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#366055] hover:text-white transition"
                                        >
                                            Previous
                                        </button>

                                        {/* Page Numbers */}
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`px-4 py-2 rounded-lg font-semibold transition ${
                                                    currentPage === page
                                                        ? 'bg-[#366055] text-white'
                                                        : 'border border-[#366055] text-[#366055] hover:bg-[#366055] hover:text-white'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}

                                        {/* Next Button */}
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 rounded-lg border border-[#366055] text-[#366055] font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#366055] hover:text-white transition"
                                        >
                                            Next
                                        </button>
                                    </div>
                                )}

                                {/* Results Info */}
                                <div className="text-center mt-8 text-neutral-600">
                                    <p>
                                        Showing {startIndex + 1} to {Math.min(endIndex, sortedRestaurants.length)} of {sortedRestaurants.length} restaurants
                                    </p>
                                </div>
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
