import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Home, Users, Calendar, CreditCard, Bell, Phone, DoorOpen } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KPICard } from "@/components/common/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/lib/store";
import { dashboardService } from "@/services/dashboardService";
import { notificationService } from "@/services/notificationService";
import type { Notification, Block } from "@shared/schema";
import type { StudentDashboardStats } from "@shared/schema";

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  useEffect(() => {
    loadStats();
    loadNotifications();
    if (window.location.hash === "#notifications") {
      setShowAllNotifications(true);
      setTimeout(() => {
        const el = document.getElementById("student-notifications-section");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 50);
    }
  }, [user?.studentId]);

  const loadStats = async () => {
    if (!user?.studentId) return;
    setIsLoading(true);
    try {
      const data = await dashboardService.getStudentStats(user.studentId);
      setStats(data);
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotifications = async () => {
    if (!user?.studentId || !user?.block) return;
    try {
      const data = await notificationService.getForStudent(user.studentId, user.block as Block);
      setNotifications(data);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  };

  const markRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      await loadNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead(user?.id || "");
      await loadNotifications();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
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

  const feePercentage = stats ? Math.round((stats.paidFee / stats.totalFee) * 100) : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Welcome, {stats?.name || user?.name}
            </h1>
            <p className="font-mono text-sm text-muted-foreground" data-testid="text-student-id">
              {stats?.studentId || user?.studentId}
            </p>
          </div>
          {stats?.unreadNotifications && stats.unreadNotifications > 0 && (
            <Badge className="self-start">
              <Bell className="w-3 h-3 mr-1" />
              {stats.unreadNotifications} new notifications
            </Badge>
          )}
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KPICard
            title="Monthly Attendance"
            value={`${stats?.monthlyAttendancePercentage || 0}%`}
            icon={Calendar}
            description={stats?.todayAttendance === "present" ? "Present today" : stats?.todayAttendance === "absent" ? "Absent today" : "Not marked"}
            trend={stats?.monthlyAttendancePercentage && stats.monthlyAttendancePercentage >= 75 ? "up" : "down"}
            data-testid="kpi-attendance"
          />
          <KPICard
            title="Fee Status"
            value={`${feePercentage}%`}
            icon={CreditCard}
            description={`Pending: ${stats?.pendingFee?.toLocaleString() || 0}`}
            trend={stats?.pendingFee === 0 ? "up" : "down"}
            data-testid="kpi-fee"
          />
          <KPICard
            title="Active Leaves"
            value={stats?.pendingLeaves || 0}
            icon={Calendar}
            description={`Total: ${stats?.totalLeaves || 0}`}
            data-testid="kpi-leaves"
          />
          <KPICard
            title="Room"
            value={stats?.roomNumber || "N/A"}
            icon={DoorOpen}
            description={`Block ${stats?.block}, Floor ${stats?.floor || 0}`}
            data-testid="kpi-room"
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
                  <Home className="w-5 h-5 text-primary" />
                  Room Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Block</p>
                    <p className="text-lg font-semibold" data-testid="text-block">{stats?.block || "-"}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Room Number</p>
                    <p className="text-lg font-semibold" data-testid="text-room-number">{stats?.roomNumber || "-"}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Floor</p>
                    <p className="text-lg font-semibold">{stats?.floor || "-"}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-xs text-muted-foreground">Bed Number</p>
                    <p className="text-lg font-semibold">{stats?.bedNumber || "-"}</p>
                  </div>
                </div>
                {stats?.roommates && stats.roommates.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Roommates</p>
                    <div className="flex flex-wrap gap-2">
                      {stats.roommates.map((name, i) => (
                        <Badge key={i} variant="secondary">{name}</Badge>
                      ))}
                    </div>
                  </div>
                )}
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
                  Warden Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-medium">{stats?.wardenName?.charAt(0) || "W"}</span>
                  </div>
                  <div>
                    <p className="font-medium" data-testid="text-warden-name">{stats?.wardenName || "Not Assigned"}</p>
                    <p className="text-sm text-muted-foreground">Block {stats?.block} Warden</p>
                  </div>
                </div>
                {stats?.wardenMobile && (
                  <div className="flex items-center gap-3 p-3 rounded-lg border">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium" data-testid="text-warden-mobile">{stats.wardenMobile}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Fee Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground">Total Fee</p>
                  <p className="text-2xl font-bold" data-testid="text-total-fee">
                    {stats?.totalFee?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-green-500/10 text-center">
                  <p className="text-xs text-green-600 dark:text-green-400">Paid</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400" data-testid="text-paid-fee">
                    {stats?.paidFee?.toLocaleString() || 0}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-amber-500/10 text-center">
                  <p className="text-xs text-amber-600 dark:text-amber-400">Pending</p>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400" data-testid="text-pending-fee">
                    {stats?.pendingFee?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
              {stats?.dueDate && (
                <p className="text-sm text-muted-foreground text-center mt-4">
                  Due Date: <span className="font-medium">{new Date(stats.dueDate).toLocaleDateString()}</span>
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card id="student-notifications-section">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">No notifications</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2">
                    <button className="text-sm text-primary" onClick={() => setShowAllNotifications(true)}>
                      View all
                    </button>
                    <button className="text-sm" onClick={markAllRead}>
                      Mark all as read
                    </button>
                  </div>
                  {(showAllNotifications ? notifications : notifications.slice(0, 6)).map((n) => (
                    <div key={n.id} className="p-3 rounded-lg border flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{n.title}</p>
                        <p className="text-sm text-muted-foreground">{n.message}</p>
                        <span className="text-xs text-muted-foreground font-mono">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {!n.read && (
                        <button className="text-xs text-primary" onClick={() => markRead(n.id)}>
                          Mark as read
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
