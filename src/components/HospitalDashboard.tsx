import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import { useState } from "react";
import HospitalCard from "./HospitalCard";

const hospitalData = [
  { name: "City General Hospital", type: "government" as const, distance: "2.3 km", eta: "4 min", icuBeds: 8, generalBeds: 24, doctors: 12, specialization: "Trauma & Emergency Care", status: "available" as const },
  { name: "Apollo Medical Center", type: "private" as const, distance: "3.1 km", eta: "6 min", icuBeds: 3, generalBeds: 15, doctors: 8, specialization: "Cardiac & Neurology", status: "available" as const },
  { name: "Metro Trauma Institute", type: "government" as const, distance: "4.7 km", eta: "9 min", icuBeds: 1, generalBeds: 6, doctors: 4, specialization: "Orthopedic & Burns", status: "busy" as const },
  { name: "St. Mary's Hospital", type: "private" as const, distance: "5.2 km", eta: "11 min", icuBeds: 5, generalBeds: 18, doctors: 10, specialization: "Multi-Specialty Emergency", status: "available" as const },
  { name: "Govt. District Hospital", type: "government" as const, distance: "6.8 km", eta: "14 min", icuBeds: 0, generalBeds: 2, doctors: 3, specialization: "General Emergency", status: "critical" as const },
  { name: "Fortis Emergency Wing", type: "private" as const, distance: "3.9 km", eta: "7 min", icuBeds: 4, generalBeds: 12, doctors: 7, specialization: "Pediatric & Neonatal", status: "busy" as const },
];

const HospitalDashboard = () => {
  const [filter, setFilter] = useState<"all" | "government" | "private">("all");

  const filtered = filter === "all" ? hospitalData : hospitalData.filter((h) => h.type === filter);

  return (
    <section id="hospitals" className="relative py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <span className="text-xs font-mono text-secondary tracking-widest">REAL-TIME DATA</span>
          <h2 className="text-3xl font-bold text-foreground mt-2 mb-4">
            Hospital <span className="text-primary">Availability</span>
          </h2>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 flex-1 max-w-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search hospitals..."
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "government", "private"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-lg px-3 py-2 text-xs font-mono transition-colors border ${
                    filter === f
                      ? "border-secondary bg-secondary/10 text-secondary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f === "all" ? "All" : f === "government" ? "Govt" : "Private"}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((h, i) => (
            <HospitalCard key={h.name} {...h} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HospitalDashboard;
