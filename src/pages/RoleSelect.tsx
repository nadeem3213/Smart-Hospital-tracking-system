import { motion } from "framer-motion";
import { Activity, ShieldCheck, User, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RoleSelect = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
            <Activity className="h-7 w-7 text-primary" />
            <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary animate-pulse" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-bold tracking-wide text-foreground">
              MEDI<span className="text-primary">ROUTE</span>
            </h1>
            <p className="text-[10px] font-mono text-muted-foreground tracking-widest">
              EMERGENCY DISPATCH SYSTEM
            </p>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-foreground">
          Select Your <span className="text-primary">Role</span>
        </h2>
        <p className="text-sm text-muted-foreground mt-2">Choose how you want to access the system</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-8 px-4 w-full max-w-2xl">
        {/* Admin Card */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          onClick={() => navigate("/admin/login")}
          className="flex-1 cursor-pointer group rounded-xl border border-border bg-card p-8 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">Admin</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Manage hospitals, monitor the network, and control system settings.
              </p>
            </div>
            <div className="flex items-center gap-2 text-primary text-sm font-semibold group-hover:gap-3 transition-all">
              Login as Admin <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </motion.div>

        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ y: -6, transition: { duration: 0.2 } }}
          onClick={() => navigate("/login")}
          className="flex-1 cursor-pointer group rounded-xl border border-border bg-card p-8 transition-all hover:border-secondary/40 hover:shadow-lg hover:shadow-secondary/5"
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
              <User className="h-10 w-10 text-secondary" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-foreground mb-1">User</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Access hospital information, find routes, and manage your profile.
              </p>
            </div>
            <div className="flex items-center gap-2 text-secondary text-sm font-semibold group-hover:gap-3 transition-all">
              Continue as User <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </motion.div>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center text-xs text-muted-foreground font-mono mt-12 tracking-wider"
      >
        SECURE • ENCRYPTED • HIPAA COMPLIANT
      </motion.p>
    </div>
  );
};

export default RoleSelect;
