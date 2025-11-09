import { getTempAddress, setTempAddress } from '@/data/address';
import * as MapLibreGL from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import debounce from 'lodash.debounce';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

MapLibreGL.setAccessToken(null);

const GoongConstants = {
  MAP_KEY: 'mLM7L3S4dgc0GHsXXaFp6nXG0lN0dzW2qn4FnIQf',
  API_KEY: 'rrES1aD0oSzi4rK4BpufpNhcW9U4hyXg1Uatebk1',
};

const CenterPinMapPicker = () => {
  const [mapStyle] = useState(
    `https://tiles.goong.io/assets/goong_map_highlight.json?api_key=${GoongConstants.MAP_KEY}`
  );

  const camera = useRef<MapLibreGL.Camera>(null);
  const [zoomLevel] = useState(16);
  const [centerCoordinate, setCenterCoordinate] = useState<
    [number, number] | null
  >(null);

  const [address, setAddress] = useState('');
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [moving, setMoving] = useState(false);
  const router = useRouter();

  // 🛰️ Lấy vị trí hiện tại ban đầu
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
        setCenterCoordinate(coord);
        fetchAddressFromCoords(coord);
      } catch (err) {
        console.error(err);
        Alert.alert('Không thể lấy vị trí hiện tại');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // 🧭 Lấy địa chỉ từ toạ độ
  const fetchAddressFromCoords = async (coord: [number, number]) => {
    try {
      const [lng, lat] = coord;
      const url = `https://rsapi.goong.io/Geocode?latlng=${lat},${lng}&api_key=${GoongConstants.API_KEY}`;
      console.log('📡 Fetching reverse geocode:', url);

      const res = await fetch(url);
      const data = await res.json();
      if (data.results?.length > 0) {
        const addr = data.results[0].formatted_address;
        setAddress(addr);
        setSearchText(addr); // sync input text
      }
    } catch (err) {
      console.error('Error reverse geocode:', err);
    }
  };

  // 🔁 Khi map dừng di chuyển → reverse geocode
  const fetchAddressFromCoordsDebounced = useRef(
    debounce((coord: [number, number]) => fetchAddressFromCoords(coord), 500)
  ).current;

  const handleRegionDidChange = (e: any) => {
    try {
      const coord: [number, number] = e.geometry.coordinates;
      setMoving(false);
      fetchAddressFromCoordsDebounced(coord);
    } catch (err) {
      console.log('Error reading region center:', err);
    }
  };

  // 🕒 Debounce autocomplete
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchText.trim().length > 1 && searchText !== address) {
        fetchSuggestions(searchText);
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchText]);

  // 🔍 Gọi API autocomplete
  const fetchSuggestions = async (text: string) => {
    try {
      const res = await fetch(
        `https://rsapi.goong.io/Place/AutoComplete?api_key=${
          GoongConstants.API_KEY
        }&input=${encodeURIComponent(text)}`
      );
      const data = await res.json();
      setSuggestions(data.predictions || []);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  };

  // 📍 Khi chọn 1 gợi ý
  const handleSelectSuggestion = async (item: any) => {
    try {
      setSuggestions([]);
      setSearchText(item.description);
      setAddress(item.description);
      setLoading(true);

      const res = await fetch(
        `https://rsapi.goong.io/Place/Detail?place_id=${item.place_id}&api_key=${GoongConstants.API_KEY}`
      );
      const data = await res.json();

      if (data.result?.geometry?.location) {
        const { lat, lng } = data.result.geometry.location;
        const coord: [number, number] = [lng, lat];
        setCenterCoordinate(coord);
        camera.current?.setCamera({
          centerCoordinate: coord,
          zoomLevel: 16,
          animationDuration: 1000,
        });
      }
    } catch (err) {
      console.error('Error selecting suggestion:', err);
    } finally {
      setLoading(false);
    }
  };

  const params = useLocalSearchParams();
  const [formData, setFormData] = useState({
    ...params, // nhận tất cả dữ liệu trước đó
  });

  const handleConfirm = () => {
    if (searchText.trim() === '') return; // optional: check input

    // lưu tạm
    setTempAddress({ address: searchText });

    // console log ngay sau khi lưu
    console.log('📌 Địa chỉ tạm lưu:', getTempAddress());

    router.back(); // về page trước (add)
  };

  return (
    <View style={styles.container}>
      {/* 🔙 Nút quay lại */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: 'absolute',
          top: Platform.OS === 'ios' ? 50 : 40, // tránh notch / status bar
          left: 20,
          padding: 10,
          backgroundColor: 'rgba(255,255,255,0.9)', // nhẹ cho dễ nhìn
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

      {/* 🗺️ Bản đồ */}
      <MapLibreGL.MapView
        style={styles.map}
        mapStyle={mapStyle}
        onRegionDidChange={handleRegionDidChange}
      >
        <MapLibreGL.Camera
          ref={camera}
          zoomLevel={zoomLevel}
          centerCoordinate={centerCoordinate}
          animationMode="none"
        />
      </MapLibreGL.MapView>

      {/* 📍 Ghim ở giữa */}
      <View style={styles.centerPinContainer}>
        <Image
          source={require('@/assets/images/pin.png')}
          style={styles.centerPin}
        />
      </View>

      {/* 🔎 Ô nhập địa chỉ + autocomplete */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.addressBox}
      >
        <View style={styles.addressContainer}>
          <TextInput
            style={styles.addressInput}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Nhập địa chỉ..."
            returnKeyType="search"
          />
          {(loading || moving) && (
            <ActivityIndicator
              size="small"
              color="#000"
            />
          )}
        </View>

        {suggestions.length > 0 && (
          <View style={styles.suggestionBox}>
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.place_id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => handleSelectSuggestion(item)}
                  style={styles.suggestionItem}
                >
                  <Text style={styles.suggestionText}>{item.description}</Text>
                </Pressable>
              )}
            />
          </View>
        )}
      </KeyboardAvoidingView>
      <TouchableOpacity
        onPress={handleConfirm}
        style={{
          position: 'absolute',
          bottom: 40,
          left: 20,
          right: 20,
          backgroundColor: '#e67e22',
          padding: 14,
          borderRadius: 10,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '600' }}>Chọn địa chỉ</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  centerPinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -16,
    marginTop: -32,
    zIndex: 2,
  },
  centerPin: { width: 32, height: 32, tintColor: '#007AFF' },
  addressBox: {
    position: 'absolute',
    top: 90,
    left: 20,
    right: 20,
  },
  addressContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    zIndex: 10,
  },
  addressInput: { flex: 1, fontSize: 14, color: '#333' },
  suggestionBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 150,
    elevation: 3,
    zIndex: 9,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  suggestionText: { fontSize: 14, color: '#333' },
});

export default CenterPinMapPicker;
