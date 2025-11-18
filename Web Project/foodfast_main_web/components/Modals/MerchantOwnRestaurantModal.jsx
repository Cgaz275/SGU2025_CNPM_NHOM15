'use client'

import { useRouter } from 'next/navigation'
import { X, AlertCircle } from 'lucide-react'

export default function MerchantOwnRestaurantModal({ isOpen, restaurantName, onClose }) {
    const router = useRouter()

    if (!isOpen) return null

    const handleEditClick = () => {
        router.push('/profile')
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-black/10 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <AlertCircle size={24} className="text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Your Restaurant</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-lg transition"
                    >
                        <X size={24} className="text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="space-y-3">
                        <p className="text-gray-700 text-lg font-medium">
                            This is your restaurant: <span className="text-[#366055] font-bold">{restaurantName}</span>
                        </p>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            You cannot add items from your own restaurant to the cart. However, you can manage your menu and restaurant details from your personal dashboard.
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-700">
                            💡 <span className="font-medium">Tip:</span> Visit your restaurant management page to edit dishes, prices, and option groups.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-black/10 p-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleEditClick}
                        className="flex-1 px-4 py-3 bg-[#366055] text-white rounded-lg font-medium hover:bg-[#2b4c44] transition"
                    >
                        Edit Restaurant
                    </button>
                </div>
            </div>
        </div>
    )
}
