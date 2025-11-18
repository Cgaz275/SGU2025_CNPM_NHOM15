'use client'

import { useState, useEffect, useRef } from 'react'
import { doc, getDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore'
import { db } from '@/config/FirebaseConfig'
import { GOONG_MAP_TILES_KEY, GOONG_MAP_STYLE } from '@/config/GoongMapConfig'
import { AlertCircle } from 'lucide-react'

export default function OrderTrackingMap({ order }) {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const goongjs = useRef(null)
  const markers = useRef([])
  const [error, setError] = useState(null)
  const [locations, setLocations] = useState(null)
  const [flownPath, setFlownPath] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load Goong Map library
  useEffect(() => {
    if (typeof window === 'undefined') return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.css'
    document.head.appendChild(link)

    import('@goongmaps/goong-js').then((module) => {
      goongjs.current = module.default
    })

    return () => {
      link.remove()
    }
  }, [])

  // Fetch locations data - only fetch once on mount
  useEffect(() => {
    if (!order?.restaurantId) {
      setLoading(false)
      return
    }

    const fetchLocations = async () => {
      try {
        setLoading(true)

        // Default delivery location
        let deliveryLat = 10.7624
        let deliveryLng = 106.6597
        if (order.address?.latlong) {
          deliveryLat = order.address.latlong.latitude
          deliveryLng = order.address.latlong.longitude
        }

        // Get restaurant location
        let restaurantLat = 10.7624
        let restaurantLng = 106.6597
        if (order.restaurantId) {
          const restRef = doc(db, 'restaurants', order.restaurantId)
          const restSnap = await getDoc(restRef)
          if (restSnap.exists() && restSnap.data().latlong) {
            restaurantLat = restSnap.data().latlong.latitude
            restaurantLng = restSnap.data().latlong.longitude
          }
        }

        // Get drone station location
        let stationLat = 10.7769
        let stationLng = 106.6452
        let stationLocation = null
        if (order.assignedDroneId) {
          const droneRef = doc(db, 'drones', order.assignedDroneId)
          const droneSnap = await getDoc(droneRef)
          if (droneSnap.exists()) {
            const droneData = droneSnap.data()

            // Get drone location
            if (droneData.latlong) {
              // Update flown path from drone location
              setFlownPath([{ latitude: stationLat, longitude: stationLng }])
            }

            // Get station location
            if (droneData.stationId) {
              const stationRef = doc(db, 'droneStation', droneData.stationId)
              const stationSnap = await getDoc(stationRef)
              if (stationSnap.exists() && stationSnap.data().latlong) {
                stationLat = stationSnap.data().latlong.latitude
                stationLng = stationSnap.data().latlong.longitude
              }
            }
          }
        }

        stationLocation = { latitude: stationLat, longitude: stationLng }

        setLocations({
          station: stationLocation,
          delivery: { latitude: deliveryLat, longitude: deliveryLng },
          restaurant: { latitude: restaurantLat, longitude: restaurantLng },
        })
        setError(null)
      } catch (err) {
        console.error('Error fetching locations:', err)
        setError('Failed to load map locations')
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [order?.restaurantId, order?.address, order?.assignedDroneId])

  // Real-time listener for drone location updates (for simulation)
  useEffect(() => {
    if (!order?.assignedDroneId) return

    const droneRef = doc(db, 'drones', order.assignedDroneId)

    const unsubscribe = onSnapshot(droneRef, (snapshot) => {
      if (snapshot.exists()) {
        const droneData = snapshot.data()
        if (droneData.latlong) {
          setFlownPath((prev) => {
            const newPath = [...(prev || [])]
            const lastPoint = newPath[newPath.length - 1]

            // Only add new point if it's different from the last one (avoid duplicates)
            if (!lastPoint ||
                lastPoint.latitude !== droneData.latlong.latitude ||
                lastPoint.longitude !== droneData.latlong.longitude) {
              newPath.push({
                latitude: droneData.latlong.latitude,
                longitude: droneData.latlong.longitude,
              })
            }

            return newPath
          })
        }
      }
    }, (error) => {
      console.error('Error listening to drone updates:', error)
    })

    return () => unsubscribe()
  }, [order?.assignedDroneId])

  // Initialize map once when locations load
  useEffect(() => {
    if (!mapContainer.current || !goongjs.current || !locations) return

    const initMap = async () => {
      try {
        // Remove old map
        if (map.current) {
          map.current.remove()
        }

        if (!GOONG_MAP_TILES_KEY) {
          setError('Goong Maps API key is not configured')
          return
        }

        // Center map between all locations
        const allLats = [locations.station.latitude, locations.restaurant.latitude, locations.delivery.latitude]
        const allLngs = [locations.station.longitude, locations.restaurant.longitude, locations.delivery.longitude]
        const centerLat = (Math.max(...allLats) + Math.min(...allLats)) / 2
        const centerLng = (Math.max(...allLngs) + Math.min(...allLngs)) / 2

        map.current = new goongjs.current.Map({
          container: mapContainer.current,
          accessToken: GOONG_MAP_TILES_KEY,
          style: GOONG_MAP_STYLE,
          center: [centerLng, centerLat],
          zoom: 13,
        })

        map.current.on('load', () => {
          // Drone Station marker
          new goongjs.current.Marker({ color: '#10B981' })
            .setLngLat([locations.station.longitude, locations.station.latitude])
            .setPopup(new goongjs.current.Popup().setHTML('<div class="text-sm font-semibold">🚁 Drone Station</div>'))
            .addTo(map.current)
          markers.current.push('station')

          // Restaurant marker
          new goongjs.current.Marker({ color: '#F59E0B' })
            .setLngLat([locations.restaurant.longitude, locations.restaurant.latitude])
            .setPopup(new goongjs.current.Popup().setHTML('<div class="text-sm font-semibold">🏪 Restaurant</div>'))
            .addTo(map.current)
          markers.current.push('restaurant')

          // Delivery marker
          new goongjs.current.Marker({ color: '#3B82F6' })
            .setLngLat([locations.delivery.longitude, locations.delivery.latitude])
            .setPopup(new goongjs.current.Popup().setHTML('<div class="text-sm font-semibold">📍 Delivery Location</div>'))
            .addTo(map.current)
          markers.current.push('delivery')

          // Draw planned route (full path: station -> restaurant -> delivery -> station)
          map.current.addSource('planned-route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: [
                  [locations.station.longitude, locations.station.latitude],
                  [locations.restaurant.longitude, locations.restaurant.latitude],
                  [locations.delivery.longitude, locations.delivery.latitude],
                  [locations.station.longitude, locations.station.latitude],
                ],
              },
            },
          })

          map.current.addLayer({
            id: 'planned-route-line',
            type: 'line',
            source: 'planned-route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#60A5FA',
              'line-width': 3,
              'line-opacity': 0.6,
            },
          })

          // Add flown route source (empty initially, will be updated by flownPath effect)
          map.current.addSource('flown-route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: [],
              },
            },
          })

          map.current.addLayer({
            id: 'flown-route-line',
            type: 'line',
            source: 'flown-route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#10B981',
              'line-width': 4,
              'line-opacity': 0.95,
            },
          })
        })
      } catch (err) {
        console.error('Map initialization error:', err)
        setError('Failed to initialize map')
      }
    }

    initMap()

    return () => {
      if (map.current) {
        map.current.remove()
      }
    }
  }, [locations])

  // Update flown route on map without re-rendering the whole map
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded() || !flownPath) return

    const source = map.current.getSource('flown-route')
    if (source) {
      source.setData({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: flownPath.map((p) => [p.longitude, p.latitude]),
        },
      })
    }
  }, [flownPath])

  if (loading) {
    return <div className="w-full h-96 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">Loading map...</div>
  }

  if (error) {
    return (
      <div className="w-full h-96 bg-slate-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <p className="text-slate-600 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div ref={mapContainer} className="w-full h-96 rounded-lg bg-slate-100 overflow-hidden" />

      {/* Map Legend */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <p className="text-sm font-semibold text-slate-700 mb-3">Map Legend</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span className="text-slate-600">Drone Station</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-amber-500 rounded-full" />
            <span className="text-slate-600">Restaurant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
            <span className="text-slate-600">Delivery Point</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 w-4 bg-blue-400" style={{opacity: 0.6}} />
            <span className="text-slate-600">Planned Route</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1 w-4 bg-green-500" style={{opacity: 0.95}} />
            <span className="text-slate-600">Actual Path</span>
          </div>
        </div>
      </div>
    </div>
  )
}
