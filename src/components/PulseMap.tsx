import { motion } from "framer-motion";
import { useHospitals } from "@/hooks/useHospitals";
import { useMemo } from "react";

const statusColor: Record<string, string> = {
  available: "bg-success",
  busy: "bg-warning",
  critical: "bg-primary",
};

const PulseMap = () => {
  const { data: hospitalData = [] } = useHospitals();

  const mappedHospitals = useMemo(() => {
    if (hospitalData.length === 0) return [];

    // Calculate bounding box to normalize positions to 10-90% range
    const lats = hospitalData.map(h => h.lat);
    const lngs = hospitalData.map(h => h.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latRange = maxLat - minLat || 0.1;
    const lngRange = maxLng - minLng || 0.1;

    return hospitalData.map(h => ({
      name: h.name,
      status: h.status,
      // Normalize to 15-85% to keep away from edges
      x: 15 + ((h.lng - minLng) / lngRange) * 70,
      y: 15 + (1 - (h.lat - minLat) / latRange) * 70, // Invert Y for map coordinates
    }));
  }, [hospitalData]);

  return (
    <div className="relative aspect-square w-full max-w-lg mx-auto rounded-2xl border border-border bg-card/10 overflow-hidden">
      {/* Ambulance position - center point */}
      <motion.div
        className="absolute z-20"
        style={{ left: "50%", top: "50%" }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="relative -translate-x-1/2 -translate-y-1/2">
          <div className="h-4 w-4 rounded-full bg-primary" />
          <div className="absolute inset-0 h-4 w-4 rounded-full bg-primary animate-ping opacity-40" />
        </div>
      </motion.div>

      {/* Connection lines from center to hospitals */}
      <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
        {mappedHospitals.map((h, i) => (
          <motion.line
            key={i}
            x1="50%"
            y1="50%"
            x2={`${h.x}%`}
            y2={`${h.y}%`}
            stroke={h.status === "available" ? "hsl(185 80% 45%)" : "hsl(220 15% 25%)"}
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity={h.status === "available" ? 0.5 : 0.2}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1, strokeDashoffset: [-20, 0] }}
            transition={{ duration: 2, delay: i * 0.1, repeat: Infinity, repeatType: "loop" }}
          />
        ))}
      </svg>

      {/* Hospital nodes */}
      {mappedHospitals.map((h, i) => (
        <motion.div
          key={h.name}
          className="absolute z-20 group"
          style={{ left: `${h.x}%`, top: `${h.y}%` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 + i * 0.05, type: "spring" }}
        >
          <div className={`h-3 w-3 rounded-full ${statusColor[h.status]} -translate-x-1/2 -translate-y-1/2 border border-black/20`} />
          <div className="absolute left-1/2 -translate-x-1/2 top-3 bg-card/90 border border-border rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-30 shadow-xl">
            <p className="text-[10px] font-mono text-foreground">{h.name}</p>
            <p className="text-[9px] font-mono text-muted-foreground capitalize">{h.status}</p>
          </div>
        </motion.div>
      ))}

      {/* Legend */}
      <div className="absolute bottom-3 left-3 flex gap-3 z-20">
        {[
          { label: "Available", color: "bg-success" },
          { label: "Busy", color: "bg-warning" },
          { label: "Critical", color: "bg-primary" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${l.color}`} />
            <span className="text-[9px] font-mono text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>

      {/* Label */}
      <div className="absolute top-3 left-3 z-20">
        <span className="text-[10px] font-mono text-secondary tracking-wider">LIVE NETWORK VIEW</span>
      </div>
    </div>
  );
};

export default PulseMap;
