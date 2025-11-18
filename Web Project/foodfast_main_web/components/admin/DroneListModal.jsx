'use client'
import { X } from 'lucide-react'

export default function DroneListModal({ isOpen, station, onClose }) {
    if (!isOpen || !station) return null

    const droneList = Array.isArray(station.droneList) ? station.droneList : []

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-96 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800">
                        Drones in {station.name}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {droneList.length === 0 ? (
                        <p className="text-slate-500 text-center py-8">No drones assigned</p>
                    ) : (
                        <ul className="space-y-2">
                            {droneList.map((drone, idx) => (
                                <li
                                    key={idx}
                                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition"
                                >
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-slate-700 font-medium">{drone}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 p-4 bg-slate-50">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}
