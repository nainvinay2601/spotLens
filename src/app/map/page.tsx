"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";

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

export default function MapPage() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );

  const [pins, setPins] = useState([]);

  useEffect(() => {
    //Get user location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        fetchPins(latitude, longitude);
      },
      () => {
        // Default to New York if denied
        setUserLocation([40.7128, -74.006]);
        fetchPins(40.7128, -74.006);
      }
    );
  }, []);

  //Fetch pins from the api route
  const fetchPins = async (lat: number, lng: number) => {
    const res = await fetch(`/api/pins?lat=${lat}&lng=${lng}`);
    const data = 
  };
}
