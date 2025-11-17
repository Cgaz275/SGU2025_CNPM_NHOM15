'use client'
import { X, AlertTriangle } from 'lucide-react'

export default function ClearCartConfirmModal({ 
    isOpen, 
    onClose, 
    onConfirm, 
    currentRestaurantName, 
    newRestaurantName,
    isLoading = false 
}) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
                {/* Header */}
                <div className="border-b border-gray-200 p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="w-6 h-6 text-orange-600"/>
                        <h2 className="text-xl font-bold text-black">Switch Restaurant?</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                        aria-label="Close modal"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <p className="text-gray-700 text-base">
                        Your cart contains items from <span className="font-semibold text-black">{currentRestaurantName}</span>.
                    </p>
                    
                    <p className="text-gray-700 text-base">
                        Adding items from <span className="font-semibold text-black">{newRestaurantName}</span> will clear your existing cart.
                    </p>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mt-4">
                        <p className="text-sm text-orange-700">
                            You can only have items from one restaurant at a time.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 text-center rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-3 text-center rounded-lg font-medium text-white bg-orange-400 bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Processing...' : 'Proceed'}
                    </button>
                </div>
            </div>
        </div>
    )
}
