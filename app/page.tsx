"use client";

import { PointerEvent, useMemo, useState } from "react";

type Page = "overview" | "map" | "zones" | "devices";
type Risk = "Critical" | "High" | "Elevated" | "Watch";
type DispatchState = "Recommended" | "Scheduled" | "Dispatched" | "Verify impact";

type NodeData = {
  id: string;
  location: string;
  score: number;
  risk: Risk;
  eggs: number;
  growth: number;
  temp: number;
  humidity: number;
  battery: number;
  signal: "Strong" | "Medium" | "Weak";
  x: number;
  y: number;
};

const locations = [
  "North residential block", "Market drain corridor", "Community courtyard",
  "School perimeter", "Riverside apartments", "Transit plaza",
  "Community park", "South residential block", "Sports complex", "Market square",
];

const nodes: NodeData[] = Array.from({ length: 100 }, (_, i) => {
  const row = Math.floor(i / 10);
  const column = i % 10;
  const seeded = [91, 87, 82, 78, 74, 69, 63, 58, 52, 46][i % 10];
  const score = Math.max(38, Math.min(94, seeded - Math.floor(row * 1.3) + ((i * 7) % 9)));
  const risk: Risk = score >= 85 ? "Critical" : score >= 70 ? "High" : score >= 55 ? "Elevated" : "Watch";
  return {
    id: `OZ-${String(i + 1).padStart(3, "0")}`,
    location: locations[(i + row * 3) % locations.length],
    score,
    risk,
    eggs: 32 + ((i * 19) % 104),
    growth: 4 + ((i * 11) % 38),
    temp: 29.2 + ((i * 7) % 31) / 10,
    humidity: 67 + ((i * 13) % 24),
    battery: 28 + ((i * 17) % 70),
    signal: i % 13 === 0 ? "Weak" : i % 5 === 0 ? "Medium" : "Strong",
    x: 7 + column * 9.4 + (row % 2) * 1.3,
    y: 7 + row * 9.3,
  };
});

const topZones = nodes.slice().sort((a, b) => b.score - a.score).slice(0, 6);

const riskDrivers = [
  { label: "Egg activity", value: "+37%", weight: 40 },
  { label: "Rainfall", value: "+28%", weight: 30 },
  { label: "Humidity", value: "84%", weight: 20 },
  { label: "Temperature", value: "32.1°C", weight: 10 },
];

const pageLabels: Record<Page, { title: string; description: string }> = {
  overview: { title: "Command center", description: "Vector activity, network health and fogging readiness at a glance." },
  map: { title: "Risk map", description: "Explore block-level reproduction-surge risk across the 100 m sensor grid." },
  zones: { title: "Priority zones", description: "Turn early vector signals into targeted fogging operations." },
  devices: { title: "Device network", description: "Monitor 100 solar-powered OviZero nodes across the coverage area." },
};

