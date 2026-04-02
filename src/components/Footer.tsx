import { Activity } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-card/20 py-10">
    <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" />
        <span className="text-sm font-bold text-foreground">
          MEDI<span className="text-primary">ROUTE</span>
        </span>
      </div>
      <p className="text-xs text-muted-foreground font-mono">
        Smart Hospital Load Balancer & Emergency Routing System
      </p>
      <p className="text-xs text-muted-foreground">
        © 2026 MediRoute. Saving lives through technology.
      </p>
    </div>
  </footer>
);

export default Footer;
