import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import "leaflet.heat";

// ── Severity icons ──────────────────────────────────────────────
const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41],
});
const yellowIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41],
});
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41],
});

// ── Cluster layer component ──────────────────────────────────────
function ClusterLayer({ markers }) {
  const map = useMap();

  useEffect(() => {
    if (!markers.length) return;

    const clusterGroup = L.markerClusterGroup();

    markers.forEach((incident) => {
      const icon =
        incident.severity === "High" ? redIcon
        : incident.severity === "Medium" ? yellowIcon
        : greenIcon;

      const marker = L.marker([incident.lat, incident.lon], { icon });
      marker.bindPopup(`
        <div style="min-width:160px">
          <strong>${incident.title}</strong><br/>
          📍 ${incident.location}<br/>
          ⚠️ Severity: <b>${incident.severity}</b><br/>
          🔖 Status: ${incident.status}
        </div>
      `);
      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);
    return () => map.removeLayer(clusterGroup);
  }, [markers, map]);

  return null;
}

// ── Heat map layer component ─────────────────────────────────────
function HeatLayer({ markers }) {
  const map = useMap();

  useEffect(() => {
    if (!markers.length) return;

    const points = markers.map((m) => [
      m.lat,
      m.lon,
      m.severity === "High" ? 1.0 : m.severity === "Medium" ? 0.6 : 0.3,
    ]);

    const heat = L.heatLayer(points, {
      radius: 35,
      blur: 25,
      maxZoom: 17,
      gradient: { 0.3: "blue", 0.6: "yellow", 1.0: "red" },
    });

    heat.addTo(map);
    return () => map.removeLayer(heat);
  }, [markers, map]);

  return null;
}

// ── Main MapView ─────────────────────────────────────────────────
function MapView({ incidents }) {
  const [markers, setMarkers] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [viewMode, setViewMode] = useState("cluster"); // "cluster" | "heat"

  // Geocode incidents
  useEffect(() => {
    if (!incidents.length) return;

    const getCoordinates = async () => {
      const results = [];
      for (const incident of incidents) {
        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(incident.location)}&format=json&limit=1`
          );
          if (response.data.length > 0) {
            results.push({
              ...incident,
              lat: parseFloat(response.data[0].lat),
              lon: parseFloat(response.data[0].lon),
            });
          }
        } catch (error) {
          console.log(error);
        }
      }
      setMarkers(results);
    };

    getCoordinates();
  }, [incidents]);

  // Apply filters
  const filteredMarkers = markers.filter((m) => {
    const severityMatch = filterSeverity === "All" || m.severity === filterSeverity;
    const statusMatch = filterStatus === "All" || m.status === filterStatus;
    return severityMatch && statusMatch;
  });

  return (
    <div>
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-4">
        {/* View Mode Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("cluster")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              viewMode === "cluster"
                ? "bg-purple-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            📍 Cluster View
          </button>
          <button
            onClick={() => setViewMode("heat")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              viewMode === "heat"
                ? "bg-purple-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            🔥 Heat Map
          </button>
        </div>

        {/* Severity Filter */}
        <select
          value={filterSeverity}
          onChange={(e) => setFilterSeverity(e.target.value)}
          className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
        >
          <option value="All">All Severities</option>
          <option value="High">🔴 High</option>
          <option value="Medium">🟡 Medium</option>
          <option value="Low">🟢 Low</option>
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">⏳ Pending</option>
          <option value="Verified">✅ Verified</option>
          <option value="Resolved">🔵 Resolved</option>
        </select>

        {/* Count badge */}
        <span className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm">
          Showing <span className="text-white font-bold">{filteredMarkers.length}</span> incidents
        </span>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-xs text-slate-400">
        <span>🔴 High</span>
        <span>🟡 Medium</span>
        <span>🟢 Low</span>
        {viewMode === "heat" && <span className="text-slate-300 ml-2">Heat intensity = severity weight</span>}
      </div>

      {/* Map */}
      <MapContainer
        center={[28.6139, 77.2090]}
        zoom={12}
        style={{ height: "550px", width: "100%", borderRadius: "12px" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {viewMode === "cluster" && <ClusterLayer markers={filteredMarkers} />}
        {viewMode === "heat" && <HeatLayer markers={filteredMarkers} />}
      </MapContainer>
    </div>
  );
}

export default MapView;
