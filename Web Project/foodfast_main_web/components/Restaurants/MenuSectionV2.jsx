'use client'
import MenuItemCard from './MenuItemCardV2'

export default function MenuSection({ title, items, sectionId, onAddToCart }) {
    return (
        <section id={sectionId} className="w-full max-w-7xl mx-auto px-4 md:px-6 mb-12 md:mb-16 scroll-mt-32">
            <h2 className="text-[#366055] text-3xl md:text-4xl lg:text-[44px] font-bold mb-6 md:mb-8">
                {title}
            </h2>

            {items.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No items available in this category</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                    {items.map((item) => (
                        <MenuItemCard 
                            key={item.id} 
                            item={item}
                            onAddToCart={onAddToCart}
                        />
                    ))}
                </div>
            )}
        </section>
    )
}
