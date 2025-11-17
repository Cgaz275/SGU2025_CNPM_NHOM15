'use client'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import OrderModal from '../Modals/OrderModal'
import { lazyLoadProps } from '../../utils/imageUtils'
import { formatPrice } from '../../utils/currencyFormatter'

export default function MenuItemCard({ item, onAddToCart }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [quantity, setQuantity] = useState(1)

    const handleAddClick = () => {
        if (item.optionGroup) {
            setIsModalOpen(true)
        } else {
            // If no option group, add directly to cart with selected quantity
            onAddToCart({
                dishId: item.id,
                dishName: item.name,
                price: item.price,
                quantity: quantity,
                selectedChoices: {},
                imageUrl: item.imageUrl || item.image,
            })
            setQuantity(1)
        }
    }

    const handleQuantityChange = (newQuantity) => {
        if (newQuantity > 0) {
            setQuantity(newQuantity)
        }
    }

    return (
        <>
            <div className="bg-[#FDFDFD] rounded-xl border border-black/10 shadow-[5px_5px_34px_0_rgba(0,0,0,0.25)] overflow-hidden hover:shadow-[5px_5px_44px_0_rgba(0,0,0,0.35)] transition">
                <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4">
                    {/* Left Side - Info */}
                    <div className="flex flex-col justify-between">
                        <div>
                            <h3 className="text-black text-lg md:text-xl font-semibold mb-2 md:mb-3 leading-tight">
                                {item.name}
                            </h3>
                            <p className="text-black text-xs md:text-sm leading-relaxed mb-3 md:mb-4 line-clamp-3">
                                {item.description}
                            </p>
                        </div>
                        <p className="text-[#366055] text-base md:text-lg font-bold">
                            {formatPrice(item.price)}
                        </p>
                    </div>

                    {/* Right Side - Image and Add Button */}
                    <div className="relative w-full sm:w-[180px] md:w-[203px] h-[180px] md:h-[199px] flex-shrink-0">
                        <img
                            src={item.imageUrl || item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-xl"
                            {...lazyLoadProps}
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/200' }}
                        />

                        {/* Quantity and Add Button */}
                        <div className="absolute bottom-0 right-0 flex items-center gap-2 p-2 bg-white/90 rounded-tl-[45px] rounded-br-xl">
                            {!item.optionGroup && (
                                <div className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
                                    <button
                                        onClick={() => handleQuantityChange(quantity - 1)}
                                        className="text-[#366055] font-bold text-sm w-6 h-6 flex items-center justify-center hover:bg-white rounded transition"
                                        aria-label="Decrease quantity"
                                    >
                                        −
                                    </button>
                                    <span className="text-[#366055] font-bold text-sm w-6 text-center">{quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange(quantity + 1)}
                                        className="text-[#366055] font-bold text-sm w-6 h-6 flex items-center justify-center hover:bg-white rounded transition"
                                        aria-label="Increase quantity"
                                    >
                                        +
                                    </button>
                                </div>
                            )}
                            <button
                                onClick={handleAddClick}
                                className="w-10 h-10 md:w-12 md:h-12 bg-white hover:bg-gray-100 rounded flex items-center justify-center transition group"
                                aria-label="Add to cart"
                            >
                                <Plus className="w-6 h-6 md:w-8 md:h-8 text-[#366055] group-hover:scale-110 transition" strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Order Modal */}
            {item.optionGroup && (
                <OrderModal
                    isOpen={isModalOpen}
                    dish={item}
                    optionGroupId={item.optionGroup}
                    onClose={() => setIsModalOpen(false)}
                    onAddToCart={onAddToCart}
                />
            )}
        </>
    )
}
