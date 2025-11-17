'use client'
import { MapPin } from 'lucide-react';

export default function ProfileForm({
    formData,
    onInputChange,
    isEditing,
    onMapClick
}) {
    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm sm:text-base text-black opacity-80 mb-2">
                    Full Name
                </label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={onInputChange}
                    disabled={!isEditing}
                    placeholder="Your First Name"
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-lg bg-[#F9F9F9] text-sm sm:text-base text-black placeholder-black/40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#366055]"
                />
            </div>

            <div>
                <label className="block text-sm sm:text-base text-black opacity-80 mb-2">
                    Default Address
                </label>
                <div className="flex gap-3">
                    <input
                        type="text"
                        name="defaultAddress"
                        value={formData.defaultAddress}
                        onChange={onInputChange}
                        disabled={!isEditing}
                        placeholder="Your Address"
                        className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-lg bg-[#F9F9F9] text-sm sm:text-base text-black placeholder-black/40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#366055]"
                    />
                    {isEditing && (
                        <button
                            type="button"
                            onClick={onMapClick}
                            className="px-4 sm:px-6 py-3 sm:py-4 bg-[#366055] text-white rounded-lg font-medium hover:bg-[#2b4c44] transition flex items-center gap-2 whitespace-nowrap"
                        >
                            <MapPin size={18} />
                            <span className="hidden sm:inline">Pick on Map</span>
                            <span className="sm:hidden">Map</span>
                        </button>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm sm:text-base text-black opacity-80 mb-2">
                    Phone number
                </label>
                <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={onInputChange}
                    disabled={!isEditing}
                    placeholder="Your phone number"
                    className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-lg bg-[#F9F9F9] text-sm sm:text-base text-black placeholder-black/40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#366055]"
                />
            </div>
        </div>
    )
}
