import { motion } from "framer-motion";
import {
  Hospital,
  Users,
  Bed,
  Star,
  Activity,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  PieChart as PieChartIcon,
  User,
  Heart,
  Phone,
  MapPin,
  Shield,
  Pill,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UserActivityTable from "@/components/UserActivityTable";
import { hospitalData } from "@/data/hospitals";

/* ─── derived stats ─── */
const totalHospitals = hospitalData.length;
const totalDoctors = hospitalData.reduce((s, h) => s + h.doctors, 0);
const totalICU = hospitalData.reduce((s, h) => s + h.icuBeds, 0);
const totalGeneral = hospitalData.reduce((s, h) => s + h.generalBeds, 0);
const avgRating = (
  hospitalData.reduce((s, h) => s + h.rating, 0) / totalHospitals
).toFixed(1);
const activeEmergencies = 3;

/* ─── chart data ─── */
const bedData = hospitalData.map((h) => ({
  name: h.name.replace(/(Hospital|Medical|Institute|Wing)/gi, "").trim(),
  ICU: h.icuBeds,
  General: h.generalBeds,
}));

const typeDistribution = [
  {
    name: "Government",
    value: hospitalData.filter((h) => h.type === "government").length,
  },
  {
    name: "Private",
    value: hospitalData.filter((h) => h.type === "private").length,
  },
];

const statusDistribution = [
  {
    name: "Available",
    value: hospitalData.filter((h) => h.status === "available").length,
  },
  {
    name: "Busy",
    value: hospitalData.filter((h) => h.status === "busy").length,
  },
  {
    name: "Critical",
    value: hospitalData.filter((h) => h.status === "critical").length,
  },
];

const doctorsPerHospital = hospitalData.map((h) => ({
  name: h.name.replace(/(Hospital|Medical|Institute|Wing)/gi, "").trim(),
  doctors: h.doctors,
}));

const monthlyVisits = [
  { month: "Jan", visits: 320 },
  { month: "Feb", visits: 290 },
  { month: "Mar", visits: 410 },
  { month: "Apr", visits: 380 },
  { month: "May", visits: 450 },
  { month: "Jun", visits: 520 },
  { month: "Jul", visits: 490 },
  { month: "Aug", visits: 560 },
  { month: "Sep", visits: 530 },
  { month: "Oct", visits: 610 },
  { month: "Nov", visits: 580 },
  { month: "Dec", visits: 640 },
];

const emergencyResponse = [
  { month: "Jan", time: 8.2 },
  { month: "Feb", time: 7.8 },
  { month: "Mar", time: 7.1 },
  { month: "Apr", time: 6.9 },
  { month: "May", time: 6.5 },
  { month: "Jun", time: 6.2 },
  { month: "Jul", time: 5.8 },
  { month: "Aug", time: 5.5 },
  { month: "Sep", time: 5.3 },
  { month: "Oct", time: 5.0 },
  { month: "Nov", time: 4.8 },
  { month: "Dec", time: 4.5 },
];

/* ─── palette ─── */
const COLORS = {
  primary: "#ef4444",
  secondary: "#14b8a6",
  accent: "#eab308",
  success: "#22c55e",
};

const PIE_TYPE_COLORS = [COLORS.secondary, COLORS.primary];
const PIE_STATUS_COLORS = [COLORS.success, COLORS.accent, COLORS.primary];

/* ─── stat card config ─── */
const stats = [
  {
    label: "Total Hospitals",
    value: totalHospitals,
    icon: Hospital,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Total Doctors",
    value: totalDoctors,
    icon: Users,
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    label: "ICU Beds",
    value: totalICU,
    icon: Bed,
    color: "text-[#eab308]",
    bg: "bg-[#eab308]/10",
  },
  {
    label: "General Beds",
    value: totalGeneral,
    icon: Bed,
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    label: "Avg Rating",
    value: avgRating,
    icon: Star,
    color: "text-[#eab308]",
    bg: "bg-[#eab308]/10",
  },
  {
    label: "Active Emergencies",
    value: activeEmergencies,
    icon: AlertTriangle,
    color: "text-primary",
    bg: "bg-primary/10",
  },
];

/* ─── tabs ─── */
type TabKey = "overview" | "trends" | "performance";
const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "trends", label: "Trends", icon: TrendingUp },
  { key: "performance", label: "Performance", icon: PieChartIcon },
];

/* ─── shared chart tooltip style ─── */
const tooltipStyle = {
  contentStyle: {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "0.75rem",
    fontSize: "0.75rem",
    fontFamily: "monospace",
    color: "hsl(var(--foreground))",
  },
  itemStyle: { color: "hsl(var(--foreground))" },
  labelStyle: { color: "hsl(var(--muted-foreground))", marginBottom: 4 },
};

