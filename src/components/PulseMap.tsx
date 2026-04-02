import { motion } from "framer-motion";

const hospitals = [
  { x: 30, y: 25, name: "City General", status: "available" },
  { x: 65, y: 35, name: "Metro ICU", status: "busy" },
  { x: 45, y: 60, name: "St. Mary's", status: "available" },
  { x: 75, y: 70, name: "Govt. Hospital", status: "critical" },
  { x: 20, y: 55, name: "Apollo Care", status: "available" },
  { x: 55, y: 15, name: "Trauma Center", status: "busy" },
];

const statusColor: Record<string, string> = {
  available: "bg-success",
  busy: "bg-warning",
  critical: "bg-primary",
};

const statusGlow: Record<string, string> = {
  available: "shadow-[0_0_12px_hsl(145_65%_42%/0.6)]",
  busy: "shadow-[0_0_12px_hsl(45_95%_55%/0.6)]",
  critical: "shadow-[0_0_12px_hsl(0_85%_55%/0.6)]",
};

const PulseMap = () => {
  return (
    <div className="relative aspect-square w-full max-w-lg mx-auto rounded-2xl border border-border bg-card/50 overflow-hidden">
      {/* Grid */}
      <div className="absolute inset-0 grid-bg opacity-60" />

      {/* Ambulance position */}
      <motion.div
        className="absolute z-20"
        style={{ left: "48%", top: "45%" }}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="relative">
          <div className="h-4 w-4 rounded-full bg-primary" />
          <div className="absolute inset-0 h-4 w-4 rounded-full bg-primary animate-ping opacity-40" />
        </div>
      </motion.div>

      {/* Connection lines from ambulance to hospitals */}
      <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none">
        {hospitals.map((h, i) => (
          <motion.line
            key={i}
            x1="50%"
            y1="47%"
            x2={`${h.x}%`}
            y2={`${h.y}%`}
            stroke={h.status === "available" ? "hsl(185 80% 45%)" : "hsl(220 15% 25%)"}
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity={h.status === "available" ? 0.5 : 0.2}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1, strokeDashoffset: [-20, 0] }}
            transition={{ duration: 2, delay: i * 0.2, repeat: Infinity, repeatType: "loop" }}
          />
        ))}
      </svg>

      {/* Hospital nodes */}
      {hospitals.map((h, i) => (
        <motion.div
          key={h.name}
          className="absolute z-20 group"
          style={{ left: `${h.x}%`, top: `${h.y}%` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 + i * 0.1, type: "spring" }}
        >
          <div className={`h-3 w-3 rounded-full ${statusColor[h.status]} ${statusGlow[h.status]} -translate-x-1/2 -translate-y-1/2`} />
          <div className="absolute left-1/2 -translate-x-1/2 top-3 bg-card/90 border border-border rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
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
        <span className="text-[10px] font-mono text-secondary tracking-wider">LIVE MAP VIEW</span>
      </div>
    </div>
  );
};

export default PulseMap;
