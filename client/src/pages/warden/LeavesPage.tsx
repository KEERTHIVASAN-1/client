import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Check, X, Calendar } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/store";
import { leaveService } from "@/services/leaveService";
import type { Leave, LeaveStatus } from "@shared/schema";

export default function LeavesPage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadLeaves = useCallback(async () => {
    if (!user?.block) return;
    setIsLoading(true);
    try {
      const response = await leaveService.getAll({
        page,
        pageSize,
        block: user.block,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      setLeaves(response.data);
      setTotal(response.total);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load leaves", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, statusFilter, user?.block, toast]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  const handleStatusUpdate = async (status: LeaveStatus) => {
    if (!selectedLeave) return;
    setIsSubmitting(true);
    try {
      await leaveService.updateStatus(selectedLeave.id, status);
      toast({ title: "Success", description: `Leave request ${status}` });
      setIsDetailOpen(false);
      loadLeaves();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update leave status", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start).toLocaleDateString();
    const endDate = new Date(end).toLocaleDateString();
    return startDate === endDate ? startDate : `${startDate} - ${endDate}`;
  };

  const getDays = (start: string, end: string) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const columns: Column<Leave>[] = [
    {
      key: "studentIdNumber",
      header: "Student ID",
      render: (leave) => (
        <span className="font-mono text-sm font-medium">{leave.studentIdNumber}</span>
      ),
    },
    {
      key: "studentName",
      header: "Name",
      render: (leave) => <span className="font-medium">{leave.studentName}</span>,
    },
    {
      key: "dates",
      header: "Duration",
      render: (leave) => (
        <div className="flex flex-col">
          <span className="text-sm">{formatDateRange(leave.startDate, leave.endDate)}</span>
          <span className="text-xs text-muted-foreground">{getDays(leave.startDate, leave.endDate)} day(s)</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (leave) => <StatusBadge status={leave.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (leave) => (
        leave.status === "pending" && (
          <div className="flex items-center justify-end gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="text-green-600"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLeave(leave);
                handleStatusUpdate("approved");
              }}
              data-testid={`button-approve-${leave.id}`}
            >
              <Check className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLeave(leave);
                handleStatusUpdate("rejected");
              }}
              data-testid={`button-reject-${leave.id}`}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-semibold text-foreground">Leave Requests</h1>
          <p className="text-sm text-muted-foreground">Block {user?.block} leave applications</p>
        </motion.div>

        <Card>
          <CardContent className="p-6">
            <DataTable
              columns={columns}
              data={leaves}
              total={total}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              isLoading={isLoading}
              onRowClick={(leave) => {
                setSelectedLeave(leave);
                setIsDetailOpen(true);
              }}
              getRowKey={(l) => l.id}
              filters={
                <Select
                  value={statusFilter}
                  onValueChange={(v) => {
                    setStatusFilter(v as LeaveStatus | "all");
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-32" data-testid="select-leave-status-filter">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              }
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>Review leave application</DialogDescription>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{selectedLeave.studentName}</p>
                  <p className="font-mono text-sm text-muted-foreground">{selectedLeave.studentIdNumber}</p>
                </div>
                <StatusBadge status={selectedLeave.status} />
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Room</span>
                  <p className="font-medium">{selectedLeave.roomNumber || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration</span>
                  <p className="font-medium">{getDays(selectedLeave.startDate, selectedLeave.endDate)} day(s)</p>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Reason</span>
                <p className="text-sm mt-1 p-3 bg-muted/50 rounded-lg">{selectedLeave.reason}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedLeave?.status === "pending" ? (
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleStatusUpdate("rejected")}
                  disabled={isSubmitting}
                  data-testid="button-dialog-reject"
                >
                  <X className="w-4 h-4 mr-1" />
                  Reject
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleStatusUpdate("approved")}
                  disabled={isSubmitting}
                  data-testid="button-dialog-approve"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Approve
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