export default function Home() {
  const [page, setPage] = useState<Page>("overview");
  const [period, setPeriod] = useState("7D");
  const [selectedId, setSelectedId] = useState("OZ-001");
  const [riskFilter, setRiskFilter] = useState<"All" | Risk>("All");
  const [mapMode, setMapMode] = useState<"Risk" | "Network">("Risk");
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragOrigin, setDragOrigin] = useState<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [deviceQuery, setDeviceQuery] = useState("");
  const [dispatch, setDispatch] = useState<Record<string, DispatchState>>({});
  const [toast, setToast] = useState("");

  const selected = nodes.find((node) => node.id === selectedId) ?? nodes[0];
  const visibleNodes = useMemo(
    () => nodes.filter((node) => riskFilter === "All" || node.risk === riskFilter),
    [riskFilter],
  );
  const searchedDevices = useMemo(() => {
    const query = deviceQuery.trim().toLowerCase();
    return nodes.filter((node) => !query || node.id.toLowerCase().includes(query) || node.location.toLowerCase().includes(query));
  }, [deviceQuery]);

  const navigate = (next: Page) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const moveDispatch = (id: string) => {
    const current = dispatch[id] ?? "Recommended";
    const next: Record<DispatchState, DispatchState> = {
      Recommended: "Scheduled", Scheduled: "Dispatched", Dispatched: "Verify impact", "Verify impact": "Recommended",
    };
    setDispatch((previous) => ({ ...previous, [id]: next[current] }));
    showToast(`${id}: ${next[current].toLowerCase()}`);
  };

  const exportCsv = () => {
    const rows = ["node,location,risk_score,risk,egg_count,growth,temp_c,humidity,battery", ...nodes.map((node) =>
      [node.id, node.location, node.score, node.risk, node.eggs, node.growth, node.temp.toFixed(1), node.humidity, node.battery].join(","),
    )];
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([rows.join("\n")], { type: "text/csv" }));
    link.download = "ovizero-network.csv";
    link.click();
    URL.revokeObjectURL(link.href);
    showToast("Network data exported");
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragOrigin) return;
    setOffset({ x: dragOrigin.ox + event.clientX - dragOrigin.x, y: dragOrigin.oy + event.clientY - dragOrigin.y });
  };

  return (
    <div className="product-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => navigate("overview")} aria-label="OviZero command center">
          <span className="brand-mark">O</span><span><strong>OviZero</strong><small>Vector intelligence</small></span>
        </button>
        <nav aria-label="Primary navigation">
          <MenuButton label="Command center" icon="01" active={page === "overview"} onClick={() => navigate("overview")} />
          <MenuButton label="Risk map" icon="02" active={page === "map"} onClick={() => navigate("map")} />
          <MenuButton label="Priority zones" icon="03" active={page === "zones"} onClick={() => navigate("zones")} badge={String(topZones.length)} />
          <MenuButton label="Device network" icon="04" active={page === "devices"} onClick={() => navigate("devices")} />
        </nav>
        <div className="coverage-card">
          <span className="coverage-icon">100m</span>
          <div><strong>Dense coverage</strong><small>One node every 100 metres</small></div>
        </div>
        <div className="sidebar-foot"><span className="pulse-dot" /><div><strong>100 / 100 online</strong><small>Network operating normally</small></div></div>
      </aside>

      <main className="workspace">
        <header className="workspace-header">
          <div><p className="eyebrow">OviZero intelligence network</p><h1>{pageLabels[page].title}</h1><p>{pageLabels[page].description}</p></div>
          <div className="header-actions">
            <div className="period-control">{["7D", "30D", "90D"].map((item) => <button key={item} className={period === item ? "active" : ""} onClick={() => setPeriod(item)}>{item}</button>)}</div>
            <button className="secondary-button" onClick={exportCsv}>Export CSV</button>
          </div>
        </header>

        {page === "overview" && <Overview period={period} dispatch={dispatch} navigate={navigate} selectNode={setSelectedId} moveDispatch={moveDispatch} />}
        {page === "map" && <RiskMap
          selected={selected} selectNode={setSelectedId} visibleNodes={visibleNodes} riskFilter={riskFilter} setRiskFilter={setRiskFilter}
          mapMode={mapMode} setMapMode={setMapMode} zoom={zoom} setZoom={setZoom} offset={offset} setOffset={setOffset}
          dragOrigin={dragOrigin} setDragOrigin={setDragOrigin} onPointerMove={onPointerMove} dispatch={dispatch} moveDispatch={moveDispatch}
        />}
        {page === "zones" && <PriorityZones dispatch={dispatch} moveDispatch={moveDispatch} openMap={(id) => { setSelectedId(id); navigate("map"); }} />}
        {page === "devices" && <DeviceNetwork query={deviceQuery} setQuery={setDeviceQuery} devices={searchedDevices} selected={selected} selectNode={setSelectedId} openMap={() => navigate("map")} />}
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {(["overview", "map", "zones", "devices"] as Page[]).map((item, index) => <button key={item} className={page === item ? "active" : ""} onClick={() => navigate(item)}><span>0{index + 1}</span>{item === "overview" ? "Center" : item === "devices" ? "Network" : item}</button>)}
      </nav>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function MenuButton({ label, icon, active, onClick, badge }: { label: string; icon: string; active: boolean; onClick: () => void; badge?: string }) {
  return <button className={`menu-button ${active ? "active" : ""}`} onClick={onClick}><span>{icon}</span><strong>{label}</strong>{badge && <i>{badge}</i>}</button>;
}

function Overview({ period, dispatch, navigate, selectNode, moveDispatch }: { period: string; dispatch: Record<string, DispatchState>; navigate: (page: Page) => void; selectNode: (id: string) => void; moveDispatch: (id: string) => void }) {
  const counts = nodes.reduce((result, node) => ({ ...result, [node.risk]: (result[node.risk] ?? 0) + 1 }), {} as Record<Risk, number>);
  return <div className="page-stack">
    <section className="signal-banner">
      <div className="signal-score"><span>91</span><small>/100</small></div>
      <div><p className="eyebrow">Highest reproduction-surge risk</p><h2>North residential block is critical</h2><p>Egg activity and rainfall are rising together. Targeted fogging is recommended within 48 hours.</p></div>
      <button className="dark-button" onClick={() => { selectNode("OZ-001"); navigate("zones"); }}>Review fogging plan <span>→</span></button>
    </section>

    <section className="metric-row">
      <Metric label="Priority zones" value={String(counts.Critical + counts.High)} detail={`${counts.Critical} critical · ${counts.High} high`} accent="red" />
      <Metric label="Egg activity" value="+37%" detail={`${period} network change`} accent="black" />
      <Metric label="Fogging operations" value="6" detail="Recommended now" accent="green" />
      <Metric label="Network coverage" value="1 km²" detail="100 nodes · 100 m spacing" accent="cyan" />
    </section>

    <section className="overview-grid">
      <div className="card priority-card">
        <CardHeading eyebrow="Action queue" title="Priority zones" action="Open all" onClick={() => navigate("zones")} />
        <div className="priority-list">{topZones.slice(0, 4).map((node, index) => <div className="priority-row" key={node.id}>
          <span className="rank">0{index + 1}</span><div className="priority-name"><strong>{node.location}</strong><small>{node.id} · {node.eggs} eggs detected</small></div>
          <strong className="row-score">{node.score}</strong><RiskBadge risk={node.risk} />
          <button onClick={() => moveDispatch(node.id)}>{dispatch[node.id] ?? "Schedule fogging"}</button>
        </div>)}</div>
      </div>
      <div className="card surge-card">
        <CardHeading eyebrow="Vector-climate correlation" title="Surge signal" action="Explore map" onClick={() => navigate("map")} />
        <div className="trend-chart" aria-label="Egg activity trend chart">
          {[18, 23, 20, 31, 38, 44, 57, 53, 69, 76, 91, 100].map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}
        </div>
        <div className="trend-summary"><div><strong>127</strong><small>Eggs at peak node</small></div><div><strong>84%</strong><small>Relative humidity</small></div><div><strong>+28%</strong><small>Rainfall</small></div></div>
      </div>
    </section>

    <section className="card network-strip">
      <div><p className="eyebrow">Dense early-warning layer</p><h2>100 solar nodes, spaced every 100 metres</h2><p>Wingbeat detection confirms Aedes presence. Vision AI counts eggs. Temperature and humidity reveal the microclimate conditions behind reproduction surges.</p></div>
      <div className="network-viz">{Array.from({ length: 50 }, (_, i) => <span key={i} className={i % 17 === 0 ? "hot" : i % 7 === 0 ? "warm" : ""} />)}</div>
      <button className="secondary-button" onClick={() => navigate("devices")}>Inspect network</button>
    </section>
  </div>;
}

type RiskMapProps = {
  selected: NodeData; selectNode: (id: string) => void; visibleNodes: NodeData[]; riskFilter: "All" | Risk; setRiskFilter: (risk: "All" | Risk) => void;
  mapMode: "Risk" | "Network"; setMapMode: (mode: "Risk" | "Network") => void; zoom: number; setZoom: (zoom: number) => void;
  offset: { x: number; y: number }; setOffset: (offset: { x: number; y: number }) => void;
  dragOrigin: { x: number; y: number; ox: number; oy: number } | null; setDragOrigin: (value: { x: number; y: number; ox: number; oy: number } | null) => void;
  onPointerMove: (event: PointerEvent<HTMLDivElement>) => void; dispatch: Record<string, DispatchState>; moveDispatch: (id: string) => void;
};

function RiskMap(props: RiskMapProps) {
  const { selected, selectNode, visibleNodes, riskFilter, setRiskFilter, mapMode, setMapMode, zoom, setZoom, offset, setOffset, setDragOrigin, onPointerMove, dispatch, moveDispatch } = props;
  return <div className="map-page">
    <section className="map-controls card">
      <div className="segmented"><button className={mapMode === "Risk" ? "active" : ""} onClick={() => setMapMode("Risk")}>Risk view</button><button className={mapMode === "Network" ? "active" : ""} onClick={() => setMapMode("Network")}>Network view</button></div>
      <div className="filter-buttons">{(["All", "Critical", "High", "Elevated", "Watch"] as const).map((risk) => <button key={risk} className={riskFilter === risk ? "active" : ""} onClick={() => setRiskFilter(risk)}>{risk}</button>)}</div>
      <span className="node-count">{visibleNodes.length} nodes visible</span>
    </section>
    <section className="map-detail-grid">
      <div className="interactive-map card" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setDragOrigin({ x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y }); }} onPointerMove={onPointerMove} onPointerUp={() => setDragOrigin(null)} onPointerCancel={() => setDragOrigin(null)}>
        <div className="map-stage" style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})` }}>
          <div className="map-road r1" /><div className="map-road r2" /><div className="map-road r3" /><div className="map-road r4" />
          <div className="map-label l1">North residential</div><div className="map-label l2">Market district</div><div className="map-label l3">Community park</div>
          {visibleNodes.map((node) => <button key={node.id} className={`network-node ${mapMode.toLowerCase()} ${node.risk.toLowerCase()} ${selected.id === node.id ? "selected" : ""}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} onPointerDown={(event) => { event.stopPropagation(); selectNode(node.id); }} aria-label={`${node.id}, ${node.location}, risk ${node.score}`} title={`${node.id} · ${node.score}`}><span>{mapMode === "Risk" ? node.score : ""}</span></button>)}
        </div>
        <div className="map-zoom"><button onClick={() => setZoom(Math.min(2.5, zoom + .25))} aria-label="Zoom in">+</button><button onClick={() => setZoom(Math.max(.75, zoom - .25))} aria-label="Zoom out">−</button><button onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} aria-label="Reset map">R</button></div>
        <div className="scale-bar"><span />100 m</div>
        <div className="map-legend"><span><i className="critical" />Critical</span><span><i className="high" />High</span><span><i className="elevated" />Elevated</span><span><i className="watch" />Watch</span></div>
      </div>
      <aside className="node-panel card">
        <div className="node-panel-top"><div><p className="eyebrow">Selected node</p><h2>{selected.id}</h2><p>{selected.location}</p></div><RiskBadge risk={selected.risk} /></div>
        <div className="hero-score"><div><span>{selected.score}</span><small>/100</small></div><strong>Reproduction-surge risk</strong></div>
        <p className="decision-line"><b>{selected.location} is {selected.risk.toLowerCase()}.</b> Egg activity and favourable microclimate conditions indicate a rising Aedes reproduction surge.</p>
        <div className="node-stats"><div><small>Egg count</small><strong>{selected.eggs}</strong></div><div><small>{periodLabel(selected.growth)}</small><strong>+{selected.growth}%</strong></div><div><small>Temperature</small><strong>{selected.temp.toFixed(1)}°C</strong></div><div><small>Humidity</small><strong>{selected.humidity}%</strong></div></div>
        <div className="driver-list"><p className="eyebrow">What drove the score</p>{riskDrivers.map((driver) => <div key={driver.label}><span>{driver.label} <b>{driver.value}</b></span><i><em style={{ width: `${driver.weight}%` }} /></i><strong>{driver.weight}%</strong></div>)}</div>
        <div className="fogging-callout"><span>Targeted action</span><strong>Fog a 100 m radius around {selected.id}</strong><small>Recommended within {selected.risk === "Critical" ? "48 hours" : "5 days"}</small></div>
        <button className="dark-button full" onClick={() => moveDispatch(selected.id)}>{dispatch[selected.id] ?? "Schedule targeted fogging"}<span>→</span></button>
      </aside>
    </section>
  </div>;
}

