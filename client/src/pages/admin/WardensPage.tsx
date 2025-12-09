import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Shield, Phone, Mail, Building2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { wardenService } from "@/services/wardenService";
import { BLOCKS, insertWardenSchema, type Warden, type InsertWarden, type Block } from "@shared/schema";

const blockColors: Record<Block, string> = {
  A: "bg-blue-500/10 text-blue-500",
  B: "bg-emerald-500/10 text-emerald-500",
  C: "bg-amber-500/10 text-amber-500",
  D: "bg-purple-500/10 text-purple-500",
};

export default function WardensPage() {
  const { toast } = useToast();
  const [wardens, setWardens] = useState<Warden[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedWarden, setSelectedWarden] = useState<Warden | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedBlocks, setAssignedBlocks] = useState<Block[]>([]);

  const form = useForm<InsertWarden>({
    resolver: zodResolver(insertWardenSchema),
    defaultValues: {
      name: "",
      email: "",
      mobile: "",
      block: "A",
    },
  });

  const loadWardens = async () => {
    setIsLoading(true);
    try {
      const data = await wardenService.getAll();
      setWardens(data);
      setAssignedBlocks(data.map(w => w.block));
    } catch (error) {
      toast({ title: "Error", description: "Failed to load wardens", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWardens();
  }, []);

  const getAvailableBlocks = () => {
    if (selectedWarden) {
      return BLOCKS.filter(b => b === selectedWarden.block || !assignedBlocks.includes(b));
    }
    return BLOCKS.filter(b => !assignedBlocks.includes(b));
  };

  const openAddForm = () => {
    const available = BLOCKS.filter(b => !assignedBlocks.includes(b));
    if (available.length === 0) {
      toast({ title: "Info", description: "All blocks already have wardens assigned" });
      return;
    }
    setSelectedWarden(null);
    form.reset({
      name: "",
      email: "",
      mobile: "",
      block: available[0],
    });
    setIsFormOpen(true);
  };

  const openEditForm = (warden: Warden) => {
    setSelectedWarden(warden);
    form.reset({
      name: warden.name,
      email: warden.email,
      mobile: warden.mobile,
      block: warden.block,
    });
    setIsFormOpen(true);
  };

  const openDeleteDialog = (warden: Warden) => {
    setSelectedWarden(warden);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async (data: InsertWarden) => {
    setIsSubmitting(true);
    try {
      if (selectedWarden) {
        await wardenService.update(selectedWarden.id, data);
        toast({ title: "Success", description: "Warden updated successfully" });
      } else {
        await wardenService.create(data);
        toast({ title: "Success", description: "Warden added successfully" });
      }
      setIsFormOpen(false);
      loadWardens();
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to save warden", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedWarden) return;
    setIsSubmitting(true);
    try {
      await wardenService.delete(selectedWarden.id);
      toast({ title: "Success", description: "Warden removed successfully" });
      setIsDeleteOpen(false);
      loadWardens();
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove warden", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Wardens</h1>
            <p className="text-sm text-muted-foreground">Manage block wardens (1 per block)</p>
          </div>
          <Button onClick={openAddForm} disabled={assignedBlocks.length >= 4} data-testid="button-add-warden">
            <Plus className="w-4 h-4 mr-2" />
            Add Warden
          </Button>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BLOCKS.map((b) => (
              <Card key={b}>
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BLOCKS.map((block) => {
              const warden = wardens.find(w => w.block === block);
              return (
                <motion.div
                  key={block}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="hover-elevate" data-testid={`card-warden-block-${block}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${blockColors[block]}`}>
                            <Building2 className="w-5 h-5" />
                          </div>
                          <CardTitle className="text-lg">Block {block}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {warden ? (
                        <>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                              <Shield className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{warden.name}</p>
                              <Badge variant="outline" className="text-xs">Warden</Badge>
                            </div>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="w-3.5 h-3.5" />
                              <span className="truncate">{warden.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="w-3.5 h-3.5" />
                              <span>{warden.mobile}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-2">
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => openEditForm(warden)} data-testid={`button-edit-warden-${block}`}>
                              <Edit2 className="w-3.5 h-3.5 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="destructive" className="flex-1" onClick={() => openDeleteDialog(warden)} data-testid={`button-delete-warden-${block}`}>
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <Shield className="w-10 h-10 text-muted-foreground/50 mb-2" />
                          <p className="text-sm text-muted-foreground mb-3">No warden assigned</p>
                          <Button size="sm" onClick={openAddForm} data-testid={`button-assign-warden-${block}`}>
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Assign
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedWarden ? "Edit Warden" : "Add Warden"}</DialogTitle>
            <DialogDescription>
              {selectedWarden ? "Update warden information" : "Assign a warden to a block"}
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
                      <Input placeholder="Enter full name" {...field} data-testid="input-warden-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@hostel.edu" {...field} data-testid="input-warden-email" />
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
                      <Input placeholder="Mobile number" {...field} data-testid="input-warden-mobile" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="block"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Block *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-warden-block">
                          <SelectValue placeholder="Select block" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getAvailableBlocks().map((b) => (
                          <SelectItem key={b} value={b}>Block {b}</SelectItem>
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
                <Button type="submit" disabled={isSubmitting} data-testid="button-save-warden">
                  {isSubmitting ? "Saving..." : selectedWarden ? "Update" : "Add"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Warden</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove {selectedWarden?.name} from Block {selectedWarden?.block}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting} data-testid="button-confirm-delete-warden">
              {isSubmitting ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
