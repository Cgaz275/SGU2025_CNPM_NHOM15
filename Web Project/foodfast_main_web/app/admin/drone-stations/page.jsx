'use client'
import { useState } from 'react'
import { Eye, MapPin, Edit3 } from 'lucide-react'
import useDroneStationsAdmin from '@/hooks/useDroneStationsAdmin'
import ListWithPagination from '@/components/admin/ListWithPagination'
import DroneListModal from '@/components/admin/DroneListModal'
import DroneStationMapModal from '@/components/admin/DroneStationMapModal'
import DroneStationLocationEditor from '@/components/admin/DroneStationLocationEditor'

export default function AdminDroneStations() {
    const { data: stations, loading } = useDroneStationsAdmin()
    const [selectedStation, setSelectedStation] = useState(null)
    const [isListModalOpen, setIsListModalOpen] = useState(false)
    const [isMapOpen, setIsMapOpen] = useState(false)
    const [isEditLocationOpen, setIsEditLocationOpen] = useState(false)

    const handleViewDrones = (station) => {
        setSelectedStation(station)
        setIsListModalOpen(true)
    }

    const handleViewMap = (station) => {
        setSelectedStation(station)
        setIsMapOpen(true)
    }

    const handleCloseListModal = () => {
        setIsListModalOpen(false)
        setSelectedStation(null)
    }

    const handleCloseMapModal = () => {
        setIsMapOpen(false)
        setSelectedStation(null)
    }

    const handleEditLocation = (station) => {
        setSelectedStation(station)
        setIsEditLocationOpen(true)
    }

    const handleCloseEditLocation = () => {
        setIsEditLocationOpen(false)
        setSelectedStation(null)
    }

    const handleLocationUpdateSuccess = () => {
        // The hook will automatically update when Firebase data changes
    }

    const stationColumns = [
        {
            key: 'name',
            label: 'Station Name',
        },
        {
            key: 'is_enable',
            label: 'Status',
            render: (item) => {
                const statusClass = item.is_enable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                return <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClass}`}>{item.is_enable ? 'Active' : 'Inactive'}</span>
            }
        },
        {
            key: 'location',
            label: 'Location',
            render: (item) => {
                if (item.latlong && item.latlong.latitude !== undefined) {
                    return (
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-800">{item.address || 'Address not available'}</p>
                                <p className="text-xs text-slate-600">{item.latlong.latitude.toFixed(4)}, {item.latlong.longitude.toFixed(4)}</p>
                            </div>
                            <button
                                onClick={() => handleEditLocation(item)}
                                className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition flex-shrink-0"
                                title="Edit location"
                            >
                                <Edit3 size={16} />
                            </button>
                        </div>
                    )
                }
                return (
                    <button
                        onClick={() => handleEditLocation(item)}
                        className="px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition text-sm font-medium"
                    >
                        Set Location
                    </button>
                )
            }
        },
        {
            key: 'current_drone',
            label: 'Current Drone',
        },
        {
            key: 'droneList',
            label: 'Assigned Drones',
            render: (item) => {
                const droneCount = Array.isArray(item.droneList) ? item.droneList.length : 0
                return (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleViewDrones(item)}
                            className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition text-sm font-medium"
                        >
                            <Eye size={16} />
                            {droneCount}
                        </button>
                        <button
                            onClick={() => handleViewMap(item)}
                            className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition text-sm font-medium"
                        >
                            <MapPin size={16} />
                            Map
                        </button>
                    </div>
                )
            }
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
                items={stations}
                columns={stationColumns}
                title="Manage"
                searchFields={['name', 'current_drone']}
            />
            <DroneListModal
                isOpen={isListModalOpen}
                station={selectedStation}
                onClose={handleCloseListModal}
            />
            <DroneStationMapModal
                isOpen={isMapOpen}
                station={selectedStation}
                onClose={handleCloseMapModal}
            />
            <DroneStationLocationEditor
                isOpen={isEditLocationOpen}
                station={selectedStation}
                onClose={handleCloseEditLocation}
                onSuccess={handleLocationUpdateSuccess}
            />
        </div>
    )
}
