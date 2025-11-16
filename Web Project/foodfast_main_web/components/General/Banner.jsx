'use client'
import { MapPin } from 'lucide-react';
import Link from 'next/link';

export default function Banner() {
    return (
        <div className="w-full bg-neutral-100 border-b border-black/10">
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🌟</span>
                    <p className="text-sm md:text-base">
                        <span className="text-black">Get 5% Off your first order,</span>
                        <Link href="/" className="ml-1 font-bold text-[#366055] underline">
                            Promo: ORDER5
                        </Link>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-[#FC8A06]" />
                    <span className="text-[#FC8A06] text-sm md:text-base font-medium">
                        Ho Chi Minh city, Vietnam
                    </span>
                    <Link href="/" className="text-[#366055] text-sm font-medium underline ml-4">
                        Change Location
                    </Link>
                </div>
            </div>
        </div>
    );
}
