export type GeoPoint = { lat: number; lng: number };

export function createConvexHull(points: GeoPoint[]): GeoPoint[] {
  if (points.length <= 3) return [...points];

  const sorted = [...points].sort((a, b) => a.lat === b.lat ? a.lng - b.lng : a.lat - b.lat);
  const cross = (origin: GeoPoint, a: GeoPoint, b: GeoPoint) =>
    (a.lat - origin.lat) * (b.lng - origin.lng) - (a.lng - origin.lng) * (b.lat - origin.lat);
  const addToHull = (source: GeoPoint[]) => source.reduce<GeoPoint[]>((hull, point) => {
    while (hull.length >= 2 && cross(hull[hull.length - 2], hull[hull.length - 1], point) <= 0) hull.pop();
    hull.push(point);
    return hull;
  }, []);

  const lower = addToHull(sorted);
  const upper = addToHull([...sorted].reverse());
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

export function expandPolygonFromCentroid(points: GeoPoint[], scale = 1.18): GeoPoint[] {
  if (!points.length) return [];
  const center = points.reduce((total, point) => ({ lat: total.lat + point.lat, lng: total.lng + point.lng }), { lat: 0, lng: 0 });
  center.lat /= points.length;
  center.lng /= points.length;
  return points.map((point) => ({ lat: center.lat + (point.lat - center.lat) * scale, lng: center.lng + (point.lng - center.lng) * scale }));
}

export function createProjectionBounds(points: GeoPoint[], paddingRatio = 0.15) {
  const latitudes = points.map((point) => point.lat);
  const longitudes = points.map((point) => point.lng);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  const latPadding = (maxLat - minLat) * paddingRatio || 0.002;
  const lngPadding = (maxLng - minLng) * paddingRatio || 0.002;
  return { minLat: minLat - latPadding, maxLat: maxLat + latPadding, minLng: minLng - lngPadding, maxLng: maxLng + lngPadding };
}

export function projectGeoPoint(point: GeoPoint, bounds: ReturnType<typeof createProjectionBounds>) {
  const x = ((point.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng || 1)) * 100;
  const y = 100 - ((point.lat - bounds.minLat) / (bounds.maxLat - bounds.minLat || 1)) * 100;
  return { x, y };
}
