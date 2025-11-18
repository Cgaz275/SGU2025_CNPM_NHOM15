'use client'
import { useRef, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { GOONG_MAP_TILES_KEY, GOONG_MAP_STYLE } from '@/config/GoongMapConfig'

export default function DroneLocationModal({ isOpen, drone, onClose }) {
    const mapContainer = useRef(null)
    const map = useRef(null)
    const markers = useRef([])
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!isOpen || !mapContainer.current) return

        const initializeMap = async () => {
            try {
                if (!GOONG_MAP_TILES_KEY) {
                    setError('Map API key not configured')
                    return
                }

                if (!drone?.latlong?.latitude) {
                    setError('Drone location not available')
                    return
                }

                const goongjs = (await import('@goongmaps/goong-js')).default
                await import('@goongmaps/goong-js/dist/goong-js.css')

                const lng = drone.latlong.longitude || drone.latlong.lng
                const lat = drone.latlong.latitude || drone.latlong.lat

                if (!lng || !lat) {
                    setError('Invalid drone coordinates')
                    return
                }

                // Remove old map if exists
                if (map.current) {
                    map.current.remove()
                    map.current = null
                }

                // Create new map
                map.current = new goongjs.Map({
                    container: mapContainer.current,
                    accessToken: GOONG_MAP_TILES_KEY,
                    style: GOONG_MAP_STYLE,
                    center: [lng, lat],
                    zoom: 15
                })

                // Add marker for drone
                const marker = new goongjs.Marker({ color: '#3B82F6' })
                    .setLngLat([lng, lat])
                    .setPopup(new goongjs.Popup().setHTML(`
                        <div class="p-2">
                            <p class="font-semibold text-slate-800">${drone.name || 'Drone'}</p>
                            <p class="text-xs text-slate-600">ID: ${drone.id}</p>
                            <p class="text-xs text-slate-600">${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
                        </div>
                    `))
                    .addTo(map.current)

                markers.current.push(marker)
                marker.togglePopup()

                setError(null)
            } catch (err) {
                console.error('Map error:', err)
                setError('Failed to load map')
            }
        }

        initializeMap()

        return () => {
            markers.current.forEach(m => m.remove())
            markers.current = []
        }
    }, [isOpen, drone])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl h-96 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800">
                        {drone?.name || 'Drone'} Location
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Map Container */}
                {error ? (
                    <div className="flex-1 flex items-center justify-center bg-slate-50">
                        <p className="text-slate-500 text-center">{error}</p>
                    </div>
                ) : (
                    <div ref={mapContainer} className="flex-1 bg-slate-100" />
                )}

                {/* Info Footer */}
                {drone?.latlong && (
                    <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs text-slate-600">
                        <p>Coordinates: {drone.latlong.latitude?.toFixed(4)}, {drone.latlong.longitude?.toFixed(4)}</p>
                    </div>
                )}
            </div>
        </div>
    )
}
