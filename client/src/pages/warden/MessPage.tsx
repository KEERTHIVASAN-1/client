import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Utensils, Clock } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    setIsLoading(true);
    try {
      const data = await messService.getWeeklyMenu();
      setMenu(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load menu", variant: "destructive" });
    } finally {
      setIsLoading(false);
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
          <div className="grid gap-4 md:grid-cols-3">
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
        >
          <h1 className="text-2xl font-semibold text-foreground">Mess Menu</h1>
          <p className="text-sm text-muted-foreground">Weekly meal schedule</p>
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
                    <CardContent>
                      <div className="flex flex-wrap gap-2 min-h-16">
                        {menu[day]?.[meal]?.map((item, index) => (
                          <Badge key={index} variant="secondary">
                            {item}
                          </Badge>
                        )) || (
                          <p className="text-sm text-muted-foreground">No items available</p>
                        )}
                      </div>
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
