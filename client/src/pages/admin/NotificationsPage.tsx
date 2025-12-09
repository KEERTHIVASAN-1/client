import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Bell, Send, Users, Building2, User, Search, Trash2 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, Column } from "@/components/common/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/store";
import { notificationService } from "@/services/notificationService";
import { studentService } from "@/services/studentService";
import { BLOCKS, type Notification, type Block } from "@shared/schema";

type TargetType = "all_students" | "block_students" | "all_wardens" | "block_warden" | "individual";

const TARGET_LABELS: Record<TargetType, string> = {
  all_students: "All Students",
  block_students: "Block Students",
  all_wardens: "All Wardens",
  block_warden: "Block Warden",
  individual: "Individual",
};

export default function NotificationsPage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetType: "all_students" as TargetType,
    targetBlock: "" as Block | "",
    targetId: "",
    targetIdSearch: "",
    targetName: "",
  });

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await notificationService.getAll({ page, pageSize });
      setNotifications(response.data);
      setTotal(response.total);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load notifications", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, toast]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const resetForm = () => {
    setFormData({
      title: "",
      message: "",
      targetType: "all_students",
      targetBlock: "",
      targetId: "",
      targetIdSearch: "",
      targetName: "",
    });
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      toast({ title: "Error", description: "Title and message are required", variant: "destructive" });
      return;
    }

    if ((formData.targetType === "block_students" || formData.targetType === "block_warden") && !formData.targetBlock) {
      toast({ title: "Error", description: "Please select a block", variant: "destructive" });
      return;
    }

    if (formData.targetType === "individual" && !formData.targetId) {
      toast({ title: "Error", description: "Please select a student", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await notificationService.create(
        {
          title: formData.title,
          message: formData.message,
          targetType: formData.targetType,
          targetBlock: formData.targetBlock ? (formData.targetBlock as Block) : undefined,
          targetId: formData.targetType === "individual" ? formData.targetId : undefined,
        },
        user?.id || "admin",
        user?.name || "Admin"
      );
      toast({ title: "Success", description: "Notification sent successfully" });
      setIsDialogOpen(false);
      resetForm();
      loadNotifications();
    } catch (error) {
      toast({ title: "Error", description: "Failed to send notification", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const searchStudent = async () => {
    if (!formData.targetIdSearch.trim()) {
      toast({ title: "Error", description: "Enter a Student ID to search", variant: "destructive" });
      return;
    }
    try {
      const student = await studentService.searchByStudentId(formData.targetIdSearch.trim());
      if (!student) {
        toast({ title: "Not Found", description: "No active student found with that ID", variant: "destructive" });
        setFormData(prev => ({ ...prev, targetId: "", targetName: "" }));
        return;
      }
      setFormData(prev => ({ ...prev, targetId: student.id, targetName: `${student.name} (${student.studentId})` }));
      toast({ title: "Selected", description: `Target set to ${student.name}` });
    } catch {
      toast({ title: "Error", description: "Failed to search student", variant: "destructive" });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getTargetIcon = (type: TargetType) => {
    switch (type) {
      case "all_students":
      case "all_wardens":
        return <Users className="w-4 h-4" />;
      case "block_students":
      case "block_warden":
        return <Building2 className="w-4 h-4" />;
      case "individual":
        return <User className="w-4 h-4" />;
    }
  };

  const columns: Column<Notification>[] = [
    {
      key: "title",
      header: "Title",
      render: (n) => <span className="font-medium">{n.title}</span>,
    },
    {
      key: "message",
      header: "Message",
      render: (n) => (
        <span className="text-sm text-muted-foreground truncate max-w-64 block">{n.message}</span>
      ),
    },
    {
      key: "target",
      header: "Recipients",
      render: (n) => (
        <div className="flex items-center gap-2">
          {getTargetIcon(n.targetType)}
          <span className="text-sm">{TARGET_LABELS[n.targetType]}</span>
          {n.targetBlock && (
            <Badge variant="outline">Block {n.targetBlock}</Badge>
          )}
        </div>
      ),
    },
    {
      key: "sentBy",
      header: "Sent By",
      render: (n) => <span className="text-sm">{n.sentByName}</span>,
    },
    {
      key: "createdAt",
      header: "Date",
      render: (n) => <span className="text-sm text-muted-foreground">{formatDate(n.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      render: (n) => (
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            className="text-red-600"
            onClick={async () => {
              try {
                await notificationService.delete(n.id);
                toast({ title: "Deleted", description: "Notification deleted" });
                loadNotifications();
              } catch (error) {
                toast({ title: "Error", description: "Failed to delete notification", variant: "destructive" });
              }
            }}
            data-testid={`button-delete-${n.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
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
            <h1 className="text-2xl font-semibold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">Send and manage notifications</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} data-testid="button-new-notification">
            <Bell className="w-4 h-4 mr-2" />
            Send Notification
          </Button>
        </motion.div>

        <Card>
          <CardContent className="p-6">
            <DataTable
              columns={columns}
              data={notifications}
              total={total}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              searchPlaceholder="Search notifications..."
              isLoading={isLoading}
              getRowKey={(n) => n.id}
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>
              Create and send a new notification
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Notification title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                data-testid="input-notification-title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your message..."
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={4}
                data-testid="input-notification-message"
              />
            </div>

            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select
                value={formData.targetType}
                onValueChange={(v) => setFormData(prev => ({ ...prev, targetType: v as TargetType, targetBlock: "", targetId: "", targetName: "", targetIdSearch: "" }))}
              >
                <SelectTrigger data-testid="select-target-type">
                  <SelectValue placeholder="Select recipients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all_students">All Students</SelectItem>
                  <SelectItem value="block_students">Students in Block</SelectItem>
                  <SelectItem value="all_wardens">All Wardens</SelectItem>
                  <SelectItem value="block_warden">Warden of Block</SelectItem>
                  <SelectItem value="individual">Specific Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.targetType === "block_students" || formData.targetType === "block_warden") && (
              <div className="space-y-2">
                <Label>Select Block</Label>
                <Select
                  value={formData.targetBlock}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, targetBlock: v as Block }))}
                >
                  <SelectTrigger data-testid="select-target-block">
                    <SelectValue placeholder="Select block" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOCKS.map((b) => (
                      <SelectItem key={b} value={b}>Block {b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.targetType === "individual" && (
              <div className="space-y-2">
                <Label>Specific Student</Label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Enter Student ID (e.g., HSTL2025A001)"
                    value={formData.targetIdSearch}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetIdSearch: e.target.value }))}
                    data-testid="input-target-student-id"
                  />
                  <Button variant="outline" onClick={searchStudent} data-testid="button-search-student">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
                {formData.targetName && (
                  <p className="text-sm text-muted-foreground">Selected: {formData.targetName}</p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} data-testid="button-send-notification">
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? "Sending..." : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
