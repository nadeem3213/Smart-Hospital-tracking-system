import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Search,
  Heart,
  MapPin,
  Phone,
  Mail,
  Bed,
  UserCheck,
  Clock,
  Building2,
  Landmark,
  Filter,
  X,
  ChevronDown,
  Stethoscope,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { hospitalData } from "@/data/hospitals";
import type { Hospital } from "@/data/hospitals";
import { haversineDistance, AMBULANCE_POSITION } from "@/lib/dijkstra";

/* ------------------------------------------------------------------ */
/*  Constants & helpers                                                */
/* ------------------------------------------------------------------ */

type HospitalType = "all" | "government" | "private";
type HospitalStatus = "all" | "available" | "busy" | "critical";
type SortKey = "rating" | "distance" | "name";

const statusStyles: Record<
  string,
  { bg: string; text: string; label: string; dot: string }
> = {
  available: {
    bg: "bg-success/10",
    text: "text-success",
    label: "AVAILABLE",
    dot: "bg-success",
  },
  busy: {
    bg: "bg-warning/10",
    text: "text-warning",
    label: "BUSY",
    dot: "bg-warning",
  },
  critical: {
    bg: "bg-primary/10",
    text: "text-primary",
    label: "CRITICAL",
    dot: "bg-primary",
  },
};

const FAVORITES_KEY = "mediroute-favorite-hospitals";

function loadFavorites(): Set<string> {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {
    /* ignore */
  }
  return new Set();
}

function saveFavorites(favs: Set<string>) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favs]));
}

/* ------------------------------------------------------------------ */
/*  Star rating renderer                                               */
/* ------------------------------------------------------------------ */

function RatingStars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.25 && rating - full < 0.75;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star
          key={`f${i}`}
          className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"
        />
      ))}
      {hasHalf && (
        <span className="relative h-3.5 w-3.5">
          <Star className="absolute inset-0 h-3.5 w-3.5 text-muted-foreground/40" />
          <span className="absolute inset-0 overflow-hidden w-[50%]">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          </span>
        </span>
      )}
      {Array.from({ length: empty }).map((_, i) => (
        <Star
          key={`e${i}`}
          className="h-3.5 w-3.5 text-muted-foreground/40"
        />
      ))}
      <span className="ml-1 text-xs font-mono text-muted-foreground">
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

