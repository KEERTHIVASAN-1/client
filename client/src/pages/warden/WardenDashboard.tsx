import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, DoorOpen, UserCheck, UserX, Clock, ClipboardList, Eye } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KPICard } from "@/components/common/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/lib/store";
import { dashboardService } from "@/services/dashboardService";
import { notificationService } from "@/services/notificationService";
import type { Notification, Block } from "@shared/schema";
import type { WardenDashboardStats } from "@shared/schema";

export default function WardenDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<WardenDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadStats();
    loadNotifications();
  }, [user?.block]);

  const loadStats = async () => {
    if (!user?.block) return;
    setIsLoading(true);
    try {
      const data = await dashboardService.getWardenStats(user.block);
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotifications = async () => {
    if (!user?.block) return;
    try {
      const data = await notificationService.getForWarden(user.id, user.block as Block);
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const attendancePercentage = stats
    ? Math.round((stats.presentToday / (stats.presentToday + stats.absentToday || 1)) * 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-semibold text-foreground">
            Block {user?.block} Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user?.name}
          </p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Total Students"
            value={stats?.totalStudents || 0}
            icon={Users}
            description="In your block"
            data-testid="kpi-total-students"
          />
          <KPICard
            title="Total Rooms"
            value={stats?.totalRooms || 0}
            icon={DoorOpen}
            description="Under management"
            data-testid="kpi-total-rooms"
          />
          <KPICard
            title="Present Today"
            value={stats?.presentToday || 0}
            icon={UserCheck}
            description={`${attendancePercentage}% attendance`}
            trend="up"
            data-testid="kpi-present-today"
          />
          <KPICard
            title="Absent Today"
            value={stats?.absentToday || 0}
            icon={UserX}
            description={`${stats?.pendingAttendance || 0} pending`}
            trend={stats?.absentToday && stats.absentToday > 5 ? "down" : "neutral"}
            data-testid="kpi-absent-today"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-primary" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-amber-500" />
                      <span>Pending Attendance</span>
                    </div>
                    <span className="font-semibold" data-testid="text-pending-attendance">
                      {stats?.pendingAttendance || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <ClipboardList className="w-5 h-5 text-blue-500" />
                      <span>Active Leaves</span>
                    </div>
                    <span className="font-semibold" data-testid="text-active-leaves">
                      {stats?.activeLeaves || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-green-500" />
                      <span>Visitors Today</span>
                    </div>
                    <span className="font-semibold" data-testid="text-visitors-today">
                      {stats?.visitorsToday || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Attendance Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${attendancePercentage * 3.52} 352`}
                        className="text-primary"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold" data-testid="text-attendance-percentage">
                        {attendancePercentage}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span>Present: {stats?.presentToday || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted" />
                    <span>Absent: {stats?.absentToday || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Recent Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No notifications</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.slice(0, 6).map((n) => (
                      <div key={n.id} className="p-3 rounded-lg border">
                        <p className="font-medium">{n.title}</p>
                        <p className="text-sm text-muted-foreground">{n.message}</p>
                        <span className="text-xs text-muted-foreground font-mono">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
