'use client'
import { useRef, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { GOONG_MAP_TILES_KEY, GOONG_MAP_STYLE } from '@/config/GoongMapConfig'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/config/FirebaseConfig'

export default function DroneStationMapModal({ isOpen, station, onClose }) {
    const mapContainer = useRef(null)
    const map = useRef(null)
    const markers = useRef([])
    const [error, setError] = useState(null)
    const [drones, setDrones] = useState([])
    const [loading, setLoading] = useState(false)

    // Fetch drone details for the station
    useEffect(() => {
        if (!isOpen || !station?.droneList || !Array.isArray(station.droneList)) {
            setDrones([])
            return
        }

        const fetchDrones = async () => {
            try {
                setLoading(true)
                const droneList = []

                for (const droneId of station.droneList) {
                    const q = query(collection(db, 'drones'), where('__name__', '==', droneId))
                    const snapshot = await getDocs(q)

                    if (!snapshot.empty) {
                        droneList.push({
                            id: snapshot.docs[0].id,
                            ...snapshot.docs[0].data()
                        })
                    } else {
                        // Fallback if document not found
                        droneList.push({
                            id: droneId,
                            name: droneId,
                            latlong: null
                        })
                    }
                }

                setDrones(droneList)
                setError(null)
            } catch (err) {
                console.error('Error fetching drones:', err)
                setError('Failed to load drone data')
            } finally {
                setLoading(false)
            }
        }

        fetchDrones()
    }, [isOpen, station])

    // Initialize map and add markers
    useEffect(() => {
        if (!isOpen || !mapContainer.current || drones.length === 0) return

        const initializeMap = async () => {
            try {
                if (!GOONG_MAP_TILES_KEY) {
                    setError('Map API key not configured')
                    return
                }

                // Filter drones with valid coordinates
                const dronesWithLocation = drones.filter(d => d.latlong?.latitude)

                if (dronesWithLocation.length === 0) {
                    setError('No drones with location data available')
                    return
                }

                const goongjs = (await import('@goongmaps/goong-js')).default
                await import('@goongmaps/goong-js/dist/goong-js.css')

                // Calculate map center and bounds
                let minLat = Infinity, maxLat = -Infinity
                let minLng = Infinity, maxLng = -Infinity

                dronesWithLocation.forEach(drone => {
                    const lat = drone.latlong.latitude
                    const lng = drone.latlong.longitude || drone.latlong.lng
                    minLat = Math.min(minLat, lat)
                    maxLat = Math.max(maxLat, lat)
                    minLng = Math.min(minLng, lng)
                    maxLng = Math.max(maxLng, lng)
                })

                const centerLng = (minLng + maxLng) / 2
                const centerLat = (minLat + maxLat) / 2

                // Remove old map
                if (map.current) {
                    map.current.remove()
                    map.current = null
                }

                // Create new map
                map.current = new goongjs.Map({
                    container: mapContainer.current,
                    accessToken: GOONG_MAP_TILES_KEY,
                    style: GOONG_MAP_STYLE,
                    center: [centerLng, centerLat],
                    zoom: dronesWithLocation.length === 1 ? 15 : 13
                })

                // Add markers for each drone
                dronesWithLocation.forEach((drone, idx) => {
                    const lng = drone.latlong.longitude || drone.latlong.lng
                    const lat = drone.latlong.latitude

                    const marker = new goongjs.Marker({ color: '#3B82F6' })
                        .setLngLat([lng, lat])
                        .setPopup(new goongjs.Popup().setHTML(`
                            <div class="p-2 max-w-xs">
                                <p class="font-semibold text-slate-800">${drone.name || drone.id}</p>
                                <p class="text-xs text-slate-600">ID: ${drone.id}</p>
                                <p class="text-xs text-slate-600">Battery: ${drone.battery || 'N/A'}%</p>
                                <p class="text-xs text-slate-600">${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
                            </div>
                        `))
                        .addTo(map.current)

                    markers.current.push(marker)

                    // Open first popup
                    if (idx === 0) {
                        marker.togglePopup()
                    }
                })

                // Fit bounds if multiple drones
                if (dronesWithLocation.length > 1) {
                    const bounds = new goongjs.LngLatBounds(
                        [minLng, minLat],
                        [maxLng, maxLat]
                    )
                    map.current.fitBounds(bounds, { padding: 50 })
                }

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
    }, [isOpen, drones])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl h-96 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800">
                        {station?.name} - Assigned Drones ({drones.length})
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
                ) : loading ? (
                    <div className="flex-1 flex items-center justify-center bg-slate-50">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-400"></div>
                    </div>
                ) : (
                    <div ref={mapContainer} className="flex-1 bg-slate-100" />
                )}

                {/* Drone List Footer */}
                {drones.length > 0 && (
                    <div className="bg-slate-50 p-4 border-t border-slate-200 max-h-32 overflow-y-auto">
                        <p className="text-xs font-semibold text-slate-700 mb-2">Drones at Station:</p>
                        <div className="space-y-1">
                            {drones.map((drone) => (
                                <p key={drone.id} className="text-xs text-slate-600">
                                    • {drone.name || drone.id}
                                    {drone.latlong?.latitude && ` (${drone.latlong.latitude.toFixed(4)}, ${drone.latlong.longitude?.toFixed(4)})`}
                                </p>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
