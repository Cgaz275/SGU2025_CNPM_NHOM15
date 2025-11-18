'use client'
import { useState } from 'react'
import { X, Battery, MapPin, Zap, AlertCircle } from 'lucide-react'
import useDronesAdmin from '@/hooks/useDronesAdmin'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/config/FirebaseConfig'
import toast from 'react-hot-toast'

export default function AssignDroneModal({ isOpen, order, onClose, onAssignSuccess }) {
    const { data: drones, loading: dronesLoading } = useDronesAdmin()
    const [selectedDroneId, setSelectedDroneId] = useState(null)
    const [assigning, setAssigning] = useState(false)

    // Calculate distance between two coordinates
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371 // Earth's radius in km
        const dLat = ((lat2 - lat1) * Math.PI) / 180
        const dLon = ((lon2 - lon1) * Math.PI) / 180
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    }

    // Get available drones sorted by battery and proximity
    const getAvailableDrones = () => {
        const orderLat = order?.address?.latlong?.latitude || 10.7624 // Default to Ho Chi Minh
        const orderLon = order?.address?.latlong?.longitude || 106.6597

        const available = drones.filter(drone => {
            return (drone.status === 'active' || drone.status === 'available') && drone.battery > 20
        })

        // Sort by battery (high first) and distance (close first)
        return available.sort((a, b) => {
            // Get drone locations
            const aLat = a.latlong?.latitude || 10.7624
            const aLon = a.latlong?.longitude || 106.6597
            const bLat = b.latlong?.latitude || 10.7624
            const bLon = b.latlong?.longitude || 106.6597

            // Calculate distances
            const distA = calculateDistance(orderLat, orderLon, aLat, aLon)
            const distB = calculateDistance(orderLat, orderLon, bLat, bLon)

            // Priority: Battery first (70%), then distance (30%)
            const scoreA = (a.battery * 0.7) - (distA * 0.3)
            const scoreB = (b.battery * 0.7) - (distB * 0.3)

            return scoreB - scoreA
        })
    }

    // Format battery color
    const getBatteryColor = (battery) => {
        if (battery >= 80) return 'text-green-600 bg-green-50'
        if (battery >= 50) return 'text-blue-600 bg-blue-50'
        if (battery >= 30) return 'text-yellow-600 bg-yellow-50'
        return 'text-red-600 bg-red-50'
    }

    const getBatteryIcon = (battery) => {
        if (battery >= 80) return '🔋'
        if (battery >= 50) return '🔌'
        return '⚠️'
    }

    // Format distance
    const formatDistance = (distance) => {
        if (distance < 1) return `${(distance * 1000).toFixed(0)}m`
        return `${distance.toFixed(2)}km`
    }

    // Assign drone to order
    const handleAssignDrone = async () => {
        if (!selectedDroneId) {
            toast.error('Please select a drone')
            return
        }

        setAssigning(true)
        try {
            const selectedDrone = drones.find(d => d.id === selectedDroneId)
            const orderRef = doc(db, 'orders', order.id)

            await updateDoc(orderRef, {
                assignedDroneId: selectedDroneId,
                assignedDroneName: selectedDrone.name,
                status: 'shipping',
                updatedAt: new Date(),
            })

            toast.success(`Drone "${selectedDrone.name}" assigned successfully!`)
            setSelectedDroneId(null)
            onAssignSuccess && onAssignSuccess()
            onClose()
        } catch (error) {
            console.error('Error assigning drone:', error)
            toast.error('Failed to assign drone')
        } finally {
            setAssigning(false)
        }
    }

    if (!isOpen || !order) return null

    const availableDrones = getAvailableDrones()
    const orderLat = order?.address?.latlong?.latitude || 10.7624
    const orderLon = order?.address?.latlong?.longitude || 106.6597

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-96 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div>
                        <h2 className="text-xl font-semibold text-slate-800">Assign Drone</h2>
                        <p className="text-sm text-slate-600 mt-1">Order: {order.id?.slice(0, 12)}...</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition"
                    >
                        <X size={28} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {dronesLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                        </div>
                    ) : availableDrones.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3">
                            <AlertCircle size={48} className="text-amber-500" />
                            <p className="text-slate-700 font-medium">No available drones</p>
                            <p className="text-sm text-slate-600 text-center">
                                Drones must be active with battery above 20%
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {availableDrones.map((drone) => {
                                const distance = calculateDistance(
                                    orderLat,
                                    orderLon,
                                    drone.latlong?.latitude || 10.7624,
                                    drone.latlong?.longitude || 106.6597
                                )
                                const isSelected = selectedDroneId === drone.id

                                return (
                                    <div
                                        key={drone.id}
                                        onClick={() => setSelectedDroneId(drone.id)}
                                        className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                                            isSelected
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-slate-200 bg-white hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="font-semibold text-slate-800">{drone.name}</h3>
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                                        {drone.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-600 mt-1">ID: {drone.id}</p>
                                            </div>

                                            {/* Selection Indicator */}
                                            <div className={`w-5 h-5 rounded-full border-2 transition ${
                                                isSelected
                                                    ? 'bg-blue-500 border-blue-500'
                                                    : 'border-slate-300'
                                            }`} />
                                        </div>

                                        {/* Drone Info Grid */}
                                        <div className="grid grid-cols-3 gap-3 mt-4">
                                            {/* Battery */}
                                            <div className={`p-3 rounded-lg ${getBatteryColor(drone.battery)}`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Battery size={16} />
                                                    <span className="text-xs font-semibold">Battery</span>
                                                </div>
                                                <p className="text-lg font-bold">{drone.battery}%</p>
                                                <p className="text-xs mt-1 opacity-75">{getBatteryIcon(drone.battery)}</p>
                                            </div>

                                            {/* Distance */}
                                            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <MapPin size={16} />
                                                    <span className="text-xs font-semibold">Distance</span>
                                                </div>
                                                <p className="text-lg font-bold">{formatDistance(distance)}</p>
                                            </div>

                                            {/* Capacity */}
                                            <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Zap size={16} />
                                                    <span className="text-xs font-semibold">Capacity</span>
                                                </div>
                                                <p className="text-lg font-bold">{drone.max_payload_kg || '-'} kg</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 p-4 bg-slate-50 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={assigning}
                        className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition font-medium disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAssignDrone}
                        disabled={!selectedDroneId || assigning}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {assigning ? (
                            <>
                                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                Assigning...
                            </>
                        ) : (
                            'Assign Drone'
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
