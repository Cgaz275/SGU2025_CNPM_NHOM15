'use client'
import { MapPin } from "lucide-react";

export default function DeliveryInfoCard({
    address,
    setAddress,
    receiverName,
    setReceiverName,
    phoneNumber,
    setPhoneNumber,
    onMapClick
}) {
    return (
        <div className="bg-[#366055] rounded-[13px] p-6">
            <h2 className="text-white text-2xl md:text-3xl font-semibold mb-4">Delivery Information</h2>
            <div className="h-px bg-white mb-6"></div>

            <div className="space-y-4">
                <div>
                    <label className="text-white text-sm md:text-base block mb-2">
                        Address
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Address Placeholder"
                            className="flex-1 h-[47px] px-3 bg-[#FDFDFD] rounded-md text-base placeholder:text-[#C4C4C4] outline-none"
                        />
                        <button
                            type="button"
                            onClick={onMapClick}
                            className="h-[47px] px-3 md:px-4 bg-[#FDFDFD] text-[#366055] rounded-md hover:bg-white transition flex items-center gap-2 font-medium"
                        >
                            <MapPin size={18} />
                            <span className="hidden sm:inline text-sm">Map</span>
                        </button>
                    </div>
                </div>

                <div>
                    <label className="text-white text-sm md:text-base font-medium block mb-2">
                        Receiver name
                    </label>
                    <input
                        type="text"
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                        placeholder="Receiver name placeholder"
                        className="w-full h-[47px] px-3 bg-[#FDFDFD] rounded-md text-sm md:text-base placeholder:text-[#C4C4C4] outline-none"
                    />
                </div>

                <div>
                    <label className="text-white text-sm md:text-base font-medium block mb-2">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Phone placeholder"
                        className="w-full h-[47px] px-3 bg-[#FDFDFD] rounded-md text-base placeholder:text-[#C4C4C4] outline-none"
                    />
                </div>
            </div>
        </div>
    )
}
