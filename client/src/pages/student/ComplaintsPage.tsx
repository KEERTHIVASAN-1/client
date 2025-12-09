import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Plus, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { complaintService } from "@/services/complaintService";
import { insertComplaintSchema, COMPLAINT_CATEGORIES, type Complaint, type InsertComplaint, type ComplaintCategory } from "@shared/schema";

const CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  mess: "Mess/Food",
  room: "Room",
  cleanliness: "Cleanliness",
  safety: "Safety",
  other: "Other",
};

export default function ComplaintsPage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const form = useForm<InsertComplaint>({
    resolver: zodResolver(insertComplaintSchema),
    defaultValues: {
      category: "other",
      title: "",
      description: "",
    },
  });

  const loadComplaints = useCallback(async () => {
    if (!user?.studentId) return;
    setIsLoading(true);
    try {
      const data = await complaintService.getByStudent(user.studentId);
      setComplaints(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load complaints", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user?.studentId, toast]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const onSubmit = async (data: InsertComplaint) => {
    if (!user?.studentId) return;
    setIsSubmitting(true);
    try {
      await complaintService.create(user.studentId, data);
      toast({ title: "Success", description: "Complaint submitted successfully" });
      setIsDialogOpen(false);
      form.reset();
      loadComplaints();
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit complaint", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCount = complaints.filter(c => c.status === "new").length;
  const inProgressCount = complaints.filter(c => c.status === "in_progress").length;
  const resolvedCount = complaints.filter(c => c.status === "resolved").length;

  const columns: Column<Complaint>[] = [
    {
      key: "complaintId",
      header: "ID",
      render: (c) => <span className="font-mono text-sm">{c.complaintId}</span>,
    },
    {
      key: "title",
      header: "Title",
      render: (c) => <span className="font-medium">{c.title}</span>,
    },
    {
      key: "category",
      header: "Category",
      render: (c) => <Badge variant="outline">{CATEGORY_LABELS[c.category]}</Badge>,
    },
    {
      key: "status",
      header: "Status",
      render: (c) => <StatusBadge status={c.status} />,
    },
    {
      key: "createdAt",
      header: "Date",
      render: (c) => (
        <span className="text-sm text-muted-foreground">
          {new Date(c.createdAt).toLocaleDateString()}
        </span>
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
            <h1 className="text-2xl font-semibold text-foreground">My Complaints</h1>
            <p className="text-sm text-muted-foreground">Submit and track complaints</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} data-testid="button-new-complaint">
            <Plus className="w-4 h-4 mr-2" />
            New Complaint
          </Button>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-2xl font-bold" data-testid="text-open-count">{openCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-500" data-testid="text-progress-count">{inProgressCount}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold text-green-500" data-testid="text-resolved-count">{resolvedCount}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Complaint History</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={complaints}
              total={complaints.length}
              page={1}
              pageSize={10}
              onPageChange={() => {}}
              onPageSizeChange={() => {}}
              isLoading={isLoading}
              onRowClick={(c) => setSelectedComplaint(c)}
              getRowKey={(c) => c.id}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Complaint</DialogTitle>
            <DialogDescription>Submit a new complaint</DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COMPLAINT_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{CATEGORY_LABELS[cat]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief title..." {...field} data-testid="input-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your complaint in detail..."
                        rows={4}
                        {...field}
                        data-testid="input-description"
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
                <Button type="submit" disabled={isSubmitting} data-testid="button-submit-complaint">
                  {isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complaint Details</DialogTitle>
            <DialogDescription>{selectedComplaint?.complaintId}</DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{CATEGORY_LABELS[selectedComplaint.category]}</Badge>
                <StatusBadge status={selectedComplaint.status} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Title</p>
                <p className="font-medium">{selectedComplaint.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="text-sm mt-1 p-3 bg-muted/50 rounded-lg">{selectedComplaint.description}</p>
              </div>
              {selectedComplaint.adminNote && (
                <div>
                  <p className="text-sm text-muted-foreground">Admin Response</p>
                  <p className="text-sm mt-1 p-3 bg-primary/5 rounded-lg border border-primary/10">
                    {selectedComplaint.adminNote}
                  </p>
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                Submitted: {new Date(selectedComplaint.createdAt).toLocaleString()}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedComplaint(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
