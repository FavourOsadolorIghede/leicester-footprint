/**
 * GPS trip auto-detection: turn a series of location points into a distance,
 * a duration and a best-guess travel mode (walking / cycling / vehicle).
 *
 * Everything is client-side. Location is only ever read while a trip is running.
 */

/** Speed thresholds in km/h. Tweak here if real-world testing suggests it. */
export const SPEED_THRESHOLDS = {
  WALKING_MAX_AVG: 7,
  WALKING_MAX_P95: 10,
  CYCLING_MIN_AVG: 7,
  CYCLING_MAX_AVG: 25,
  CYCLING_MAX_P95: 35,
  VEHICLE_MIN_AVG: 25,
  VEHICLE_MIN_P95: 35,
};

export const QUALITY = {
  MAX_ACCURACY_METERS: 100,
  MIN_POINTS: 10,
  MIN_DURATION_SECONDS: 120,
};

export const WATCH_OPTIONS = {
  enableHighAccuracy: true,
  maximumAge: 20000,
  timeout: 25000,
};

const EARTH_RADIUS_KM = 6371;

/** Great-circle distance between two lat/lng points, in km. */
export function haversineKm(lat1, lng1, lat2, lng2) {
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_KM * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

/** Drop points whose reported accuracy is worse than the threshold. */
export function filterPoints(points) {
  return points.filter((p) => !(p.accuracy && p.accuracy > QUALITY.MAX_ACCURACY_METERS));
}

function percentile(sortedAsc, p) {
  if (sortedAsc.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sortedAsc.length) - 1;
  return sortedAsc[Math.max(0, idx)];
}

/**
 * @param {Array<{lat:number,lng:number,timestamp:number,accuracy?:number}>} points
 */
export function analyzeTrack(points) {
  const pts = filterPoints(points);
  if (pts.length < 2) {
    return { distance: 0, duration: 0, avgSpeed: 0, p95Speed: 0, pointsCount: pts.length, isValid: false };
  }

  let distance = 0;
  const speeds = [];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const d = haversineKm(a.lat, a.lng, b.lat, b.lng);
    distance += d;
    const dtSec = (b.timestamp - a.timestamp) / 1000;
    if (dtSec > 0) {
      const kmh = (d / dtSec) * 3600;
      if (kmh <= 200) speeds.push(kmh); // discard GPS jumps
    }
  }

  const durationSec = (pts[pts.length - 1].timestamp - pts[0].timestamp) / 1000;
  const avgSpeed = durationSec > 0 ? (distance / durationSec) * 3600 : 0;
  const p95Speed = percentile([...speeds].sort((x, y) => x - y), 95);

  return {
    distance,
    duration: durationSec,
    avgSpeed,
    p95Speed,
    pointsCount: pts.length,
    isValid: pts.length >= 2,
  };
}

/**
 * @returns {{mode: 'walk'|'bike'|'car_average'|'unknown', confidence: 'high'|'medium'|'low'}}
 */
export function classifyTrip(metrics) {
  if (!metrics.isValid) return { mode: 'unknown', confidence: 'low' };
  const { avgSpeed, p95Speed, pointsCount, duration } = metrics;
  const T = SPEED_THRESHOLDS;

  let mode = 'car_average';
  if (avgSpeed <= T.WALKING_MAX_AVG && p95Speed <= T.WALKING_MAX_P95) {
    mode = 'walk';
  } else if (avgSpeed > T.CYCLING_MIN_AVG && avgSpeed <= T.CYCLING_MAX_AVG && p95Speed <= T.CYCLING_MAX_P95) {
    mode = 'bike';
  }

  let confidence = 'medium';
  if (pointsCount >= QUALITY.MIN_POINTS && duration >= QUALITY.MIN_DURATION_SECONDS) {
    confidence = 'high';
  } else if (pointsCount >= 5 && duration >= 60) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  return { mode, confidence };
}

/** Thin wrappers around the Geolocation API. */
export function watchTrip(onPoint, onError) {
  if (!('geolocation' in navigator)) {
    onError?.({ code: 0, message: 'Geolocation is not supported by this device.' });
    return null;
  }
  return navigator.geolocation.watchPosition(
    (pos) =>
      onPoint({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        timestamp: pos.timestamp,
        accuracy: pos.coords.accuracy,
        speed: pos.coords.speed,
      }),
    onError,
    WATCH_OPTIONS
  );
}

export function stopWatch(id) {
  if (id != null && 'geolocation' in navigator) navigator.geolocation.clearWatch(id);
}
