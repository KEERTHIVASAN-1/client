import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  DoorOpen,
  BedDouble,
  IndianRupee,
  UserCheck,
  UserX,
  ClipboardList,
  AlertTriangle,
  Eye,
  Clock,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KPICard } from "@/components/common/KPICard";
import { BlockCard } from "@/components/common/BlockCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { dashboardService } from "@/services/dashboardService";
import type { AdminDashboardStats, MonthlyChartData } from "@shared/schema";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const CHART_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [chartData, setChartData] = useState<MonthlyChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [statsData, charts] = await Promise.all([
        dashboardService.getAdminStats(),
        dashboardService.getMonthlyChartData(),
      ]);
      setStats(statsData);
      setChartData(charts);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const occupancyData = stats
    ? stats.blockStats.map((b) => ({
        name: `Block ${b.block}`,
        students: b.studentCount,
      }))
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-semibold text-foreground" data-testid="text-dashboard-title">
              Admin Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Overview of hostel management system
            </p>
          </div>
          <Button variant="outline" onClick={loadData} data-testid="button-refresh-dashboard">
            Refresh
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                title="Total Students"
                value={stats.totalStudents}
                icon={Users}
                trend={{ value: 5, isPositive: true }}
                iconClassName="bg-blue-500/10 text-blue-500"
              />
              <KPICard
                title="Total Rooms"
                value={stats.totalRooms}
                icon={DoorOpen}
                iconClassName="bg-emerald-500/10 text-emerald-500"
              />
              <KPICard
                title="Available Beds"
                value={stats.availableBeds}
                icon={BedDouble}
                iconClassName="bg-amber-500/10 text-amber-500"
              />
              <KPICard
                title="Pending Fees"
                value={`${stats.pendingFees.toLocaleString("en-IN")}`}
                icon={IndianRupee}
                trend={{ value: 12, isPositive: false }}
                iconClassName="bg-red-500/10 text-red-500"
              />
              <KPICard
                title="Today's Attendance"
                value={`${stats.todayAttendancePercentage}%`}
                icon={UserCheck}
                trend={{ value: 2, isPositive: true }}
                iconClassName="bg-green-500/10 text-green-500"
              />
              <KPICard
                title="Visitors Today"
                value={stats.visitorCountToday}
                icon={Eye}
                iconClassName="bg-purple-500/10 text-purple-500"
              />
              <KPICard
                title="Active Leaves"
                value={stats.activeLeaveRequests}
                icon={Clock}
                iconClassName="bg-orange-500/10 text-orange-500"
              />
              <KPICard
                title="Open Complaints"
                value={stats.openComplaints}
                icon={AlertTriangle}
                trend={{ value: 8, isPositive: false }}
                iconClassName="bg-rose-500/10 text-rose-500"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Block Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {stats.blockStats.map((blockStat) => (
                      <BlockCard
                        key={blockStat.block}
                        block={blockStat.block}
                        studentCount={blockStat.studentCount}
                        roomCount={blockStat.roomCount}
                        wardenName={blockStat.wardenName}
                        wardenMobile={blockStat.wardenMobile}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Attendance Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="month"
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                          domain={[0, 100]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "hsl(var(--foreground))" }}
                        />
                        <Line
                          type="monotone"
                          dataKey="attendance"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: "#10b981", strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Fee Collection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis
                          dataKey="month"
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "hsl(var(--foreground))" }}
                          formatter={(value) => [`₹${Number(value).toLocaleString("en-IN")}`, "Collected"]}
                        />
                        <Bar dataKey="fees" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-medium">Students by Block</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={occupancyData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={4}
                          dataKey="students"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={{ stroke: "hsl(var(--muted-foreground))" }}
                        >
                          {occupancyData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "hsl(var(--foreground))" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Failed to load dashboard data
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