/* ─── custom pie label ─── */
const renderPieLabel = ({
  name,
  percent,
}: {
  name: string;
  percent: number;
}) => `${name} ${(percent * 100).toFixed(0)}%`;

/* ─── animation variants ─── */
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: "easeOut" },
  }),
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

/* ─── Profile data interface ─── */
interface ProfileData {
  fullName: string;
  phone: string;
  bloodGroup: string;
  gender: string;
  disease: string;
  allergies: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  address: string;
}

const API_BASE = "http://localhost:5000";

/* ═══════════════════════════════════════════
   Dashboard component
   ═══════════════════════════════════════════ */
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [userProfile, setUserProfile] = useState<ProfileData | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("user");
    if (!token || !stored) return;

    try {
      const parsed = JSON.parse(stored);
      setUserName(parsed.name || null);
      setUserEmail(parsed.email || null);
    } catch {
      return;
    }

    fetch(`${API_BASE}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setUserProfile({
            fullName: data.profile.fullName || "",
            phone: data.profile.phone || "",
            bloodGroup: data.profile.bloodGroup || "",
            gender: data.profile.gender || "",
            disease: data.profile.disease || "None",
            allergies: data.profile.allergies || "",
            emergencyContactName: data.profile.emergencyContactName || "",
            emergencyContactPhone: data.profile.emergencyContactPhone || "",
            address: data.profile.address || "",
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container pt-16 pb-12">
        {/* ── heading ── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 mb-8"
        >
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Analytics <span className="text-primary">Dashboard</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground font-mono">
            Real-time hospital network statistics & performance metrics
          </p>
        </motion.div>

        {/* ── User Profile Card ── */}
        {userName && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8 rounded-xl border border-border bg-card/60 backdrop-blur-sm p-5 overflow-hidden"
          >
            <div className="flex items-start gap-5 flex-wrap sm:flex-nowrap">
              {/* Avatar */}
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 border-2 border-primary/20">
                <User className="h-8 w-8 text-primary" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-lg font-bold text-foreground truncate">
                    {userProfile?.fullName || userName}
                  </h2>
                  <div className="flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2 py-0.5">
                    <Shield className="h-3 w-3 text-success" />
                    <span className="text-[10px] font-mono text-success">ACTIVE</span>
                  </div>
                </div>

                {userEmail && (
                  <p className="text-xs text-muted-foreground mb-3">{userEmail}</p>
                )}

                {userProfile ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {userProfile.bloodGroup && (
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                        <Heart className="h-3.5 w-3.5 text-primary shrink-0" />
                        <div>
                          <p className="text-[10px] text-muted-foreground">Blood</p>
                          <p className="text-xs font-bold font-mono text-foreground">{userProfile.bloodGroup}</p>
                        </div>
                      </div>
                    )}
                    {userProfile.phone && (
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                        <Phone className="h-3.5 w-3.5 text-secondary shrink-0" />
                        <div>
                          <p className="text-[10px] text-muted-foreground">Phone</p>
                          <p className="text-xs font-semibold text-foreground truncate">{userProfile.phone}</p>
                        </div>
                      </div>
                    )}
                    {userProfile.gender && (
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                        <User className="h-3.5 w-3.5 text-accent shrink-0" />
                        <div>
                          <p className="text-[10px] text-muted-foreground">Gender</p>
                          <p className="text-xs font-semibold text-foreground">{userProfile.gender}</p>
                        </div>
                      </div>
                    )}
                    {userProfile.disease && userProfile.disease !== "None" && (
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
                        <div>
                          <p className="text-[10px] text-muted-foreground">Condition</p>
                          <p className="text-xs font-semibold text-foreground">{userProfile.disease}</p>
                        </div>
                      </div>
                    )}
                    {userProfile.allergies && (
                      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2">
                        <Pill className="h-3.5 w-3.5 text-primary shrink-0" />
                        <div>
                          <p className="text-[10px] text-muted-foreground">Allergies</p>
                          <p className="text-xs font-semibold text-foreground truncate">{userProfile.allergies}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Complete your <a href="/profile" className="text-primary hover:underline font-medium">medical profile</a> to see your details here.
                    </p>
                  </div>
                )}

                {userProfile?.emergencyContactName && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3 text-primary" />
                    <span>Emergency: <span className="text-foreground font-medium">{userProfile.emergencyContactName}</span> — {userProfile.emergencyContactPhone}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── stats cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-4 flex flex-col gap-3 transition-colors hover:border-primary/20"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.bg}`}>
                  <s.icon className={`h-4.5 w-4.5 ${s.color}`} />
                </div>
              </div>
              <div>
                <p className={`text-2xl font-bold font-mono ${s.color}`}>
                  {s.value}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
                  {s.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── tab bar ── */}
        <div className="flex items-center gap-2 mb-6 border-b border-border pb-3">
          {tabs.map((t) => {
            const active = activeTab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
                {active && (
                  <motion.span
                    layoutId="tab-indicator"
                    className="absolute -bottom-3 left-0 right-0 h-[2px] bg-primary rounded-full"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── charts ── */}
        {activeTab === "overview" && (
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10"
          >
            {/* Bar – Bed availability */}
            <ChartCard title="Hospital Bed Availability" subtitle="ICU vs General beds per hospital">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={bedData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                  />
                  <Tooltip {...tooltipStyle} />
                  <Legend
                    wrapperStyle={{ fontSize: 12, fontFamily: "monospace" }}
                  />
                  <Bar dataKey="ICU" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="General" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Pie – Type distribution */}
            <ChartCard title="Hospital Type Distribution" subtitle="Government vs Private facilities">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="value"
                    label={renderPieLabel}
                    stroke="none"
                  >
                    {typeDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_TYPE_COLORS[i % PIE_TYPE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12, fontFamily: "monospace" }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Bar – Doctors per hospital */}
            <ChartCard title="Doctors per Hospital" subtitle="Medical staff distribution">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={doctorsPerHospital} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                  />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="doctors" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Pie – Status distribution */}
            <ChartCard title="Hospital Status Distribution" subtitle="Current availability overview">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                    dataKey="value"
                    label={renderPieLabel}
                    stroke="none"
                  >
                    {statusDistribution.map((_, i) => (
                      <Cell key={i} fill={PIE_STATUS_COLORS[i % PIE_STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12, fontFamily: "monospace" }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </motion.div>
        )}

        {activeTab === "trends" && (
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10"
          >
            {/* Line – Monthly patient visits */}
            <ChartCard title="Monthly Patient Visits" subtitle="12-month patient volume trend">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyVisits}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                  />
                  <Tooltip {...tooltipStyle} />
                  <Line
                    type="monotone"
                    dataKey="visits"
                    stroke={COLORS.secondary}
                    strokeWidth={2.5}
                    dot={{ fill: COLORS.secondary, r: 4 }}
                    activeDot={{ r: 6, stroke: COLORS.secondary, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Area – Emergency response time */}
            <ChartCard title="Emergency Response Time" subtitle="Average response time trend (minutes)">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={emergencyResponse}>
                  <defs>
                    <linearGradient id="responseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                    domain={[0, 10]}
                  />
                  <Tooltip {...tooltipStyle} />
                  <Area
                    type="monotone"
                    dataKey="time"
                    stroke={COLORS.primary}
                    strokeWidth={2.5}
                    fill="url(#responseGrad)"
                    dot={{ fill: COLORS.primary, r: 4 }}
                    activeDot={{ r: 6, stroke: COLORS.primary, strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </motion.div>
        )}

        {activeTab === "performance" && (
          <motion.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10"
          >
            {/* combined bed + doctors bar */}
            <ChartCard title="Hospital Capacity Overview" subtitle="Beds & doctors comparison">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={hospitalData.map((h) => ({
                    name: h.name.replace(/(Hospital|Medical|Institute|Wing)/gi, "").trim(),
                    ICU: h.icuBeds,
                    General: h.generalBeds,
                    Doctors: h.doctors,
                  }))}
                  barGap={2}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                  />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12, fontFamily: "monospace" }} />
                  <Bar dataKey="ICU" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="General" fill={COLORS.secondary} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Doctors" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Ratings horizontal bar */}
            <ChartCard title="Hospital Ratings" subtitle="Patient satisfaction scores">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  layout="vertical"
                  data={hospitalData
                    .map((h) => ({
                      name: h.name.replace(/(Hospital|Medical|Institute|Wing)/gi, "").trim(),
                      rating: h.rating,
                    }))
                    .sort((a, b) => b.rating - a.rating)}
                  barSize={18}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    domain={[0, 5]}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                    width={120}
                  />
                  <Tooltip {...tooltipStyle} />
                  <Bar dataKey="rating" fill={COLORS.success} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </motion.div>
        )}

        {/* ── activity table ── */}
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-6"
        >
          <UserActivityTable />
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

/* ─── reusable chart wrapper ─── */
function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-5">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        <p className="text-[11px] text-muted-foreground font-mono">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

export default Dashboard;