const Hospitals = () => {
  /* ---- state ---- */
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<HospitalType>("all");
  const [statusFilter, setStatusFilter] = useState<HospitalStatus>("all");
  const [sortKey, setSortKey] = useState<SortKey>("rating");
  const [favorites, setFavorites] = useState<Set<string>>(loadFavorites);
  const [userPos, setUserPos] = useState<[number, number]>(AMBULANCE_POSITION);
  const [showFilters, setShowFilters] = useState(false);

  /* ---- geolocation ---- */
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => {
        /* fallback already set */
      }
    );
  }, []);

  /* ---- favorites helpers ---- */
  const toggleFavorite = (name: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      saveFavorites(next);
      return next;
    });
  };

  /* ---- derived: hospitals with live distance ---- */
  const hospitalsWithDistance = useMemo(
    () =>
      hospitalData.map((h) => ({
        ...h,
        liveDistance: haversineDistance(userPos[0], userPos[1], h.lat, h.lng),
      })),
    [userPos]
  );

  /* ---- filtered & sorted list ---- */
  const filtered = useMemo(() => {
    let list = hospitalsWithDistance;

    // search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (h) =>
          h.name.toLowerCase().includes(q) ||
          h.specialization.toLowerCase().includes(q) ||
          h.specialties.some((s) => s.toLowerCase().includes(q))
      );
    }

    // type
    if (typeFilter !== "all") list = list.filter((h) => h.type === typeFilter);

    // status
    if (statusFilter !== "all")
      list = list.filter((h) => h.status === statusFilter);

    // sort
    list = [...list].sort((a, b) => {
      if (sortKey === "rating") return b.rating - a.rating;
      if (sortKey === "distance") return a.liveDistance - b.liveDistance;
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [hospitalsWithDistance, search, typeFilter, statusFilter, sortKey]);

  /* ---- pill button helper ---- */
  const pill = (
    label: string,
    active: boolean,
    onClick: () => void,
    accent?: string
  ) => (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
        active
          ? `${accent ?? "bg-secondary/20 text-secondary"} ring-1 ring-secondary/40`
          : "bg-muted/50 text-muted-foreground hover:bg-muted"
      }`}
    >
      {label}
    </button>
  );

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 pt-16">
        {/* ── Hero / Header ── */}
        <section className="relative overflow-hidden border-b border-border bg-card/30">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,206,209,0.06),transparent_60%)]" />
          <div className="container relative z-10 py-12 md:py-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10 glow-cyan">
                <Stethoscope className="h-7 w-7 text-secondary" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Hospital <span className="text-secondary glow-text-cyan">Directory</span>
              </h1>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Browse all hospitals in the MediRoute network — filter, compare, and find
                the best care near you.
              </p>
            </motion.div>
          </div>
        </section>

        {/* ── Search & Filter bar ── */}
        <section className="sticky top-16 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="container py-4 space-y-3">
            {/* Search row */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search hospitals, specializations..."
                  className="w-full rounded-xl border border-border bg-muted/50 py-2.5 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-secondary/50"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters((v) => !v)}
                className="gap-1.5 rounded-xl border-border text-xs"
              >
                <Filter className="h-3.5 w-3.5" />
                Filters
                <ChevronDown
                  className={`h-3 w-3 transition-transform ${showFilters ? "rotate-180" : ""}`}
                />
              </Button>
            </div>

            {/* Collapsible filter chips */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap items-center gap-6 pb-1">
                    {/* Type */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
                        Type
                      </span>
                      {(["all", "government", "private"] as HospitalType[]).map(
                        (t) =>
                          pill(
                            t === "all"
                              ? "All"
                              : t === "government"
                              ? "Government"
                              : "Private",
                            typeFilter === t,
                            () => setTypeFilter(t)
                          )
                      )}
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
                        Status
                      </span>
                      {(
                        ["all", "available", "busy", "critical"] as HospitalStatus[]
                      ).map((s) =>
                        pill(
                          s === "all"
                            ? "All"
                            : s.charAt(0).toUpperCase() + s.slice(1),
                          statusFilter === s,
                          () => setStatusFilter(s),
                          s === "available"
                            ? "bg-success/20 text-success"
                            : s === "busy"
                            ? "bg-warning/20 text-warning"
                            : s === "critical"
                            ? "bg-primary/20 text-primary"
                            : undefined
                        )
                      )}
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
                        Sort
                      </span>
                      {(["rating", "distance", "name"] as SortKey[]).map((k) =>
                        pill(
                          k === "rating"
                            ? "⭐ Rating"
                            : k === "distance"
                            ? "📍 Distance"
                            : "🏥 Name",
                          sortKey === k,
                          () => setSortKey(k)
                        )
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* ── Results count ── */}
        <div className="container pt-6 pb-2">
          <p className="text-xs text-muted-foreground font-mono">
            Showing{" "}
            <span className="text-foreground font-semibold">{filtered.length}</span>{" "}
            hospital{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* ── Hospital Cards Grid ── */}
        <section className="container pb-16">
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <Stethoscope className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">
                No hospitals match your filters.
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 text-xs text-secondary"
                onClick={() => {
                  setSearch("");
                  setTypeFilter("all");
                  setStatusFilter("all");
                }}
              >
                Clear all filters
              </Button>
            </motion.div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((hospital, index) => {
                const s = statusStyles[hospital.status];
                const isFav = favorites.has(hospital.name);

                return (
                  <motion.div
                    key={hospital.name}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.07, duration: 0.5 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="group relative rounded-xl border border-border bg-card/60 backdrop-blur-sm p-5 transition-all hover:border-secondary/30 hover:shadow-md hover:shadow-secondary/5"
                  >
                    {/* ── Favorite button ── */}
                    <button
                      onClick={() => toggleFavorite(hospital.name)}
                      className="absolute top-4 right-4 z-10"
                      aria-label={
                        isFav ? "Remove from favorites" : "Add to favorites"
                      }
                    >
                      <Heart
                        className={`h-5 w-5 transition-colors ${
                          isFav
                            ? "fill-primary text-primary glow-text-red"
                            : "text-muted-foreground/40 hover:text-primary/60"
                        }`}
                      />
                    </button>

                    {/* ── Header: icon + name + type badge ── */}
                    <div className="flex items-start gap-3 mb-3 pr-8">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
                        {hospital.type === "government" ? (
                          <Landmark className="h-5 w-5 text-secondary" />
                        ) : (
                          <Building2 className="h-5 w-5 text-accent" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground text-sm leading-tight truncate">
                          {hospital.name}
                        </h3>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-mono capitalize px-1.5 py-0 ${
                              hospital.type === "government"
                                ? "border-secondary/40 text-secondary"
                                : "border-accent/40 text-accent"
                            }`}
                          >
                            {hospital.type}
                          </Badge>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold ${s.bg} ${s.text}`}
                          >
                            <span
                              className={`inline-block h-1.5 w-1.5 rounded-full ${s.dot} animate-pulse`}
                            />
                            {s.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ── Rating ── */}
                    <div className="mb-3">
                      <RatingStars rating={hospital.rating} />
                    </div>

                    {/* ── Description ── */}
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-3">
                      {hospital.description}
                    </p>

                    {/* ── Specialization & tags ── */}
                    <div className="mb-3">
                      <p className="text-[10px] font-mono text-secondary mb-1.5 tracking-wide">
                        {hospital.specialization}
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {hospital.specialties.slice(0, 4).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-muted/70 px-2 py-0.5 text-[10px] text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                        {hospital.specialties.length > 4 && (
                          <span className="rounded-md bg-muted/70 px-2 py-0.5 text-[10px] text-muted-foreground">
                            +{hospital.specialties.length - 4}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ── Stats grid ── */}
                    <div className="grid grid-cols-3 gap-2.5 mb-3">
                      <div className="text-center rounded-lg border border-border p-2">
                        <UserCheck className="h-3.5 w-3.5 mx-auto text-success mb-0.5" />
                        <p className="text-sm font-bold font-mono text-foreground">
                          {hospital.doctors}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Doctors
                        </p>
                      </div>
                      <div className="text-center rounded-lg border border-border p-2">
                        <Bed className="h-3.5 w-3.5 mx-auto text-secondary mb-0.5" />
                        <p className="text-sm font-bold font-mono text-foreground">
                          {hospital.icuBeds}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          ICU Beds
                        </p>
                      </div>
                      <div className="text-center rounded-lg border border-border p-2">
                        <Bed className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-0.5" />
                        <p className="text-sm font-bold font-mono text-foreground">
                          {hospital.generalBeds}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          General
                        </p>
                      </div>
                    </div>

                    {/* ── Distance & ETA ── */}
                    <div className="flex items-center gap-4 mb-3 rounded-lg bg-muted/50 px-3 py-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 text-secondary" />
                        <span className="font-mono font-semibold text-foreground">
                          {hospital.liveDistance.toFixed(1)} km
                        </span>
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        ETA {hospital.eta}
                      </span>
                    </div>

                    {/* ── Contact & Established ── */}
                    <div className="space-y-1.5 mb-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3 shrink-0" />
                        <span className="font-mono truncate">
                          {hospital.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="font-mono truncate">
                          {hospital.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span>
                          Est.{" "}
                          <span className="font-mono font-semibold text-foreground">
                            {hospital.established}
                          </span>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Hospitals;
