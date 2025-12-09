import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, Users, UserCheck, UserX } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatusBadge } from "@/components/common/StatusBadge";
import { KPICard } from "@/components/common/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { attendanceService } from "@/services/attendanceService";
import { BLOCKS, type Attendance, type Block } from "@shared/schema";

export default function AttendancePage() {
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [stats, setStats] = useState<{ totalDays: number; averageAttendance: number; presentCount: number; absentCount: number } | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [blockFilter, setBlockFilter] = useState<Block | "all">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [records, statsData] = await Promise.all([
          attendanceService.getByDate(
            selectedDate,
            blockFilter !== "all" ? blockFilter : undefined
          ),
          attendanceService.getStats(
            blockFilter !== "all" ? blockFilter : undefined,
            selectedDate.substring(0, 7)
          ),
        ]);
        setAttendance(records);
        setStats(statsData);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load attendance", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [selectedDate, blockFilter, toast]);

  const presentCount = attendance.filter(a => a.status === "present").length;
  const absentCount = attendance.filter(a => a.status === "absent").length;
  const attendancePercentage = attendance.length > 0 
    ? Math.round((presentCount / attendance.length) * 100) 
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-semibold text-foreground">Attendance</h1>
          <p className="text-sm text-muted-foreground">View daily attendance records</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Students"
            value={attendance.length}
            icon={Users}
            iconClassName="bg-blue-500/10 text-blue-500"
          />
          <KPICard
            title="Present Today"
            value={presentCount}
            icon={UserCheck}
            iconClassName="bg-green-500/10 text-green-500"
          />
          <KPICard
            title="Absent Today"
            value={absentCount}
            icon={UserX}
            iconClassName="bg-red-500/10 text-red-500"
          />
          <KPICard
            title="Attendance Rate"
            value={`${attendancePercentage}%`}
            icon={Calendar}
            iconClassName="bg-purple-500/10 text-purple-500"
          />
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-base font-medium">Attendance Records</CardTitle>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="date" className="text-sm">Date:</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-40"
                    data-testid="input-attendance-date"
                  />
                </div>
                <Select
                  value={blockFilter}
                  onValueChange={(v) => setBlockFilter(v as Block | "all")}
                >
                  <SelectTrigger className="w-32" data-testid="select-attendance-block">
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
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Student ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Block</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Marked By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-5 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : attendance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        No attendance records for this date
                      </TableCell>
                    </TableRow>
                  ) : (
                    attendance.map((record, index) => (
                      <TableRow
                        key={record.id}
                        className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
                      >
                        <TableCell className="font-mono text-sm">{record.studentIdNumber}</TableCell>
                        <TableCell className="font-medium">{record.studentName}</TableCell>
                        <TableCell><Badge variant="outline">Block {record.block}</Badge></TableCell>
                        <TableCell>{record.roomNumber}</TableCell>
                        <TableCell><StatusBadge status={record.status} /></TableCell>
                        <TableCell className="text-muted-foreground text-sm">{record.markedBy}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
