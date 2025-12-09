import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Calendar, UserCheck, UserX } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, Column } from "@/components/common/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/store";
import { attendanceService } from "@/services/attendanceService";
import type { Attendance } from "@shared/schema";

export default function AttendancePage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  const loadAttendance = useCallback(async () => {
    if (!user?.studentId) return;
    setIsLoading(true);
    try {
      const data = await attendanceService.getByStudent(user.studentId, month);
      setAttendance(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load attendance", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user?.studentId, month, toast]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const presentCount = attendance.filter(a => a.status === "present").length;
  const absentCount = attendance.filter(a => a.status === "absent").length;
  const percentage = attendance.length > 0 
    ? Math.round((presentCount / attendance.length) * 100) 
    : 0;

  const columns: Column<Attendance>[] = [
    {
      key: "date",
      header: "Date",
      render: (a) => (
        <span className="font-medium">{new Date(a.date).toLocaleDateString()}</span>
      ),
    },
    {
      key: "day",
      header: "Day",
      render: (a) => (
        <span className="text-muted-foreground">
          {new Date(a.date).toLocaleDateString("en-US", { weekday: "long" })}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (a) => (
        <Badge
          variant={a.status === "present" ? "default" : "destructive"}
          className={a.status === "present" ? "bg-green-500/10 text-green-600 border-green-500/20" : ""}
        >
          {a.status === "present" ? (
            <><UserCheck className="w-3 h-3 mr-1" /> Present</>
          ) : (
            <><UserX className="w-3 h-3 mr-1" /> Absent</>
          )}
        </Badge>
      ),
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
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
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-semibold text-foreground">My Attendance</h1>
            <p className="text-sm text-muted-foreground">View your attendance records</p>
          </div>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 rounded-md border bg-background"
            data-testid="input-attendance-month"
          />
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Present</p>
                  <p className="text-2xl font-bold text-green-500" data-testid="text-present-count">{presentCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <UserX className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Absent</p>
                  <p className="text-2xl font-bold text-red-500" data-testid="text-absent-count">{absentCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Percentage</p>
                  <p className="text-2xl font-bold" data-testid="text-percentage">{percentage}%</p>
                </div>
              </div>
              <Badge variant={percentage >= 75 ? "default" : "destructive"}>
                {percentage >= 75 ? "Good" : "Low"}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={attendance}
              total={attendance.length}
              page={1}
              pageSize={31}
              onPageChange={() => {}}
              onPageSizeChange={() => {}}
              isLoading={isLoading}
              getRowKey={(a) => a.id}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
