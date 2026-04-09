import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
  Heart,
  Shield,
  Pill,
  AlertTriangle,
  Save,
  Activity,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, differenceInYears } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { API_BASE } from "@/config";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string | null;
  bloodGroup: string;
  gender: string;
  disease: string;
  diseaseDetails: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  address: string;
  allergies: string;
  currentMedications: string;
}

const defaultProfile: ProfileData = {
  fullName: "",
  email: "",
  phone: "",
  dateOfBirth: null,
  bloodGroup: "",
  gender: "",
  disease: "None",
  diseaseDetails: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  address: "",
  allergies: "",
  currentMedications: "",
};

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const genders = ["Male", "Female", "Other"];
const diseases = [
  "None",
  "Diabetes",
  "Hypertension",
  "Asthma",
  "Heart Disease",
  "Cancer",
  "Kidney Disease",
  "Liver Disease",
  "Thyroid",
  "Arthritis",
  "Other",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};



const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<{ name: string; email: string; lat?: number; lng?: number } | null>(null);
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [dobOpen, setDobOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!stored || !token) {
      navigate("/login");
      return;
    }

    let parsed: { name: string; email: string; lat?: number; lng?: number };
    try {
      parsed = JSON.parse(stored);
    } catch {
      navigate("/login");
      return;
    }
    setUser(parsed);

    fetch(`${API_BASE}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          setProfile({
            fullName: data.profile.fullName || parsed.name || "",
            email: parsed.email || "",
            phone: data.profile.phone || "",
            dateOfBirth: data.profile.dateOfBirth || null,
            bloodGroup: data.profile.bloodGroup || "",
            gender: data.profile.gender || "",
            disease: data.profile.disease || "None",
            diseaseDetails: data.profile.diseaseDetails || "",
            emergencyContactName: data.profile.emergencyContactName || "",
            emergencyContactPhone: data.profile.emergencyContactPhone || "",
            address: data.profile.address || "",
            allergies: data.profile.allergies || "",
            currentMedications: data.profile.currentMedications || "",
          });
        } else {
          setProfile((prev) => ({
            ...prev,
            fullName: parsed.name || "",
            email: parsed.email || "",
          }));
        }
      })
      .catch(() => {
        setProfile((prev) => ({
          ...prev,
          fullName: parsed.name || "",
          email: parsed.email || "",
        }));
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleChange = (field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setProfile((prev) => ({ ...prev, dateOfBirth: date.toISOString() }));
      setDobOpen(false);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: "Save failed", description: data.message, variant: "destructive" });
        return;
      }

      toast({
        title: "Profile Saved",
        description: "Your profile information has been updated successfully.",
      });
    } catch {
      toast({
        title: "Connection Error",
        description: "Could not connect to the server.",
        variant: "destructive",
      });
    }
  };

  const selectedDob = profile.dateOfBirth ? new Date(profile.dateOfBirth) : undefined;
  const age = selectedDob ? differenceInYears(new Date(), selectedDob) : null;

  if (!user) return null;
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-sm font-mono text-muted-foreground animate-pulse">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container max-w-4xl pt-16 py-12 px-4">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wide text-foreground">
                USER <span className="text-primary">PROFILE</span>
              </h1>
              <p className="text-xs font-mono text-muted-foreground tracking-widest">
                MEDICAL INFORMATION MANAGEMENT
              </p>
            </div>
          </div>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 rounded-xl border border-border bg-card/60 backdrop-blur-sm p-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground">{user.name}</h2>
              <div className="flex flex-wrap items-center gap-4 mt-1">
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </span>
                {user.lat && user.lng && (
                  <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {user.lat.toFixed(4)}, {user.lng.toFixed(4)}
                  </span>
                )}
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5">
              <Shield className="h-3.5 w-3.5 text-green-500" />
              <span className="text-xs font-mono text-green-500">VERIFIED</span>
            </div>
          </div>
        </motion.div>

        {/* Profile Edit Form */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Personal Information */}
          <motion.div
            variants={itemVariants}
            className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <User className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold tracking-wide text-foreground">
                PERSONAL INFORMATION
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground tracking-wider">
                  FULL NAME
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={profile.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    placeholder="Enter your full name"
                    className="pl-10 bg-muted/50 border-border"
                  />
                </div>
              </div>

              {/* Email (Read-Only) */}
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground tracking-wider">
                  EMAIL
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={profile.email}
                    readOnly
                    className="pl-10 bg-muted/50 border-border opacity-60 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground tracking-wider">
                  PHONE NUMBER
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={profile.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="Enter your phone number"
                    className="pl-10 bg-muted/50 border-border"
                  />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground tracking-wider">
                  DATE OF BIRTH / AGE
                </Label>
                <Popover open={dobOpen} onOpenChange={setDobOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal bg-muted/50 border-border hover:bg-muted/70"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                      {selectedDob ? (
                        <span>
                          {format(selectedDob, "PPP")}{" "}
                          <span className="text-primary font-mono text-xs">
                            ({age} yrs)
                          </span>
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Select date of birth
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDob}
                      onSelect={handleDateSelect}
                      disabled={(date) => date > new Date()}
                      initialFocus
                      captionLayout="dropdown-buttons"
                      fromYear={1920}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Blood Group */}
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground tracking-wider">
                  BLOOD GROUP
                </Label>
                <Select
                  value={profile.bloodGroup}
                  onValueChange={(value) => handleChange("bloodGroup", value)}
                >
                  <SelectTrigger className="bg-muted/50 border-border">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Select blood group" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {bloodGroups.map((bg) => (
                      <SelectItem key={bg} value={bg}>
                        {bg}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground tracking-wider">
                  GENDER
                </Label>
                <Select
                  value={profile.gender}
                  onValueChange={(value) => handleChange("gender", value)}
                >
                  <SelectTrigger className="bg-muted/50 border-border">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    {genders.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>

          {/* Medical Information */}
          <motion.div
            variants={itemVariants}
            className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Activity className="h-4 w-4 text-secondary" />
              <h3 className="text-sm font-bold tracking-wide text-foreground">
                MEDICAL INFORMATION
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Disease / Condition */}
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground tracking-wider">
                  DISEASE / CONDITION
                </Label>
                <Select
                  value={profile.disease}
                  onValueChange={(value) => handleChange("disease", value)}
                >
                  <SelectTrigger className="bg-muted/50 border-border">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Select condition" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {diseases.map((d) => (
                      <SelectItem key={d} value={d}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Allergies */}
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground tracking-wider">
                  ALLERGIES
                </Label>
                <div className="relative">
                  <AlertTriangle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={profile.allergies}
                    onChange={(e) => handleChange("allergies", e.target.value)}
                    placeholder="List any allergies"
                    className="pl-10 bg-muted/50 border-border"
                  />
                </div>
              </div>

              {/* Disease Details (shown when disease is not 'None') */}
              {profile.disease !== "None" && (
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-xs font-mono text-muted-foreground tracking-wider">
                    DISEASE DETAILS
                  </Label>
                  <Textarea
                    value={profile.diseaseDetails}
                    onChange={(e) =>
                      handleChange("diseaseDetails", e.target.value)
                    }
                    placeholder="Provide additional details about your condition..."
                    className="bg-muted/50 border-border min-h-[80px]"
                  />
                </div>
              )}

              {/* Current Medications */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-mono text-muted-foreground tracking-wider">
                  CURRENT MEDICATIONS
                </Label>
                <div className="relative">
                  <Pill className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={profile.currentMedications}
                    onChange={(e) =>
                      handleChange("currentMedications", e.target.value)
                    }
                    placeholder="List current medications"
                    className="pl-10 bg-muted/50 border-border"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Emergency Contact & Address */}
          <motion.div
            variants={itemVariants}
            className="rounded-xl border border-border bg-card/60 backdrop-blur-sm p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Shield className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold tracking-wide text-foreground">
                EMERGENCY CONTACT & ADDRESS
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Emergency Contact Name */}
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground tracking-wider">
                  EMERGENCY CONTACT NAME
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={profile.emergencyContactName}
                    onChange={(e) =>
                      handleChange("emergencyContactName", e.target.value)
                    }
                    placeholder="Emergency contact name"
                    className="pl-10 bg-muted/50 border-border"
                  />
                </div>
              </div>

              {/* Emergency Contact Phone */}
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground tracking-wider">
                  EMERGENCY CONTACT PHONE
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={profile.emergencyContactPhone}
                    onChange={(e) =>
                      handleChange("emergencyContactPhone", e.target.value)
                    }
                    placeholder="Emergency contact phone"
                    className="pl-10 bg-muted/50 border-border"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2 md:col-span-2">
                <Label className="text-xs font-mono text-muted-foreground tracking-wider">
                  ADDRESS
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    value={profile.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="Enter your full address"
                    className="pl-10 bg-muted/50 border-border min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div variants={itemVariants} className="flex justify-end">
            <Button
              onClick={handleSave}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-xl px-8 font-mono tracking-wider shadow-lg shadow-primary/20"
            >
              <Save className="h-4 w-4" />
              SAVE PROFILE
            </Button>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
