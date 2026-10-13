"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { distanceMeters, interpolatePoint, midpoint } from "@/lib/geo";
import { formatCurrency, formatDistance, formatMinutes } from "@/lib/format";

const COURIER_SPEED = 45;

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function rideStats(progress, restaurant, delivery) {
  if (progress >= 1) return { etaMinutes: 0, remainingMeters: 0 };

  const remainingSeconds =
    distanceMeters(
      interpolatePoint(restaurant, delivery, progress),
      delivery,
    ) / COURIER_SPEED;

  return {
    etaMinutes: remainingSeconds / 60,
    remainingMeters: remainingSeconds * COURIER_SPEED,
  };
}

export default function DeliveryMap({
  orderId,
  initialStatus,
  restaurant,
  delivery,
  area,
  address,
  total,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const courierMarkerRef = useRef(null);
  const traveledLineRef = useRef(null);
  const eventsRef = useRef(null);

  const [status, setStatus] = useState(initialStatus);
  const [live, setLive] = useState(false);
  const [progress, setProgress] = useState(0);
  const { etaMinutes, remainingMeters } = rideStats(
    progress,
    restaurant,
    delivery,
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let map;
    const startPoint = [restaurant.lat, restaurant.lng];
    const endPoint = [delivery.lat, delivery.lng];

    async function setup() {
      const L = (await import("leaflet")).default;

      map = L.map(containerRef.current, {
        center: [midpoint(restaurant, delivery).lat, midpoint(restaurant, delivery).lng],
        zoom: 13,
        scrollWheelZoom: false,
      });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const courierIcon = L.divIcon({
        className: "",
        html: '<div class="track-courier-marker"></div>',
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      });

      const deliveryIcon = L.divIcon({
        className: "",
        html: '<div class="track-delivery-marker"><span class="track-delivery-dot"></span></div>',
        iconSize: [32, 32],
        iconAnchor: [16, 28],
        popupAnchor: [0, -30],
      });

      L.polyline([startPoint, endPoint], {
        color: "#d6cec8",
        weight: 4,
        dashArray: "1 9",
        lineCap: "round",
      }).addTo(map);

      const traveledLine = L.polyline([startPoint], {
        color: "#8d293c",
        weight: 4,
        lineCap: "round",
      }).addTo(map);
      traveledLineRef.current = traveledLine;

      L.marker(endPoint, { icon: deliveryIcon })
        .addTo(map)
        .bindPopup(
          `<strong>${escapeHtml(area)}</strong><br/>${escapeHtml(address || "Address on file")}`,
          { autoPan: false },
        );

      const courierMarker = L.marker(startPoint, { icon: courierIcon })
        .addTo(map)
        .bindTooltip("Courier", {
          direction: "right",
          offset: [12, 0],
          className: "track-tooltip",
        });
      courierMarkerRef.current = courierMarker;

      map.fitBounds(L.latLngBounds([startPoint, endPoint]).pad(0.4));

      const events = new EventSource(`/api/orders/${orderId}/stream`);
      eventsRef.current = events;

      events.addEventListener("snapshot", (event) => {
        const data = JSON.parse(event.data);
        setStatus(data.status);
        setLive(true);
      });

      events.addEventListener("position", (event) => {
        const data = JSON.parse(event.data);
        const point = data.courier;
        courierMarker.setLatLng([point.lat, point.lng]);
        traveledLine.setLatLngs([
          startPoint,
          [point.lat, point.lng],
        ]);
        setProgress(data.progress ?? 0);
        setLive(true);
      });

      events.addEventListener("status", (event) => {
        const data = JSON.parse(event.data);
        setStatus(data.status);
        setLive(true);
      });

      events.addEventListener("done", () => {
        events.close();
        setLive(false);
      });

      events.onerror = () => {
        setLive(false);
      };
    }

    function cleanup() {
      eventsRef.current?.close();
      if (map) {
        map.remove();
        mapRef.current = null;
      }
    }

    setup();
    return cleanup;
  }, [orderId, restaurant, delivery, area, address]);

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-sand-200 px-5 py-3.5 sm:px-6">
        <span className="eyebrow mb-0">On the map</span>
        <span className="flex items-center gap-2 text-xs font-medium text-sand-500">
          <span
            aria-hidden="true"
            className={`h-2 w-2 rounded-full ${live ? "bg-success-600" : "bg-sand-300"}`}
          />
          {live ? "Live · connected to the courier" : "Live connection paused"}
        </span>
        <span className="ml-auto text-sm font-semibold text-brand-700">
          {formatCurrency(total)}
        </span>
      </div>

      <div className="space-y-3 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <p className="text-sm text-sand-600">
            Status:{" "}
            <span className="font-semibold capitalize text-sand-900">
              {status}
            </span>
          </p>
          {progress < 1 && (
            <p className="text-sm text-sand-600">
              Estimated arrival:{" "}
              <span className="font-semibold text-sand-900">
                {formatMinutes(etaMinutes)}
              </span>
            </p>
          )}
          {progress >= 1 && (
            <p className="text-sm font-semibold text-success-700">
              {status === "cancelled" ? "This order was cancelled." : "The courier has arrived."}
            </p>
          )}
          <p className="ml-auto text-xs tabular-nums text-sand-400">
            {formatDistance(remainingMeters)} remaining
          </p>
        </div>

        <div
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={Math.round(progress * 100)}
          aria-label="Courier progress to the delivery address"
        >
          <div className="h-1.5 overflow-hidden rounded-full bg-sand-200">
            <div
              className="h-full rounded-full bg-brand-700 transition-all duration-700 ease-out"
              style={{ width: `${Math.min(100, Math.round(progress * 100))}%` }}
            />
          </div>
        </div>
      </div>

      <div
        ref={containerRef}
        aria-label={`Delivery map from Addis Eats to ${area}`}
        className="h-80 w-full sm:h-[26rem]"
      />
    </div>
  );
}