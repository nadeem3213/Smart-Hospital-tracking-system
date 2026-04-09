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
import { useNavigate } from "react-router-dom";
import { API_BASE } from "@/config";

interface CaseRecord {
  caseId: string;
  type: string;
  hospital: string;
  time: string;
  status: "Completed" | "In Progress" | "Pending";
}

// Mock cases removed. Data is fetched dynamically.

const statusConfig: Record<string, { icon: typeof CheckCircle; className: string }> = {
  Completed: { icon: CheckCircle, className: "bg-success/10 text-success border-success/30" },
  "In Progress": { icon: Loader2, className: "bg-warning/10 text-warning border-warning/30" },
  Pending: { icon: AlertTriangle, className: "bg-primary/10 text-primary border-primary/30" },
};

const UserActivityTable = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/visits`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch");
      })
      .then((data) => {
        if (data.cases) {
          setCases(data.cases);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
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
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6">
                <div className="flex flex-col items-center justify-center text-muted-foreground text-sm">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                  Loading dispatch records...
                </div>
              </TableCell>
            </TableRow>
          ) : cases.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-6 text-muted-foreground text-sm">
                No active records found.
              </TableCell>
            </TableRow>
          ) : (
            cases.map((record) => {
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
                  <div 
                    onClick={() => navigate("/routing", { state: { selectedHospital: record.hospital } })}
                    className="flex items-center gap-1.5 cursor-pointer group/hosp"
                  >
                    <Hospital className="h-3.5 w-3.5 text-muted-foreground group-hover/hosp:text-secondary transition-colors" />
                    <span className="text-sm text-foreground group-hover/hosp:text-secondary group-hover/hosp:underline transition-all">
                      {record.hospital}
                    </span>
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
            })
          )}
        </TableBody>
      </Table>
    </motion.div>
  );
};

export default UserActivityTable;
