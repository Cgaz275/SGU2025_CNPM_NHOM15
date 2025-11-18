import { Ionicons } from '@expo/vector-icons';
import MapLibreGL from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { db } from '../../FirebaseConfig';

MapLibreGL.setAccessToken(null);

const GoongConstants = {
  MAP_KEY: 'mLM7L3S4dgc0GHsXXaFp6nXG0lN0dzW2qn4FnIQf',
  API_KEY: 'rrES1aD0oSzi4rK4BpufpNhcW9U4hyXg1Uatebk1',
};

const RestaurantMapScreen = () => {
  const cameraRef = useRef<MapLibreGL.Camera>(null);
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<any[]>([]);

  // 🛰️ Lấy vị trí hiện tại
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Không có quyền truy cập vị trí');
          setLoading(false);
          return;
        }

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const coord: [number, number] = [
          pos.coords.longitude,
          pos.coords.latitude,
        ];
        setUserLocation(coord);

        cameraRef.current?.setCamera({
          centerCoordinate: coord,
          zoomLevel: 15,
          animationDuration: 1200,
        });
      } catch (err) {
        console.error(err);
        Alert.alert('Không thể lấy vị trí hiện tại');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const snap = await getDocs(collection(db, 'restaurants'));
        const data = snap.docs.map((d) => {
          const r = d.data();
          const latlong = r.latlong; // GeoPoint
          return {
            id: d.id,
            ...r,
            latitude: latlong?.latitude || 0,
            longitude: latlong?.longitude || 0,
          };
        });
        setRestaurants(data);
      } catch (err) {
        console.error('ERROR loading restaurants:', err);
      }
    };
    loadRestaurants();
  }, []);

  return (
    <View style={styles.container}>
      {/* 🔙 Nút quay lại */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: 'absolute',
          top: Platform.OS === 'ios' ? 50 : 40,
          left: 20,
          padding: 10,
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderRadius: 999,
          zIndex: 10,
        }}
      >
        <Image
          source={require('../../assets/icons/arrow.png')}
          style={{ width: 20, height: 20, tintColor: '#000' }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <MapLibreGL.MapView
        style={styles.map}
        projection="globe"
        mapStyle={`https://tiles.goong.io/assets/goong_map_highlight.json?api_key=${GoongConstants.MAP_KEY}`}
      >
        <MapLibreGL.Camera
          ref={cameraRef}
          zoomLevel={15}
          centerCoordinate={userLocation || [106.68025, 10.75893]}
          animationDuration={10}
        />

        {/* 📍 Marker người dùng */}
        {userLocation && (
          <MapLibreGL.PointAnnotation
            id="user-marker"
            coordinate={userLocation}
          >
            <View style={styles.currentLocationIcon}>
              <View style={styles.currentLocationInner} />
            </View>
          </MapLibreGL.PointAnnotation>
        )}

        {/* 🍽️ Marker nhà hàng */}
        {restaurants.map((r) => (
          <MapLibreGL.PointAnnotation
            key={r.id}
            id={`restaurant-${r.id}`}
            coordinate={[r.longitude, r.latitude]}
            onSelected={() => router.push(`/restaurantsc/${r.id}`)}
          >
            <View style={styles.restaurantMarker}>
              <Ionicons
                name="restaurant"
                size={22}
                color="#e67e22"
              />
              <Text
                style={styles.markerText}
                numberOfLines={1}
              >
                {r.name}
              </Text>
            </View>
          </MapLibreGL.PointAnnotation>
        ))}
      </MapLibreGL.MapView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <Text style={{ color: 'white' }}>Đang lấy vị trí...</Text>
        </View>
      )}
    </View>
  );
};

export default RestaurantMapScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  restaurantMarker: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e67e22',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 1 },
  },
  markerText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#333',
    maxWidth: 70,
    textAlign: 'center',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLocationIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  currentLocationInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#fff',
  },
});
