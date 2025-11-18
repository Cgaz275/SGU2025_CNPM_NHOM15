import { Ionicons } from '@expo/vector-icons';
import MapLibreGL from '@maplibre/maplibre-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

MapLibreGL.setAccessToken(null);

const GoongConstants = {
  MAP_KEY: 'mLM7L3S4dgc0GHsXXaFp6nXG0lN0dzW2qn4FnIQf', // Key để load map
  API_KEY: 'rrES1aD0oSzi4rK4BpufpNhcW9U4hyXg1Uatebk1', // Key để gọi API services
};

const NavigationScreen = ({ pickup, dropoff }) => {
  const camera = useRef<MapLibreGL.Camera>(null);
  const [zoomLevel, setZoomLevel] = useState(12);
  const [centerCoordinate, setCenterCoordinate] = useState<[number, number]>([
    106.681,
    10.7626, // mặc định Sài Gòn
  ]);
  const [route, setRoute] = useState<
    Array<{ latitude: number; longitude: number }>
  >([]);
  const [distance, setDistance] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [originLocation, setOriginLocation] = useState<[number, number] | null>(
    null
  );
  const [destinationLocation, setDestinationLocation] = useState<
    [number, number] | null
  >(null);

  const geocodeAddress = async (address: string) => {
    const url = `https://rsapi.goong.io/Geocode?address=${encodeURIComponent(
      address
    )}&api_key=${GoongConstants.API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log('Geocode data for', address, data); // 👈 thêm dòng này
    if (data?.results?.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      console.log('Toạ độ của', address, ':', lat, lng); // 👈 thêm dòng này
      return [lng, lat] as [number, number];
    }
    throw new Error('Không tìm thấy địa chỉ');
  };

  const getDirections = async () => {
    if (!pickup || !dropoff) return;

    const origin = [pickup.longitude, pickup.latitude];
    const destination = [dropoff.longitude, dropoff.latitude];

    setOriginLocation(origin);
    setDestinationLocation(destination);

    const coordinates = [
      { latitude: origin[1], longitude: origin[0] },
      { latitude: destination[1], longitude: destination[0] },
    ];
    setRoute(coordinates);

    // tính distance
    const R = 6371;
    const toRad = (deg) => (deg * Math.PI) / 180;

    const dLat = toRad(destination[1] - origin[1]);
    const dLon = toRad(destination[0] - origin[0]);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(origin[1])) *
        Math.cos(toRad(destination[1])) *
        Math.sin(dLon / 2) ** 2;

    const dist = (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(
      2
    );
    setDistance(`${dist} km`);

    // fit camera
    if (camera.current) {
      const west = Math.min(origin[0], destination[0]);
      const south = Math.min(origin[1], destination[1]);
      const east = Math.max(origin[0], destination[0]);
      const north = Math.max(origin[1], destination[1]);

      (camera.current as any).fitBounds(
        [west, south],
        [east, north],
        100,
        1000
      );
    }
  };

  useEffect(() => {
    if (pickup && dropoff) {
      setTimeout(() => {
        getDirections();
      }, 300);
    }
  }, [pickup, dropoff]);

  return (
    <View style={styles.container}>
      <MapLibreGL.MapView
        mapStyle={`https://tiles.goong.io/assets/goong_map_highlight.json?api_key=${GoongConstants.MAP_KEY}`}
        style={styles.map}
      >
        <MapLibreGL.Camera
          ref={camera}
          zoomLevel={zoomLevel}
          centerCoordinate={centerCoordinate}
          animationDuration={1000}
        />

        {/* Marker điểm đầu */}
        {originLocation && (
          <MapLibreGL.PointAnnotation
            id="origin-marker"
            coordinate={originLocation}
          >
            <View style={styles.markerDestination}>
              <Ionicons
                name="location-sharp"
                size={32}
                color="red"
              />
            </View>
          </MapLibreGL.PointAnnotation>
        )}

        {destinationLocation && (
          <MapLibreGL.PointAnnotation
            id="destination-marker"
            coordinate={destinationLocation}
          >
            <View
              style={{
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Image
                source={require('@/assets/images/drone.png')}
                style={{ width: 100, height: 100 }}
                resizeMode="center"
              />
            </View>
          </MapLibreGL.PointAnnotation>
        )}

        {/* Route */}
        {route.length > 0 && (
          <MapLibreGL.ShapeSource
            id="lineSource"
            shape={{
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: route.map((coord) => [
                  coord.longitude,
                  coord.latitude,
                ]),
              },
            }}
          >
            <MapLibreGL.LineLayer
              id="lineLayer"
              style={{
                lineColor: '#fe5e4cff',
                lineWidth: 5,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </MapLibreGL.ShapeSource>
        )}
      </MapLibreGL.MapView>

      {/* Info box */}
      {/* <View style={styles.infoBox}>
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.infoText}>
            📍 Khoảng cách: {distance || '...'}
          </Text>
        )}
        <TouchableOpacity
          style={styles.button}
          onPress={getDirections}
        >
          <Text style={styles.buttonText}>Làm mới</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );
};

export default NavigationScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  markerOrigin: {
    width: 30,
    height: 30,

    borderRadius: 15,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  markerDestination: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  markerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    elevation: 4,
    alignItems: 'center',
  },
  infoText: { fontSize: 16, color: '#333', marginBottom: 10 },
  button: {
    backgroundColor: '#2E64FE',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  buttonText: { color: 'white', fontWeight: '600' },
});
