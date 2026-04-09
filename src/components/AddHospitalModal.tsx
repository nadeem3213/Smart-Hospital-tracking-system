import { useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, MapPin, Building, Loader2 } from "lucide-react";
import { useAddHospital } from "@/hooks/useHospitals";
import type { Hospital } from "@/data/hospitals";

const customIcon = L.divIcon({
  className: "custom-marker-drop",
  html: `<div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary shadow-lg ring-4 ring-primary/20"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function MapEvents({ setPos }: { setPos: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPos([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

const AddHospitalModal = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const addHospitalMutation = useAddHospital();
  
  // Form State
  const [name, setName] = useState("");
  const [type, setType] = useState<"government" | "private">("private");
  const [specialization, setSpecialization] = useState("");
  const [icuBeds, setIcuBeds] = useState(0);
  const [generalBeds, setGeneralBeds] = useState(0);
  const [doctors, setDoctors] = useState(0);
  
  // Map/Location State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [position, setPosition] = useState<[number, number]>([18.5204, 73.8567]); // Default Pune
  const mapRef = useRef<L.Map>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setPosition([lat, lon]);
        mapRef.current?.flyTo([lat, lon], 15);
        toast({ title: "Location found", description: "Please drag or verify the pin on the exact building." });
      } else {
        toast({ title: "Not found", description: "Address not found. Please try zooming manually.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to search address.", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !specialization) {
      toast({ title: "Missing fields", description: "Please fill out all required fields.", variant: "destructive" });
      return;
    }

    const newHospital = {
      name,
      type,
      icuBeds,
      generalBeds,
      doctors,
      specialization,
      lat: position[0],
      lng: position[1],
      description: "Added manually via Dispatch Dashboard",
      phone: "",
      email: "",
      established: new Date().getFullYear().toString(),
      specialties: [specialization],
    };

    addHospitalMutation.mutate(newHospital, {
      onSuccess: () => {
        toast({ title: "Hospital Added!", description: `${name} is now live on the routing network.`, className: "bg-success text-success-foreground" });
        setOpen(false);
        // Reset form
        setName("");
        setSpecialization("");
        setIcuBeds(0);
        setGeneralBeds(0);
        setDoctors(0);
      },
      onError: (err: any) => {
        toast({ title: "Failed to add", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 font-semibold">
          <Plus className="h-4 w-4" /> Add Hospital
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] border-border bg-card/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Building className="h-5 w-5 text-primary" /> Register New Facility
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-mono text-muted-foreground uppercase">Hospital Name</Label>
              <Input required value={name} onChange={e => setName(e.target.value)} placeholder="E.g. Apollo City Hospital" className="bg-muted/50 border-border" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground uppercase">Facility Type</Label>
                <Select value={type} onValueChange={(val: "government" | "private") => setType(val)}>
                  <SelectTrigger className="bg-muted/50 border-border">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground uppercase">Specialization</Label>
                <Input required value={specialization} onChange={e => setSpecialization(e.target.value)} placeholder="E.g. Cardiology" className="bg-muted/50 border-border" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label className="text-[10px] font-mono text-muted-foreground uppercase">ICU Beds</Label>
                <Input type="number" min="0" required value={icuBeds} onChange={e => setIcuBeds(parseInt(e.target.value) || 0)} className="bg-muted/50 border-border font-mono" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-mono text-muted-foreground uppercase">Gen Beds</Label>
                <Input type="number" min="0" required value={generalBeds} onChange={e => setGeneralBeds(parseInt(e.target.value) || 0)} className="bg-muted/50 border-border font-mono" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-mono text-muted-foreground uppercase">Doctors</Label>
                <Input type="number" min="0" required value={doctors} onChange={e => setDoctors(parseInt(e.target.value) || 0)} className="bg-muted/50 border-border font-mono" />
              </div>
            </div>
            
            <Button type="submit" disabled={addHospitalMutation.isPending} className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
              {addHospitalMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MapPin className="h-4 w-4 mr-2" />}
              {addHospitalMutation.isPending ? "Adding Database Record..." : "Confirm & Add"}
            </Button>
          </div>

          <div className="space-y-2 flex flex-col">
            <Label className="text-xs font-mono text-muted-foreground uppercase">Precise Location Mapping</Label>
            
            <div className="flex gap-2">
              <Input 
                value={searchQuery} 
                onChange={e => setSearchQuery(e.target.value)} 
                placeholder="Search address (e.g. MG Road Pune)" 
                className="bg-muted/50 border-border"
                onKeyDown={e => e.key === 'Enter' && handleSearch(e)}
              />
              <Button type="button" onClick={handleSearch} disabled={isSearching} variant="secondary" className="shrink-0 text-secondary-foreground border border-secondary/20 hover:bg-secondary/20">
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>

            <div className="relative flex-1 min-h-[220px] rounded-lg border border-border overflow-hidden mt-2">
              <MapContainer 
                center={position} 
                zoom={13} 
                style={{ height: "100%", width: "100%" }}
                ref={mapRef}
                zoomControl={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <MapEvents setPos={setPosition} />
                <Marker position={position} icon={customIcon} draggable={true} eventHandlers={{ dragend: (e) => setPosition([e.target.getLatLng().lat, e.target.getLatLng().lng]) }} />
              </MapContainer>
              <div className="absolute bottom-2 left-2 right-2 bg-background/90 backdrop-blur-sm rounded-md p-2 text-[10px] text-muted-foreground text-center pointer-events-none z-[1000] border border-border">
                Click map or drag the pin to set precise destination
              </div>
            </div>
            
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground px-1">
              <span>LAT: {position[0].toFixed(5)}</span>
              <span>LNG: {position[1].toFixed(5)}</span>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddHospitalModal;
