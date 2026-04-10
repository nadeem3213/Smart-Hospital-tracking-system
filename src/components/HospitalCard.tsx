import { motion } from "framer-motion";
import { MapPin, Bed, UserCheck, Clock, ArrowRight, Building2, Landmark, Pencil, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface HospitalCardProps {
  name: string;
  type: "government" | "private";
  distance: string;
  eta: string;
  icuBeds: number;
  generalBeds: number;
  doctors: number;
  specialization: string;
  status: "available" | "busy" | "critical";
  index: number;
  isAdmin?: boolean;
  onEdit?: () => void;
  phone?: string;
}

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
  available: { bg: "bg-success/10", text: "text-success", label: "AVAILABLE" },
  busy: { bg: "bg-warning/10", text: "text-warning", label: "LIMITED" },
  critical: { bg: "bg-primary/10", text: "text-primary", label: "CRITICAL" },
};

const HospitalCard = ({
  name, type, distance, eta, icuBeds, generalBeds, doctors, specialization, status, index, isAdmin, onEdit, phone,
}: HospitalCardProps) => {
  const s = statusStyles[status];
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -4 }}
      className="group rounded-xl border border-border bg-card/60 backdrop-blur-sm p-5 transition-colors hover:border-secondary/30"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            {type === "government" ? (
              <Landmark className="h-5 w-5 text-secondary" />
            ) : (
              <Building2 className="h-5 w-5 text-accent" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground text-sm truncate">{name}</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground capitalize truncate">{type} Hospital</p>
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[8px] sm:text-[10px] font-mono font-semibold ${s.bg} ${s.text}`}>
          {s.label}
        </span>
      </div>

      <div className="mb-4 rounded-lg bg-muted/50 p-2.5 sm:p-3">
        <p className="text-[11px] sm:text-xs font-mono text-secondary mb-1 truncate">{specialization}</p>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[11px] sm:text-xs text-muted-foreground">
          <span className="flex items-center gap-1 shrink-0">
            <MapPin className="h-3 w-3" /> {distance}
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <Clock className="h-3 w-3" /> ETA {eta}
          </span>
          {phone && (
            <span className="flex items-center gap-1 shrink-0">
              <Phone className="h-3 w-3 text-primary/70" /> {phone}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
        <div className="text-center rounded-lg border border-border p-1.5 sm:p-2">
          <Bed className="h-3.5 w-3.5 mx-auto text-secondary mb-1" />
          <p className="text-xs sm:text-sm font-bold font-mono text-foreground truncate">{icuBeds}</p>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">ICU</p>
        </div>
        <div className="text-center rounded-lg border border-border p-1.5 sm:p-2">
          <Bed className="h-3.5 w-3.5 mx-auto text-muted-foreground mb-1" />
          <p className="text-xs sm:text-sm font-bold font-mono text-foreground truncate">{generalBeds}</p>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">General</p>
        </div>
        <div className="text-center rounded-lg border border-border p-1.5 sm:p-2">
          <UserCheck className="h-3.5 w-3.5 mx-auto text-success mb-1" />
          <p className="text-xs sm:text-sm font-bold font-mono text-foreground truncate">{doctors}</p>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">Doctors</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => navigate("/routing")}
          className="flex-1 bg-secondary/10 text-secondary hover:bg-secondary/20 border border-secondary/20 gap-2 text-xs"
          size="sm"
        >
          Route Now <ArrowRight className="h-3 w-3" />
        </Button>
        {isAdmin && onEdit && (
          <Button
            onClick={onEdit}
            variant="outline"
            size="sm"
            className="border-primary/30 text-primary hover:bg-primary/10 gap-1 text-xs"
          >
            <Pencil className="h-3 w-3" />
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default HospitalCard;
