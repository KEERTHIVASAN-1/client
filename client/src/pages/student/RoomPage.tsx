import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DoorOpen, Users, Phone, MapPin, Bed } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/lib/store";
import { dashboardService } from "@/services/dashboardService";
import type { StudentDashboardStats } from "@shared/schema";

export default function RoomPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<StudentDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
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

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64" />
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
          <h1 className="text-2xl font-semibold text-foreground">My Room</h1>
          <p className="text-sm text-muted-foreground">Room information and roommates</p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DoorOpen className="w-5 h-5 text-primary" />
                  Room Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Block</p>
                      <p className="text-lg font-semibold" data-testid="text-block">{stats?.block || "-"}</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-3">
                    <DoorOpen className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Room</p>
                      <p className="text-lg font-semibold" data-testid="text-room">{stats?.roomNumber || "-"}</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Floor</p>
                      <p className="text-lg font-semibold">{stats?.floor || "-"}</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 flex items-center gap-3">
                    <Bed className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Bed</p>
                      <p className="text-lg font-semibold" data-testid="text-bed">{stats?.bedNumber || "-"}</p>
                    </div>
                  </div>
                </div>
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
                  Roommates
                </CardTitle>
              </CardHeader>
              <CardContent>
                {stats?.roommates && stats.roommates.length > 0 ? (
                  <div className="space-y-3">
                    {stats.roommates.map((name, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-medium">{name.charAt(0)}</span>
                        </div>
                        <span className="font-medium" data-testid={`text-roommate-${index}`}>{name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No roommates assigned</p>
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
                <Users className="w-5 h-5 text-primary" />
                Warden Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xl font-medium">{stats?.wardenName?.charAt(0) || "W"}</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-lg" data-testid="text-warden-name">{stats?.wardenName || "Not Assigned"}</p>
                  <p className="text-sm text-muted-foreground">Block {stats?.block} Warden</p>
                </div>
                {stats?.wardenMobile && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg border">
                    <Phone className="w-4 h-4 text-primary" />
                    <span className="font-medium" data-testid="text-warden-mobile">{stats.wardenMobile}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
