import { motion } from "framer-motion";
import { Activity, Clock, Hospital, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";

interface CaseRecord {
  caseId: string;
  type: string;
  hospital: string;
  time: string;
  status: "Completed" | "In Progress" | "Pending";
}

const MOCK_CASES: CaseRecord[] = [
  {
    caseId: "EMG101",
    type: "Cardiac",
    hospital: "City General Hospital",
    time: "10:32 AM",
    status: "Completed",
  },
  {
    caseId: "EMG102",
    type: "Accident",
    hospital: "Apollo Medical Center",
    time: "2:15 PM",
    status: "Completed",
  },
  {
    caseId: "EMG103",
    type: "Burns",
    hospital: "Metro Trauma Institute",
    time: "4:48 PM",
    status: "In Progress",
  },
  {
    caseId: "EMG104",
    type: "Orthopedic",
    hospital: "St. Mary's Hospital",
    time: "6:20 PM",
    status: "Completed",
  },
  {
    caseId: "EMG105",
    type: "Pediatric",
    hospital: "Fortis Emergency Wing",
    time: "8:05 PM",
    status: "Pending",
  },
  {
    caseId: "EMG106",
    type: "Neurology",
    hospital: "Govt. District Hospital",
    time: "9:42 PM",
    status: "In Progress",
  },
  {
    caseId: "EMG107",
    type: "Respiratory",
    hospital: "City General Hospital",
    time: "11:10 PM",
    status: "Completed",
  },
  {
    caseId: "EMG108",
    type: "Trauma",
    hospital: "Apollo Medical Center",
    time: "1:30 AM",
    status: "Completed",
  },
];

const statusConfig: Record<string, { icon: typeof CheckCircle; className: string }> = {
  Completed: { icon: CheckCircle, className: "bg-success/10 text-success border-success/30" },
  "In Progress": { icon: Loader2, className: "bg-warning/10 text-warning border-warning/30" },
  Pending: { icon: AlertTriangle, className: "bg-primary/10 text-primary border-primary/30" },
};

const UserActivityTable = () => {
  const [cases, setCases] = useState<CaseRecord[]>(MOCK_CASES);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:5000/api/visits", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch");
      })
      .then((data) => {
        if (data.cases && data.cases.length > 0) {
          setCases(data.cases);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden"
    >
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/10">
              <Activity className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Emergency Case Log</h3>
              <p className="text-xs text-muted-foreground font-mono">Recent dispatch records & case tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono text-success border-success/30">
              {cases.filter((c) => c.status === "Completed").length} COMPLETED
            </Badge>
            <Badge variant="outline" className="text-xs font-mono text-warning border-warning/30">
              {cases.filter((c) => c.status === "In Progress").length} ACTIVE
            </Badge>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-xs font-mono text-muted-foreground tracking-wider">CASE ID</TableHead>
            <TableHead className="text-xs font-mono text-muted-foreground tracking-wider">TYPE</TableHead>
            <TableHead className="text-xs font-mono text-muted-foreground tracking-wider">HOSPITAL</TableHead>
            <TableHead className="text-xs font-mono text-muted-foreground tracking-wider">TIME</TableHead>
            <TableHead className="text-xs font-mono text-muted-foreground tracking-wider">STATUS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((record) => {
            const statusInfo = statusConfig[record.status] || statusConfig.Pending;
            const StatusIcon = statusInfo.icon;
            return (
              <TableRow key={record.caseId} className="border-border">
                <TableCell>
                  <span className="text-sm font-bold font-mono text-secondary">{record.caseId}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] font-mono text-foreground border-border">
                    {record.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Hospital className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm text-foreground">{record.hospital}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm font-mono text-foreground">{record.time}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[10px] font-mono ${statusInfo.className}`}>
                    <StatusIcon className="mr-1.5 h-3 w-3" />
                    {record.status}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </motion.div>
  );
};

export default UserActivityTable;
