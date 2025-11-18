'use client'
import { useState, useEffect, useRef } from 'react'
import { Zap, MapPin, Clock, AlertCircle } from 'lucide-react'
import useOrdersAdmin from '@/hooks/useOrdersAdmin'
import { calculateDronePosition, formatFlightPhase, getDroneState, DRONE_STATES } from '@/utils/droneSimulation'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/config/FirebaseConfig'
import { GOONG_MAP_TILES_KEY, GOONG_MAP_STYLE } from '@/config/GoongMapConfig'
import toast from 'react-hot-toast'

export default function DroneTrackingPage() {
  const { data: orders } = useOrdersAdmin()
  const mapContainer = useRef(null)
  const map = useRef(null)
  const goongjs = useRef(null)
  const markers = useRef([])
  const layers = useRef([])
  const svgOverlay = useRef(null)
  const droneMarker = useRef(null)
  const [selectedOrderId, setSelectedOrderId] = useState(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [droneInfo, setDroneInfo] = useState(null)
  const [simulationData, setSimulationData] = useState(null)
  const [isRunning, setIsRunning] = useState(false)
  const [droneLocation, setDroneLocation] = useState(null)
  const [error, setError] = useState(null)
  const [mapBounds, setMapBounds] = useState(null)
  const [simulationSpeed, setSimulationSpeed] = useState(100)

  // Get orders that are in shipping status
  const shippingOrders = orders?.filter((o) => o.status?.toLowerCase() === 'shipping') || []

  // Load map library
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

  // Initialize map when order is selected
  useEffect(() => {
    if (!selectedOrderId || !mapContainer.current || !goongjs.current) return

    const initializeMap = async () => {
      try {
        const order = orders?.find((o) => o.id === selectedOrderId)
        if (!order) return

        // Get delivery location
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
        if (order.assignedDroneId) {
          const droneRef = doc(db, 'drones', order.assignedDroneId)
          const droneSnap = await getDoc(droneRef)
          if (droneSnap.exists()) {
            const droneData = droneSnap.data()
            setDroneInfo(droneData)

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

        const startLocation = { latitude: stationLat, longitude: stationLng }
        const restaurantLocation = { latitude: restaurantLat, longitude: restaurantLng }
        const deliveryLocation = { latitude: deliveryLat, longitude: deliveryLng }

        setSimulationData({
          startLocation,
          restaurantLocation,
          deliveryLocation,
        })

        // Remove old map and drone marker
        if (droneMarker.current) {
          droneMarker.current.remove()
          droneMarker.current = null
        }
        if (map.current) {
          map.current.remove()
        }

        // Create new map
        if (!GOONG_MAP_TILES_KEY) {
          setError('Goong Maps API key is not configured')
          return
        }

        map.current = new goongjs.current.Map({
          container: mapContainer.current,
          accessToken: GOONG_MAP_TILES_KEY,
          style: GOONG_MAP_STYLE,
          center: [startLocation.longitude, startLocation.latitude],
          zoom: 13,
        })

        map.current.on('load', () => {
          // Add base markers
          new goongjs.current.Marker({ color: '#10B981' })
            .setLngLat([startLocation.longitude, startLocation.latitude])
            .setPopup(new goongjs.current.Popup().setHTML('<div class="text-sm font-semibold">Drone Station</div>'))
            .addTo(map.current)

          new goongjs.current.Marker({ color: '#F59E0B' })
            .setLngLat([restaurantLocation.longitude, restaurantLocation.latitude])
            .setPopup(new goongjs.current.Popup().setHTML('<div class="text-sm font-semibold">Restaurant</div>'))
            .addTo(map.current)

          new goongjs.current.Marker({ color: '#3B82F6' })
            .setLngLat([deliveryLocation.longitude, deliveryLocation.latitude])
            .setPopup(new goongjs.current.Popup().setHTML('<div class="text-sm font-semibold">Delivery Location</div>'))
            .addTo(map.current)

          // Store bounds for SVG overlay
          setMapBounds({
            startLocation,
            restaurantLocation,
            deliveryLocation,
          })

          // Add planned route source
          map.current.addSource('planned-route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: [
                  [startLocation.longitude, startLocation.latitude],
                  [restaurantLocation.longitude, restaurantLocation.latitude],
                  [deliveryLocation.longitude, deliveryLocation.latitude],
                  [startLocation.longitude, startLocation.latitude],
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

          layers.current.push('planned-route-line')
        })

        setError(null)
      } catch (err) {
        console.error('Map initialization error:', err)
        setError('Failed to load map')
      }
    }

    initializeMap()
  }, [selectedOrderId, orders])

  // Update drone position based on elapsed time
  useEffect(() => {
    if (!simulationData || !map.current || !goongjs.current || !map.current.isStyleLoaded()) return

    const sim = calculateDronePosition(
      elapsedSeconds,
      simulationData.startLocation,
      simulationData.restaurantLocation,
      simulationData.deliveryLocation
    )

    setDroneLocation(sim)

    // Update or create flown route
    if (sim.flownPath && sim.flownPath.length > 1) {
      if (map.current.getSource('flown-route')) {
        map.current.getSource('flown-route').setData({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: sim.flownPath.map((p) => [p.longitude, p.latitude]),
          },
        })
      } else {
        map.current.addSource('flown-route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: sim.flownPath.map((p) => [p.longitude, p.latitude]),
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

        layers.current.push('flown-route-line')
      }
    }

    // Create drone marker once, then just update its position
    if (!droneMarker.current) {
      const droneElement = document.createElement('div')
      droneElement.setAttribute('data-type', 'drone')
      droneElement.className = 'drone-marker'
      droneElement.innerHTML = `
        <span style="font-size: 22px; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.4));">✈</span>
      `

      droneMarker.current = new goongjs.current.Marker({ element: droneElement })
        .setLngLat([sim.position.longitude, sim.position.latitude])
        .addTo(map.current)
    } else {
      // Just update position of existing marker
      droneMarker.current.setLngLat([sim.position.longitude, sim.position.latitude])
    }
  }, [elapsedSeconds, simulationData])

  // Simulation timer
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1
        if (next > 15 * 60) {
          setIsRunning(false)
          return prev
        }
        return next
      })
    }, simulationSpeed)

    return () => clearInterval(interval)
  }, [isRunning, simulationSpeed])

  // Update drone location in Firestore when position changes
  useEffect(() => {
    if (!selectedOrderId || !droneLocation?.position || !isRunning) return

    const updateDroneLocation = async () => {
      try {
        const order = orders?.find((o) => o.id === selectedOrderId)
        if (!order?.assignedDroneId) return

        const droneRef = doc(db, 'drones', order.assignedDroneId)
        await updateDoc(droneRef, {
          'latlong.latitude': droneLocation.position.latitude,
          'latlong.longitude': droneLocation.position.longitude,
          lastUpdated: new Date().toISOString(),
        })
      } catch (error) {
        console.error('Error updating drone location:', error)
      }
    }

    updateDroneLocation()
  }, [droneLocation, selectedOrderId, isRunning, orders])

  const handleStartSimulation = () => {
    if (!selectedOrderId) {
      toast.error('Please select an order')
      return
    }
    setElapsedSeconds(0)
    setIsRunning(true)
  }

  const handlePauseSimulation = () => {
    setIsRunning(false)
  }

  const handleResumeSimulation = () => {
    setIsRunning(true)
  }

  const handleResetSimulation = () => {
    setElapsedSeconds(0)
    setIsRunning(false)
    setDroneLocation(null)

    // Clear the flown route from the map
    if (map.current) {
      // Remove flown route layer and source
      if (map.current.getLayer('flown-route-line')) {
        map.current.removeLayer('flown-route-line')
      }
      if (map.current.getSource('flown-route')) {
        map.current.removeSource('flown-route')
      }

      // Remove drone marker
      if (droneMarker.current) {
        droneMarker.current.remove()
        droneMarker.current = null
      }

      // Update layers array
      layers.current = layers.current.filter((layer) => layer !== 'flown-route-line')
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const droneState = droneInfo ? getDroneState(droneInfo.battery || 100, isRunning) : null

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(1.4);
          }
        }
      `}</style>
      <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <MapPin className="w-8 h-8 text-slate-800" />
        <h1 className="text-3xl font-bold text-slate-800">Drone Tracking</h1>
      </div>

      {/* Order Selection */}
      <div className="mb-6 bg-slate-50 p-4 rounded-lg">
        <p className="text-sm font-semibold text-slate-700 mb-3">Select Shipping Order</p>
        {shippingOrders.length === 0 ? (
          <p className="text-slate-600 text-sm">No orders in shipping status</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {shippingOrders.map((order) => (
              <button
                key={order.id}
                onClick={() => {
                  setSelectedOrderId(order.id)
                  setElapsedSeconds(0)
                  setIsRunning(false)
                }}
                className={`text-left p-3 rounded-lg border-2 transition ${
                  selectedOrderId === order.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <p className="font-semibold text-slate-800">Order {order.id.slice(0, 8)}</p>
                <p className="text-xs text-slate-600 mt-1">Total: {order.total?.toLocaleString('vi-VN')} VND</p>
                <p className="text-xs text-slate-600">Drone: {order.assignedDroneName || 'Not assigned'}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedOrderId && (
        <>
          {/* Drone Info */}
          {droneInfo && (
            <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Drone</p>
                  <p className="font-bold text-slate-800">{droneInfo.name}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Battery</p>
                  <div className="flex items-center gap-2">
                    <Zap className={`w-4 h-4 ${droneInfo.battery < 20 ? 'text-red-600' : 'text-green-600'}`} />
                    <span className="font-bold text-slate-800">{droneInfo.battery || 100}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      droneState === DRONE_STATES.WARNING ? 'bg-yellow-500' :
                      droneState === DRONE_STATES.IN_FLIGHT ? 'bg-blue-500' :
                      'bg-green-500'
                    }`} />
                    <span className="font-bold text-slate-800 capitalize">{droneState}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Max Payload</p>
                  <p className="font-bold text-slate-800">{droneInfo.max_payload_kg || '-'} kg</p>
                </div>
              </div>
            </div>
          )}

          {/* Simulation Controls */}
          <div className="mb-6 bg-slate-50 p-4 rounded-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-700" />
                <span className="text-2xl font-bold text-slate-800">{formatTime(elapsedSeconds)}</span>
                <span className="text-sm text-slate-600">/ 15:00</span>
              </div>
              {droneLocation && (
                <div className="text-lg font-semibold text-blue-600">
                  {formatFlightPhase(droneLocation.phase)}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {!isRunning ? (
                <>
                  <button
                    onClick={handleStartSimulation}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                  >
                    Start Simulation
                  </button>
                  {elapsedSeconds > 0 && (
                    <>
                      <button
                        onClick={handleResumeSimulation}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                      >
                        Resume
                      </button>
                      <button
                        onClick={handleResetSimulation}
                        className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition font-medium"
                      >
                        Reset
                      </button>
                    </>
                  )}
                </>
              ) : (
                <button
                  onClick={handlePauseSimulation}
                  className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-medium"
                >
                  Pause
                </button>
              )}
            </div>

            {/* Simulation Speed Control */}
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-4">
                <label className="text-sm font-semibold text-slate-700">Simulation Speed:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="50"
                    max="500"
                    step="50"
                    value={simulationSpeed}
                    onChange={(e) => setSimulationSpeed(Number(e.target.value))}
                    disabled={isRunning}
                    className="w-32"
                  />
                  <span className="text-sm text-slate-600 font-medium min-w-fit">
                    {500 / simulationSpeed}x speed
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Adjust simulation speed (can only change when paused)
              </p>
            </div>

            {droneLocation && droneLocation.progress !== undefined && (
              <div className="mt-4">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                    style={{ width: `${droneLocation.progress * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Map */}
          {error ? (
            <div className="w-full h-96 bg-slate-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                <p className="text-slate-600">{error}</p>
              </div>
            </div>
          ) : (
            <div
              ref={mapContainer}
              className="w-full h-96 rounded-lg bg-slate-100 overflow-hidden"
            />
          )}

          {/* Flight Statistics */}
          {droneLocation && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-slate-700 mb-3">Current Position</p>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>
                    <span className="font-semibold">Latitude:</span> {droneLocation.position.latitude.toFixed(6)}
                  </p>
                  <p>
                    <span className="font-semibold">Longitude:</span> {droneLocation.position.longitude.toFixed(6)}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-slate-700 mb-3">Flight Progress</p>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>
                    <span className="font-semibold">Phase:</span> {formatFlightPhase(droneLocation.phase)}
                  </p>
                  <p>
                    <span className="font-semibold">Progress:</span> {(droneLocation.progress * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 bg-slate-50 p-4 rounded-lg">
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
              <div className="flex items-center gap-2">
                <span className="text-lg">✈</span>
                <span className="text-slate-600">Current Drone</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
    </>
  )
}
