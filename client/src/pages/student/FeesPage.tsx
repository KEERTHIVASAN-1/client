import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { CreditCard, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, Column } from "@/components/common/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/store";
import { feeService } from "@/services/feeService";
import type { Fee } from "@shared/schema";

export default function FeesPage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [fees, setFees] = useState<Fee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFees = useCallback(async () => {
    if (!user?.studentId) return;
    setIsLoading(true);
    try {
      const response = await feeService.getAll({ studentId: user.studentId });
      setFees(response.data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load fees", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user?.studentId, toast]);

  useEffect(() => {
    loadFees();
  }, [loadFees]);

  const currentFee = fees[0];
  const paidPercentage = currentFee 
    ? Math.round((currentFee.paidAmount / currentFee.totalAmount) * 100) 
    : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "overdue":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const columns: Column<Fee>[] = [
    {
      key: "dueDate",
      header: "Due Date",
      render: (f) => (
        <span className="font-medium">{new Date(f.dueDate).toLocaleDateString()}</span>
      ),
    },
    {
      key: "totalAmount",
      header: "Total Amount",
      render: (f) => <span className="font-medium">{f.totalAmount.toLocaleString()}</span>,
    },
    {
      key: "paidAmount",
      header: "Paid",
      render: (f) => (
        <span className="text-green-600 dark:text-green-400">{f.paidAmount.toLocaleString()}</span>
      ),
    },
    {
      key: "pending",
      header: "Pending",
      render: (f) => (
        <span className="text-amber-600 dark:text-amber-400">
          {(f.totalAmount - f.paidAmount).toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (f) => (
        <Badge
          variant={f.status === "paid" ? "default" : f.status === "overdue" ? "destructive" : "secondary"}
          className={f.status === "paid" ? "bg-green-500/10 text-green-600 border-green-500/20" : ""}
        >
          {getStatusIcon(f.status)}
          <span className="ml-1 capitalize">{f.status}</span>
        </Badge>
      ),
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-48" />
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-semibold text-foreground">Fee Status</h1>
          <p className="text-sm text-muted-foreground">View and track your fee payments</p>
        </motion.div>

        {currentFee && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Current Fee Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="p-4 rounded-lg bg-muted/50 text-center">
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-3xl font-bold" data-testid="text-total-fee">
                      {currentFee.totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/10 text-center">
                    <p className="text-sm text-green-600 dark:text-green-400">Paid</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400" data-testid="text-paid-fee">
                      {currentFee.paidAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-amber-500/10 text-center">
                    <p className="text-sm text-amber-600 dark:text-amber-400">Pending</p>
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400" data-testid="text-pending-fee">
                      {(currentFee.totalAmount - currentFee.paidAmount).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Payment Progress</span>
                    <span className="font-medium">{paidPercentage}%</span>
                  </div>
                  <Progress value={paidPercentage} className="h-3" />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Due Date</p>
                      <p className="font-medium">{new Date(currentFee.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge
                    variant={currentFee.status === "paid" ? "default" : currentFee.status === "overdue" ? "destructive" : "secondary"}
                  >
                    {currentFee.status === "paid" ? "Paid" : currentFee.status === "overdue" ? "Overdue" : "Pending"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={fees}
                total={fees.length}
                page={1}
                pageSize={10}
                onPageChange={() => {}}
                onPageSizeChange={() => {}}
                isLoading={isLoading}
                getRowKey={(f) => f.id}
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
