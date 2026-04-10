import { motion } from "framer-motion";
import { Search, Filter } from "lucide-react";
import { useState, useEffect } from "react";
import HospitalCard from "./HospitalCard";
import AddHospitalModal from "./AddHospitalModal";
import EditHospitalModal from "./EditHospitalModal";

import { useHospitals } from "../hooks/useHospitals";
import type { Hospital } from "../data/hospitals";

const HospitalDashboard = () => {
  const [filter, setFilter] = useState<"all" | "government" | "private">("all");
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const { data: hospitalData = [], isLoading } = useHospitals();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setIsAdmin(parsed.role === "admin");
      }
    } catch {
      setIsAdmin(false);
    }
  }, []);

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
            <div className="flex gap-2 flex-wrap">
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
            {isAdmin && (
              <div className="ml-auto">
                <AddHospitalModal />
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading ? (
            <div className="col-span-full py-10 flex justify-center text-primary">
              <span className="animate-pulse">Loading Live Data...</span>
            </div>
          ) : filtered.length > 0 ? (
            filtered.map((h, i) => (
              <HospitalCard
                key={h.name}
                {...h}
                index={i}
                isAdmin={isAdmin}
                onEdit={() => setEditingHospital(h)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              No hospitals found manually matching this criteria.
            </div>
          )}
        </div>

        {editingHospital && (
          <EditHospitalModal
            hospital={editingHospital}
            open={!!editingHospital}
            onOpenChange={(open) => { if (!open) setEditingHospital(null); }}
          />
        )}
      </div>
    </section>
  );
};

export default HospitalDashboard;
