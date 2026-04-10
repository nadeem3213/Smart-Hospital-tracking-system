import { motion } from "framer-motion";
import {
  Users,
  Search,
  User,
  Mail,
  Phone,
  Heart,
  MapPin,
  Shield,
  Pill,
  AlertTriangle,
  Activity,
  Calendar,
  Download,
  Eye,
  Loader2,
  FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, differenceInYears } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { API_BASE } from "@/config";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface UserProfile {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  fullName: string;
  phone: string;
  dateOfBirth: string | null;
  bloodGroup: string;
  gender: string;
  disease: string;
  diseaseDetails: string;
  allergies: string;
  currentMedications: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.4, ease: "easeOut" },
  }),
};

function generateProfilePDF(profile: UserProfile) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(239, 68, 68);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("MEDIROUTE", 14, 18);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Patient Health Profile Report", 14, 26);
  doc.text(`Generated: ${format(new Date(), "PPP 'at' p")}`, 14, 33);

  let y = 52;

  doc.setTextColor(239, 68, 68);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Personal Information", 14, y);
  y += 3;
  doc.setDrawColor(239, 68, 68);
  doc.setLineWidth(0.5);
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  const dob = profile.dateOfBirth ? new Date(profile.dateOfBirth) : null;
  const age = dob ? differenceInYears(new Date(), dob) : null;

  const personalData: [string, string][] = [
    ["Full Name", profile.fullName || "N/A"],
    ["Email", profile.userId?.email || "N/A"],
    ["Phone", profile.phone || "N/A"],
    ["Date of Birth", dob ? `${format(dob, "PPP")} (${age} years)` : "N/A"],
    ["Gender", profile.gender || "N/A"],
    ["Blood Group", profile.bloodGroup || "N/A"],
    ["Address", profile.address || "N/A"],
  ];

  autoTable(doc, {
    startY: y,
    head: [["Field", "Details"]],
    body: personalData,
    theme: "striped",
    headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y + 60;
  y += 12;

  doc.setTextColor(239, 68, 68);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Medical Information", 14, y);
  y += 3;
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  const medicalData: [string, string][] = [
    ["Disease / Condition", profile.disease || "None"],
    ["Disease Details", profile.diseaseDetails || "N/A"],
    ["Allergies", profile.allergies || "None"],
    ["Current Medications", profile.currentMedications || "None"],
  ];

  autoTable(doc, {
    startY: y,
    head: [["Field", "Details"]],
    body: medicalData,
    theme: "striped",
    headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
    margin: { left: 14, right: 14 },
  });

  y = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y + 40;
  y += 12;

  doc.setTextColor(239, 68, 68);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Emergency Contact", 14, y);
  y += 3;
  doc.line(14, y, pageWidth - 14, y);
  y += 8;

  const emergencyData: [string, string][] = [
    ["Contact Name", profile.emergencyContactName || "N/A"],
    ["Contact Phone", profile.emergencyContactPhone || "N/A"],
  ];

  autoTable(doc, {
    startY: y,
    head: [["Field", "Details"]],
    body: emergencyData,
    theme: "striped",
    headStyles: { fillColor: [239, 68, 68], textColor: 255, fontStyle: "bold" },
    styles: { fontSize: 10, cellPadding: 4 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 50 } },
    margin: { left: 14, right: 14 },
  });

  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFillColor(245, 245, 245);
  doc.rect(0, pageHeight - 20, pageWidth, 20, "F");
  doc.setTextColor(120, 120, 120);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("MEDIROUTE — Emergency Dispatch System • Confidential Patient Record", pageWidth / 2, pageHeight - 8, { align: "center" });

  const fileName = `${(profile.fullName || profile.userId?.name || "patient").replace(/\s+/g, "_")}_health_report.pdf`;
  doc.save(fileName);
}

