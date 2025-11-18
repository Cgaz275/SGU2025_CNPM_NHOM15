'use client'
import React, { useRef, useEffect, useState } from 'react'
import { X, CheckCircle, Loader } from 'lucide-react'
import { GOONG_MAP_TILES_KEY, GOONG_MAP_STYLE, GOONG_API_KEY } from '@/config/GoongMapConfig'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/config/FirebaseConfig'
import toast from 'react-hot-toast'

export default function DroneStationLocationEditor({ isOpen, station, onClose, onSuccess }) {
    const mapContainer = useRef(null)
    const map = useRef(null)
    const marker = useRef(null)
    const [lng, setLng] = useState(station?.latlong?.longitude || 106.6452)
    const [lat, setLat] = useState(station?.latlong?.latitude || 10.7769)
    const [searchInput, setSearchInput] = useState('')
    const [error, setError] = useState(null)
    const [isSaving, setIsSaving] = useState(false)

    // Load Goong CSS
    useEffect(() => {
        const link = document.createElement('link')
        link.href = 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js/dist/goong-js.css'
        link.rel = 'stylesheet'
        document.head.appendChild(link)
        return () => document.head.removeChild(link)
    }, [])

    // Initialize map
    useEffect(() => {
        if (!isOpen || !mapContainer.current || !GOONG_MAP_TILES_KEY) return

        const initializeMap = async () => {
            try {
                const goongjs = (await import('@goongmaps/goong-js')).default

                if (map.current) {
                    map.current.remove()
                    map.current = null
                }

                map.current = new goongjs.Map({
                    container: mapContainer.current,
                    accessToken: GOONG_MAP_TILES_KEY,
                    style: GOONG_MAP_STYLE,
                    center: [lng, lat],
                    zoom: 15
                })

                // Add draggable marker
                marker.current = new goongjs.Marker({ color: '#10B981', draggable: true })
                    .setLngLat([lng, lat])
                    .addTo(map.current)

                // Update coordinates on marker drag
                marker.current.on('dragend', () => {
                    const lngLat = marker.current.getLngLat()
                    setLng(lngLat.lng)
                    setLat(lngLat.lat)
                })

                // Update marker on map click
                map.current.on('click', (e) => {
                    setLng(e.lngLat.lng)
                    setLat(e.lngLat.lat)
                    marker.current.setLngLat([e.lngLat.lng, e.lngLat.lat])
                })

                setError(null)
            } catch (err) {
                console.error('Map error:', err)
                setError('Failed to load map')
            }
        }

        initializeMap()

        return () => {
            if (map.current) {
                map.current.remove()
                map.current = null
            }
        }
    }, [isOpen])

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!searchInput.trim() || !GOONG_API_KEY) {
            toast.error('Please enter a location')
            return
        }

        try {
            const response = await fetch(
                `https://rsapi.goong.io/Place/AutoComplete?api_key=${GOONG_API_KEY}&input=${encodeURIComponent(searchInput)}`
            )

            if (!response.ok) {
                throw new Error('Search failed')
            }

            const data = await response.json()
            if (data.predictions && data.predictions.length > 0) {
                const firstResult = data.predictions[0]
                const detailsResponse = await fetch(
                    `https://rsapi.goong.io/Place/Detail?place_id=${firstResult.place_id}&api_key=${GOONG_API_KEY}`
                )

                if (detailsResponse.ok) {
                    const details = await detailsResponse.json()
                    if (details.result?.geometry?.location) {
                        const newLng = details.result.geometry.location.lng
                        const newLat = details.result.geometry.location.lat
                        setLng(newLng)
                        setLat(newLat)
                        marker.current.setLngLat([newLng, newLat])
                        map.current.flyTo({ center: [newLng, newLat], zoom: 15 })
                        setSearchInput('')
                        toast.success('Location found')
                    }
                }
            } else {
                toast.error('Location not found')
            }
        } catch (err) {
            console.error('Search error:', err)
            toast.error('Search failed')
        }
    }

    const handleSaveLocation = async () => {
        if (!station?.id) {
            toast.error('Invalid station')
            return
        }

        try {
            setIsSaving(true)
            let address = ''

            // Reverse geocode to get address
            if (GOONG_API_KEY) {
                try {
                    const response = await fetch(
                        `https://rsapi.goong.io/Geocode?latlng=${lat},${lng}&api_key=${GOONG_API_KEY}`
                    )

                    if (response.ok) {
                        const data = await response.json()
                        if (data.results && data.results.length > 0) {
                            address = data.results[0].formatted_address || ''
                        }
                    }
                } catch (err) {
                    console.warn('Reverse geocoding failed:', err)
                    // Continue saving location even if reverse geocoding fails
                }
            }

            const stationRef = doc(db, 'droneStation', station.id)
            await updateDoc(stationRef, {
                latlong: {
                    latitude: lat,
                    longitude: lng
                },
                ...(address && { address })
            })

            toast.success('Location and address updated successfully')
            onSuccess?.()
            onClose()
        } catch (err) {
            console.error('Update error:', err)
            toast.error('Failed to update location')
        } finally {
            setIsSaving(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl h-[600px] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800">
                        Update Location - {station?.name}
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="text-slate-400 hover:text-slate-600 transition disabled:opacity-50"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Search location..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-slate-400"
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition font-medium"
                        >
                            Search
                        </button>
                    </form>
                    <p className="text-xs text-slate-600 mt-2">Or click on the map to select a location</p>
                </div>

                {/* Map Container */}
                {error ? (
                    <div className="flex-1 flex items-center justify-center bg-slate-100">
                        <p className="text-slate-500">{error}</p>
                    </div>
                ) : (
                    <div ref={mapContainer} className="flex-1 bg-slate-100" />
                )}

                {/* Coordinates Display */}
                <div className="bg-slate-50 p-4 border-t border-slate-200">
                    <p className="text-sm text-slate-700 font-medium mb-2">Current Coordinates:</p>
                    <p className="text-xs text-slate-600 font-mono">
                        Latitude: {lat.toFixed(6)} | Longitude: {lng.toFixed(6)}
                    </p>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-3 p-4 border-t border-slate-200 bg-slate-50">
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-medium disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveLocation}
                        disabled={isSaving}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <>
                                <Loader size={18} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <CheckCircle size={18} />
                                Save Location
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
