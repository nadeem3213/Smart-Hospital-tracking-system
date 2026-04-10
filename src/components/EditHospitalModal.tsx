import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Loader2, Save } from "lucide-react";
import { useUpdateHospital } from "@/hooks/useHospitals";
import type { Hospital } from "@/data/hospitals";

interface EditHospitalModalProps {
  hospital: Hospital;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditHospitalModal = ({ hospital, open, onOpenChange }: EditHospitalModalProps) => {
  const { toast } = useToast();
  const updateMutation = useUpdateHospital();

  const [name, setName] = useState("");
  const [type, setType] = useState<"government" | "private">("private");
  const [specialization, setSpecialization] = useState("");
  const [status, setStatus] = useState<"available" | "busy" | "critical">("available");
  const [icuBeds, setIcuBeds] = useState(0);
  const [generalBeds, setGeneralBeds] = useState(0);
  const [doctors, setDoctors] = useState(0);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (hospital && open) {
      setName(hospital.name);
      setType(hospital.type);
      setSpecialization(hospital.specialization);
      setStatus(hospital.status);
      setIcuBeds(hospital.icuBeds);
      setGeneralBeds(hospital.generalBeds);
      setDoctors(hospital.doctors);
      setPhone(hospital.phone || "");
      setEmail(hospital.email || "");
      setDescription(hospital.description || "");
    }
  }, [hospital, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospital._id) return;

    updateMutation.mutate(
      {
        id: hospital._id,
        data: {
          name,
          type,
          specialization,
          status,
          icuBeds,
          generalBeds,
          doctors,
          phone,
          email,
          description,
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "Hospital Updated",
            description: `${name} has been updated successfully.`,
            className: "bg-success text-success-foreground",
          });
          onOpenChange(false);
        },
        onError: (err: Error) => {
          toast({ title: "Update Failed", description: err.message, variant: "destructive" });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] border-border bg-card/95 backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Pencil className="h-5 w-5 text-primary" /> Edit Hospital
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label className="text-xs font-mono text-muted-foreground uppercase">Hospital Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required className="bg-muted/50 border-border" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-mono text-muted-foreground uppercase">Facility Type</Label>
              <Select value={type} onValueChange={(val: "government" | "private") => setType(val)}>
                <SelectTrigger className="bg-muted/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="government">Government</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-mono text-muted-foreground uppercase">Status</Label>
              <Select value={status} onValueChange={(val: "available" | "busy" | "critical") => setStatus(val)}>
                <SelectTrigger className="bg-muted/50 border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-mono text-muted-foreground uppercase">Specialization</Label>
            <Input value={specialization} onChange={(e) => setSpecialization(e.target.value)} required className="bg-muted/50 border-border" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label className="text-[10px] font-mono text-muted-foreground uppercase">ICU Beds</Label>
              <Input type="number" min="0" value={icuBeds} onChange={(e) => setIcuBeds(parseInt(e.target.value) || 0)} className="bg-muted/50 border-border font-mono" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-mono text-muted-foreground uppercase">Gen Beds</Label>
              <Input type="number" min="0" value={generalBeds} onChange={(e) => setGeneralBeds(parseInt(e.target.value) || 0)} className="bg-muted/50 border-border font-mono" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-mono text-muted-foreground uppercase">Doctors</Label>
              <Input type="number" min="0" value={doctors} onChange={(e) => setDoctors(parseInt(e.target.value) || 0)} className="bg-muted/50 border-border font-mono" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-mono text-muted-foreground uppercase">Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 ..." className="bg-muted/50 border-border" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-mono text-muted-foreground uppercase">Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="info@hospital.com" className="bg-muted/50 border-border" />
            </div>
          </div>


          <div className="space-y-2">
            <Label className="text-xs font-mono text-muted-foreground uppercase">Description</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-border bg-muted/50 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-secondary/50 resize-none"
            />
          </div>

          <Button type="submit" disabled={updateMutation.isPending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {updateMutation.isPending ? "Saving Changes..." : "Save Changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditHospitalModal;
