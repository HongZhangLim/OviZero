"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createConvexHull, createProjectionBounds, expandPolygonFromCentroid, projectGeoPoint } from "@/lib/geo";
import { proposedGateway, type NodeData } from "@/lib/pilot-data";

type MapMode = "Risk" | "Network";

type OviZeroRiskMapProps = {
  nodes: NodeData[];
  visibleNodes: NodeData[];
  selectedId: string;
  mapMode: MapMode;
  onSelectNode: (id: string) => void;
};

declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const mapStyles: google.maps.MapTypeStyle[] = [
  { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#667085" }] },
  { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#e8ecef" }] },
  { featureType: "landscape.man_made", elementType: "geometry.fill", stylers: [{ color: "#fcfcfc" }] },
  { featureType: "landscape.natural", elementType: "geometry.fill", stylers: [{ color: "#f5f7f6" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#dfe5e2" }] },
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
];

const riskColors: Record<NodeData["risk"], string> = {
  Critical: "#d92d20",
  High: "#f79009",
  Elevated: "#0ea5e9",
  Watch: "#667085",
};

function markerSvg(node: NodeData, selected: boolean) {
  const size = selected ? 72 : 64;
  const circle = selected ? 17 : 14;
  const color = riskColors[node.risk];
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg width="${size}" height="58" viewBox="0 0 ${size} 58" xmlns="http://www.w3.org/2000/svg">
      <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity=".23"/></filter>
      ${selected ? `<circle cx="${size / 2}" cy="29" r="${circle + 5}" fill="none" stroke="${color}" stroke-width="2" stroke-opacity=".28"/>` : ""}
      <circle cx="${size / 2}" cy="29" r="${circle}" fill="#fff" stroke="${color}" stroke-width="${selected ? 3 : 2}" filter="url(#shadow)"/>
      <circle cx="${size / 2}" cy="29" r="${circle - 3}" fill="${color}"/>
      <rect x="${size / 2 - 24}" y="4" width="48" height="16" rx="5" fill="#fff" stroke="${color}"/>
      <text x="${size / 2}" y="15.5" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" font-weight="700" fill="#101828">${node.id}</text>
    </svg>`)} `;
}

function gatewaySvg() {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg width="66" height="66" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
      <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity=".22"/></filter>
      <circle cx="33" cy="28" r="15" fill="#eafaf2" stroke="#087a50" stroke-width="2" filter="url(#shadow)"/>
      <path d="M33 19v17M27 25a8 8 0 0 1 12 0M23 29a14 14 0 0 1 20 0" fill="none" stroke="#087a50" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="33" cy="17" r="2.5" fill="#087a50"/>
      <rect x="17" y="47" width="32" height="14" rx="4" fill="#fff" stroke="#087a50"/>
      <text x="33" y="57" text-anchor="middle" font-family="Arial,sans-serif" font-size="9" font-weight="700" fill="#101828">GW-01</text>
    </svg>`)} `;
}

export default function OviZeroRiskMap({ nodes, visibleNodes, selectedId, mapMode, onSelectNode }: OviZeroRiskMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const overlaysRef = useRef<google.maps.MVCObject[]>([]);
  const [mapsLoaded, setMapsLoaded] = useState(() => typeof window !== "undefined" && Boolean(window.google?.maps));
  const [mapsUnavailable, setMapsUnavailable] = useState(!apiKey);

  const boundary = useMemo(() => expandPolygonFromCentroid(createConvexHull(nodes.map(({ latitude, longitude }) => ({ lat: latitude, lng: longitude })))), [nodes]);
  const projectedBounds = useMemo(() => createProjectionBounds(mapMode === "Network" ? [...boundary, { lat: proposedGateway.latitude, lng: proposedGateway.longitude }] : boundary), [boundary, mapMode]);
  const project = (latitude: number, longitude: number) => projectGeoPoint({ lat: latitude, lng: longitude }, projectedBounds);

  useEffect(() => {
    if (!apiKey) return;
    if (window.google?.maps) return;

    const scriptId = "ovizero-google-maps";
    const fail = () => setMapsUnavailable(true);
    window.gm_authFailure = fail;
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => setMapsLoaded(true), { once: true });
      existing.addEventListener("error", fail, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}`;
    script.async = true;
    script.onload = () => setMapsLoaded(true);
    script.onerror = fail;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!mapsLoaded || mapsUnavailable || !containerRef.current || mapRef.current) return;
    const center = nodes.reduce((total, node) => ({ lat: total.lat + node.latitude / nodes.length, lng: total.lng + node.longitude / nodes.length }), { lat: 0, lng: 0 });
    mapRef.current = new window.google.maps.Map(containerRef.current, {
      center,
      zoom: 16,
      styles: mapStyles,
      disableDefaultUI: true,
      zoomControl: true,
      gestureHandling: "cooperative",
      clickableIcons: false,
      keyboardShortcuts: false,
    });
  }, [mapsLoaded, mapsUnavailable, nodes]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || mapsUnavailable) return;
    const bounds = new window.google.maps.LatLngBounds();
    (mapMode === "Network" ? [...boundary, { lat: proposedGateway.latitude, lng: proposedGateway.longitude }] : boundary).forEach((point) => bounds.extend(point));
    map.fitBounds(bounds, window.innerWidth < 760 ? 30 : 72);
  }, [boundary, mapMode, mapsUnavailable]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || mapsUnavailable) return;
    overlaysRef.current.forEach((overlay) => {
      window.google.maps.event.clearInstanceListeners(overlay);
      if ("setMap" in overlay && typeof overlay.setMap === "function") overlay.setMap(null);
    });
    overlaysRef.current = [];

    const polygon = new window.google.maps.Polygon({ paths: boundary, strokeColor: "#087a50", strokeOpacity: 0.35, strokeWeight: 1.25, fillColor: "#eafaf2", fillOpacity: 0.12, clickable: false, map });
    overlaysRef.current.push(polygon);

    if (mapMode === "Network") {
      const gateway = new window.google.maps.Marker({ position: { lat: proposedGateway.latitude, lng: proposedGateway.longitude }, icon: { url: gatewaySvg(), scaledSize: new window.google.maps.Size(66, 66), anchor: new window.google.maps.Point(33, 33) }, title: "GW-01 proposed gateway", clickable: false, zIndex: 20, map });
      overlaysRef.current.push(gateway);
      visibleNodes.forEach((node) => {
        const selected = node.id === selectedId;
        const link = new window.google.maps.Polyline({ path: [{ lat: proposedGateway.latitude, lng: proposedGateway.longitude }, { lat: node.latitude, lng: node.longitude }], strokeOpacity: 0, icons: [{ icon: { path: "M 0,-1 0,1", strokeColor: "#087a50", strokeOpacity: selected ? 0.9 : 0.48, strokeWeight: selected ? 2.5 : 1.5, scale: 2 }, offset: "0", repeat: "14px" }], clickable: false, zIndex: 5, map });
        overlaysRef.current.push(link);
      });
    }

    visibleNodes.forEach((node) => {
      const selected = node.id === selectedId;
      const marker = new window.google.maps.Marker({ position: { lat: node.latitude, lng: node.longitude }, icon: { url: markerSvg(node, selected), scaledSize: new window.google.maps.Size(selected ? 72 : 64, 58), anchor: new window.google.maps.Point(selected ? 36 : 32, 29) }, title: `${node.id}: ${node.risk} risk`, zIndex: selected ? 40 : 30, map });
      marker.addListener("click", () => onSelectNode(node.id));
      overlaysRef.current.push(marker);
    });
  }, [boundary, mapMode, mapsUnavailable, onSelectNode, selectedId, visibleNodes]);

  const useGoogleMap = mapsLoaded && !mapsUnavailable;

  return <div className="ovizero-risk-map">
    <div ref={containerRef} className={`google-map-canvas ${useGoogleMap ? "visible" : ""}`} />
    {!useGoogleMap && <div className="geo-map-fallback">
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" aria-label="Illustrative geographic pilot map">
        <polygon points={boundary.map((point) => { const { x, y } = project(point.lat, point.lng); return `${x},${y}`; }).join(" ")} className="pilot-boundary" />
        {mapMode === "Network" && visibleNodes.map((node) => { const start = project(proposedGateway.latitude, proposedGateway.longitude); const end = project(node.latitude, node.longitude); return <line key={`link-${node.id}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y} className={node.id === selectedId ? "gateway-link selected" : "gateway-link"} />; })}
        {mapMode === "Network" && <g className="gateway-marker"><circle cx={project(proposedGateway.latitude, proposedGateway.longitude).x} cy={project(proposedGateway.latitude, proposedGateway.longitude).y} r="3.1" /><path d={`M ${project(proposedGateway.latitude, proposedGateway.longitude).x},${project(proposedGateway.latitude, proposedGateway.longitude).y - 1.2} v2.8`} /><text x={project(proposedGateway.latitude, proposedGateway.longitude).x} y={project(proposedGateway.latitude, proposedGateway.longitude).y + 5.4}>GW-01</text></g>}
        {visibleNodes.map((node) => { const { x, y } = project(node.latitude, node.longitude); const selected = node.id === selectedId; return <g key={node.id} className="fallback-node" role="button" tabIndex={0} aria-label={`Select ${node.id}`} onClick={() => onSelectNode(node.id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onSelectNode(node.id); } }}><circle className={selected ? "node-halo" : "node-halo hidden"} cx={x} cy={y} r="4.8" /><circle className="node-ring" cx={x} cy={y} r={selected ? 3.35 : 2.9} stroke={riskColors[node.risk]} /><circle cx={x} cy={y} r={selected ? 2.55 : 2.15} fill={riskColors[node.risk]} /><rect x={x - 5.1} y={y - 7.2} width="10.2" height="2.9" rx=".7" /><text x={x} y={y - 5.15}>{node.id}</text></g>; })}
      </svg>
      <span className="map-preview-note">Map preview — Google Maps unavailable</span>
    </div>}
    <div className="map-disclaimer">Illustrative pilot deployment area</div>
    <div className="map-legend"><span><i className="critical" />Critical</span><span><i className="high" />High</span><span><i className="elevated" />Elevated</span><span><i className="watch" />Watch</span>{mapMode === "Network" && <span><b>GW</b> Proposed gateway</span>}</div>
  </div>;
}
