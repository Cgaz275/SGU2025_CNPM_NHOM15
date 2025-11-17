'use client'
import Counter from "@/components/Counter";
import { XIcon } from "lucide-react";
import Image from "next/image";

export default function CartItemCard({ item, onDelete, currency }) {
    return (
        <div className="relative bg-[#FAFAF6] rounded-xl p-8 shadow-sm">
            {/* Remove Button */}
            <button
                onClick={() => onDelete(item.id)}
                className="absolute -left-4 -top-4 w-8 h-8 bg-[#366055] rounded-full flex items-center justify-center hover:bg-[#2a4d42] transition"
            >
                <XIcon size={15} className="text-white" />
            </button>

            <div className="flex flex-col sm:flex-row gap-6">
                {/* Product Image */}
                <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    {item.images && item.images[0] ? (
                        <Image
                            src={item.images[0]}
                            className="w-auto h-20 object-contain"
                            alt={item.name}
                            width={113}
                            height={113}
                        />
                    ) : item.imageUrl ? (
                        <Image
                            src={item.imageUrl}
                            className="w-auto h-20 object-contain"
                            alt={item.name}
                            width={113}
                            height={113}
                        />
                    ) : (
                        <div className="text-slate-400 text-xs">No image</div>
                    )}
                </div>

                {/* Product Info */}
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <h3 className="text-[#366055] text-xl md:text-2xl font-bold leading-tight mb-2">
                            {item.name}
                        </h3>
                        <p className="text-[#03081F] text-sm md:text-base">
                            {item.category || 'Product Category'}
                        </p>
                        <p className="text-[#03081F] text-sm md:text-base">
                            Unit price: {item.price.toLocaleString()} {currency}
                        </p>
                        <p className="text-[#03081F] text-sm md:text-base">
                            Size: {item.size || 'Standard'}
                        </p>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm md:text-base">
                            <span className="text-[#03081F]">Total: </span>
                            <span className="text-[#FC8A06] text-xl md:text-2xl font-bold">
                                {(item.price * item.quantity).toLocaleString()} {currency}
                            </span>
                        </p>
                    </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex sm:flex-col items-center justify-center">
                    <Counter productId={item.id} />
                </div>
            </div>
        </div>
    )
}
