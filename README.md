🌱 Climate‑Plan AI  
Street‑Level Sensors → Real‑Time Alerts → Personal &amp; Enterprise Climate Decisions

&gt; **Prototype status:** Front‑end demo running on synthetic + live API data.  
&gt; **Next milestone:** Plug in hardware sensor mesh and launch the AI Planner beta.

---

## ⚡ Why We’re Building This
Traditional satellite / city‑station data is too coarse to spot a fire spark, toxic plume, or heat‑stroke hotspot on your block.  
Our solution plants low‑cost sensor nodes **every 100–250 m**, streams the data, and lets AI tell each user—or an entire enterprise—_exactly_ what to do next.

---

## ✨ Core Features

| Module | What it does |
|--------|--------------|
| **Granular Sensor Mesh** | Virtual for now; future ESP32‑based nodes (temp, humidity, CO₂/PM, flame &amp; gas sensors) every 0.1‑0.25 km. |
| **Early Danger Detection** | Edge logic flags sudden temperature spikes / gas signatures → instant “Fire / Hazard Possible” alert. |
| **Interactive Map** (`index.html`) | Plots every node; markers auto‑tint green/yellow/red. Click to view live metrics + last AI recommendation. |
| **Ops Dashboard** (`dashboard.html`) | Buckets all sites into **Safe**, **Moderate**, **Danger** lanes; surfaces impact snippets (schools affected, farm zones, worker clusters). |
| **AI Personalized Planner** (road‑map) | Advises: _“Shift outdoor PE to 7 AM”_, _“Irrigate Zone A at 4 PM”_, _“Evacuate aisle 3—possible fire”_. |
| **B2B / School API** | Planned REST+WebSocket layer so partners can ingest insights, embed widgets, and automate ESG reports. |

---

## 🏗️ Architecture (Prototype → Full Scale)

</code></pre>
<pre><code>Sensor Node (ESP32)  ← future  ──MQTT/HTTPS──▶  Ingest API (FastAPI) ─┐
  • Temp / Humidity                                          │ WebSocket / REST
  • CO₂ / PM₂.₅                                              ▼
  • Flame / Gas     (Edge anomaly)                   Front‑End SPA (this repo)
</code></pre>
<pre><code>
Today the front‑end consumes **Open‑Meteo** + synthetic feeds; swap in real POSTs later.

---

## Quick&nbsp;Start (Prototype)

```bash
git clone https://github.com/YOUR‑ORG/climate-plan-ai.git
cd climate-plan-ai
python -m http.server 8000      # or VS&nbsp;Code Live&nbsp;Server

# Map view
open http://localhost:8000/index.html
# Dashboard
open http://localhost:8000/dashboard.html
</code></pre>
<p>Synthetic readings live in <code inline="">dashboard.js → generateFakeReading()</code>.</p>
<hr>
<h2>Config Cheat‑Sheet</h2>

Tweak | Where
-- | --
Node coordinates | monitoredLocations in dashboard.js
Alert thresholds | getStatusLabel() in JS files
AI chat canned replies | aiResponses in main.js
Live‑Server port | .vscode/settings.json


<hr>
<h2>Future Roadmap</h2>
<ol>
<li>
<p><strong>Hardware Alpha&nbsp;(10 nodes)</strong> – ESP32 + LoRa/4G fallback, solar‑powered.</p>
</li>
<li>
<p><strong>AI Planner v1</strong> – LSTM / Prophet ensemble for 3‑day, block‑level risk forecasts.</p>
</li>
<li>
<p><strong>School Pack</strong> – Dashboards + push alerts for principals and PE teachers.</p>
</li>
<li>
<p><strong>Enterprise Tier</strong> – SLA dashboards, ESG exports, webhook automations.</p>
</li>
<li>
<p><strong>Edge‑ML Firmware</strong> – Tiny anomaly models on‑device to flag fire/gas in &lt;1 s.</p>
</li>
</ol>
<hr>
<h2>Tech&nbsp;Stack</h2>
<ul>
<li>
<p>Vanilla HTML / CSS / JS + Leaflet (fast, framework‑free).</p>
</li>
<li>
<p>Open‑Meteo + Nominatim for zero‑key weather / geocoding.</p>
</li>
<li>
<p>(Planned) FastAPI + TimescaleDB for ingest + analytics.</p>
</li>
<li>
<p>(Planned) TinyML on ESP32 for local anomaly detection.</p>
</li>
</ul>
<hr>
<h2>License</h2>
<p>MIT — Fork, remix, and deploy anywhere.</p>
<blockquote>
<p><em>Built in 24 hrs for <strong>"Let’s Build AI for Climate Resilience(Hackathon)" by <strong>Team SkyMinds</strong> — “Think globally, sense locally, act instantly.”</em></p>
</blockquote>
<pre><code>

</code></pre></body></html><!--EndFragment-->
</body>
</html>
