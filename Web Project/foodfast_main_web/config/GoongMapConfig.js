
const GOONG_MAP_KEY = process.env.NEXT_PUBLIC_GOONG_MAPTILES_KEY; 

// Định nghĩa Style URL
const GOONG_MAP_STYLE = GOONG_MAP_KEY 
    ? `https://tiles.goong.io/assets/goong_map_web.json?api_key=${GOONG_MAP_KEY}`
    : 'YOUR_FALLBACK_STYLE_URL_OR_ERROR'; 

// Thiết lập Viewport mặc định
const DEFAULT_VIEWPORT = {
    lng: 105.8542, // Hà Nội
    lat: 21.0285,
    zoom: 12
};

export { 
    GOONG_MAP_KEY, 
    GOONG_MAP_STYLE, 
    DEFAULT_VIEWPORT 
};