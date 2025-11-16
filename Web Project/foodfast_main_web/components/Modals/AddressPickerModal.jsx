'use client';

import React, { useRef, useEffect, useState } from 'react';
import { GOONG_MAP_TILES_KEY, GOONG_API_KEY, GOONG_MAP_STYLE, DEFAULT_VIEWPORT } from '@/config/GoongMapConfig';
import { X, MapPin } from 'lucide-react';

export default function AddressPickerModal({ isOpen, onClose, onSelectAddress, initialLat, initialLng }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);

  const [lng, setLng] = useState(initialLng || DEFAULT_VIEWPORT.lng);
  const [lat, setLat] = useState(initialLat || DEFAULT_VIEWPORT.lat);
  const [zoom, setZoom] = useState(DEFAULT_VIEWPORT.zoom);
  const [address, setAddress] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Load Goong CSS on client mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.css';
    document.head.appendChild(link);

    return () => {
      link.remove();
    };
  }, []);

  // Check API keys on mount
  useEffect(() => {
    if (!GOONG_MAP_TILES_KEY) {
      console.error('GOONG_MAP_TILES_KEY is not configured');
    }
    if (!GOONG_API_KEY) {
      console.error('GOONG_API_KEY is not configured for geocoding');
    }
  }, []);

  useEffect(() => {
    if (!isOpen || !mapContainer.current || !GOONG_MAP_TILES_KEY) return;

    // Dynamically import goongjs only on client side
    import('@goongmaps/goong-js').then((goongModule) => {
      const goongjs = goongModule.default;

      if (map.current) {
        map.current.remove();
      }

      map.current = new goongjs.Map({
        container: mapContainer.current,
        accessToken: GOONG_MAP_TILES_KEY,
        style: GOONG_MAP_STYLE,
        center: [lng, lat],
        zoom: zoom
      });

      // Add marker for selected location
      if (marker.current) {
        marker.current.remove();
      }

      marker.current = new goongjs.Marker({ color: '#366055' })
        .setLngLat([lng, lat])
        .addTo(map.current);

      // Update coordinates on map movement
      const onMove = () => {
        const center = map.current.getCenter();
        setLng(center.lng);
        setLat(center.lat);
        setZoom(map.current.getZoom());

        if (marker.current) {
          marker.current.setLngLat([center.lng, center.lat]);
        }

        // Reverse geocode to get address
        reverseGeocode(center.lat, center.lng);
      };

      map.current.on('move', onMove);

      // Geocode initial coordinates
      reverseGeocode(lat, lng);

      return () => {
        map.current?.off('move', onMove);
      };
    }).catch((error) => {
      console.error('Failed to load Goong Maps:', error);
    });
  }, [isOpen]);

  const reverseGeocode = async (latitude, longitude) => {
    if (!GOONG_API_KEY) {
      console.warn('Goong API key not configured for geocoding');
      return;
    }

    try {
      const url = `https://rsapi.goong.io/Geocode?latlng=${latitude},${longitude}&api_key=${GOONG_API_KEY}`;
      console.log('Reverse geocoding request to:', url.replace(GOONG_API_KEY, 'API_KEY_HIDDEN'));

      const response = await fetch(url);

      if (!response.ok) {
        console.error(`Goong API error ${response.status}:`, response.statusText);
        return;
      }

      const data = await response.json();
      if (data.results && data.results.length > 0) {
        setAddress(data.results[0].formatted_address);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const searchAddress = async (e) => {
    e.preventDefault();
    if (!searchInput.trim() || !GOONG_API_KEY) {
      console.warn('Search input or API key missing');
      return;
    }

    setLoading(true);
    try {
      const url = `https://rsapi.goong.io/geocode?address=${encodeURIComponent(searchInput)}&api_key=${GOONG_API_KEY}`;
      console.log('Geocoding request for:', searchInput);

      const response = await fetch(url);

      if (!response.ok) {
        console.error(`Goong API error ${response.status}:`, response.statusText);
        console.error('Please verify your Goong API key has geocoding permissions');
        alert(`Geocoding failed: ${response.status}. Please check your API key configuration.`);
        return;
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const geometry = result.geometry.location;

        setLng(geometry.lng);
        setLat(geometry.lat);

        map.current?.flyTo({
          center: [geometry.lng, geometry.lat],
          zoom: 15,
          duration: 1000
        });

        if (marker.current) {
          marker.current.setLngLat([geometry.lng, geometry.lat]);
        }

        setAddress(result.formatted_address);
      } else {
        alert('No results found for this address');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Failed to search address. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!address) {
      alert('Please select an address');
      return;
    }

    onSelectAddress({
      address,
      lat,
      lng,
      latlong: {
        latitude: lat,
        longitude: lng
      }
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#366055] text-white p-4 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin size={24} />
            <h2 className="text-lg sm:text-2xl font-semibold">Select Delivery Address</h2>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-[#2b4c44] p-2 rounded transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 sm:p-6 border-b">
          <form onSubmit={searchAddress} className="flex gap-2">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search address..."
              className="flex-1 px-4 py-3 rounded-lg bg-[#F9F9F9] text-sm sm:text-base outline-none focus:ring-2 focus:ring-[#366055]"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 sm:px-6 py-3 bg-[#366055] text-white rounded-lg font-medium hover:bg-[#2b4c44] transition disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>
        </div>

        {/* Map */}
        <div
          ref={mapContainer}
          className="w-full h-64 sm:h-80"
        />

        {/* Selected Address */}
        <div className="p-4 sm:p-6 border-t">
          <label className="block text-sm sm:text-base font-medium text-black mb-3">
            Selected Address
          </label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#F9F9F9] text-sm sm:text-base outline-none focus:ring-2 focus:ring-[#366055] resize-none h-20"
            placeholder="Address will appear here"
          />
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}
          </p>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 bg-gray-50 p-4 sm:p-6 flex gap-3 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-3 rounded-lg bg-[#366055] text-white font-medium hover:bg-[#2b4c44] transition"
          >
            Confirm Address
          </button>
        </div>
      </div>
    </div>
  );
}
