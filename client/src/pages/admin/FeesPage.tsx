import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { IndianRupee, Plus, CreditCard } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { feeService } from "@/services/feeService";
import { BLOCKS, insertFeeSchema, type Fee, type Block, type FeeStatus, type InsertFee } from "@shared/schema";

export default function FeesPage() {
  const { toast } = useToast();
  const [fees, setFees] = useState<Fee[]>([]);
  const [stats, setStats] = useState<{ total: number; paid: number; pending: number; overdue: number } | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [blockFilter, setBlockFilter] = useState<Block | "all">("all");
  const [statusFilter, setStatusFilter] = useState<FeeStatus | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const createForm = useForm<InsertFee>({
    resolver: zodResolver(insertFeeSchema),
    defaultValues: {
      studentId: "",
      totalAmount: 0,
      dueDate: new Date().toISOString().split("T")[0],
    },
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [feesResponse, statsData] = await Promise.all([
        feeService.getAll({
          page,
          pageSize,
          search: search || undefined,
          block: blockFilter !== "all" ? blockFilter : undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
        }),
        feeService.getStats(),
      ]);
      setFees(feesResponse.data);
      setTotal(feesResponse.total);
      setStats(statsData);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load fees", variant: "destructive" });
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

  const openCreateDialog = () => {
    createForm.reset({
      studentId: "",
      totalAmount: 0,
      dueDate: new Date().toISOString().split("T")[0],
    });
    setIsCreateOpen(true);
  };

  const handleCreateFee = async (data: InsertFee) => {
    setIsSubmitting(true);
    try {
      await feeService.create(data);
      toast({ title: "Success", description: "Fee record created" });
      setIsCreateOpen(false);
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create fee", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPaymentDialog = (fee: Fee) => {
    setSelectedFee(fee);
    setPaymentAmount("");
    setIsPaymentOpen(true);
  };

  const editForm = useForm<{ totalAmount: number; dueDate: string; status: FeeStatus }>({
    defaultValues: {
      totalAmount: 0,
      dueDate: new Date().toISOString().split("T")[0],
      status: "pending",
    },
  });

  const openEditDialog = (fee: Fee) => {
    setSelectedFee(fee);
    editForm.reset({
      totalAmount: fee.totalAmount,
      dueDate: fee.dueDate,
      status: fee.status,
    });
    setIsEditOpen(true);
  };

  const handleEditFee = async (data: { totalAmount: number; dueDate: string; status: FeeStatus }) => {
    if (!selectedFee) return;
    setIsSubmitting(true);
    try {
      await feeService.update(selectedFee.id, data);
      toast({ title: "Success", description: "Fee updated" });
      setIsEditOpen(false);
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update fee", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteDialog = (fee: Fee) => {
    setSelectedFee(fee);
    setIsDeleteOpen(true);
  };

  const handleDeleteFee = async () => {
    if (!selectedFee) return;
    setIsSubmitting(true);
    try {
      await feeService.delete(selectedFee.id);
      toast({ title: "Success", description: "Fee deleted" });
      setIsDeleteOpen(false);
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete fee", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedFee || !paymentAmount) return;
    const amount = Number(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Error", description: "Enter a valid amount", variant: "destructive" });
      return;
    }
    const remaining = selectedFee.totalAmount - selectedFee.paidAmount;
    if (amount > remaining) {
      toast({ title: "Error", description: `Maximum payable amount is ₹${remaining.toLocaleString("en-IN")}`, variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await feeService.recordPayment(selectedFee.id, amount);
      toast({ title: "Success", description: "Payment recorded successfully" });
      setIsPaymentOpen(false);
      loadData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to record payment", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Fee>[] = [
    {
      key: "studentIdNumber",
      header: "Student ID",
      render: (fee) => (
        <span className="font-mono text-sm font-medium">{fee.studentIdNumber}</span>
      ),
    },
    {
      key: "studentName",
      header: "Name",
      render: (fee) => <span className="font-medium">{fee.studentName}</span>,
    },
    {
      key: "block",
      header: "Block",
      render: (fee) => <Badge variant="outline">Block {fee.block}</Badge>,
    },
    {
      key: "totalAmount",
      header: "Total",
      render: (fee) => (
        <span className="font-medium">₹{fee.totalAmount.toLocaleString("en-IN")}</span>
      ),
    },
    {
      key: "paidAmount",
      header: "Paid",
      render: (fee) => (
        <span className="text-green-600 dark:text-green-400">₹{fee.paidAmount.toLocaleString("en-IN")}</span>
      ),
    },
    {
      key: "pending",
      header: "Pending",
      render: (fee) => {
        const pending = fee.totalAmount - fee.paidAmount;
        return (
          <span className={pending > 0 ? "text-red-600 dark:text-red-400" : ""}>
            ₹{pending.toLocaleString("en-IN")}
          </span>
        );
      },
    },
    {
      key: "dueDate",
      header: "Due Date",
      render: (fee) => (
        <span className="text-sm text-muted-foreground">
          {new Date(fee.dueDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (fee) => <StatusBadge status={fee.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (fee) => (
        <div className="flex items-center justify-end gap-2">
          {fee.status !== "paid" && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                openPaymentDialog(fee);
              }}
              data-testid={`button-payment-${fee.id}`}
            >
              <CreditCard className="w-3.5 h-3.5 mr-1" />
              Pay
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              openEditDialog(fee);
            }}
            data-testid={`button-edit-${fee.id}`}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={(e) => {
              e.stopPropagation();
              openDeleteDialog(fee);
            }}
            data-testid={`button-delete-${fee.id}`}
          >
            Delete
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
        >
          <h1 className="text-2xl font-semibold text-foreground">Fee Management</h1>
          <p className="text-sm text-muted-foreground">Track and manage student fees</p>
          <div className="mt-4">
            <Button onClick={openCreateDialog} data-testid="button-add-fee">
              <Plus className="w-4 h-4 mr-2" />
              Add Fee
            </Button>
          </div>
        </motion.div>

        {stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total Fees"
              value={`₹${stats.total.toLocaleString("en-IN")}`}
              icon={IndianRupee}
              iconClassName="bg-blue-500/10 text-blue-500"
            />
            <KPICard
              title="Collected"
              value={`₹${stats.paid.toLocaleString("en-IN")}`}
              icon={CreditCard}
              iconClassName="bg-green-500/10 text-green-500"
            />
            <KPICard
              title="Pending"
              value={`₹${stats.pending.toLocaleString("en-IN")}`}
              icon={IndianRupee}
              iconClassName="bg-amber-500/10 text-amber-500"
            />
            <KPICard
              title="Overdue"
              value={`₹${stats.overdue.toLocaleString("en-IN")}`}
              icon={IndianRupee}
              iconClassName="bg-red-500/10 text-red-500"
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
              data={fees}
              total={total}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              onSearch={handleSearch}
              searchPlaceholder="Search by name or ID..."
              isLoading={isLoading}
              getRowKey={(f) => f.id}
              filters={
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={blockFilter}
                    onValueChange={(v) => {
                      setBlockFilter(v as Block | "all");
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-32" data-testid="select-fee-block-filter">
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
                      setStatusFilter(v as FeeStatus | "all");
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-32" data-testid="select-fee-status-filter">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              }
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Record a payment for {selectedFee?.studentName}
            </DialogDescription>
          </DialogHeader>
          {selectedFee && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Amount</span>
                  <p className="font-medium">₹{selectedFee.totalAmount.toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Already Paid</span>
                  <p className="font-medium text-green-600 dark:text-green-400">
                    ₹{selectedFee.paidAmount.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Pending</span>
                  <p className="font-medium text-red-600 dark:text-red-400">
                    ₹{(selectedFee.totalAmount - selectedFee.paidAmount).toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Due Date</span>
                  <p className="font-medium">{new Date(selectedFee.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="pl-8"
                    data-testid="input-payment-amount"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePayment} disabled={isSubmitting || !paymentAmount} data-testid="button-confirm-payment">
              {isSubmitting ? "Processing..." : "Record Payment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Fee</DialogTitle>
            <DialogDescription>Assign fee details to a student</DialogDescription>
          </DialogHeader>
          <form onSubmit={createForm.handleSubmit(handleCreateFee)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID *</Label>
              <Input
                id="studentId"
                placeholder="e.g., HSTL2025A001 or Mongo _id"
                {...createForm.register("studentId")}
                className="font-mono"
                data-testid="input-fee-student-id"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total Amount *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="totalAmount"
                  type="number"
                  placeholder="Enter total amount"
                  {...createForm.register("totalAmount", { valueAsNumber: true })}
                  className="pl-8"
                  data-testid="input-fee-total"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                {...createForm.register("dueDate")}
                data-testid="input-fee-due"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} data-testid="button-create-fee">
                {isSubmitting ? "Saving..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Fee</DialogTitle>
            <DialogDescription>Update fee details</DialogDescription>
          </DialogHeader>
          <form onSubmit={editForm.handleSubmit(handleEditFee)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editTotal">Total Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                <Input
                  id="editTotal"
                  type="number"
                  {...editForm.register("totalAmount", { valueAsNumber: true })}
                  className="pl-8"
                  data-testid="input-edit-fee-total"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDue">Due Date</Label>
              <Input id="editDue" type="date" {...editForm.register("dueDate")} data-testid="input-edit-fee-due" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={editForm.watch("status")} onValueChange={(v) => editForm.setValue("status", v as FeeStatus)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} data-testid="button-update-fee">{isSubmitting ? "Saving..." : "Update"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Fee</DialogTitle>
            <DialogDescription>Confirm deletion of this fee record</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteFee} disabled={isSubmitting} data-testid="button-confirm-delete">{isSubmitting ? "Deleting..." : "Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
