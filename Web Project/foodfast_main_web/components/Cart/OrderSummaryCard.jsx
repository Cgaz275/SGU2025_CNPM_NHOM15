'use client'
import { formatPrice } from '@/utils/currencyFormatter'

export default function OrderSummaryCard({
    totalPrice,
    shippingFee,
    discount,
    discountApplied,
    appliedPromo,
    finalTotal,
    paymentMethod,
    setPaymentMethod,
    onPlaceOrder,
    isLoading,
    currency
}) {
    return (
        <div className="bg-[#366055] rounded-[13px] p-6">
            {/* Order Summary */}
            <h2 className="text-white text-2xl md:text-3xl font-semibold mb-4">Order Summary</h2>
            <div className="h-px bg-white mb-6"></div>

            <div className="space-y-4 mb-6">
                <div className="flex justify-between text-white">
                    <span className="text-base md:text-lg font-semibold">Sub-total:</span>
                    <span className="text-base md:text-lg font-normal">
                        {formatPrice(totalPrice)}
                    </span>
                </div>

                <div className="flex justify-between text-white">
                    <div className="flex flex-col">
                        <span className="text-base md:text-lg font-semibold">Discount Applied:</span>
                        {discountApplied && appliedPromo && (
                            <span className="text-sm text-green-300 mt-1">Code: {appliedPromo.code}</span>
                        )}
                    </div>
                    <span className="text-base md:text-lg font-normal">
                        {discountApplied ? formatPrice(discount) : 'No promotion applied'}
                    </span>
                </div>

                <div className="flex justify-between text-white">
                    <span className="text-base md:text-lg font-semibold">Shipping Fee:</span>
                    <span className="text-base md:text-lg font-normal">
                        {formatPrice(shippingFee)}
                    </span>
                </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
                <h3 className="text-white text-base md:text-lg font-semibold mb-4">Payment Method:</h3>
                <div className="flex items-center gap-8">
                    {['COD', 'VNPay', 'VISA'].map((method) => (
                        <label key={method} className="flex items-center gap-3 cursor-pointer">
                            <div className="relative">
                                <div className="w-[13px] h-[13px] rounded-full border-2 border-white bg-transparent"></div>
                                {paymentMethod === method && (
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[9px] h-[9px] rounded-full bg-white"></div>
                                )}
                            </div>
                            <input
                                type="radio"
                                name="payment"
                                value={method}
                                checked={paymentMethod === method}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="sr-only"
                            />
                            <span className="text-white text-base md:text-lg">{method}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="h-px bg-white mb-6"></div>

            {/* Total */}
            <div className="text-white text-2xl md:text-3xl font-semibold mb-8">
                Total: {formatPrice(finalTotal)}
            </div>

            {/* Place Order Button */}
            <button
                onClick={onPlaceOrder}
                disabled={isLoading}
                className="w-full bg-white text-[#366055] py-4 md:py-5 rounded-lg font-bold text-lg md:text-xl hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Placing Order...' : 'Place Order'}
            </button>
        </div>
    )
}
