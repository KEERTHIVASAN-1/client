import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Eye, Clock, LogIn, LogOut } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, Column } from "@/components/common/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/store";
import { visitorService } from "@/services/visitorService";
import type { Visitor } from "@shared/schema";

export default function VisitorsPage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadVisitors = useCallback(async () => {
    if (!user?.studentId) return;
    setIsLoading(true);
    try {
      const data = await visitorService.getByStudent(user.studentId);
      setVisitors(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load visitors", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user?.studentId, toast]);

  useEffect(() => {
    loadVisitors();
  }, [loadVisitors]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

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
      key: "purpose",
      header: "Purpose",
      render: (v) => <span className="text-sm">{v.purpose}</span>,
    },
    {
      key: "date",
      header: "Date",
      render: (v) => <span className="text-sm">{formatDate(v.inTime)}</span>,
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
          <Badge variant="secondary">Still Inside</Badge>
        )
      ),
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
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
          <h1 className="text-2xl font-semibold text-foreground">My Visitors</h1>
          <p className="text-sm text-muted-foreground">View your visitor history</p>
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Visitor History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {visitors.length > 0 ? (
              <DataTable
                columns={columns}
                data={visitors}
                total={visitors.length}
                page={1}
                pageSize={10}
                onPageChange={() => {}}
                onPageSizeChange={() => {}}
                isLoading={isLoading}
                getRowKey={(v) => v.id}
              />
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No visitor records found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
