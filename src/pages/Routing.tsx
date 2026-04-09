import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import {
  Zap, MapPin, Clock, Route, ArrowRight, Activity,
  LocateFixed, Search, Car, Bike, Footprints,
  Building2, Landmark, Filter, X, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AMBULANCE_POSITION } from "@/data/hospitals";
import type { Hospital } from "@/data/hospitals";
import { useHospitals } from "@/hooks/useHospitals";
import { haversineDistance } from "@/lib/dijkstra";

type TravelMode = "car" | "bike" | "walk";

const TRAVEL_SPEEDS: Record<TravelMode, number> = { car: 40, bike: 15, walk: 5 };
const TRAVEL_LABELS: Record<TravelMode, string> = { car: "Car", bike: "Bike", walk: "Walk" };
const TRAVEL_ICONS: Record<TravelMode, typeof Car> = { car: Car, bike: Bike, walk: Footprints };

const statusColors: Record<string, string> = {
  available: "hsl(145, 65%, 42%)",
  busy: "hsl(45, 95%, 55%)",
  critical: "hsl(0, 85%, 55%)",
};

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  available: { bg: "bg-success/10", text: "text-success", label: "Available" },
  busy: { bg: "bg-warning/10", text: "text-warning", label: "Limited" },
  critical: { bg: "bg-destructive/10", text: "text-destructive", label: "Critical" },
};

interface RoadRoute {
  path: [number, number][];
  distanceKm: number;
  durationMin: number;
  label: string;
}

async function fetchOSRMRoutes(
  from: [number, number],
  to: [number, number]
): Promise<RoadRoute[]> {
  const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson&alternatives=true`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.code !== "Ok" || !data.routes?.length) return [];

  const labels = ["Fastest Route", "Alternative Route", "Scenic Route"];
  return data.routes.slice(0, 3).map((route: { geometry: { coordinates: [number, number][] }; distance: number; duration: number }, i: number) => ({
    path: route.geometry.coordinates.map((c) => [c[1], c[0]] as [number, number]),
    distanceKm: Math.round(route.distance / 10) / 100,
    durationMin: Math.round(route.duration / 6) / 10,
    label: labels[i] || `Route ${i + 1}`,
  }));
}

function getEtaForMode(distKm: number, mode: TravelMode, drivingDurationMin?: number): number {
  if (drivingDurationMin !== undefined && mode === "car") {
    return drivingDurationMin;
  }
  return Math.round((distKm / TRAVEL_SPEEDS[mode]) * 60 * 10) / 10;
}

const ROUTE_COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b"];

const MODE_LINE_STYLES: Record<TravelMode, { weight: number; glowWeight: number; dashArray?: string; dimWeight: number; dimDash: string }> = {
  car: { weight: 6, glowWeight: 0, dimWeight: 4, dimDash: "6, 8" },
  bike: { weight: 4, glowWeight: 0, dashArray: "10, 6", dimWeight: 3, dimDash: "6, 8" },
  walk: { weight: 2.5, glowWeight: 0, dashArray: "4, 8", dimWeight: 2, dimDash: "4, 6" },
};

const createHospitalIcon = (status: string, isSelected: boolean) => {
  const color = statusColors[status] || statusColors.available;
  const size = isSelected ? 24 : 16;
  const borderWidth = isSelected ? 3 : 2;
  const glowSize = isSelected ? 22 : 10;

  return L.divIcon({
    className: "hospital-marker",
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      border: ${borderWidth}px solid rgba(255,255,255,${isSelected ? 0.95 : 0.5});
      box-shadow: 0 2px 4px rgba(0,0,0,0.15);
      transition: all 0.3s ease;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
};

const userLocationIcon = L.divIcon({
  className: "user-location-marker",
  html: `<div class="user-pulse-ring"></div><div class="user-dot"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const FitRoute = ({ roadRoutes, userPosition }: { roadRoutes: RoadRoute[]; userPosition: [number, number] }) => {
  const map = useMap();

  useEffect(() => {
    if (roadRoutes.length > 0 && roadRoutes[0].path.length > 0) {
      const allPoints: [number, number][] = [userPosition, ...roadRoutes[0].path];
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [60, 60], duration: 1 });
    }
  }, [roadRoutes, map, userPosition]);

  return null;
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
};

const staggerContainer = {
  show: { transition: { staggerChildren: 0.06 } },
};

