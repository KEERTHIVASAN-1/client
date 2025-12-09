import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, DoorOpen, Users, RefreshCcw } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { roomService } from "@/services/roomService";
import { BLOCKS, insertRoomSchema, type Room, type InsertRoom, type Block } from "@shared/schema";
import { z } from "zod";

const formSchema = insertRoomSchema.extend({
  floor: z.coerce.number().min(0, "Floor must be 0 or greater"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1").max(4, "Maximum capacity is 4"),
});

export default function RoomsPage() {
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [blockFilter, setBlockFilter] = useState<Block | "all">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<InsertRoom>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomNumber: "",
      block: "A",
      floor: 0,
      capacity: 2,
    },
  });

  const loadRooms = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await roomService.getAll({
        page,
        pageSize,
        search: search || undefined,
        block: blockFilter !== "all" ? blockFilter : undefined,
      });
      setRooms(response.data);
      setTotal(response.total);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load rooms", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, search, blockFilter, toast]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const openAddForm = () => {
    setSelectedRoom(null);
    form.reset({
      roomNumber: "",
      block: "A",
      floor: 0,
      capacity: 2,
    });
    setIsFormOpen(true);
  };

  const openEditForm = (room: Room) => {
    setSelectedRoom(room);
    form.reset({
      roomNumber: room.roomNumber,
      block: room.block,
      floor: room.floor,
      capacity: room.capacity,
    });
    setIsFormOpen(true);
  };

  const openDeleteDialog = (room: Room) => {
    setSelectedRoom(room);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (data: InsertRoom) => {
    setIsSubmitting(true);
    try {
      if (selectedRoom) {
        await roomService.update(selectedRoom.id, data);
        toast({ title: "Success", description: "Room updated successfully" });
      } else {
        await roomService.create(data);
        toast({ title: "Success", description: "Room added successfully" });
      }
      setIsFormOpen(false);
      loadRooms();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to save room", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRoom) return;
    setIsSubmitting(true);
    try {
      await roomService.delete(selectedRoom.id);
      toast({ title: "Success", description: "Room deleted successfully" });
      setIsDeleteOpen(false);
      loadRooms();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete room", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: Column<Room>[] = [
    {
      key: "roomNumber",
      header: "Room Number",
      render: (room) => (
        <div className="flex items-center gap-2">
          <DoorOpen className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">{room.roomNumber}</span>
        </div>
      ),
    },
    {
      key: "block",
      header: "Block",
      render: (room) => <Badge variant="outline">Block {room.block}</Badge>,
    },
    {
      key: "floor",
      header: "Floor",
      render: (room) => <span>{room.floor === 0 ? "Ground" : `Floor ${room.floor}`}</span>,
    },
    {
      key: "occupancy",
      header: "Occupancy",
      render: (room) => {
        const percentage = (room.occupied / room.capacity) * 100;
        return (
          <div className="flex items-center gap-3 min-w-32">
            <Progress value={percentage} className="h-2 flex-1" />
            <span className="text-sm font-medium whitespace-nowrap">
              {room.occupied}/{room.capacity}
            </span>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      render: (room) => {
        if (room.occupied >= room.capacity) {
          return <Badge variant="secondary">Full</Badge>;
        }
        return <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">Available</Badge>;
      },
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (room) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              openEditForm(room);
            }}
            data-testid={`button-edit-room-${room.id}`}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              openDeleteDialog(room);
            }}
            disabled={room.occupied > 0}
            data-testid={`button-delete-room-${room.id}`}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
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
            <h1 className="text-2xl font-semibold text-foreground">Rooms</h1>
            <p className="text-sm text-muted-foreground">Manage hostel rooms and occupancy</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={loadRooms} data-testid="button-refresh-rooms">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={openAddForm} data-testid="button-add-room">
              <Plus className="w-4 h-4 mr-2" />
              Add Room
            </Button>
          </div>
        </motion.div>

        <Card>
          <CardContent className="p-6">
            <DataTable
              columns={columns}
              data={rooms}
              total={total}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              onSearch={handleSearch}
              searchPlaceholder="Search by room number..."
              isLoading={isLoading}
              getRowKey={(r) => r.id}
              filters={
                <Select
                  value={blockFilter}
                  onValueChange={(v) => {
                    setBlockFilter(v as Block | "all");
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-32" data-testid="select-room-block-filter">
                    <SelectValue placeholder="Block" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Blocks</SelectItem>
                    {BLOCKS.map((b) => (
                      <SelectItem key={b} value={b}>Block {b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              }
            />
          </CardContent>
        </Card>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedRoom ? "Edit Room" : "Add Room"}</DialogTitle>
            <DialogDescription>
              {selectedRoom ? "Update room details" : "Enter room information"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="roomNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., A101" {...field} data-testid="input-room-number" />
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
                          <SelectTrigger data-testid="select-room-block">
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
                  name="floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor *</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} data-testid="input-room-floor" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity *</FormLabel>
                    <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
                      <FormControl>
                        <SelectTrigger data-testid="select-room-capacity">
                          <SelectValue placeholder="Select capacity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 Bed</SelectItem>
                        <SelectItem value="2">2 Beds</SelectItem>
                        <SelectItem value="3">3 Beds</SelectItem>
                        <SelectItem value="4">4 Beds</SelectItem>
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
                <Button type="submit" disabled={isSubmitting} data-testid="button-save-room">
                  {isSubmitting ? "Saving..." : selectedRoom ? "Update" : "Add"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Room</DialogTitle>
            <DialogDescription>
              {selectedRoom?.occupied && selectedRoom.occupied > 0
                ? `Room ${selectedRoom?.roomNumber} has ${selectedRoom?.occupied} student(s). Remove students first.`
                : `Are you sure you want to delete room ${selectedRoom?.roomNumber}?`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting || (selectedRoom?.occupied ?? 0) > 0}
              data-testid="button-confirm-delete-room"
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
