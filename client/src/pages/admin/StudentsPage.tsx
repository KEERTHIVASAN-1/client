import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Building2,
  BedDouble,
  Calendar,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { studentService } from "@/services/studentService";
import { roomService } from "@/services/roomService";
import { BLOCKS, insertStudentSchema, type Student, type InsertStudent, type Block, type Room } from "@shared/schema";

export default function StudentsPage() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [blockFilter, setBlockFilter] = useState<Block | "all">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);

  const form = useForm<InsertStudent>({
    resolver: zodResolver(insertStudentSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      parentMobile: "",
      address: "",
      block: "A",
      admissionDate: new Date().toISOString().split("T")[0],
      roomId: undefined,
    },
  });

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await studentService.getAll({
        page,
        pageSize,
        search: search || undefined,
        block: blockFilter !== "all" ? blockFilter : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });
      setStudents(response.data);
      setTotal(response.total);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load students", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, blockFilter, statusFilter, toast]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const loadAvailableRooms = useCallback(async () => {
    try {
      const rooms = await roomService.getAvailable();
      setAvailableRooms(rooms);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load available rooms", variant: "destructive" });
    }
  }, [toast]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const openAddForm = () => {
    setSelectedStudent(null);
    form.reset({
      name: "",
      email: "",
      mobile: "",
      parentMobile: "",
      address: "",
      block: "A",
      admissionDate: new Date().toISOString().split("T")[0],
      roomId: undefined,
    });
    loadAvailableRooms();
    setIsFormOpen(true);
  };

  const openEditForm = (student: Student) => {
    setSelectedStudent(student);
    form.reset({
      name: student.name,
      email: student.email,
      mobile: student.mobile,
      parentMobile: student.parentMobile,
      address: student.address,
      block: student.block,
      admissionDate: student.admissionDate,
      roomId: student.roomId,
    });
    loadAvailableRooms();
    setIsFormOpen(true);
  };

  const openProfile = (student: Student) => {
    setSelectedStudent(student);
    setIsProfileOpen(true);
  };

  const openDeleteDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (data: InsertStudent) => {
    setIsSubmitting(true);
    try {
      if (selectedStudent) {
        await studentService.update(selectedStudent.id, data);
        if (data.roomId && data.roomId !== selectedStudent.roomId) {
          const room = availableRooms.find(r => r.id === data.roomId);
          if (room) {
            const bedNumber = Math.min(room.occupied + 1, room.capacity);
            await studentService.allocateRoom(selectedStudent.id, room.id, room.roomNumber, bedNumber);
          }
        }
        toast({ title: "Success", description: "Student updated successfully" });
      } else {
        await studentService.create(data);
        toast({ title: "Success", description: "Student added successfully" });
      }
      setIsFormOpen(false);
      loadStudents();
    } catch (error) {
      toast({ title: "Error", description: "Failed to save student", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    setIsSubmitting(true);
    try {
      await studentService.removeFromHostel(selectedStudent.id);
      toast({ title: "Success", description: "Student removed from hostel" });
      setIsDeleteOpen(false);
      loadStudents();
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove student", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Student>[] = [
    {
      key: "studentId",
      header: "Student ID",
      render: (student) => (
        <span className="font-mono text-sm font-medium" data-testid={`text-studentid-${student.id}`}>
          {student.studentId}
        </span>
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (student) => (
        <div className="flex flex-col">
          <span className="font-medium">{student.name}</span>
          <span className="text-xs text-muted-foreground">{student.email}</span>
        </div>
      ),
    },
    {
      key: "block",
      header: "Block",
      render: (student) => <Badge variant="outline">Block {student.block}</Badge>,
    },
    {
      key: "roomNumber",
      header: "Room",
      render: (student) => (
        <span className="text-sm">{student.roomNumber || "-"}</span>
      ),
    },
    {
      key: "mobile",
      header: "Mobile",
      render: (student) => <span className="text-sm">{student.mobile}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (student) => <StatusBadge status={student.status} />,
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (student) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              openEditForm(student);
            }}
            data-testid={`button-edit-${student.id}`}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          {student.status === "active" && (
            <Button
              size="icon"
              variant="ghost"
              className="text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                openDeleteDialog(student);
              }}
              data-testid={`button-delete-${student.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Students</h1>
            <p className="text-sm text-muted-foreground">Manage hostel students</p>
          </div>
          <Button onClick={openAddForm} data-testid="button-add-student">
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
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
              searchPlaceholder="Search by name, ID, or room..."
              isLoading={isLoading}
              onRowClick={openProfile}
              getRowKey={(s) => s.id}
              filters={
                <div className="flex flex-wrap items-center gap-2">
                  <Select
                    value={blockFilter}
                    onValueChange={(v) => {
                      setBlockFilter(v as Block | "all");
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-32" data-testid="select-block-filter">
                      <SelectValue placeholder="Block" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Blocks</SelectItem>
                      {BLOCKS.map((b) => (
                        <SelectItem key={b} value={b}>Block {b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={statusFilter}
                    onValueChange={(v) => {
                      setStatusFilter(v);
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="w-32" data-testid="select-status-filter">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="removed">Removed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              }
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedStudent ? "Edit Student" : "Add Student"}</DialogTitle>
            <DialogDescription>
              {selectedStudent ? "Update student information" : "Enter student details"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} data-testid="input-student-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="email@example.com" {...field} data-testid="input-student-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mobile *</FormLabel>
                      <FormControl>
                        <Input placeholder="Mobile number" {...field} data-testid="input-student-mobile" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="parentMobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Mobile *</FormLabel>
                    <FormControl>
                      <Input placeholder="Parent mobile number" {...field} data-testid="input-parent-mobile" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter full address" {...field} data-testid="input-student-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="block"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Block *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-student-block">
                            <SelectValue placeholder="Select block" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BLOCKS.map((b) => (
                            <SelectItem key={b} value={b}>Block {b}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="admissionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admission Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-admission-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room (optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger data-testid="select-student-room">
                          <SelectValue placeholder="Select available room" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableRooms.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {`Block ${r.block} - ${r.roomNumber} (${r.capacity - r.occupied} available)`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} data-testid="button-save-student">
                  {isSubmitting ? "Saving..." : selectedStudent ? "Update" : "Add"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Student Profile
            </SheetTitle>
            <SheetDescription>View student details</SheetDescription>
          </SheetHeader>
          {selectedStudent && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedStudent.name}</h3>
                  <p className="font-mono text-sm text-muted-foreground">{selectedStudent.studentId}</p>
                </div>
                <StatusBadge status={selectedStudent.status} />
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm">{selectedStudent.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Mobile</p>
                    <p className="text-sm">{selectedStudent.mobile}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Parent Mobile</p>
                    <p className="text-sm">{selectedStudent.parentMobile}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="text-sm">{selectedStudent.address}</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Block</p>
                    <p className="text-sm">Block {selectedStudent.block}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <BedDouble className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Room</p>
                    <p className="text-sm">{selectedStudent.roomNumber || "Not assigned"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Admission Date</p>
                    <p className="text-sm">{new Date(selectedStudent.admissionDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="flex-1" variant="outline" onClick={() => openEditForm(selectedStudent)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                {selectedStudent.status === "active" && (
                  <Button className="flex-1" variant="destructive" onClick={() => openDeleteDialog(selectedStudent)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Student</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedStudent?.name} from the hostel? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting} data-testid="button-confirm-delete">
              {isSubmitting ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
