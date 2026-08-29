"use client";

import { useState } from "react";

const zones = {
  north: {
    name: "North residential block", score: 91, level: "Critical", tone: "critical",
    summary: "Rainfall and egg activity are rising—inspect drainage within 48 hours.",
    action: "Inspect drainage", window: "Within 48 hours",
    drivers: [
      { label: "Egg count trend", value: "+37%", weight: 40 },
      { label: "Rainfall", value: "+28%", weight: 30 },
      { label: "Humidity", value: "84%", weight: 20 },
      { label: "Temperature", value: "32.1°C", weight: 10 },
    ],
  },
  drain: {
    name: "Market drain corridor", score: 78, level: "High", tone: "high",
    summary: "Humidity remains elevated and egg activity is increasing—check standing water this week.",
    action: "Check standing water", window: "Within 5 days",
    drivers: [
      { label: "Egg count trend", value: "+24%", weight: 35 },
      { label: "Humidity", value: "82%", weight: 30 },
      { label: "Rainfall", value: "+16%", weight: 25 },
      { label: "Temperature", value: "31.4°C", weight: 10 },
    ],
  },
  park: {
    name: "Community park", score: 54, level: "Watch", tone: "watch",
    summary: "Conditions are stable—continue routine monitoring and inspect after the next rainfall.",
    action: "Continue monitoring", window: "Routine schedule",
    drivers: [
      { label: "Humidity", value: "76%", weight: 30 },
      { label: "Egg count trend", value: "+8%", weight: 25 },
      { label: "Rainfall", value: "+6%", weight: 25 },
      { label: "Temperature", value: "30.6°C", weight: 20 },
    ],
  },
} as const;

type ZoneKey = keyof typeof zones;

export default function Home() {
  const [period, setPeriod] = useState("7 days");
  const [selectedZone, setSelectedZone] = useState<ZoneKey>("north");
  const [showPlan, setShowPlan] = useState(false);
  const zone = zones[selectedZone];

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="OviZero overview">
          <span className="brand-mark" aria-hidden="true">O</span>
          <span>OviZero</span>
        </a>
        <nav className="nav" aria-label="Primary navigation">
          <a className="active" href="#risk-map">Risk map</a>
          <a href="#how-it-works">How it works</a>
        </nav>
        <div className="live-pill"><span /> Pilot preview</div>
      </header>

      <section className="page-heading" id="top">
        <div>
          <p className="eyebrow">Vector-climate intelligence</p>
          <h1>Risk map</h1>
          <p className="intro">See where Aedes activity is rising and what to do next.</p>
        </div>
        <div className="period-switch" aria-label="Select time period">
          {["7 days", "30 days"].map((item) => (
            <button key={item} className={period === item ? "selected" : ""} onClick={() => setPeriod(item)}>{item}</button>
          ))}
        </div>
      </section>

      <section className="risk-layout" id="risk-map">
        <div className="map-card" aria-label="Illustrative block-level risk map">
          <div className="map-toolbar">
            <div><span className="online-dot" /> 5 sensors reporting</div>
            <button aria-label="Center map" onClick={() => { setSelectedZone("north"); setShowPlan(false); }}>Center map</button>
          </div>
          <div className="map-canvas">
            <div className="road road-a" />
            <div className="road road-b" />
            <div className="road road-c" />
            <div className="block block-a">Riverside homes</div>
            <div className="block block-b">Market district</div>
            <div className="block block-c">Community park</div>
            <div className="risk-halo halo-1" />
            <div className="risk-halo halo-2" />
            <button className={`map-pin critical ${selectedZone === "north" ? "chosen" : ""}`} aria-label="North residential block, critical risk" onClick={() => { setSelectedZone("north"); setShowPlan(false); }}><span>91</span></button>
            <button className={`map-pin high ${selectedZone === "drain" ? "chosen" : ""}`} aria-label="Market drain corridor, high risk" onClick={() => { setSelectedZone("drain"); setShowPlan(false); }}><span>78</span></button>
            <button className={`map-pin watch ${selectedZone === "park" ? "chosen" : ""}`} aria-label="Community park, watch risk" onClick={() => { setSelectedZone("park"); setShowPlan(false); }}><span>54</span></button>
            <div className="map-legend"><span><i className="critical-key" /> Critical</span><span><i className="high-key" /> High</span><span><i className="watch-key" /> Watch</span></div>
          </div>
        </div>

        <aside className={`risk-panel ${zone.tone}`} id="overview" aria-live="polite">
          <div className="summary-line">
            <span className="alert-icon" aria-hidden="true">!</span>
            <p><strong>{zone.name} is {zone.level.toLowerCase()}.</strong> {zone.summary}</p>
          </div>

          <div className="score-hero">
            <div>
              <p className="eyebrow">Block-level risk</p>
              <div className="score"><strong>{zone.score}</strong><span>/100</span></div>
            </div>
            <div className="critical-badge">{zone.level}</div>
          </div>

          <div className="action-strip">
            <div><span>Recommended action</span><strong>{zone.action}</strong></div>
            <div><span>Action window</span><strong>{zone.window}</strong></div>
          </div>

          <div className="drivers">
            <div className="section-title">
              <div><p className="eyebrow">Why this score</p><h2>Risk drivers</h2></div>
              <span>{period}</span>
            </div>
            {zone.drivers.map((driver) => (
              <div className="driver" key={driver.label}>
                <div className="driver-label"><span>{driver.label} <b>{driver.value}</b></span><strong>{driver.weight}%</strong></div>
                <div className="bar"><span style={{ width: `${driver.weight}%` }} /></div>
              </div>
            ))}
            <p className="method-note">Illustrative weighting based on published entomological regression approaches. OviZero validation is planned.</p>
          </div>

          <button className="primary-action" aria-expanded={showPlan} onClick={() => setShowPlan((value) => !value)}>Open response plan <span aria-hidden="true">{showPlan ? "×" : "→"}</span></button>
          {showPlan && <div className="response-plan">
            <p className="eyebrow">Field response</p>
            <ol><li>Inspect drains and exposed water containers.</li><li>Record breeding evidence and remove stagnant water.</li><li>Recheck this block after 72 hours.</li></ol>
          </div>}
        </aside>
      </section>

      <section className="how-section" id="how-it-works">
        <div className="how-heading"><p className="eyebrow">From sensor to action</p><h2>Earlier signals. Clearer response.</h2></div>
        <div className="how-grid">
          <article><span>01</span><h3>Sense</h3><p>Solar ovitraps monitor wingbeats, egg activity, temperature and humidity.</p></article>
          <article><span>02</span><h3>Understand</h3><p>Edge vision and vector-climate models combine local signals into block-level risk.</p></article>
          <article><span>03</span><h3>Act</h3><p>Teams receive a priority, reason codes and a clear inspection window.</p></article>
        </div>
      </section>

      <p className="prototype-note">Pilot interface · Risk values shown are illustrative and not a public health alert.</p>
    </main>
  );
}
