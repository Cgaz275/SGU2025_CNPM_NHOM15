'use client'
import { useState } from 'react'
import { MapPin } from 'lucide-react'
import useDronesAdmin from '@/hooks/useDronesAdmin'
import ListWithPagination from '@/components/admin/ListWithPagination'
import DroneLocationModal from '@/components/admin/DroneLocationModal'

export default function AdminDrones() {
    const { data: drones, loading } = useDronesAdmin()
    const [selectedDrone, setSelectedDrone] = useState(null)
    const [isMapOpen, setIsMapOpen] = useState(false)

    const handleViewLocation = (drone) => {
        setSelectedDrone(drone)
        setIsMapOpen(true)
    }

    const handleCloseMap = () => {
        setIsMapOpen(false)
        setSelectedDrone(null)
    }

    const droneColumns = [
        {
            key: 'name',
            label: 'Drone Name',
        },
        {
            key: 'id',
            label: 'Drone ID',
            render: (item) => item.id,
        },
        {
            key: 'status',
            label: 'Status',
            render: (item) => {
                const statusColors = {
                    active: 'bg-green-100 text-green-700',
                    inactive: 'bg-red-100 text-red-700',
                    maintenance: 'bg-yellow-100 text-yellow-700',
                }
                const statusClass = statusColors[item.status] || 'bg-slate-100 text-slate-700'
                return <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}>{item.status || 'Unknown'}</span>
            }
        },
        {
            key: 'battery',
            label: 'Battery (%)',
        },
        {
            key: 'location',
            label: 'Current Location',
            render: (item) => {
                if (item.latlong && item.latlong.latitude !== undefined) {
                    return (
                        <button
                            onClick={() => handleViewLocation(item)}
                            className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition text-sm font-medium"
                        >
                            <MapPin size={16} />
                            View Map
                        </button>
                    )
                }
                return '-'
            }
        },
        {
            key: 'max_payload_kg',
            label: 'Capacity (kg)',
        },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400"></div>
            </div>
        )
    }

    return (
        <div className="text-slate-500 mb-40">
            <ListWithPagination
                items={drones}
                columns={droneColumns}
                title="Manage"
                searchFields={['name', 'id', 'status']}
            />
            <DroneLocationModal
                isOpen={isMapOpen}
                drone={selectedDrone}
                onClose={handleCloseMap}
            />
        </div>
    )
}
