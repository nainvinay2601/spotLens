"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { IPin } from "@/models/pin.model";

// Dynamically import to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

interface PinApiResponse {
  success: boolean;
  message: string;
  data: IPin[];
}

export default function MapPage() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );

  const [pins, setPins] = useState<IPin[]>([]);

useEffect(() => {
  const getLocation = async () => {
    try {
      // Try IP-based location first (works best in villages)
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      if (data.latitude && data.longitude) {
        console.log("✅ Got location from IP:", data.city, data.region);
        setUserLocation([data.latitude, data.longitude]);
        fetchPins(data.latitude, data.longitude);
        return;
      }
    } catch (error) {
      console.log("IP location failed, using default", error);
    }
    
    // Fallback to default location
    setUserLocation([40.7128, -74.006]);
    fetchPins(40.7128, -74.006);
  };

  getLocation();
}, []);

  //Fetch pins from the api route
  const fetchPins = async (lat: number, lng: number) => {
    try {
      const res = await fetch(`/api/pins?lat=${lat}&lng=${lng}`);
      const response: PinApiResponse = await res.json();

      if (response.success && response.data) {
        setPins(response.data);
        console.log(response.message); // Will show "Found X pins within..."
      } else {
        console.error("API error:", response);
        setPins([]);
      }
    } catch (error) {
      console.error("Error fetching pins:", error);
      setPins([]);
    }
  };

  if (!userLocation) return <div> Loading Map ...</div>;

  return (
    <MapContainer
      center={userLocation}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {pins &&
        Array.isArray(pins) &&
        pins.map((pin) => (
          <Marker
            key={pin.userId}
            position={[
              pin.location.coordinates[1],
              pin.location.coordinates[0],
            ]}
          >
            <Popup>
              <h3>{pin.title}</h3>
              <p>{pin.category}</p>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
