export const RESTAURANT_LOCATION = { lat: 9.0032, lng: 38.778 };
export const RESTAURANT_NAME = "Addis Eats — Bole Road";

export const AREA_LOCATIONS = {
  Bole: { lat: 8.9872, lng: 38.7891 },
  Kazanchis: { lat: 9.0067, lng: 38.7574 },
  Piassa: { lat: 9.0304, lng: 38.7422 },
  Megenagna: { lat: 9.0025, lng: 38.777 },
  CMC: { lat: 8.9901, lng: 38.7976 },
  AyerTena: { lat: 9.0082, lng: 38.7193 },
  Mexico: { lat: 9.018, lng: 38.7483 },
  SarBet: { lat: 9.0137, lng: 38.7449 },
  Saris: { lat: 8.9449, lng: 38.7174 },
};

export function areaLocation(area) {
  return AREA_LOCATIONS[area] ?? RESTAURANT_LOCATION;
}

export function midpoint(first, second) {
  return {
    lat: (first.lat + second.lat) / 2,
    lng: (first.lng + second.lng) / 2,
  };
}

export function distanceMeters(first, second) {
  const earthRadius = 6_371_000;
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const deltaLat = toRadians(second.lat - first.lat);
  const deltaLng = toRadians(second.lng - first.lng);
  const hav =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(first.lat)) *
      Math.cos(toRadians(second.lat)) *
      Math.sin(deltaLng / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(hav), Math.sqrt(1 - hav));
}

export function interpolatePoint(first, second, progress, jitterSeed = 0) {
  const t = Math.min(Math.max(progress, 0), 1);
  const arc = Math.sin(t * Math.PI) * (jitterSeed || 0);

  return {
    lat: first.lat + (second.lat - first.lat) * t + arc,
    lng: first.lng + (second.lng - first.lng) * t + arc,
  };
}

export function seedFromString(value) {
  let hash = 2166136261;
  for (const char of String(value ?? "")) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 0xffffffff - 0.5;
}