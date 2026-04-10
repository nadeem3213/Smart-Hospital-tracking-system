import { motion } from "framer-motion";
import { Bot, Activity, Navigation, ShieldCheck } from "lucide-react";

const steps = [
  {
    icon: Bot,
    title: "AI Symptom Triage",
    description: "Patients describe symptoms to our Neural AI to instantly match with the right specialist facility.",
    color: "text-primary",
    borderColor: "border-primary/30",
  },
  {
    icon: Activity,
    title: "Live Availability Sync",
    description: "The system scans a real-time websocket network for active ICU beds and emergency bandwidth.",
    color: "text-secondary",
    borderColor: "border-secondary/30",
  },
  {
    icon: Navigation,
    title: "Intelligent Routing",
    description: "Our algorithm calculates the absolute fastest, traffic-aware path to the selected medical center.",
    color: "text-accent",
    borderColor: "border-accent/30",
  },
  {
    icon: ShieldCheck,
    title: "Synchronized Arrival",
    description: "Dashboards update globally before arrival, locking in load limits and preventing care overlaps.",
    color: "text-success",
    borderColor: "border-success/30",
  },
];

const HowItWorks = () => {
  return (
    <section id="routing" className="relative py-20 border-t border-border">
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-xs font-mono text-secondary tracking-widest">WORKFLOW</span>
          <h2 className="text-3xl font-bold text-foreground mt-2">
            How <span className="text-secondary">It Works</span>
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`relative rounded-xl border ${step.borderColor} bg-card/40 p-6 text-center`}
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-background border border-border rounded-full h-6 w-6 flex items-center justify-center">
                <span className="text-[10px] font-mono text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <step.icon className={`h-8 w-8 mx-auto mb-4 ${step.color}`} />
              <h3 className="font-semibold text-foreground text-sm mb-2">{step.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
