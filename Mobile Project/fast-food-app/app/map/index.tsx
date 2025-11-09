import MapLibreGL from '@maplibre/maplibre-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Thiết lập MapLibre
MapLibreGL.setAccessToken(null);

const GoongConstants = {
  MAP_KEY: 'mLM7L3S4dgc0GHsXXaFp6nXG0lN0dzW2qn4FnIQf', // Key để load map
  API_KEY: 'rrES1aD0oSzi4rK4BpufpNhcW9U4hyXg1Uatebk1', // Key để gọi API services
};

const NavigationScreen = () => {
  console.log('=== NavigationScreen rendered ===');

  // State cho bản đồ
  const [loadMap] = useState(
    `https://tiles.goong.io/assets/goong_map_highlight.json?api_key=${GoongConstants.MAP_KEY}`
  );
  const camera = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(12);
  const [centerCoordinate, setCenterCoordinate] = useState([105.83991, 21.028]);

  // State cho tìm kiếm
  const [searchOrigin, setSearchOrigin] = useState<string>('');
  const [searchDestination, setSearchDestination] = useState<string>('');
  const [suggestionsOrigin, setSuggestionsOrigin] = useState<any[]>([]);
  const [suggestionsDestination, setSuggestionsDestination] = useState<any[]>(
    []
  );
  const [showSuggestionsOrigin, setShowSuggestionsOrigin] =
    useState<boolean>(false);
  const [showSuggestionsDestination, setShowSuggestionsDestination] =
    useState<boolean>(false);

  // State cho marker và route
  const [originLocation, setOriginLocation] = useState<[number, number] | null>(
    null
  );
  const [destinationLocation, setDestinationLocation] = useState<
    [number, number] | null
  >(null);
  const [route, setRoute] = useState<
    Array<{ latitude: number; longitude: number }>
  >([]);
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Debounce timer
  const debounceTimerOrigin = useRef<number | null>(null);
  const debounceTimerDestination = useRef<number | null>(null);

  // Gọi Autocomplete API
  const getPlacesAutocomplete = async (
    search: string,
    isOrigin: boolean = true
  ) => {
    if (search.trim().length < 2) {
      if (isOrigin) {
        setSuggestionsOrigin([]);
      } else {
        setSuggestionsDestination([]);
      }
      return;
    }

    try {
      const url = `https://rsapi.goong.io/Place/AutoComplete?api_key=${
        GoongConstants.API_KEY
      }&input=${encodeURIComponent(search)}`;
      console.log('Fetching autocomplete:', url);

      const response = await fetch(url);
      const data = await response.json();

      console.log('Autocomplete response:', data);

      if (isOrigin) {
        setSuggestionsOrigin(data.predictions || []);
        setShowSuggestionsOrigin(true);
        console.log('Origin suggestions:', data.predictions?.length || 0);
        console.log('showSuggestionsOrigin set to true');
      } else {
        setSuggestionsDestination(data.predictions || []);
        setShowSuggestionsDestination(true);
        console.log('Destination suggestions:', data.predictions?.length || 0);
        console.log('showSuggestionsDestination set to true');
      }
    } catch (error) {
      console.error('Error fetching autocomplete:', error);
    }
  };

  // Debounce cho tìm kiếm điểm đầu
  useEffect(() => {
    if (debounceTimerOrigin.current) {
      clearTimeout(debounceTimerOrigin.current);
    }

    debounceTimerOrigin.current = setTimeout(() => {
      if (searchOrigin.trim()) {
        getPlacesAutocomplete(searchOrigin, true);
      }
    }, 500);

    return () => {
      if (debounceTimerOrigin.current) {
        clearTimeout(debounceTimerOrigin.current);
      }
    };
  }, [searchOrigin]);

  // Debounce cho tìm kiếm điểm cuối
  useEffect(() => {
    if (debounceTimerDestination.current) {
      clearTimeout(debounceTimerDestination.current);
    }

    debounceTimerDestination.current = setTimeout(() => {
      if (searchDestination.trim()) {
        getPlacesAutocomplete(searchDestination, false);
      }
    }, 500);

    return () => {
      if (debounceTimerDestination.current) {
        clearTimeout(debounceTimerDestination.current);
      }
    };
  }, [searchDestination]);

  // Gọi Place Detail API
  const getPlaceDetail = async (placeId: string, isOrigin: boolean = true) => {
    console.log('getPlaceDetail called:', placeId, 'isOrigin:', isOrigin);
    try {
      const response = await fetch(
        `https://rsapi.goong.io/Place/Detail?place_id=${placeId}&api_key=${GoongConstants.API_KEY}`
      );
      const data = await response.json();

      console.log('Place detail response:', data);

      const location: [number, number] = [
        data.result.geometry.location.lng,
        data.result.geometry.location.lat,
      ];

      console.log('Location set:', location);

      if (isOrigin) {
        setOriginLocation(location);
        setSearchOrigin(data.result.formatted_address);
        setShowSuggestionsOrigin(false);
        console.log('Origin location updated');
      } else {
        setDestinationLocation(location);
        setSearchDestination(data.result.formatted_address);
        setShowSuggestionsDestination(false);
        console.log('Destination location updated');
      }

      // Di chuyển camera đến vị trí được chọn
      setCenterCoordinate(location);
      setZoomLevel(14);
    } catch (error) {
      console.error('Error fetching place detail:', error);
    }
  };

  // Gọi Directions API
  const getDirections = async () => {
    console.log('=== getDirections (drone mode) ===');
    console.log('originLocation:', originLocation);
    console.log('destinationLocation:', destinationLocation);

    if (!originLocation || !destinationLocation) {
      alert('Vui lòng chọn điểm đầu và điểm cuối');
      return;
    }

    try {
      setLoading(true);

      // Tạo đường thẳng giữa 2 điểm
      const coordinates = [
        { latitude: originLocation[1], longitude: originLocation[0] },
        { latitude: destinationLocation[1], longitude: destinationLocation[0] },
      ];

      setRoute(coordinates);

      // Tính khoảng cách đường chim bay (km)
      const R = 6371;
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const [lon1, lat1] = originLocation;
      const [lon2, lat2] = destinationLocation;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = (R * c).toFixed(1);

      setDistance(distance + ' km');
      setDuration('Drone flight'); // tuỳ m muốn hiển thị gì

      // Fit camera (lấy trung điểm)
      const avgLng = (lon1 + lon2) / 2;
      const avgLat = (lat1 + lat2) / 2;
      setCenterCoordinate([avgLng, avgLat]);
      setZoomLevel(12);

      console.log('Straight line route set ✅');
    } catch (error) {
      console.error('Error creating straight route:', error);
      alert('Không thể tạo đường chim bay');
    } finally {
      setLoading(false);
    }
  };

  // Reset
  const handleReset = () => {
    setSearchOrigin('');
    setSearchDestination('');
    setOriginLocation(null);
    setDestinationLocation(null);
    setRoute([]);
    setDistance('');
    setDuration('');
    setSuggestionsOrigin([]);
    setSuggestionsDestination([]);
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 1, 20));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 1, 1));
  };

  // Render suggestion item
  const renderSuggestion = (item: any, isOrigin: boolean) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => {
        console.log('Suggestion clicked:', item.description);
        getPlaceDetail(item.place_id, isOrigin);
      }}
    >
      <Text style={styles.suggestionText}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {console.log('Render - originLocation:', originLocation)}
      {console.log('Render - destinationLocation:', destinationLocation)}
      {console.log('Render - loading:', loading)}
      {console.log(
        'Render - Button disabled:',
        loading || !originLocation || !destinationLocation
      )}

      <MapLibreGL.MapView
        mapStyle={loadMap}
        style={styles.map}
        // @ts-ignore - projection prop exists but not in types
        projection="globe"
        zoomEnabled={true}
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
            <View style={styles.markerOrigin}>
              <Text style={styles.markerText}>A</Text>
            </View>
          </MapLibreGL.PointAnnotation>
        )}

        {/* Marker điểm cuối */}
        {destinationLocation && (
          <MapLibreGL.PointAnnotation
            id="destination-marker"
            coordinate={destinationLocation}
          >
            <View style={styles.markerDestination}>
              <Text style={styles.markerText}>B</Text>
            </View>
          </MapLibreGL.PointAnnotation>
        )}

        {/* Hiển thị route */}
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
                lineColor: '#2E64FE',
                lineWidth: 5,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </MapLibreGL.ShapeSource>
        )}
      </MapLibreGL.MapView>

      {/* Search Panel */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.searchContainer}
      >
        <View style={styles.searchPanel}>
          {/* Điểm đầu */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <View style={styles.dotOrigin} />
              <TextInput
                style={styles.input}
                placeholder="Điểm đi"
                value={searchOrigin}
                onChangeText={setSearchOrigin}
                onFocus={() => {
                  console.log('Origin input focused');
                  setShowSuggestionsOrigin(true);
                  setShowSuggestionsDestination(false);
                }}
              />
            </View>
            {console.log(
              'Checking origin suggestions - show:',
              showSuggestionsOrigin,
              'length:',
              suggestionsOrigin.length
            )}
            {showSuggestionsOrigin && suggestionsOrigin.length > 0 && (
              <View style={styles.suggestionsList}>
                {console.log('Rendering origin suggestions list')}
                <FlatList
                  data={suggestionsOrigin}
                  keyExtractor={(item, index) => `origin-${index}`}
                  renderItem={({ item }) => renderSuggestion(item, true)}
                  nestedScrollEnabled={true}
                />
              </View>
            )}
          </View>

          {/* Điểm cuối */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <View style={styles.dotDestination} />
              <TextInput
                style={styles.input}
                placeholder="Điểm đến"
                value={searchDestination}
                onChangeText={setSearchDestination}
                onFocus={() => {
                  console.log('Destination input focused');
                  setShowSuggestionsDestination(true);
                  setShowSuggestionsOrigin(false);
                }}
              />
            </View>
            {console.log(
              'Checking destination suggestions - show:',
              showSuggestionsDestination,
              'length:',
              suggestionsDestination.length
            )}
            {showSuggestionsDestination &&
              suggestionsDestination.length > 0 && (
                <View style={styles.suggestionsList}>
                  {console.log('Rendering destination suggestions list')}
                  <FlatList
                    data={suggestionsDestination}
                    keyExtractor={(item, index) => `dest-${index}`}
                    renderItem={({ item }) => renderSuggestion(item, false)}
                    nestedScrollEnabled={true}
                  />
                </View>
              )}
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary]}
              onPress={() => {
                console.log('Button pressed!');
                getDirections();
              }}
              disabled={loading || !originLocation || !destinationLocation}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Tìm đường</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleReset}
            >
              <Text style={styles.buttonTextSecondary}>Đặt lại</Text>
            </TouchableOpacity>
          </View>

          {/* Route info */}
          {distance && duration && (
            <View style={styles.routeInfo}>
              <Text style={styles.routeInfoText}>
                📍 Khoảng cách: {distance}
              </Text>
              <Text style={styles.routeInfoText}>⏱️ Thời gian: {duration}</Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: 40,
    left: 10,
    right: 10,
  },
  searchPanel: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  dotOrigin: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    marginRight: 10,
  },
  dotDestination: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F44336',
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 45,
    fontSize: 16,
  },
  suggestionsList: {
    maxHeight: 200,
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  button: {
    flex: 1,
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#2E64FE',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2E64FE',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#2E64FE',
    fontSize: 16,
    fontWeight: '600',
  },
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
  routeInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  routeInfoText: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 4,
    fontWeight: '500',
  },
});

export default NavigationScreen;
