import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, MessageSquare, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { KPICard } from "@/components/common/KPICard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { complaintService } from "@/services/complaintService";
import { BLOCKS, COMPLAINT_CATEGORIES, type Complaint, type Block, type ComplaintStatus, type ComplaintCategory } from "@shared/schema";

const categoryLabels: Record<ComplaintCategory, string> = {
  mess: "Mess",
  room: "Room",
  cleanliness: "Cleanliness",
  safety: "Safety",
  other: "Other",
};

export default function ComplaintsPage() {
  const { toast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<{ new: number; inProgress: number; resolved: number; total: number } | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [blockFilter, setBlockFilter] = useState<Block | "all">("all");
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [newStatus, setNewStatus] = useState<ComplaintStatus>("in_progress");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [complaintsResponse, statsData] = await Promise.all([
        complaintService.getAll({
          page,
          pageSize,
          search: search || undefined,
          block: blockFilter !== "all" ? blockFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
        }),
        complaintService.getStats(),
      ]);
      setComplaints(complaintsResponse.data);
      setTotal(complaintsResponse.total);
      setStats(statsData);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load complaints", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, blockFilter, statusFilter, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const openDetail = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setAdminNote(complaint.adminNote || "");
    setNewStatus(complaint.status === "new" ? "in_progress" : complaint.status);
    setIsDetailOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedComplaint) return;
    setIsSubmitting(true);
    try {
      await complaintService.updateStatus(selectedComplaint.id, newStatus, adminNote);
      toast({ title: "Success", description: "Complaint updated successfully" });
      setIsDetailOpen(false);
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update complaint", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Complaint>[] = [
    {
      key: "complaintId",
      header: "ID",
      render: (complaint) => (
        <span className="font-mono text-sm font-medium">{complaint.complaintId}</span>
      ),
    },
    {
      key: "studentIdNumber",
      header: "Student",
      render: (complaint) => (
        <div className="flex flex-col">
          <span className="font-medium">{complaint.studentName}</span>
          <span className="font-mono text-xs text-muted-foreground">{complaint.studentIdNumber}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (complaint) => (
        <Badge variant="outline">{categoryLabels[complaint.category]}</Badge>
      ),
    },
    {
      key: "title",
      header: "Title",
      render: (complaint) => (
        <span className="text-sm truncate max-w-48 block">{complaint.title}</span>
      ),
    },
    {
      key: "block",
      header: "Block",
      render: (complaint) => <Badge variant="outline">Block {complaint.block}</Badge>,
    },
    {
      key: "createdAt",
      header: "Date",
      render: (complaint) => (
        <span className="text-sm text-muted-foreground">
          {new Date(complaint.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (complaint) => <StatusBadge status={complaint.status} />,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-semibold text-foreground">Complaints</h1>
          <p className="text-sm text-muted-foreground">Manage student complaints</p>
        </motion.div>

        {stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total Complaints"
              value={stats.total}
              icon={MessageSquare}
              iconClassName="bg-blue-500/10 text-blue-500"
            />
            <KPICard
              title="New"
              value={stats.new}
              icon={AlertCircle}
              iconClassName="bg-amber-500/10 text-amber-500"
            />
            <KPICard
              title="In Progress"
              value={stats.inProgress}
              icon={Clock}
              iconClassName="bg-purple-500/10 text-purple-500"
            />
            <KPICard
              title="Resolved"
              value={stats.resolved}
              icon={CheckCircle}
              iconClassName="bg-green-500/10 text-green-500"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-16 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardContent className="p-6">
            <DataTable
              columns={columns}
              data={complaints}
              total={total}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              onSearch={handleSearch}
              searchPlaceholder="Search complaints..."
              isLoading={isLoading}
              onRowClick={openDetail}
              getRowKey={(c) => c.id}
              filters={
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={blockFilter}
                    onValueChange={(v) => {
                      setBlockFilter(v as Block | "all");
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-32" data-testid="select-complaint-block-filter">
                      <SelectValue placeholder="Block" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Blocks</SelectItem>
                      {BLOCKS.map((b) => (
                        <SelectItem key={b} value={b}>Block {b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={statusFilter}
                    onValueChange={(v) => {
                      setStatusFilter(v as ComplaintStatus | "all");
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-32" data-testid="select-complaint-status-filter">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              }
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
            <DialogDescription>
              View and update complaint status
            </DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-mono text-sm text-muted-foreground">{selectedComplaint.complaintId}</p>
                  <p className="font-medium">{selectedComplaint.title}</p>
                </div>
                <StatusBadge status={selectedComplaint.status} />
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Student</span>
                  <p className="font-medium">{selectedComplaint.studentName}</p>
                  <p className="font-mono text-xs text-muted-foreground">{selectedComplaint.studentIdNumber}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Contact</span>
                  <p className="font-medium">{selectedComplaint.studentMobile}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Block / Room</span>
                  <p className="font-medium">Block {selectedComplaint.block} - {selectedComplaint.roomNumber}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Category</span>
                  <p className="font-medium">{categoryLabels[selectedComplaint.category]}</p>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Description</span>
                <p className="text-sm mt-1 p-3 bg-muted/50 rounded-lg">{selectedComplaint.description}</p>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Update Status</Label>
                  <Select value={newStatus} onValueChange={(v) => setNewStatus(v as ComplaintStatus)}>
                    <SelectTrigger data-testid="select-new-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Admin Note</Label>
                  <Textarea
                    placeholder="Add a note..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    data-testid="input-admin-note"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={isSubmitting} data-testid="button-update-complaint">
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
