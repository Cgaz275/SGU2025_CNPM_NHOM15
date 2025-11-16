'use client'
import { useState } from 'react'

export default function CategoryTabs({ categories, activeCategory, onCategoryChange }) {
    return (
        <div className="w-full bg-[#366055] py-3 md:py-5 sticky top-0 z-40">
            <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
                <div className="flex gap-4 md:gap-8 overflow-x-auto no-scrollbar">
                    {categories.map((category, index) => (
                        <button
                            key={category.id || index}
                            onClick={() => onCategoryChange(category.slug || category.name)}
                            className={`px-6 md:px-8 py-2 rounded-full text-white text-base md:text-lg lg:text-xl font-bold whitespace-nowrap transition ${
                                activeCategory === (category.slug || category.name)
                                    ? 'bg-[#FC8A06]'
                                    : 'hover:bg-[#FC8A06]/50'
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
