import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import styles from "./LocationSection.module.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Main property marker icon
const propertyIcon = L.divIcon({
  className: "property-marker",
  html: `<div style="
    background-color: #6B7AED;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 3px 6px rgba(0,0,0,0.4);
    position: relative;
  ">
    <div style="
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 10px;
      font-weight: bold;
    ">🏠</div>
  </div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

const LocationSection = ({ property }) => {
  const { location } = property;

  return (
    <section className={styles.locationSection}>
      <div className={styles.container}>
        <div className={styles.locationContent}>
          <div className={styles.mapContainer}>
            <MapContainer
              center={[location.latitude, location.longitude]}
              zoom={14}
              style={{ height: "400px", width: "100%" }}
              className={styles.leafletMap}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />

              <Marker
                position={[location.latitude, location.longitude]}
                icon={propertyIcon}
              >
                <Popup>
                  <div className={styles.propertyPopup}>
                    <h4>{property.name}</h4>
                    <p>{location.address}</p>
                    <p>
                      {location.city}, {location.state} - {location.pincode}
                    </p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationSection;
