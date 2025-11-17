'use client'
import { MapPin } from 'lucide-react'
import { useRef, useEffect, useState } from 'react'
import { GOONG_MAP_TILES_KEY, GOONG_MAP_STYLE, DEFAULT_VIEWPORT } from '@/config/GoongMapConfig'

export default function RestaurantMap({ restaurant }) {
    const mapContainer = useRef(null)
    const map = useRef(null)
    const [mapLoaded, setMapLoaded] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!mapContainer.current || map.current) return

        if (!GOONG_MAP_TILES_KEY) {
            setError('Map API key not configured')
            console.warn('Goong Map: API key not configured')
            return
        }

        if (!restaurant) {
            console.warn('Goong Map: Restaurant data not loaded yet')
            return
        }

        const latlong = restaurant?.latlong
        console.log('Goong Map: latlong value:', latlong, 'type:', typeof latlong, 'restaurant:', restaurant?.name)

        if (!latlong) {
            setError('Restaurant coordinates not available')
            console.warn('Goong Map: latlong field missing from restaurant data')
            return
        }

        let isMounted = true

        const initializeMap = async () => {
            try {
                const goongjs = (await import('@goongmaps/goong-js')).default
                await import('@goongmaps/goong-js/dist/goong-js.css')

                // Check if component is still mounted after async operations
                if (!isMounted || !mapContainer.current) return

                let lng, lat

                if (Array.isArray(latlong)) {
                    let coord0 = parseFloat(latlong[0])
                    let coord1 = parseFloat(latlong[1])

                    if (isNaN(coord0) || isNaN(coord1)) {
                        setError('Invalid restaurant coordinates')
                        return
                    }

                    if (Math.abs(coord0) > 90) {
                        lng = coord0
                        lat = coord1
                    } else {
                        lng = coord1
                        lat = coord0
                    }
                } else if (typeof latlong === 'object' && (latlong.latitude !== undefined || latlong._latitude !== undefined)) {
                    lat = latlong.latitude || latlong._latitude
                    lng = latlong.longitude || latlong._longitude
                    console.log('Goong Map: Converted GeoPoint to coordinates - lat:', lat, 'lng:', lng)
                } else {
                    setError(`Restaurant coordinates invalid format: ${typeof latlong}`)
                    console.warn('Goong Map: latlong is not an array or GeoPoint, it is:', typeof latlong, latlong)
                    return
                }

                if (isNaN(lng) || isNaN(lat)) {
                    setError('Invalid restaurant coordinate values')
                    return
                }

                // Check again before creating map
                if (!isMounted || !mapContainer.current) return

                map.current = new goongjs.Map({
                    container: mapContainer.current,
                    accessToken: GOONG_MAP_TILES_KEY,
                    style: GOONG_MAP_STYLE,
                    center: [lng, lat],
                    zoom: 15
                })

                map.current.on('load', () => {
                    // Check if component is still mounted before updating state
                    if (!isMounted || !map.current) return

                    setMapLoaded(true)
                    setError(null)

                    if (map.current && mapContainer.current) {
                        new goongjs.Marker()
                            .setLngLat([lng, lat])
                            .addTo(map.current)
                    }
                })

                map.current.on('error', (e) => {
                    if (!isMounted) return
                    setError(`Map error: ${e.error?.message || 'Unknown error'}`)
                    console.error('Goong Map Error:', e)
                })
            } catch (err) {
                if (!isMounted) return
                setError(`Failed to initialize map: ${err.message}`)
                console.error('Map initialization error:', err)
            }
        }

        initializeMap()

        return () => {
            isMounted = false
            if (map.current) {
                map.current.remove()
                map.current = null
            }
        }
    }, [restaurant?.latlong, GOONG_MAP_TILES_KEY])

    return (
        <section className="w-full max-w-7xl mx-auto px-4 md:px-6 mb-12 md:mb-16">
            <div className="relative rounded-xl overflow-hidden shadow-[5px_5px_14px_0_rgba(0,0,0,0.25)] h-[400px] md:h-[500px] lg:h-[659px] bg-gray-200">
                {/* Goong Map */}
                <div
                    ref={mapContainer}
                    className="w-full h-full"
                />

                {/* Map Loading/Error State */}
                {!mapLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        {error ? (
                            <div className="text-center p-6">
                                <p className="text-gray-600 mb-2">Map cannot be displayed</p>
                                <p className="text-sm text-gray-500">{error}</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FC8A06] mx-auto mb-2"></div>
                                <p className="text-gray-600 text-sm">Loading map...</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Info Card - Desktop */}
                <div className="hidden md:block absolute bottom-8 left-8 bg-[rgba(3,8,31,0.97)] rounded-xl p-6 md:p-8 max-w-[466px]">
                    <h3 className="text-white text-2xl md:text-3xl font-bold mb-2">
                        {restaurant?.name || 'Restaurant'}
                    </h3>
                    <p className="text-[#FC8A06] text-lg md:text-xl font-semibold mb-4">
                        {restaurant?.address?.split(',')[0] || 'Location'}
                    </p>

                    <div className="space-y-2 text-white text-base md:text-lg">
                        <p>{restaurant?.address || 'Address not available'}</p>
                        <p className="font-bold">Rating</p>
                        <div className="flex items-baseline gap-2">
                            <p className="text-[#FC8A06] text-xl md:text-2xl">
                                {restaurant?.rating || 'N/A'} ⭐
                            </p>
                            {restaurant?.ratingCount > 0 && (
                                <p className="text-gray-300 text-sm md:text-base">
                                    ({restaurant?.ratingCount} {restaurant?.ratingCount === 1 ? 'reviewer' : 'reviewers'})
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Location Marker - Desktop */}
                {mapLoaded && (
                    <div className="hidden md:flex absolute top-1/2 right-1/3 transform -translate-y-1/2 items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-lg">
                        <div className="bg-[#366055] rounded-full p-3">
                            <MapPin className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-[#366055] font-semibold text-sm">{restaurant?.name || 'Restaurant'}</p>
                            <p className="text-[#366055] text-xs">{restaurant?.categories || 'Food'}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Info Card - Mobile */}
            <div className="md:hidden mt-4 bg-[rgba(3,8,31,0.97)] rounded-xl p-6">
                <h3 className="text-white text-xl font-bold mb-2">
                    {restaurant?.name || 'Restaurant'}
                </h3>
                <p className="text-[#FC8A06] text-lg font-semibold mb-4">
                    {restaurant?.address?.split(',')[0] || 'Location'}
                </p>

                <div className="space-y-2 text-white text-sm">
                    <p>{restaurant?.address || 'Address not available'}</p>
                    <p className="font-bold">Rating</p>
                    <div className="flex items-baseline gap-2">
                        <p className="text-[#FC8A06] text-lg">
                            {restaurant?.rating || 'N/A'} ⭐
                        </p>
                        {restaurant?.ratingCount > 0 && (
                            <p className="text-gray-300 text-xs">
                                ({restaurant?.ratingCount} {restaurant?.ratingCount === 1 ? 'reviewer' : 'reviewers'})
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
