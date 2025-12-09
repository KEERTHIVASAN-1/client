import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Calendar, Plus, Clock, Check, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/store";
import { leaveService } from "@/services/leaveService";
import { insertLeaveSchema, type Leave, type InsertLeave } from "@shared/schema";

export default function LeavePage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InsertLeave>({
    resolver: zodResolver(insertLeaveSchema),
    defaultValues: {
      startDate: "",
      endDate: "",
      reason: "",
    },
  });

  const loadLeaves = useCallback(async () => {
    if (!user?.studentId) return;
    setIsLoading(true);
    try {
      const data = await leaveService.getByStudent(user.studentId);
      setLeaves(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load leaves", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user?.studentId, toast]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  const onSubmit = async (data: InsertLeave) => {
    if (!user?.studentId) return;
    setIsSubmitting(true);
    try {
      await leaveService.create(user.studentId, data);
      toast({ title: "Success", description: "Leave request submitted" });
      setIsDialogOpen(false);
      form.reset();
      loadLeaves();
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit leave request", variant: "destructive" });
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

  const pendingCount = leaves.filter(l => l.status === "pending").length;
  const approvedCount = leaves.filter(l => l.status === "approved").length;

  const columns: Column<Leave>[] = [
    {
      key: "dates",
      header: "Duration",
      render: (leave) => (
        <div className="flex flex-col">
          <span className="font-medium">{formatDateRange(leave.startDate, leave.endDate)}</span>
          <span className="text-xs text-muted-foreground">{getDays(leave.startDate, leave.endDate)} day(s)</span>
        </div>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      render: (leave) => (
        <span className="text-sm truncate max-w-64 block">{leave.reason}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (leave) => <StatusBadge status={leave.status} />,
    },
    {
      key: "approvedBy",
      header: "Processed By",
      render: (leave) => (
        <span className="text-sm text-muted-foreground">{leave.approvedBy || "-"}</span>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Leave Requests</h1>
            <p className="text-sm text-muted-foreground">Apply for and track leaves</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} data-testid="button-apply-leave">
            <Plus className="w-4 h-4 mr-2" />
            Apply for Leave
          </Button>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold" data-testid="text-pending-count">{pendingCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-500" data-testid="text-approved-count">{approvedCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold" data-testid="text-total-count">{leaves.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Leave History</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={leaves}
              total={leaves.length}
              page={1}
              pageSize={10}
              onPageChange={() => {}}
              onPageSizeChange={() => {}}
              isLoading={isLoading}
              getRowKey={(l) => l.id}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
            <DialogDescription>Submit a new leave request</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-start-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-end-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter reason for leave..."
                        rows={4}
                        {...field}
                        data-testid="input-reason"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} data-testid="button-submit-leave">
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
