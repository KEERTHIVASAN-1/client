import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Eye, Clock, LogIn, LogOut } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, Column } from "@/components/common/DataTable";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/store";
import { visitorService } from "@/services/visitorService";
import type { Visitor } from "@shared/schema";

export default function VisitorsPage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(true);

  const loadVisitors = useCallback(async () => {
    if (!user?.block) return;
    setIsLoading(true);
    try {
      const response = await visitorService.getAll({
        page,
        pageSize,
        block: user.block,
        date,
      });
      setVisitors(response.data);
      setTotal(response.total);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load visitors", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, date, user?.block, toast]);

  useEffect(() => {
    loadVisitors();
  }, [loadVisitors]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const columns: Column<Visitor>[] = [
    {
      key: "visitorName",
      header: "Visitor",
      render: (v) => <span className="font-medium">{v.visitorName}</span>,
    },
    {
      key: "student",
      header: "Visiting Student",
      render: (v) => (
        <div className="flex flex-col">
          <span className="text-sm">{v.studentName}</span>
          <span className="font-mono text-xs text-muted-foreground">{v.studentIdNumber}</span>
        </div>
      ),
    },
    {
      key: "purpose",
      header: "Purpose",
      render: (v) => <span className="text-sm">{v.purpose}</span>,
    },
    {
      key: "inTime",
      header: "In Time",
      render: (v) => (
        <div className="flex items-center gap-2">
          <LogIn className="w-4 h-4 text-green-500" />
          <span className="text-sm">{formatTime(v.inTime)}</span>
        </div>
      ),
    },
    {
      key: "outTime",
      header: "Out Time",
      render: (v) => (
        v.outTime ? (
          <div className="flex items-center gap-2">
            <LogOut className="w-4 h-4 text-blue-500" />
            <span className="text-sm">{formatTime(v.outTime)}</span>
          </div>
        ) : (
          <Badge variant="secondary">Inside</Badge>
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
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Visitor Log</h1>
            <p className="text-sm text-muted-foreground">Block {user?.block} visitor records</p>
          </div>
          <Input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setPage(1);
            }}
            className="w-40"
            data-testid="input-visitor-date"
          />
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
              searchPlaceholder="Search visitors..."
              isLoading={isLoading}
              getRowKey={(v) => v.id}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
