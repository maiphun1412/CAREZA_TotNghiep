"use client";

import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import { Spin } from "antd";
import "leaflet/dist/leaflet.css";

// Reconfigure Leaflet Marker Icons
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface CompanyLocationMapProps {
  companyName: string;
  address: string;
  latitude?: number;
  longitude?: number;
}

export default function CompanyLocationMap({
  companyName,
  address,
  latitude,
  longitude,
}: CompanyLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [coords, setCoords] = useState<[number, number] | null>(null);
  const [loadingGeocode, setLoadingGeocode] = useState<boolean>(true);

  // 1. Resolve coordinates
  useEffect(() => {
    let active = true;
    setLoadingGeocode(true);

    const resolveLocation = () => {
      const latVal = typeof latitude === "number" ? latitude : parseFloat(latitude as any);
      const lonVal = typeof longitude === "number" ? longitude : parseFloat(longitude as any);

      if (!isNaN(latVal) && !isNaN(lonVal) && latVal !== 0 && lonVal !== 0) {
        if (active) {
          setCoords([latVal, lonVal]);
          setLoadingGeocode(false);
        }
        return;
      }

      // Default fallback coordinates based on address text
      const lowerAddr = (address || "").toLowerCase();
      let fallbackCoord: [number, number] = [10.8415, 106.8099]; // TP.HCM / Khu Công Nghệ Cao

      if (lowerAddr.includes("hà nội") || lowerAddr.includes("ha noi") || lowerAddr.includes("cầu giấy")) {
        fallbackCoord = [21.0285, 105.8542];
      } else if (lowerAddr.includes("đà nẵng") || lowerAddr.includes("da nang")) {
        fallbackCoord = [16.0544, 108.2022];
      } else if (lowerAddr.includes("quận 1") || lowerAddr.includes("bến nghé") || lowerAddr.includes("saigon")) {
        fallbackCoord = [10.7769, 106.7009];
      }

      if (active) {
        setCoords(fallbackCoord);
        setLoadingGeocode(false);
      }
    };

    resolveLocation();

    return () => {
      active = false;
    };
  }, [latitude, longitude, address]);

  // 2. Initialize & Cleanup Leaflet map safely without React-Leaflet race conditions
  useEffect(() => {
    if (!mapContainerRef.current || !coords || loadingGeocode) return;

    // Remove any existing instance
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: coords,
        zoom: 15,
        scrollWheelZoom: false,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(map);

      const marker = L.marker(coords).addTo(map);
      marker.bindPopup(`
        <div style="font-size: 12px; font-family: sans-serif; line-height: 1.4;">
          <strong style="color: #0062ff; display: block; margin-bottom: 2px;">${companyName || "Văn phòng"}</strong>
          <span style="color: #475467; font-size: 11px;">${address || ""}</span>
        </div>
      `);

      mapInstanceRef.current = map;

      // Invalidate size after mount
      const timer = setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 200);

      return () => {
        clearTimeout(timer);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    } catch {
      // Ignore map init errors during rapid hot-reloading
    }
  }, [coords, companyName, address, loadingGeocode]);

  if (loadingGeocode) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-xl p-4 text-center space-y-1.5 min-h-[160px]">
        <Spin size="small" />
        <span className="text-slate-400 text-xs">Đang tải bản đồ vị trí...</span>
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full rounded-xl overflow-hidden relative z-0"
      style={{ minHeight: "160px", width: "100%", height: "100%" }}
    />
  );
}
