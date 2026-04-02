import { motion } from "framer-motion";
import { Bed, UserCheck, Ambulance, Clock } from "lucide-react";

const stats = [
  { icon: Bed, label: "ICU Beds Available", value: 42, total: 180, color: "text-secondary" },
  { icon: UserCheck, label: "Doctors On-Call", value: 89, total: 120, color: "text-success" },
  { icon: Ambulance, label: "Active Ambulances", value: 23, total: 35, color: "text-primary" },
  { icon: Clock, label: "Avg Route Time", value: "4.2", unit: "min", color: "text-warning" },
];

const StatsBar = () => {
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
                  {stat.unit && <span className="text-sm text-muted-foreground ml-1">{stat.unit}</span>}
                  {stat.total && <span className="text-sm text-muted-foreground">/{stat.total}</span>}
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
