import { Activity, MapPin, Cpu, Navigation, Phone, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border bg-background pt-16 pb-8">
    <div className="container grid md:grid-cols-4 gap-10 mb-12">
      <div className="space-y-4 md:col-span-1">
        <div className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Activity className="h-4 w-4 text-primary" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
          </div>
          <span className="text-lg font-bold text-foreground tracking-wide">
            MEDI<span className="text-primary">ROUTE</span>
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed pr-4">
          Smart emergency dispatch system designed to balance hospital loads and route patients securely using real-time AI logic.
        </p>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground font-mono tracking-widest">
          CORE FEATURES
        </h4>
        <ul className="space-y-2.5 text-xs text-muted-foreground">
          <li className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
            <MapPin className="h-3 w-3" /> Real-Time Tracking
          </li>
          <li className="flex items-center gap-2 hover:text-secondary transition-colors cursor-pointer">
            <Cpu className="h-3 w-3" /> AI-Based Routing
          </li>
          <li className="flex items-center gap-2 hover:text-accent transition-colors cursor-pointer">
            <Activity className="h-3 w-3" /> Live Bed Availability
          </li>
          <li className="flex items-center gap-2 hover:text-success transition-colors cursor-pointer">
            <Navigation className="h-3 w-3" /> Traffic-Aware Pathing
          </li>
        </ul>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground font-mono tracking-widest">
          QUICK LINKS
        </h4>
        <ul className="space-y-2.5 text-xs text-muted-foreground flex flex-col">
          <Link to="/home" className="hover:text-foreground transition-colors w-max">
            Home Platform
          </Link>
          <Link to="/hospitals" className="hover:text-foreground transition-colors w-max">
            Hospital Directory
          </Link>
          <Link to="/routing" className="hover:text-foreground transition-colors w-max">
            Active Routing
          </Link>
          <Link to="/dashboard" className="hover:text-foreground transition-colors w-max">
            Analytics Dashboard
          </Link>
        </ul>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground font-mono tracking-widest">
          SYSTEM STATUS
        </h4>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card/60 p-3">
            <Shield className="h-4 w-4 text-success shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground font-mono">NETWORK</p>
              <p className="text-xs font-semibold text-foreground">Operational</p>
            </div>
            <div className="ml-auto h-2 w-2 rounded-full bg-success animate-pulse" />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>Emergency Support Available 24/7</span>
          </div>
        </div>
      </div>
    </div>

    <div className="container border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <p className="text-xs text-muted-foreground font-mono">
        © {new Date().getFullYear()} MediRoute Neural Dispatch. Saving lives through technology.
      </p>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
        <span className="h-3 w-[1px] bg-border" />
        <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
      </div>
    </div>
  </footer>
);

export default Footer;
