import { motion } from "framer-motion";
import {
  Activity,
  Bell,
  Shield,
  LogIn,
  UserPlus,
  LogOut,
  User,
  Ambulance,
  Sparkles,
  CheckCheck,
  Clock,
  Siren,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import ThemeToggle from "@/components/ThemeToggle";

interface Notification {
  id: number;
  type: "ambulance" | "feature" | "alert";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [];

const Navbar = () => {
  const [time, setTime] = useState(new Date());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: number) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "ambulance":
        return <Ambulance className="h-4 w-4 text-destructive" />;
      case "feature":
        return <Sparkles className="h-4 w-4 text-primary" />;
      case "alert":
        return <Siren className="h-4 w-4 text-warning" />;
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      if (token && user) {
        setIsLoggedIn(true);
        try {
          const parsed = JSON.parse(user);
          setUserName(parsed.name || (parsed.role === "admin" ? "Admin" : "User"));
          setIsAdmin(parsed.role === "admin");
        } catch {
          setUserName("User");
          setIsAdmin(false);
        }
      } else {
        setIsLoggedIn(false);
        setUserName("");
        setIsAdmin(false);
      }
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUserName("");
    navigate("/");
  };

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl"
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Activity className="h-5 w-5 text-primary" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide text-foreground">
              MEDI<span className="text-primary">ROUTE</span>
            </h1>
            <p className="text-[10px] font-mono text-muted-foreground tracking-widest">
              EMERGENCY DISPATCH
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/home" className="hover:text-foreground transition-colors">Home</Link>
          {!isAdmin && (
            <Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
          )}
          <Link to="/hospitals" className="hover:text-foreground transition-colors">Hospitals</Link>
          <Link to="/routing" className="hover:text-foreground transition-colors">Routing</Link>
          {isAdmin && <Link to="/admin/users" className="hover:text-primary transition-colors text-primary/80 font-medium">User Profiles</Link>}
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:block font-mono text-xs text-secondary">
            {time.toLocaleTimeString("en-US", { hour12: false })}
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-96 p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                      {unreadCount} new
                    </Badge>
                  )}
                </div>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllRead}
                    className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <CheckCheck className="mr-1 h-3 w-3" />
                    Mark all read
                  </Button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto custom-scrollbar">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`flex gap-3 border-b border-border px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                      !notification.read ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {notification.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {!isAdmin && (
                <div className="border-t border-border px-4 py-2 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/dashboard")}
                    className="w-full text-xs text-muted-foreground hover:text-foreground"
                  >
                    View all notifications
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
          <ThemeToggle />
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5">
            <Shield className="h-3.5 w-3.5 text-success" />
            <span className="text-xs font-mono text-success">ONLINE</span>
          </div>

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/profile")}
                className="gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground"
              >
                <User className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">{userName}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-1.5 text-xs font-mono text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Logout</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/login")}
                className="gap-1.5 text-xs font-mono"
              >
                <LogIn className="h-3.5 w-3.5" />
                Login
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => navigate("/signup")}
                className="gap-1.5 text-xs font-mono"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
