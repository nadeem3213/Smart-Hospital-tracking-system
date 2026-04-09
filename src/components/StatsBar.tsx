import { motion } from "framer-motion";
import { Bed, UserCheck, Hospital, PlusSquare } from "lucide-react";
import { useHospitals } from "@/hooks/useHospitals";
import { useMemo } from "react";

const StatsBar = () => {
  const { data: hospitalData = [] } = useHospitals();

  const stats = useMemo(() => {
    let icuBeds = 0;
    let generalBeds = 0;
    let doctors = 0;

    hospitalData.forEach(h => {
      icuBeds += (h.icuBeds || 0);
      generalBeds += (h.generalBeds || 0);
      doctors += (h.doctors || 0);
    });

    return [
      { icon: Bed, label: "Total ICU Beds", value: icuBeds, color: "text-secondary" },
      { icon: PlusSquare, label: "Total General Beds", value: generalBeds, color: "text-primary" },
      { icon: UserCheck, label: "Total Doctors", value: doctors, color: "text-success" },
      { icon: Hospital, label: "Network Hospitals", value: hospitalData.length, color: "text-warning" },
    ];
  }, [hospitalData]);

  return (
    <section className="relative border-y border-border bg-card/30">
      <div className="container py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 rounded-xl border border-border bg-card/50 p-4"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-foreground">
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsBar;

