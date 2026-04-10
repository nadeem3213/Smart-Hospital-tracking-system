import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo } from "react";
import { Bed, UserCheck, Clock, MapPin, Navigation } from "lucide-react";
import type { Hospital } from "@/data/hospitals";
import { AMBULANCE_POSITION } from "@/data/hospitals";

interface MapComponentProps {
  hospitals: Hospital[];
  selectedHospital: string | null;
  onSelectHospital: (name: string) => void;
}

const statusColors: Record<string, string> = {
  available: "hsl(145, 65%, 42%)",
  busy: "hsl(45, 95%, 55%)",
  critical: "hsl(0, 85%, 55%)",
};

const statusLabels: Record<string, string> = {
  available: "Available",
  busy: "Limited",
  critical: "Critical",
};

const createHospitalIcon = (status: string, isSelected: boolean) => {
  const color = statusColors[status] || statusColors.available;
  const size = isSelected ? 22 : 14;
  const borderWidth = isSelected ? 3 : 2;
  const glowSize = isSelected ? 20 : 10;

  return L.divIcon({
    className: "hospital-marker",
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      border: ${borderWidth}px solid rgba(255,255,255,${isSelected ? 0.9 : 0.3});
      box-shadow: 0 0 ${glowSize}px ${color};
      transition: all 0.3s ease;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
};

const ambulanceIcon = L.divIcon({
  className: "ambulance-marker",
  html: `<div class="ambulance-pulse-ring"></div><div class="ambulance-dot"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const MapController = ({ selectedHospital, hospitals }: { selectedHospital: string | null; hospitals: Hospital[] }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedHospital) {
      const hospital = hospitals.find((h) => h.name === selectedHospital);
      if (hospital) {
        map.flyTo([hospital.lat, hospital.lng], 15, { duration: 1 });
      }
    }
  }, [selectedHospital, hospitals, map]);

  useEffect(() => {
    if (hospitals.length > 0) {
      const lats = hospitals.map((h) => h.lat);
      const lngs = hospitals.map((h) => h.lng);
      const newBounds = L.latLngBounds(
        [Math.min(...lats) - 0.01, Math.min(...lngs) - 0.01],
        [Math.max(...lats) + 0.01, Math.max(...lngs) + 0.01]
      );
      map.fitBounds(newBounds, { padding: [30, 30], duration: 0.5 });
    }
  }, [hospitals, map]);

  return null;
};

const MapComponent = ({ hospitals, selectedHospital, onSelectHospital }: MapComponentProps) => {
  const bounds = useMemo(() => {
    if (hospitals.length === 0) return undefined;
    const lats = hospitals.map((h) => h.lat);
    const lngs = hospitals.map((h) => h.lng);
    return L.latLngBounds(
      [Math.min(...lats) - 0.01, Math.min(...lngs) - 0.01],
      [Math.max(...lats) + 0.01, Math.max(...lngs) + 0.01]
    );
  }, [hospitals]);

  return (
    <div className="relative rounded-xl border border-border overflow-hidden">
      <MapContainer
        center={AMBULANCE_POSITION}
        zoom={13}
        bounds={bounds}
        style={{ height: "420px", width: "100%" }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomControl position="bottomright" />

        <MapController selectedHospital={selectedHospital} hospitals={hospitals} />

        <Marker position={AMBULANCE_POSITION} icon={ambulanceIcon}>
          <Popup>
            <div className="map-popup-content">
              <div className="flex items-center gap-2 mb-1">
                <Navigation className="h-3.5 w-3.5 text-red-500" />
                <span className="font-semibold text-sm">Ambulance Unit</span>
              </div>
              <p className="text-xs text-muted-foreground">Current dispatch location</p>
            </div>
          </Popup>
        </Marker>

        {hospitals.map((hospital) => (
          <Marker
            key={hospital.name}
            position={[hospital.lat, hospital.lng]}
            icon={createHospitalIcon(hospital.status, selectedHospital === hospital.name)}
            eventHandlers={{
              click: () => onSelectHospital(hospital.name),
            }}
          >
            <Popup>
              <div className="map-popup-content">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-sm leading-tight">{hospital.name}</h3>
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                    style={{
                      background: `${statusColors[hospital.status]}20`,
                      color: statusColors[hospital.status],
                    }}
                  >
                    {statusLabels[hospital.status]}
                  </span>
                </div>

                <p className="text-[11px] font-medium mb-2 text-secondary">
                  {hospital.specialization}
                </p>

                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {hospital.distance}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> ETA {hospital.eta}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="text-center rounded bg-muted/60 p-1.5">
                    <Bed className="h-3 w-3 mx-auto mb-0.5 text-secondary" />
                    <p className="text-xs font-bold">{hospital.icuBeds}</p>
                    <p className="text-[9px] text-muted-foreground">ICU</p>
                  </div>
                  <div className="text-center rounded bg-muted/60 p-1.5">
                    <Bed className="h-3 w-3 mx-auto mb-0.5 text-muted-foreground" />
                    <p className="text-xs font-bold">{hospital.generalBeds}</p>
                    <p className="text-[9px] text-muted-foreground">General</p>
                  </div>
                  <div className="text-center rounded bg-muted/60 p-1.5">
                    <UserCheck className="h-3 w-3 mx-auto mb-0.5 text-success" />
                    <p className="text-xs font-bold">{hospital.doctors}</p>
                    <p className="text-[9px] text-muted-foreground">Doctors</p>
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground capitalize">{hospital.type} Hospital</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] flex items-center gap-4 rounded-lg border border-border bg-card/90 backdrop-blur-sm px-3 py-2">
        {[
          { label: "Available", color: statusColors.available },
          { label: "Limited", color: statusColors.busy },
          { label: "Critical", color: statusColors.critical },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: item.color, boxShadow: `0 0 6px ${item.color}` }}
            />
            <span className="text-[10px] font-mono text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>

      {/* Label */}
      <div className="absolute top-4 left-4 z-[1000]">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card/90 backdrop-blur-sm px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-mono text-secondary tracking-wider">LIVE HOSPITAL MAP</span>
        </div>
      </div>
    </div>
  );
};

export default MapComponent;