const AdminUsers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) {
      navigate("/admin/login");
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      if (parsed.role !== "admin") {
        navigate("/");
        return;
      }
    } catch {
      navigate("/");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/admin/login");
      return;
    }

    fetch(`${API_BASE}/api/admin/profiles`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setProfiles(data.profiles || []);
      })
      .catch(() => {
        toast({ title: "Error", description: "Could not fetch user profiles.", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [navigate, toast]);

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.fullName || "").toLowerCase().includes(q) ||
      (p.userId?.name || "").toLowerCase().includes(q) ||
      (p.userId?.email || "").toLowerCase().includes(q) ||
      (p.bloodGroup || "").toLowerCase().includes(q) ||
      (p.disease || "").toLowerCase().includes(q)
    );
  });

  const handleViewProfile = (profile: UserProfile) => {
    setSelectedProfile(profile);
    setDialogOpen(true);
  };

  const handleDownloadPDF = (profile: UserProfile) => {
    generateProfilePDF(profile);
    toast({ title: "PDF Downloaded", description: `Report for ${profile.fullName || profile.userId?.name} has been downloaded.` });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container pt-16 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wide text-foreground">
                USER <span className="text-primary">PROFILES</span>
              </h1>
              <p className="text-xs font-mono text-muted-foreground tracking-widest">
                ADMIN TRACKING SYSTEM
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        >
          {[
            { label: "Total Profiles", value: profiles.length, icon: FileText, color: "text-primary", bg: "bg-primary/10" },
            { label: "Male", value: profiles.filter((p) => p.gender === "Male").length, icon: User, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Female", value: profiles.filter((p) => p.gender === "Female").length, icon: User, color: "text-pink-500", bg: "bg-pink-500/10" },
            { label: "With Conditions", value: profiles.filter((p) => p.disease && p.disease !== "None").length, icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-4 flex flex-col gap-2"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.bg}`}>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <p className={`text-2xl font-bold font-mono ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, blood group, condition..."
              className="pl-10 bg-muted/50 border-border"
            />
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden"
        >
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs font-mono text-muted-foreground tracking-wider">PATIENT</TableHead>
                <TableHead className="text-xs font-mono text-muted-foreground tracking-wider">CONTACT</TableHead>
                <TableHead className="text-xs font-mono text-muted-foreground tracking-wider">BLOOD</TableHead>
                <TableHead className="text-xs font-mono text-muted-foreground tracking-wider">CONDITION</TableHead>
                <TableHead className="text-xs font-mono text-muted-foreground tracking-wider">GENDER</TableHead>
                <TableHead className="text-xs font-mono text-muted-foreground tracking-wider text-right">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                      <span className="text-sm">Loading user profiles...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center text-muted-foreground">
                      <Users className="h-8 w-8 mb-2 opacity-40" />
                      <span className="text-sm">{search ? "No profiles match your search." : "No user profiles found."}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((profile, i) => (
                  <motion.tr
                    key={profile._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-border hover:bg-muted/30 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{profile.fullName || profile.userId?.name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{profile.userId?.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-foreground font-mono">{profile.phone || "—"}</span>
                    </TableCell>
                    <TableCell>
                      {profile.bloodGroup ? (
                        <Badge variant="outline" className="text-xs font-mono text-primary border-primary/30 bg-primary/5">
                          {profile.bloodGroup}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {profile.disease && profile.disease !== "None" ? (
                        <Badge variant="outline" className="text-xs font-mono text-amber-500 border-amber-500/30 bg-amber-500/5">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {profile.disease}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs font-mono text-success border-success/30 bg-success/5">
                          Healthy
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-foreground">{profile.gender || "—"}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewProfile(profile)}
                          className="h-8 gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadPDF(profile)}
                          className="h-8 gap-1.5 text-xs font-mono text-primary hover:text-primary hover:bg-primary/10"
                        >
                          <Download className="h-3.5 w-3.5" />
                          PDF
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </motion.div>

        {/* Profile Detail Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Activity className="h-5 w-5 text-primary" />
                Patient Profile Report
              </DialogTitle>
            </DialogHeader>

            {selectedProfile && (
              <div className="space-y-6 mt-2">
                {/* Patient Header */}
                <div className="flex items-center gap-4 rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
                    <User className="h-7 w-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-foreground">
                      {selectedProfile.fullName || selectedProfile.userId?.name || "Unknown"}
                    </h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      {selectedProfile.userId?.email}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDownloadPDF(selectedProfile)}
                    size="sm"
                    className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 font-mono text-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download PDF
                  </Button>
                </div>

                {/* Personal Information */}
                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-bold tracking-wide text-foreground">PERSONAL INFORMATION</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailField icon={User} label="Full Name" value={selectedProfile.fullName} />
                    <DetailField icon={Mail} label="Email" value={selectedProfile.userId?.email} />
                    <DetailField icon={Phone} label="Phone" value={selectedProfile.phone} />
                    <DetailField
                      icon={Calendar}
                      label="Date of Birth"
                      value={
                        selectedProfile.dateOfBirth
                          ? `${format(new Date(selectedProfile.dateOfBirth), "PPP")} (${differenceInYears(new Date(), new Date(selectedProfile.dateOfBirth))} yrs)`
                          : undefined
                      }
                    />
                    <DetailField icon={Heart} label="Blood Group" value={selectedProfile.bloodGroup} highlight />
                    <DetailField icon={User} label="Gender" value={selectedProfile.gender} />
                    <div className="col-span-2">
                      <DetailField icon={MapPin} label="Address" value={selectedProfile.address} />
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="h-4 w-4 text-secondary" />
                    <h4 className="text-sm font-bold tracking-wide text-foreground">MEDICAL INFORMATION</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailField icon={AlertTriangle} label="Disease / Condition" value={selectedProfile.disease} />
                    <DetailField icon={Pill} label="Allergies" value={selectedProfile.allergies} />
                    {selectedProfile.disease !== "None" && selectedProfile.diseaseDetails && (
                      <div className="col-span-2">
                        <DetailField icon={FileText} label="Disease Details" value={selectedProfile.diseaseDetails} />
                      </div>
                    )}
                    <div className="col-span-2">
                      <DetailField icon={Pill} label="Current Medications" value={selectedProfile.currentMedications} />
                    </div>
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-bold tracking-wide text-foreground">EMERGENCY CONTACT</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <DetailField icon={User} label="Contact Name" value={selectedProfile.emergencyContactName} />
                    <DetailField icon={Phone} label="Contact Phone" value={selectedProfile.emergencyContactPhone} />
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground px-1">
                  <span>Profile created: {selectedProfile.createdAt ? format(new Date(selectedProfile.createdAt), "PPP") : "—"}</span>
                  <span>Last updated: {selectedProfile.updatedAt ? format(new Date(selectedProfile.updatedAt), "PPP") : "—"}</span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
};

function DetailField({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ElementType;
  label: string;
  value: string | undefined;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
      <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${highlight ? "text-primary" : "text-muted-foreground"}`} />
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground tracking-wider">{label}</p>
        <p className={`text-sm ${highlight ? "font-bold font-mono text-primary" : "font-medium text-foreground"} ${value ? "" : "text-muted-foreground italic"}`}>
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

export default AdminUsers;