function PriorityZones({ dispatch, moveDispatch, openMap }: { dispatch: Record<string, DispatchState>; moveDispatch: (id: string) => void; openMap: (id: string) => void }) {
  return <div className="page-stack"><section className="zones-summary"><div><span>6</span><strong>Fogging recommended</strong><small>Critical reproduction-surge signals</small></div><div><span>12</span><strong>Monitor closely</strong><small>High-risk zones</small></div><div><span>3</span><strong>Verification due</strong><small>Post-fogging egg-count review</small></div></section>
    <section className="zone-grid">{topZones.map((node, index) => {
      const state = dispatch[node.id] ?? "Recommended";
      return <article className="zone-card card" key={node.id}>
        <div className="zone-card-head"><span className="zone-rank">Priority 0{index + 1}</span><RiskBadge risk={node.risk} /></div>
        <h2>{node.location}</h2><p>{node.id} · 100 m response radius</p>
        <div className="zone-score"><strong>{node.score}</strong><span>/100</span><div><b>+{node.growth}%</b><small>Egg activity</small></div></div>
        <div className="zone-reason"><strong>Why now</strong><p>Egg activity is rising alongside {node.humidity}% humidity and {node.temp.toFixed(1)}°C conditions.</p></div>
        <div className="zone-action"><span>Recommended operation</span><strong>Targeted fogging within 48 hours</strong></div>
        <div className="zone-buttons"><button onClick={() => openMap(node.id)}>View on map</button><button className="dark-button" onClick={() => moveDispatch(node.id)}>{state}</button></div>
      </article>;
    })}</section>
  </div>;
}

