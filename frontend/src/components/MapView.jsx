import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import axios from "axios";

import "leaflet/dist/leaflet.css";
const greenIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const yellowIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
function MapView({ incidents }) {
  const [markers, setMarkers] = useState([]);

  useEffect(() => {
    const getCoordinates = async () => {
      const results = [];

      for (const incident of incidents) {
        try {
          const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?q=${incident.location}&format=json&limit=1`
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

    if (incidents.length > 0) {
      getCoordinates();
    }
  }, [incidents]);

  return (
    <MapContainer
      center={[28.6139, 77.2090]}
      zoom={12}
      style={{
  height: "550px",
  width: "95%",
  margin: "20px auto",
  borderRadius: "15px",
}}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {markers.map((incident) => (
        <Marker
  key={incident._id}
  position={[incident.lat, incident.lon]}
  icon={
    incident.severity === "High"
      ? redIcon
      : incident.severity === "Medium"
      ? yellowIcon
      : greenIcon
  }
>
          <Popup>
            <strong>{incident.title}</strong>
            <br />
            {incident.location}
            <br />
            Severity: {incident.severity}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default MapView;