const Routing = () => {
  const { toast } = useToast();
  const location = useLocation();
  const [selectedHospital, setSelectedHospital] = useState<string | null>(null);
  const [roadRoutes, setRoadRoutes] = useState<RoadRoute[]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number>(0);
  const [routeLoading, setRouteLoading] = useState(false);
  const [userPosition, setUserPosition] = useState<[number, number]>(AMBULANCE_POSITION);
  const [locationStatus, setLocationStatus] = useState<"loading" | "success" | "denied" | "idle">("idle");
  const [travelMode, setTravelMode] = useState<TravelMode>("car");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "government" | "private">("all");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  const { data: hospitalData = [], isLoading: isHospitalsLoading } = useHospitals();

  const specialties = useMemo(
    () => [...new Set(hospitalData.map((h) => h.specialization))],
    [hospitalData]
  );

  const filteredHospitals = useMemo(
    () =>
      hospitalData.filter((h) => {
        const matchType = typeFilter === "all" || h.type === typeFilter;
        const matchSpecialty = specialtyFilter === "all" || h.specialization === specialtyFilter;
        const matchSearch =
          search === "" ||
          h.name.toLowerCase().includes(search.toLowerCase()) ||
          h.specialization.toLowerCase().includes(search.toLowerCase());
        return matchType && matchSpecialty && matchSearch;
      }),
    [hospitalData, search, typeFilter, specialtyFilter]
  );

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }

    setLocationStatus("loading");
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserPosition([position.coords.latitude, position.coords.longitude]);
        setLocationStatus("success");
      },
      () => {
        setLocationStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Handle passed state from other pages (e.g. "Route Now" from Hospitals list)
  useEffect(() => {
    const passedState = location.state as { selectedHospital?: string } | null;
    if (passedState?.selectedHospital && hospitalData.length > 0) {
      handleSelectHospital(passedState.selectedHospital);
      // Clear state so it doesn't re-trigger on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, hospitalData.length]);

  const handleSelectHospital = useCallback(
    async (hospitalName: string) => {
      setSelectedHospital(hospitalName);
      setSelectedRouteIndex(0);
      setRouteLoading(true);

      const hospital = hospitalData.find((h) => h.name === hospitalName);
      if (!hospital) {
        setRouteLoading(false);
        return;
      }

      try {
        const routes = await fetchOSRMRoutes(userPosition, [hospital.lat, hospital.lng]);
        setRoadRoutes(routes);
      } catch {
        setRoadRoutes([]);
        toast({ title: "Routing Error", description: "Could not fetch road directions. Please try again.", variant: "destructive" });
      } finally {
        setRouteLoading(false);
      }
    },
    [userPosition]
  );

  const handleAutoRoute = useCallback(async () => {
    let bestHospital: Hospital | null = null;
    let bestScore = Infinity;

    for (const hospital of hospitalData) {
      if (hospital.status === "critical" && hospital.icuBeds === 0) continue;
      const dist = haversineDistance(userPosition[0], userPosition[1], hospital.lat, hospital.lng);
      const statusPenalty = hospital.status === "critical" ? 5 : hospital.status === "busy" ? 2 : 0;
      const bedBonus = hospital.icuBeds > 3 ? -1 : hospital.icuBeds === 0 ? 3 : 0;
      const score = dist + statusPenalty + bedBonus;
      if (score < bestScore) {
        bestScore = score;
        bestHospital = hospital;
      }
    }

    if (bestHospital) {
      await handleSelectHospital(bestHospital.name);
    }
  }, [userPosition, hospitalData, handleSelectHospital]);

  const getUserDistanceToHospital = useCallback(
    (hospital: Hospital) => {
      const dist = haversineDistance(userPosition[0], userPosition[1], hospital.lat, hospital.lng);
      return Math.round(dist * 100) / 100;
    },
    [userPosition]
  );

  const activeHospital = hospitalData.find((h) => h.name === selectedHospital);
  const activeRoute = roadRoutes[selectedRouteIndex] ?? null;

  const bounds = useMemo(() => {
    const lats = hospitalData.map((h) => h.lat).concat(userPosition[0]);
    const lngs = hospitalData.map((h) => h.lng).concat(userPosition[1]);
    if (lats.length === 1) return undefined; // Only user location

    return L.latLngBounds(
      [Math.min(...lats) - 0.01, Math.min(...lngs) - 0.01],
      [Math.max(...lats) + 0.01, Math.max(...lngs) + 0.01]
    );
  }, [userPosition, hospitalData]);

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setSpecialtyFilter("all");
  };

  const hasActiveFilters = search !== "" || typeFilter !== "all" || specialtyFilter !== "all";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <section className="relative py-8">
          <div className="container">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Route className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <span className="text-xs font-mono text-secondary tracking-widest">SMART ROUTING ENGINE</span>
                  <h2 className="text-2xl font-bold text-foreground">
                    Emergency <span className="text-primary">Route Finder</span>
                  </h2>
                </div>
              </div>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Finds optimal routes from your live location to any hospital using real road data
                with turn-by-turn path visualization.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Sidebar */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-4"
              >
                {/* Location Status */}
                <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LocateFixed
                        className={`h-4 w-4 ${
                          locationStatus === "success"
                            ? "text-success"
                            : locationStatus === "loading"
                            ? "text-warning"
                            : "text-muted-foreground"
                        }`}
                      />
                      <span className="text-xs font-medium text-muted-foreground">
                        {locationStatus === "success"
                          ? "Live location active"
                          : locationStatus === "loading"
                          ? "Acquiring GPS..."
                          : locationStatus === "denied"
                          ? "Using default location"
                          : "Location pending"}
                      </span>
                    </div>
                    {locationStatus === "success" && (
                      <span className="flex items-center gap-1 text-[10px] text-success">
                        <span className="h-1.5 w-1.5 rounded-full bg-success" />
                        LIVE
                      </span>
                    )}
                  </div>
                </div>

                {/* Travel Mode Selector */}
                <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-3">
                  <p className="text-[10px] font-mono text-muted-foreground tracking-wider mb-2">TRAVEL MODE</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(["car", "bike", "walk"] as TravelMode[]).map((mode) => {
                      const Icon = TRAVEL_ICONS[mode];
                      return (
                        <motion.button
                          key={mode}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setTravelMode(mode)}
                          className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-xs transition-all border ${
                            travelMode === mode
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span className="font-medium">{TRAVEL_LABELS[mode]}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Auto Route */}
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleAutoRoute}
                    disabled={routeLoading}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
                    size="lg"
                  >
                    <Zap className="h-4 w-4" />
                    {routeLoading ? "Finding Route..." : "Find Best Route"}
                  </Button>
                </motion.div>

                {/* Route Options */}
                <AnimatePresence>
                  {roadRoutes.length > 1 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <p className="text-[10px] font-mono text-muted-foreground tracking-wider">ROUTE OPTIONS</p>
                      {roadRoutes.map((route, index) => {
                        const modeEta = getEtaForMode(route.distanceKm, travelMode, route.durationMin);
                        return (
                          <motion.button
                            key={index}
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSelectedRouteIndex(index)}
                            className={`w-full text-left rounded-xl border p-3 transition-all ${
                              selectedRouteIndex === index
                                ? "border-primary/60 bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                                : "border-border bg-card/60 hover:border-primary/30"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-semibold text-foreground">{route.label}</span>
                              <div
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ background: ROUTE_COLORS[index] || ROUTE_COLORS[0], boxShadow: `0 0 8px ${ROUTE_COLORS[index] || ROUTE_COLORS[0]}` }}
                              />
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {route.distanceKm} km
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> ~{modeEta} min ({TRAVEL_LABELS[travelMode]})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {(["car", "bike", "walk"] as TravelMode[]).map((m) => {
                                const MIcon = TRAVEL_ICONS[m];
                                const mEta = getEtaForMode(route.distanceKm, m, m === "car" ? route.durationMin : undefined);
                                return (
                                  <span
                                    key={m}
                                    className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-mono ${
                                      travelMode === m ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground"
                                    }`}
                                  >
                                    <MIcon className="h-2.5 w-2.5" />
                                    {mEta}m
                                  </span>
                                );
                              })}
                            </div>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Search & Filters */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 rounded-xl border border-border bg-card/80 px-3 py-2 flex-1">
                      <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                      <input
                        type="text"
                        placeholder="Search hospitals..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
                      />
                      {search && (
                        <button onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowFilters(!showFilters)}
                      className={`rounded-xl border p-2.5 transition-colors ${
                        showFilters || hasActiveFilters
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Filter className="h-4 w-4" />
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {showFilters && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="rounded-xl border border-border bg-card/80 p-3 space-y-3">
                          <div>
                            <p className="text-[10px] font-mono text-muted-foreground tracking-wider mb-1.5">HOSPITAL TYPE</p>
                            <div className="flex gap-1.5">
                              {(["all", "government", "private"] as const).map((f) => (
                                <button
                                  key={f}
                                  onClick={() => setTypeFilter(f)}
                                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors border ${
                                    typeFilter === f
                                      ? "border-primary bg-primary/10 text-primary"
                                      : "border-border text-muted-foreground hover:text-foreground"
                                  }`}
                                >
                                  {f === "all" ? "All" : f === "government" ? "Govt" : "Private"}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-[10px] font-mono text-muted-foreground tracking-wider mb-1.5">SPECIALTY</p>
                            <div className="relative">
                              <select
                                value={specialtyFilter}
                                onChange={(e) => setSpecialtyFilter(e.target.value)}
                                className="w-full appearance-none rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground pr-8 outline-none focus:border-primary/50 transition-colors"
                              >
                                <option value="all">All Specialties</option>
                                {specialties.map((s) => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                            </div>
                          </div>
                          {hasActiveFilters && (
                            <button
                              onClick={clearFilters}
                              className="text-xs text-primary hover:underline"
                            >
                              Clear all filters
                            </button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Hospital Cards */}
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                  <p className="text-[10px] font-mono text-muted-foreground tracking-wider sticky top-0 bg-background py-1 z-10">
                    HOSPITALS ({filteredHospitals.length})
                  </p>
                  {isHospitalsLoading ? (
                    <div className="py-8 flex justify-center text-primary">
                      <span className="text-xs font-mono">LOADING LIVE DATA...</span>
                    </div>
                  ) : (
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="show"
                    className="space-y-2"
                  >
                    {filteredHospitals.map((hospital) => {
                      const distFromUser = getUserDistanceToHospital(hospital);
                      const s = statusStyles[hospital.status];
                      const isSelected = selectedHospital === hospital.name;

                      return (
                        <motion.div
                          key={hospital.name}
                          variants={cardVariants}
                          whileHover={{ y: -2, transition: { duration: 0.2 } }}
                          className={`rounded-xl border p-4 transition-all cursor-pointer ${
                            isSelected
                              ? "border-primary/60 bg-primary/5 ring-1 ring-primary/20 shadow-md"
                              : "border-border bg-card/80 hover:border-primary/30 hover:shadow-sm"
                          }`}
                          onClick={() => handleSelectHospital(hospital.name)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                                hospital.type === "government" ? "bg-secondary/10" : "bg-accent/10"
                              }`}>
                                {hospital.type === "government" ? (
                                  <Landmark className="h-4 w-4 text-secondary" />
                                ) : (
                                  <Building2 className="h-4 w-4 text-accent" />
                                )}
                              </div>
                              <div>
                                <h4 className="text-sm font-semibold text-foreground leading-tight">{hospital.name}</h4>
                                <p className="text-[10px] text-muted-foreground capitalize">{hospital.type}</p>
                              </div>
                            </div>
                            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.bg} ${s.text}`}>
                              {s.label}
                            </span>
                          </div>

                          <div className="rounded-lg bg-muted/50 p-2.5 mb-2">
                            <p className="text-[11px] font-medium text-secondary mb-1">{hospital.specialization}</p>
                            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" /> {distFromUser} km
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> ~{getEtaForMode(distFromUser, travelMode)} min
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2 mb-3">
                            <div className="text-center rounded-lg border border-border py-1.5">
                              <p className="text-xs font-bold font-mono text-foreground">{hospital.icuBeds}</p>
                              <p className="text-[9px] text-muted-foreground">ICU Beds</p>
                            </div>
                            <div className="text-center rounded-lg border border-border py-1.5">
                              <p className="text-xs font-bold font-mono text-foreground">{hospital.generalBeds}</p>
                              <p className="text-[9px] text-muted-foreground">General</p>
                            </div>
                            <div className="text-center rounded-lg border border-border py-1.5">
                              <p className="text-xs font-bold font-mono text-foreground">{hospital.doctors}</p>
                              <p className="text-[9px] text-muted-foreground">Doctors</p>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            className={`w-full gap-1.5 text-xs ${
                              isSelected
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectHospital(hospital.name);
                            }}
                          >
                            {isSelected && roadRoutes.length > 0 ? "Route Active" : routeLoading && isSelected ? "Loading..." : "Route Here"}
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                  )}

                  {!isHospitalsLoading && filteredHospitals.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">No hospitals match your search.</p>
                      <button onClick={clearFilters} className="text-xs text-primary hover:underline mt-1">
                        Clear filters
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Map + Route Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2 space-y-4"
              >
                <div className="relative rounded-xl border border-border overflow-hidden shadow-sm">
                  <MapContainer
                    center={userPosition}
                    zoom={13}
                    bounds={bounds}
                    style={{ height: "520px", width: "100%" }}
                    zoomControl={false}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <FitRoute roadRoutes={roadRoutes} userPosition={userPosition} />

                    {/* User location */}
                    <Marker position={userPosition} icon={userLocationIcon}>
                      <Popup>
                        <div className="map-popup-content">
                          <div className="flex items-center gap-2 mb-1">
                            <LocateFixed className="h-3.5 w-3.5 text-blue-500" />
                            <span className="font-semibold text-sm">Your Location</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {locationStatus === "success" ? "Live GPS tracking" : "Default dispatch location"}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                    <Circle
                      center={userPosition}
                      radius={150}
                      pathOptions={{
                        color: "#3b82f6",
                        fillColor: "#3b82f6",
                        fillOpacity: 0.08,
                        weight: 1,
                        opacity: 0.3,
                      }}
                    />

                    {/* Hospital markers */}
                    {filteredHospitals.map((hospital) => (
                      <Marker
                        key={hospital.name}
                        position={[hospital.lat, hospital.lng]}
                        icon={createHospitalIcon(hospital.status, selectedHospital === hospital.name)}
                        eventHandlers={{ click: () => handleSelectHospital(hospital.name) }}
                      >
                        <Popup>
                          <div className="map-popup-content">
                            <h3 className="font-semibold text-sm">{hospital.name}</h3>
                            <p className="text-xs text-secondary">{hospital.specialization}</p>
                            <p className="text-[11px] text-muted-foreground mt-1">
                              {hospital.icuBeds} ICU • {hospital.generalBeds} General • {hospital.doctors} Doctors
                            </p>
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    {/* Non-selected routes (dimmed) */}
                    {roadRoutes.map((route, index) => {
                      if (index === selectedRouteIndex) return null;
                      const modeStyle = MODE_LINE_STYLES[travelMode];
                      return (
                        <Polyline
                          key={`bg-route-${index}`}
                          positions={route.path}
                          pathOptions={{
                            color: ROUTE_COLORS[index] || "#9ca3af",
                            weight: modeStyle.dimWeight,
                            opacity: 0.3,
                            dashArray: modeStyle.dimDash,
                          }}
                          eventHandlers={{ click: () => setSelectedRouteIndex(index) }}
                        />
                      );
                    })}

                    {/* Selected route */}
                    {activeRoute && (() => {
                      const modeStyle = MODE_LINE_STYLES[travelMode];
                      return (
                        <>
                          <Polyline
                            positions={activeRoute.path}
                            pathOptions={{
                              color: ROUTE_COLORS[selectedRouteIndex] || ROUTE_COLORS[0],
                              weight: modeStyle.weight,
                              opacity: 0.9,
                              dashArray: modeStyle.dashArray,
                            }}
                          />
                          <Polyline
                            positions={activeRoute.path}
                            pathOptions={{
                              color: ROUTE_COLORS[selectedRouteIndex] || ROUTE_COLORS[0],
                              weight: modeStyle.glowWeight,
                              opacity: 0.12,
                            }}
                          />
                        </>
                      );
                    })()}
                  </MapContainer>

                  {/* Map label + mode indicator */}
                  <div className="absolute top-4 left-4 z-[1000]">
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-card/90 backdrop-blur-sm px-3 py-1.5 shadow-sm">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-[10px] font-mono text-secondary tracking-wider">SMART ROUTING • LIVE</span>
                      <div className="h-3 w-px bg-border" />
                      {(() => {
                        const Icon = TRAVEL_ICONS[travelMode];
                        return <Icon className="h-3 w-3 text-primary" />;
                      })()}
                      <span className="text-[10px] font-mono text-primary tracking-wider">{TRAVEL_LABELS[travelMode].toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Loading indicator */}
                  {routeLoading && (
                    <div className="absolute top-4 right-4 z-[1000]">
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-card/90 backdrop-blur-sm px-3 py-1.5 shadow-sm">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-[10px] font-mono text-primary tracking-wider">CALCULATING ROUTE...</span>
                      </div>
                    </div>
                  )}

                  {/* Route info bar */}
                  <AnimatePresence>
                    {activeRoute && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-4 left-4 right-4 z-[1000]"
                      >
                        <div className="flex items-center gap-4 rounded-lg border border-border bg-card/90 backdrop-blur-sm px-4 py-3 shadow-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ background: ROUTE_COLORS[selectedRouteIndex] || ROUTE_COLORS[0], boxShadow: `0 0 8px ${ROUTE_COLORS[selectedRouteIndex] || ROUTE_COLORS[0]}` }}
                            />
                            <span className="text-xs font-medium text-muted-foreground">{activeRoute.label}</span>
                          </div>
                          <div className="h-4 w-px bg-border" />
                          <div className="flex items-center gap-2">
                            <Route className="h-4 w-4 text-secondary" />
                            <span className="text-sm font-mono font-bold text-foreground">{activeRoute.distanceKm} km</span>
                          </div>
                          <div className="h-4 w-px bg-border" />

                          {(["car", "bike", "walk"] as TravelMode[]).map((mode) => {
                            const Icon = TRAVEL_ICONS[mode];
                            const eta = getEtaForMode(activeRoute.distanceKm, mode, mode === "car" ? activeRoute.durationMin : undefined);
                            return (
                              <div
                                key={mode}
                                className={`flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors ${
                                  travelMode === mode
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground"
                                }`}
                              >
                                <Icon className="h-3.5 w-3.5" />
                                <span className="text-xs font-mono font-semibold">~{eta}m</span>
                              </div>
                            );
                          })}

                          {roadRoutes.length > 1 && (
                            <>
                              <div className="h-4 w-px bg-border" />
                              <span className="text-xs text-muted-foreground">
                                {roadRoutes.length} routes
                              </span>
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Route details */}
                <AnimatePresence mode="wait">
                  {activeRoute && activeHospital && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      key={`${selectedHospital}-${selectedRouteIndex}`}
                      className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-5 shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <Activity className="h-5 w-5 text-secondary" />
                        <h3 className="text-lg font-bold text-foreground">Route to {activeHospital.name}</h3>
                      </div>

                      <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
                        <div className="rounded-lg border border-border p-3 text-center">
                          <p className="text-2xl font-bold font-mono text-secondary">{activeRoute.distanceKm}</p>
                          <p className="text-[10px] text-muted-foreground">Distance (km)</p>
                        </div>
                        {(["car", "bike", "walk"] as TravelMode[]).map((mode) => {
                          const Icon = TRAVEL_ICONS[mode];
                          const eta = getEtaForMode(activeRoute.distanceKm, mode, mode === "car" ? activeRoute.durationMin : undefined);
                          return (
                            <div
                              key={mode}
                              className={`rounded-lg border p-3 text-center transition-colors ${
                                travelMode === mode ? "border-primary/50 bg-primary/5" : "border-border"
                              }`}
                            >
                              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                                <Icon className={`h-4 w-4 ${travelMode === mode ? "text-primary" : "text-muted-foreground"}`} />
                                <p className={`text-xl font-bold font-mono ${travelMode === mode ? "text-primary" : "text-foreground"}`}>~{eta}</p>
                              </div>
                              <p className="text-[10px] text-muted-foreground">{TRAVEL_LABELS[mode]} (min)</p>
                            </div>
                          );
                        })}
                        <div className="rounded-lg border border-border p-3 text-center">
                          <p className="text-2xl font-bold font-mono text-success">{activeHospital.icuBeds}</p>
                          <p className="text-[10px] text-muted-foreground">ICU Beds</p>
                        </div>
                      </div>

                      <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-[10px] font-mono text-muted-foreground mb-3 tracking-wider">HOSPITAL DETAILS</p>
                        <div className="grid sm:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Specialization</p>
                            <p className="font-medium text-foreground">{activeHospital.specialization}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Type</p>
                            <p className="font-medium text-foreground capitalize">{activeHospital.type}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">General Beds</p>
                            <p className="font-medium text-foreground">{activeHospital.generalBeds}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Doctors On Duty</p>
                            <p className="font-medium text-foreground">{activeHospital.doctors}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Routing;