function DeviceNetwork({ query, setQuery, devices, selected, selectNode, openMap }: { query: string; setQuery: (value: string) => void; devices: NodeData[]; selected: NodeData; selectNode: (id: string) => void; openMap: () => void }) {
  return <div className="device-layout">
    <section className="device-table-card card">
      <div className="device-toolbar"><div><p className="eyebrow">100 m sensor grid</p><h2>OviZero nodes</h2></div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search node or location" aria-label="Search devices" /></div>
      <div className="device-table" role="table"><div className="device-row header" role="row"><span>Node</span><span>Location</span><span>Risk</span><span>Eggs</span><span>Battery</span><span>LoRaWAN</span></div>{devices.map((node) => <button className={`device-row ${selected.id === node.id ? "selected" : ""}`} key={node.id} onClick={() => selectNode(node.id)} role="row"><strong>{node.id}</strong><span>{node.location}</span><span><RiskBadge risk={node.risk} /></span><strong>{node.eggs}</strong><span>{node.battery}%</span><span className={`signal ${node.signal.toLowerCase()}`}>{node.signal}</span></button>)}</div>
    </section>
    <aside className="device-detail card"><p className="eyebrow">Device diagnostics</p><h2>{selected.id}</h2><p>{selected.location}</p><div className="device-ring" style={{ "--battery": `${selected.battery * 3.6}deg` } as React.CSSProperties}><span>{selected.battery}%</span><small>Battery</small></div>
      <div className="diagnostic-list"><div><span>Solar charging</span><strong>Active</strong></div><div><span>LoRaWAN signal</span><strong>{selected.signal}</strong></div><div><span>Camera module</span><strong>Online</strong></div><div><span>Wingbeat sensor</span><strong>Listening</strong></div><div><span>Last packet</span><strong>2 min ago</strong></div></div>
      <button className="dark-button full" onClick={openMap}>Locate on risk map <span>→</span></button>
    </aside>
  </div>;
}

function Metric({ label, value, detail, accent }: { label: string; value: string; detail: string; accent: string }) {
  return <article className={`metric-card card ${accent}`}><p className="eyebrow">{label}</p><strong>{value}</strong><span>{detail}</span></article>;
}

function CardHeading({ eyebrow, title, action, onClick }: { eyebrow: string; title: string; action: string; onClick: () => void }) {
  return <div className="card-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div><button onClick={onClick}>{action} ↗</button></div>;
}

function RiskBadge({ risk }: { risk: Risk }) { return <span className={`risk-badge ${risk.toLowerCase()}`}>{risk}</span>; }
function periodLabel(growth: number) { return growth > 25 ? "7D egg growth" : "7D egg trend"; }
