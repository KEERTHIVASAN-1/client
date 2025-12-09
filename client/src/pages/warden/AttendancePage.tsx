import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Calendar, Save, UserCheck, UserX } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/store";
import { attendanceService } from "@/services/attendanceService";
import { studentService } from "@/services/studentService";
import type { Student, AttendanceRecord, AttendanceStatus } from "@shared/schema";

export default function AttendancePage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);

  const loadData = useCallback(async () => {
    if (!user?.block) return;
    setIsLoading(true);
    try {
      const [studentsRes, attendanceRes] = await Promise.all([
        studentService.getAll({ block: user.block, pageSize: 200 }),
        attendanceService.getByDate(date, user.block),
      ]);
      
      setStudents(studentsRes.data.filter(s => s.status === "active"));
      
      const attendanceMap: Record<string, AttendanceStatus> = {};
      if (attendanceRes.length > 0) {
        setHasExisting(true);
        attendanceRes.forEach(a => {
          attendanceMap[a.studentId] = a.status;
        });
      } else {
        setHasExisting(false);
        studentsRes.data.filter(s => s.status === "active").forEach(s => {
          attendanceMap[s.id] = "present";
        });
      }
      setAttendance(attendanceMap);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user?.block, date, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleAttendance = (studentId: string) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: prev[studentId] === "present" ? "absent" : "present",
    }));
  };

  const markAllPresent = () => {
    const newAttendance: Record<string, AttendanceStatus> = {};
    students.forEach(s => {
      newAttendance[s.id] = "present";
    });
    setAttendance(newAttendance);
  };

  const handleSave = async () => {
    if (!user?.block || !user?.id) return;
    
    setIsSaving(true);
    try {
      const records: AttendanceRecord[] = students.map(s => ({
        studentId: s.id,
        studentIdNumber: s.studentId,
        studentName: s.name,
        roomNumber: s.roomNumber || "",
        status: attendance[s.id] || "present",
      }));
      
      await attendanceService.markBulkAttendance(user.block, date, records, user.id);
      toast({ title: "Success", description: "Attendance saved successfully" });
      setHasExisting(true);
    } catch (error) {
      toast({ title: "Error", description: "Failed to save attendance", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const presentCount = Object.values(attendance).filter(s => s === "present").length;
  const absentCount = Object.values(attendance).filter(s => s === "absent").length;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
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
            <h1 className="text-2xl font-semibold text-foreground">Mark Attendance</h1>
            <p className="text-sm text-muted-foreground">Block {user?.block} attendance management</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-40"
              data-testid="input-attendance-date"
            />
            <Button variant="outline" onClick={markAllPresent} data-testid="button-mark-all-present">
              <UserCheck className="w-4 h-4 mr-2" />
              All Present
            </Button>
            <Button onClick={handleSave} disabled={isSaving} data-testid="button-save-attendance">
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
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
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="text-lg font-semibold">{new Date(date).toLocaleDateString()}</p>
                </div>
              </div>
              {hasExisting && <Badge variant="secondary">Updated</Badge>}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {students.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="flex items-center justify-between p-3 rounded-lg hover-elevate border"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">{student.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{student.studentId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{student.roomNumber || "No Room"}</Badge>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${attendance[student.id] === "present" ? "text-green-500" : "text-red-500"}`}>
                        {attendance[student.id] === "present" ? "Present" : "Absent"}
                      </span>
                      <Switch
                        checked={attendance[student.id] === "present"}
                        onCheckedChange={() => toggleAttendance(student.id)}
                        data-testid={`switch-attendance-${student.id}`}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
              {students.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No students in this block</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
