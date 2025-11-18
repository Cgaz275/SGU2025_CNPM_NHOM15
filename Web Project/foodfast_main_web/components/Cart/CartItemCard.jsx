'use client'
import Counter from "@/components/Counter";
import { XIcon } from "lucide-react";
import Image from "next/image";
import { formatPrice } from "@/utils/currencyFormatter";
import { useState } from "react";

export default function CartItemCard({ item, onDelete, currency }) {
    const [imageLoadError, setImageLoadError] = useState(false);

    const handleImageError = () => {
        setImageLoadError(true);
    };

    const getImageUrl = () => {
        if (item.images && item.images[0]) return item.images[0];
        if (item.imageUrl) return item.imageUrl;
        return null;
    };

    const imageUrl = getImageUrl();

    // Get addon price from metadata if available
    const addonPrice = item.addonPrice || 0;
    const basePrice = item.basePrice || item.price || 0;
    const totalItemPrice = basePrice + addonPrice;
    const addonDetails = item.addonDetails || [];

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
                <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {imageUrl && !imageLoadError ? (
                        <Image
                            src={imageUrl}
                            className="w-full h-full object-cover"
                            alt={item.name}
                            width={112}
                            height={112}
                            onError={handleImageError}
                            priority={false}
                        />
                    ) : (
                        <div className="text-slate-400 text-xs text-center">No image</div>
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
                            Unit price: {formatPrice(basePrice)}
                        </p>
                        {addonDetails.length > 0 ? (
                            <div className="text-[#03081F] text-sm md:text-base space-y-1">
                                {(() => {
                                    // Group addons by groupName
                                    const groupedAddons = {};
                                    addonDetails.forEach(addon => {
                                        if (!groupedAddons[addon.groupName]) {
                                            groupedAddons[addon.groupName] = [];
                                        }
                                        groupedAddons[addon.groupName].push(addon);
                                    });

                                    return Object.entries(groupedAddons).map(([groupName, items]) => (
                                        <div key={groupName}>
                                            <p className="font-medium">
                                                {groupName}: {items.map((item, idx) => (
                                                    <span key={idx}>
                                                        {item.choiceName}
                                                        {item.price > 0 && ` (+${formatPrice(item.price)})`}
                                                        {idx < items.length - 1 ? ', ' : ''}
                                                    </span>
                                                ))}
                                            </p>
                                        </div>
                                    ));
                                })()}
                            </div>
                        ) : addonPrice > 0 && (
                            <p className="text-[#03081F] text-sm md:text-base">
                                Addons: {formatPrice(addonPrice)}
                            </p>
                        )}
                    </div>
                    <div className="mt-4">
                        <p className="text-sm md:text-base">
                            <span className="text-[#03081F]">Total: </span>
                            <span className="text-[#FC8A06] text-xl md:text-2xl font-bold">
                                {formatPrice(totalItemPrice * item.quantity)}
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
