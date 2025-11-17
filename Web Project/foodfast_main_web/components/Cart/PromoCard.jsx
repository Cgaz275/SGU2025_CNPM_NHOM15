'use client'

export default function PromoCard({ promoCode, setPromoCode, onApply }) {
    return (
        <div className="bg-[#366055] rounded-[13px] p-6">
            <h2 className="text-white text-2xl md:text-3xl font-semibold mb-4">Promotion Code</h2>
            <div className="h-px bg-white mb-6"></div>
            <p className="text-white text-sm md:text-base font-medium mb-3">Promotion Code</p>
            <div className="flex gap-3">
                <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="enter code"
                    className="flex-1 h-[47px] px-3 bg-[#FDFDFD] rounded-md text-base placeholder:text-[#C4C4C4] outline-none"
                />
                <button
                    onClick={onApply}
                    className="w-[87px] h-[47px] bg-[#FDFDFD] rounded-md text-[#366055] text-base hover:bg-white transition"
                >
                    Apply
                </button>
            </div>
        </div>
    )
}
