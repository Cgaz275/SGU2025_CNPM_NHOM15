'use client'
import { useState } from 'react'
import { X, Plus, Minus } from 'lucide-react'
import useOptionGroup from '@/hooks/useOptionGroup'

export default function OrderModal({ isOpen, dish, optionGroupId, onClose, onAddToCart }) {
    const { data: optionGroup, loading } = useOptionGroup(optionGroupId)
    const [selectedChoices, setSelectedChoices] = useState({})
    const [quantity, setQuantity] = useState(1)

    if (!isOpen || !dish) return null

    const handleChoiceChange = (groupName, choiceName) => {
        setSelectedChoices(prev => ({
            ...prev,
            [groupName]: choiceName
        }))
    }

    const handleAddToCart = () => {
        const orderData = {
            dishId: dish.id,
            dishName: dish.name,
            price: dish.price,
            quantity,
            selectedChoices,
            optionGroup: optionGroup?.name
        }
        onAddToCart(orderData)
        handleClose()
    }

    const handleClose = () => {
        setSelectedChoices({})
        setQuantity(1)
        onClose()
    }

    const calculateTotal = () => {
        let total = dish.price * quantity
        
        if (optionGroup?.choices) {
            Object.values(selectedChoices).forEach(choiceName => {
                const choice = optionGroup.choices.find(c => c.name === choiceName)
                if (choice && choice.price) {
                    total += choice.price * quantity
                }
            })
        }
        
        return total.toFixed(2)
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-black/10 p-6 flex items-center justify-between">
                    <h2 className="text-xl md:text-2xl font-bold text-black">
                        {dish.name}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                        aria-label="Close modal"
                    >
                        <X className="w-6 h-6 text-black" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Dish Image */}
                    {dish.imageUrl && (
                        <img
                            src={dish.imageUrl}
                            alt={dish.name}
                            className="w-full h-48 object-cover rounded-lg"
                        />
                    )}

                    {/* Description */}
                    {dish.description && (
                        <p className="text-gray-600 text-sm md:text-base">
                            {dish.description}
                        </p>
                    )}

                    {/* Option Groups */}
                    {loading ? (
                        <div className="text-center py-4">
                            <p className="text-gray-500">Loading options...</p>
                        </div>
                    ) : optionGroup?.choices ? (
                        <div className="space-y-4">
                            <h3 className="font-bold text-black text-lg">
                                {optionGroup.name || 'Choose Options'}
                            </h3>
                            <div className="space-y-2">
                                {optionGroup.choices.map((choice, index) => (
                                    <label
                                        key={index}
                                        className="flex items-center gap-3 p-3 border border-black/10 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                                    >
                                        <input
                                            type="radio"
                                            name={optionGroup.name}
                                            value={choice.name}
                                            checked={selectedChoices[optionGroup.name] === choice.name}
                                            onChange={() => handleChoiceChange(optionGroup.name, choice.name)}
                                            className="w-4 h-4 cursor-pointer"
                                        />
                                        <div className="flex-1">
                                            <p className="text-black font-medium">
                                                {choice.name}
                                            </p>
                                        </div>
                                        {choice.price > 0 && (
                                            <p className="text-[#366055] font-bold">
                                                +{choice.price.toLocaleString()}đ
                                            </p>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {/* Quantity Selector */}
                    <div className="border-t border-black/10 pt-4">
                        <p className="text-black font-semibold mb-3">Quantity</p>
                        <div className="flex items-center gap-4 bg-gray-100 rounded-lg w-fit p-2">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="p-2 hover:bg-white rounded transition"
                                aria-label="Decrease quantity"
                            >
                                <Minus className="w-5 h-5 text-black" />
                            </button>
                            <span className="text-lg font-bold text-black w-8 text-center">
                                {quantity}
                            </span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="p-2 hover:bg-white rounded transition"
                                aria-label="Increase quantity"
                            >
                                <Plus className="w-5 h-5 text-black" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer - Total and Add Button */}
                <div className="sticky bottom-0 bg-white border-t border-black/10 p-6 space-y-3">
                    <div className="flex justify-between items-center">
                        <p className="text-gray-600">Total price:</p>
                        <p className="text-2xl font-bold text-[#366055]">
                            {calculateTotal()} VND
                        </p>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-[#FC8A06] text-white py-3 rounded-lg font-bold text-lg hover:bg-[#e88c2a] transition"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    )
}
