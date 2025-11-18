/**
 * Calculate distance between two coordinates in km using Haversine formula
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Interpolate position between two points
 */
export const interpolatePosition = (from, to, progress) => {
  // Linear interpolation
  return {
    latitude: from.latitude + (to.latitude - from.latitude) * progress,
    longitude: from.longitude + (to.longitude - from.longitude) * progress,
  };
};

/**
 * Drone flight simulation states
 */
export const DRONE_STATES = {
  AVAILABLE: 'available',
  IN_FLIGHT: 'in_flight',
  WARNING: 'warning',
  RETURNING: 'returning',
  LANDED: 'landed',
};

/**
 * Flight phases during delivery
 */
export const FLIGHT_PHASES = {
  STATION_TO_RESTAURANT: 'station_to_restaurant',
  RESTAURANT_PICKUP: 'restaurant_pickup',
  RESTAURANT_TO_DELIVERY: 'restaurant_to_delivery',
  AT_DELIVERY: 'at_delivery',
  DELIVERY_TO_STATION: 'delivery_to_station',
  COMPLETED: 'completed',
};

/**
 * Get drone state based on battery and flight status
 */
export const getDroneState = (battery, isFlying) => {
  if (battery < 20) return DRONE_STATES.WARNING;
  if (isFlying) return DRONE_STATES.IN_FLIGHT;
  return DRONE_STATES.AVAILABLE;
};

/**
 * Flight simulation configuration
 * Times are in minutes, speeds in km/h
 */
export const FLIGHT_CONFIG = {
  cruisingSpeed: 50, // km/h
  stationToRestaurant: 2, // minutes
  restaurantPickup: 1, // minutes
  restaurantToDelivery: 3, // minutes
  atDelivery: 1, // minutes (time spent at delivery location)
  deliveryToStation: 2, // minutes
};

/**
 * Calculate drone position and phase during flight
 * @param {number} elapsedSeconds - Seconds elapsed since flight start
 * @param {object} startLocation - {latitude, longitude} of drone station
 * @param {object} restaurantLocation - {latitude, longitude} of restaurant
 * @param {object} deliveryLocation - {latitude, longitude} of delivery address
 * @returns {object} - {position, phase, progress, currentPathSegment, flightPath}
 */
export const calculateDronePosition = (
  elapsedSeconds,
  startLocation,
  restaurantLocation,
  deliveryLocation
) => {
  const config = FLIGHT_CONFIG;
  const totalMinutes =
    config.stationToRestaurant +
    config.restaurantPickup +
    config.restaurantToDelivery +
    config.atDelivery +
    config.deliveryToStation;

  const elapsedMinutes = elapsedSeconds / 60;
  const totalSeconds = totalMinutes * 60;

  // Check if flight is complete
  if (elapsedSeconds >= totalSeconds) {
    return {
      position: startLocation,
      phase: FLIGHT_PHASES.COMPLETED,
      progress: 1,
      currentPathSegment: null,
      flightPath: [
        startLocation,
        restaurantLocation,
        deliveryLocation,
        startLocation,
      ],
      isCompleted: true,
    };
  }

  let phase;
  let currentPosition;
  let currentPathSegment = null;
  let progress = elapsedMinutes / totalMinutes;

  // Phase 1: Station to Restaurant (2 minutes)
  if (elapsedMinutes <= config.stationToRestaurant) {
    phase = FLIGHT_PHASES.STATION_TO_RESTAURANT;
    const phaseProgress = elapsedMinutes / config.stationToRestaurant;
    currentPosition = interpolatePosition(
      startLocation,
      restaurantLocation,
      phaseProgress
    );
    currentPathSegment = {
      from: startLocation,
      to: restaurantLocation,
    };
  }
  // Phase 2: Restaurant Pickup (1 minute)
  else if (
    elapsedMinutes <=
    config.stationToRestaurant + config.restaurantPickup
  ) {
    phase = FLIGHT_PHASES.RESTAURANT_PICKUP;
    currentPosition = restaurantLocation;
    currentPathSegment = {
      from: restaurantLocation,
      to: restaurantLocation,
    };
  }
  // Phase 3: Restaurant to Delivery (3 minutes)
  else if (
    elapsedMinutes <=
    config.stationToRestaurant +
      config.restaurantPickup +
      config.restaurantToDelivery
  ) {
    phase = FLIGHT_PHASES.RESTAURANT_TO_DELIVERY;
    const elapsed =
      elapsedMinutes -
      (config.stationToRestaurant + config.restaurantPickup);
    const phaseProgress = elapsed / config.restaurantToDelivery;
    currentPosition = interpolatePosition(
      restaurantLocation,
      deliveryLocation,
      phaseProgress
    );
    currentPathSegment = {
      from: restaurantLocation,
      to: deliveryLocation,
    };
  }
  // Phase 4: At Delivery Location (1 minute)
  else if (
    elapsedMinutes <=
    config.stationToRestaurant +
      config.restaurantPickup +
      config.restaurantToDelivery +
      config.atDelivery
  ) {
    phase = FLIGHT_PHASES.AT_DELIVERY;
    currentPosition = deliveryLocation;
    currentPathSegment = {
      from: deliveryLocation,
      to: deliveryLocation,
    };
  }
  // Phase 5: Delivery to Station (2 minutes)
  else {
    phase = FLIGHT_PHASES.DELIVERY_TO_STATION;
    const elapsed =
      elapsedMinutes -
      (config.stationToRestaurant +
        config.restaurantPickup +
        config.restaurantToDelivery +
        config.atDelivery);
    const phaseProgress = elapsed / config.deliveryToStation;
    currentPosition = interpolatePosition(
      deliveryLocation,
      startLocation,
      phaseProgress
    );
    currentPathSegment = {
      from: deliveryLocation,
      to: startLocation,
    };
  }

  // Build flight path (actual path flown so far)
  const flownPath = [startLocation];
  if (
    elapsedMinutes >
    config.stationToRestaurant + config.restaurantPickup
  ) {
    flownPath.push(restaurantLocation);
  }
  if (
    elapsedMinutes >
    config.stationToRestaurant +
      config.restaurantPickup +
      config.restaurantToDelivery +
      config.atDelivery
  ) {
    flownPath.push(deliveryLocation);
  }
  flownPath.push(currentPosition);

  return {
    position: currentPosition,
    phase,
    progress,
    currentPathSegment,
    flightPath: [
      startLocation,
      restaurantLocation,
      deliveryLocation,
      startLocation,
    ],
    flownPath,
    isCompleted: false,
  };
};

/**
 * Format flight phase for display
 */
export const formatFlightPhase = (phase) => {
  const phaseNames = {
    [FLIGHT_PHASES.STATION_TO_RESTAURANT]: 'Flying to Restaurant',
    [FLIGHT_PHASES.RESTAURANT_PICKUP]: 'Picking up Order',
    [FLIGHT_PHASES.RESTAURANT_TO_DELIVERY]: 'Flying to Delivery',
    [FLIGHT_PHASES.AT_DELIVERY]: 'Delivering Order',
    [FLIGHT_PHASES.DELIVERY_TO_STATION]: 'Returning to Station',
    [FLIGHT_PHASES.COMPLETED]: 'Delivery Completed',
  };
  return phaseNames[phase] || 'Unknown';
};
