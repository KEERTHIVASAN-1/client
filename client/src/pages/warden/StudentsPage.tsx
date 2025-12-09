import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, Phone, Mail, MapPin } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, Column } from "@/components/common/DataTable";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/lib/store";
import { studentService } from "@/services/studentService";
import type { Student } from "@shared/schema";

export default function StudentsPage() {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const loadStudents = useCallback(async () => {
    if (!user?.block) return;
    setIsLoading(true);
    try {
      const response = await studentService.getAll({
        page,
        pageSize,
        search: search || undefined,
        block: user.block,
      });
      setStudents(response.data);
      setTotal(response.total);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load students", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, user?.block, toast]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const openDetail = (student: Student) => {
    setSelectedStudent(student);
    setIsDrawerOpen(true);
  };

  const columns: Column<Student>[] = [
    {
      key: "studentId",
      header: "Student ID",
      render: (s) => <span className="font-mono text-sm font-medium">{s.studentId}</span>,
    },
    {
      key: "name",
      header: "Name",
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs font-medium">{s.name.charAt(0)}</span>
          </div>
          <span className="font-medium">{s.name}</span>
        </div>
      ),
    },
    {
      key: "room",
      header: "Room",
      render: (s) => <Badge variant="outline">{s.roomNumber || "Not Assigned"}</Badge>,
    },
    {
      key: "mobile",
      header: "Mobile",
      render: (s) => <span className="text-sm">{s.mobile}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (s) => (
        <Badge variant={s.status === "active" ? "default" : "secondary"}>
          {s.status === "active" ? "Active" : "Removed"}
        </Badge>
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
          <h1 className="text-2xl font-semibold text-foreground">Block {user?.block} Students</h1>
          <p className="text-sm text-muted-foreground">View students in your block</p>
        </motion.div>

        <Card>
          <CardContent className="p-6">
            <DataTable
              columns={columns}
              data={students}
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
              onRowClick={openDetail}
              getRowKey={(s) => s.id}
            />
          </CardContent>
        </Card>
      </div>

      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Student Details</SheetTitle>
            <SheetDescription>View student information</SheetDescription>
          </SheetHeader>
          
          {selectedStudent && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl font-medium">{selectedStudent.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedStudent.name}</h3>
                  <p className="font-mono text-sm text-muted-foreground">{selectedStudent.studentId}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{selectedStudent.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{selectedStudent.mobile}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{selectedStudent.address}</span>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Room</p>
                  <p className="font-medium">{selectedStudent.roomNumber || "Not Assigned"}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Bed</p>
                  <p className="font-medium">{selectedStudent.bedNumber || "-"}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Parent Mobile</p>
                  <p className="font-medium">{selectedStudent.parentMobile}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">Admission Date</p>
                  <p className="font-medium">{new Date(selectedStudent.admissionDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}
