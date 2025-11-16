// components/GoongMap.jsx (

import React, { useRef, useEffect, useState } from 'react';
import goongjs from '@goongmaps/goong-js';
import '@goongmaps/goong-js/dist/goong-js.css';

import {
    GOONG_MAP_TILES_KEY,
    GOONG_MAP_STYLE,
    DEFAULT_VIEWPORT
} from '../../config/GoongMapConfig'; 

function CustomGoongMap() {
    const mapContainer = useRef(null);
    const map = useRef(null); 

    const [lng, setLng] = useState(DEFAULT_VIEWPORT.lng); 
    const [lat, setLat] = useState(DEFAULT_VIEWPORT.lat);  
    const [zoom, setZoom] = useState(DEFAULT_VIEWPORT.zoom);

    useEffect(() => {
        if (map.current || !GOONG_MAP_TILES_KEY) return;

        map.current = new goongjs.Map({
            container: mapContainer.current,
            accessToken: GOONG_MAP_TILES_KEY,
            style: GOONG_MAP_STYLE,
            center: [lng, lat],
            zoom: zoom
        });

        map.current.on('move', () => {
            setLng(map.current.getCenter().lng.toFixed(4));
            setLat(map.current.getCenter().lat.toFixed(4));
            setZoom(map.current.getZoom().toFixed(2));
        });

        return () => map.current.remove(); 
    }, []); 

    return (
        <div style={{ padding: '20px' }}>
            <div 
                ref={mapContainer} 
                className="map-container" 
                style={{ width: '100%', height: '400px' }} 
            />
        </div>
    );
}

export default CustomGoongMap;
