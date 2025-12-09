import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Utensils, Save, Plus, X, Clock } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { messService } from "@/services/messService";
import { DAYS_OF_WEEK, MEAL_TYPES, type DayOfWeek, type MealType, type MessMenu } from "@shared/schema";

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

const MEAL_TIMES: Record<MealType, string> = {
  breakfast: "7:30 AM - 9:00 AM",
  lunch: "12:30 PM - 2:00 PM",
  dinner: "7:30 PM - 9:00 PM",
};

export default function MessPage() {
  const { toast } = useToast();
  const [menu, setMenu] = useState<MessMenu>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingCell, setEditingCell] = useState<{ day: DayOfWeek; meal: MealType } | null>(null);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    setIsLoading(true);
    try {
      const data = await messService.getWeeklyMenu();
      const normalizedMenu: MessMenu = {};
      DAYS_OF_WEEK.forEach(day => {
        normalizedMenu[day] = data[day] || { breakfast: [], lunch: [], dinner: [] };
      });
      setMenu(normalizedMenu);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load menu", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddItem = (day: DayOfWeek, meal: MealType) => {
    if (!newItem.trim()) return;
    
    setMenu(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: [...(prev[day]?.[meal] || []), newItem.trim()],
      },
    }));
    setNewItem("");
  };

  const handleRemoveItem = (day: DayOfWeek, meal: MealType, index: number) => {
    setMenu(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [meal]: prev[day]?.[meal]?.filter((_, i) => i !== index) || [],
      },
    }));
  };

  const handleSaveMenu = async () => {
    setIsSaving(true);
    try {
      await messService.updateWeeklyMenu(menu);
      toast({ title: "Success", description: "Menu saved successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save menu", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const getTodayKey = (): DayOfWeek => {
    const days: DayOfWeek[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return days[new Date().getDay()];
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
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
            <h1 className="text-2xl font-semibold text-foreground">Mess Menu</h1>
            <p className="text-sm text-muted-foreground">Manage weekly meal schedules</p>
          </div>
          <Button onClick={handleSaveMenu} disabled={isSaving} data-testid="button-save-menu">
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save All Changes"}
          </Button>
        </motion.div>

        <Tabs defaultValue={getTodayKey()}>
          <TabsList className="grid grid-cols-7 w-full">
            {DAYS_OF_WEEK.map((day) => (
              <TabsTrigger
                key={day}
                value={day}
                className="text-xs sm:text-sm"
                data-testid={`tab-${day}`}
              >
                {DAY_LABELS[day].slice(0, 3)}
              </TabsTrigger>
            ))}
          </TabsList>

          {DAYS_OF_WEEK.map((day) => (
            <TabsContent key={day} value={day} className="mt-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-4 md:grid-cols-3"
              >
                {MEAL_TYPES.map((meal) => (
                  <Card key={meal}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Utensils className="w-4 h-4 text-primary" />
                          {MEAL_LABELS[meal]}
                        </div>
                        <span className="text-xs font-normal text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {MEAL_TIMES[meal]}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex flex-wrap gap-2 min-h-16">
                        {menu[day]?.[meal]?.map((item, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="group flex items-center gap-1 pr-1"
                          >
                            {item}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="w-4 h-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveItem(day, meal, index)}
                              data-testid={`button-remove-${day}-${meal}-${index}`}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </Badge>
                        )) || (
                          <p className="text-sm text-muted-foreground">No items added</p>
                        )}
                      </div>
                      
                      {editingCell?.day === day && editingCell?.meal === meal ? (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add item..."
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleAddItem(day, meal);
                              } else if (e.key === "Escape") {
                                setEditingCell(null);
                                setNewItem("");
                              }
                            }}
                            autoFocus
                            data-testid={`input-new-item-${day}-${meal}`}
                          />
                          <Button
                            size="icon"
                            onClick={() => handleAddItem(day, meal)}
                            data-testid={`button-add-item-${day}-${meal}`}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => {
                              setEditingCell(null);
                              setNewItem("");
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setEditingCell({ day, meal })}
                          data-testid={`button-edit-${day}-${meal}`}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add Item
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
