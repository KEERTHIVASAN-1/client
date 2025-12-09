import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, LogIn, LogOut, Users } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, Column } from "@/components/common/DataTable";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { visitorService } from "@/services/visitorService";
import { BLOCKS, insertVisitorSchema, type Visitor, type InsertVisitor, type Block } from "@shared/schema";

export default function VisitorsPage() {
  const { toast } = useToast();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [blockFilter, setBlockFilter] = useState<Block | "all">("all");
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InsertVisitor>({
    resolver: zodResolver(insertVisitorSchema),
    defaultValues: {
      visitorName: "",
      studentIdNumber: "",
      purpose: "",
    },
  });

  const loadVisitors = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await visitorService.getAll({
        page,
        pageSize,
        search: search || undefined,
        block: blockFilter !== "all" ? blockFilter : undefined,
        date: dateFilter || undefined,
      });
      setVisitors(response.data);
      setTotal(response.total);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load visitors", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, blockFilter, dateFilter, toast]);

  useEffect(() => {
    loadVisitors();
  }, [loadVisitors]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const openCheckIn = () => {
    form.reset({
      visitorName: "",
      studentIdNumber: "",
      purpose: "",
    });
    setIsCheckInOpen(true);
  };

  const handleCheckIn = async (data: InsertVisitor) => {
    setIsSubmitting(true);
    try {
      await visitorService.checkIn(data);
      toast({ title: "Success", description: "Visitor checked in successfully" });
      setIsCheckInOpen(false);
      loadVisitors();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to check in visitor", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async (visitor: Visitor) => {
    try {
      await visitorService.checkOut(visitor.id);
      toast({ title: "Success", description: "Visitor checked out successfully" });
      loadVisitors();
    } catch (error) {
      toast({ title: "Error", description: "Failed to check out visitor", variant: "destructive" });
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const columns: Column<Visitor>[] = [
    {
      key: "visitorName",
      header: "Visitor Name",
      render: (visitor) => <span className="font-medium">{visitor.visitorName}</span>,
    },
    {
      key: "studentIdNumber",
      header: "Student ID",
      render: (visitor) => (
        <span className="font-mono text-sm">{visitor.studentIdNumber}</span>
      ),
    },
    {
      key: "studentName",
      header: "Student Name",
      render: (visitor) => <span>{visitor.studentName}</span>,
    },
    {
      key: "block",
      header: "Block",
      render: (visitor) => <Badge variant="outline">Block {visitor.block}</Badge>,
    },
    {
      key: "purpose",
      header: "Purpose",
      render: (visitor) => (
        <span className="text-sm truncate max-w-40 block">{visitor.purpose}</span>
      ),
    },
    {
      key: "inTime",
      header: "In Time",
      render: (visitor) => (
        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
          <LogIn className="w-3.5 h-3.5" />
          <span className="text-sm">{formatTime(visitor.inTime)}</span>
        </div>
      ),
    },
    {
      key: "outTime",
      header: "Out Time",
      render: (visitor) =>
        visitor.outTime ? (
          <div className="flex items-center gap-1 text-muted-foreground">
            <LogOut className="w-3.5 h-3.5" />
            <span className="text-sm">{formatTime(visitor.outTime)}</span>
          </div>
        ) : (
          <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
            In Hostel
          </Badge>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (visitor) =>
        !visitor.outTime && (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handleCheckOut(visitor);
            }}
            data-testid={`button-checkout-${visitor.id}`}
          >
            <LogOut className="w-3.5 h-3.5 mr-1" />
            Check Out
          </Button>
        ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Visitors</h1>
            <p className="text-sm text-muted-foreground">Manage visitor check-in/out</p>
          </div>
          <Button onClick={openCheckIn} data-testid="button-checkin-visitor">
            <Plus className="w-4 h-4 mr-2" />
            Check In Visitor
          </Button>
        </motion.div>

        <Card>
          <CardContent className="p-6">
            <DataTable
              columns={columns}
              data={visitors}
              total={total}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              onSearch={handleSearch}
              searchPlaceholder="Search visitor or student..."
              isLoading={isLoading}
              getRowKey={(v) => v.id}
              filters={
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => {
                      setDateFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-40"
                    data-testid="input-visitor-date"
                  />
                  <Select
                    value={blockFilter}
                    onValueChange={(v) => {
                      setBlockFilter(v as Block | "all");
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-32" data-testid="select-visitor-block-filter">
                      <SelectValue placeholder="Block" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Blocks</SelectItem>
                      {BLOCKS.map((b) => (
                        <SelectItem key={b} value={b}>Block {b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              }
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Check In Visitor</DialogTitle>
            <DialogDescription>
              Enter visitor details
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCheckIn)} className="space-y-4">
              <FormField
                control={form.control}
                name="visitorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visitor Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter visitor name" {...field} data-testid="input-visitor-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="studentIdNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student ID *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., HSTL2025A001" {...field} className="font-mono" data-testid="input-student-id" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose of Visit *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter purpose" {...field} data-testid="input-purpose" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCheckInOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} data-testid="button-confirm-checkin">
                  {isSubmitting ? "Checking In..." : "Check In"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
