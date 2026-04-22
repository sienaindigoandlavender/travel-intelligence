"use client";

import { useEffect, useRef, useState } from "react";
import Map, {
  Marker,
  NavigationControl,
  Popup,
  type MapRef,
} from "react-map-gl/mapbox";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { MARRAKECH_CENTER, type Riad } from "@/lib/riads";

type MapViewProps = {
  riads: Riad[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  accessToken: string;
};

export function MapView({
  riads,
  selectedId,
  onSelect,
  accessToken,
}: MapViewProps) {
  const mapRef = useRef<MapRef | null>(null);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);

  const selected = riads.find((r) => r.id === selectedId) ?? null;

  useEffect(() => {
    if (!selected || !mapRef.current || !isStyleLoaded) return;
    mapRef.current.flyTo({
      center: [selected.lng, selected.lat],
      zoom: 16,
      duration: 900,
      essential: true,
    });
  }, [selected, isStyleLoaded]);

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        mapLib={mapboxgl}
        mapboxAccessToken={accessToken}
        initialViewState={{
          longitude: MARRAKECH_CENTER.lng,
          latitude: MARRAKECH_CENTER.lat,
          zoom: MARRAKECH_CENTER.zoom,
        }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        onLoad={() => setIsStyleLoaded(true)}
        style={{ width: "100%", height: "100%" }}
      >
        <NavigationControl position="top-right" showCompass={false} />

        {riads.map((riad) => {
          const isSelected = riad.id === selectedId;
          return (
            <Marker
              key={riad.id}
              longitude={riad.lng}
              latitude={riad.lat}
              anchor="bottom"
              onClick={(event) => {
                event.originalEvent.stopPropagation();
                onSelect(riad.id);
              }}
            >
              <button
                type="button"
                aria-label={riad.name}
                className={`flex h-7 w-7 -translate-y-1 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white shadow-md transition-transform ${
                  isSelected
                    ? "scale-125 bg-zinc-900"
                    : "bg-rose-500 hover:scale-110"
                }`}
              >
                {riads.indexOf(riad) + 1}
              </button>
            </Marker>
          );
        })}

        {selected && (
          <Popup
            longitude={selected.lng}
            latitude={selected.lat}
            anchor="top"
            offset={16}
            onClose={() => onSelect("")}
            closeOnClick={false}
            focusAfterOpen={false}
          >
            <div className="min-w-[180px] space-y-1 p-1 text-sm">
              <p className="font-semibold text-zinc-900">{selected.name}</p>
              <p className="text-xs text-zinc-600">
                Tripadvisor ID: {selected.externalId}
              </p>
              <a
                href={selected.tripadvisorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs font-medium text-blue-600 underline hover:text-blue-700"
              >
                View on Tripadvisor
              </a>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
