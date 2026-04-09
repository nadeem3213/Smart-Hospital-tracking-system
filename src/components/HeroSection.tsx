import { motion } from "framer-motion";
import { Navigation, Zap, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import PulseMap from "./PulseMap";
import { useHospitals } from "@/hooks/useHospitals";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const { data: hospitalData = [] } = useHospitals();
  const navigate = useNavigate();

  const heroStats = useMemo(() => {
    const totalDoctors = hospitalData.reduce((s, h) => s + (h.doctors || 0), 0);
    const totalBeds = hospitalData.reduce((s, h) => s + (h.icuBeds || 0) + (h.generalBeds || 0), 0);

    return [
      { value: hospitalData.length > 0 ? `${hospitalData.length}` : "...", label: "Hospitals Live" },
      { value: totalDoctors > 0 ? `${totalDoctors}+` : "...", label: "Specialists On-Call" },
      { value: totalBeds > 0 ? `${totalBeds}` : "...", label: "Emergency Beds" },
    ];
  }, [hospitalData]);
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Solid background layout */}

      <div className="container relative z-10 grid lg:grid-cols-2 gap-12 items-center py-20">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 mb-6"
          >
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-xs font-mono text-primary tracking-wider">LIVE EMERGENCY SYSTEM</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight mb-6">
            <span className="text-foreground">Smart Hospital</span>
            <br />
            <span className="text-primary">Emergency</span>
            <br />
            <span className="text-secondary">Routing</span>
          </h1>

          <p className="text-muted-foreground text-lg max-w-md mb-8 leading-relaxed">
            AI-powered dispatch that finds the nearest hospital with available beds,
            specialist doctors, and optimal traffic routes — in seconds.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2"
              onClick={() => navigate("/routing")}
            >
              <Zap className="h-4 w-4" />
              Emergency Route
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-secondary/30 text-secondary hover:bg-secondary/10 gap-2"
              onClick={() => navigate("/hospitals")}
            >
              <Navigation className="h-4 w-4" />
              Find Hospital
            </Button>
          </div>

          <div className="mt-10 flex gap-8">
            {heroStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.15 }}
              >
                <p className="text-2xl font-bold font-mono text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative"
        >
          <PulseMap />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <MapPin className="h-5 w-5 text-muted-foreground" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
