import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Building2, Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore, useThemeStore } from "@/lib/store";
import { authService } from "@/services/authService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { UserRole } from "@shared/schema";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const roleCredentials: Record<UserRole, { email: string; password: string; hint: string }> = {
  admin: { email: "admin@hostel.edu", password: "admin123", hint: "Use admin@hostel.edu / admin123" },
  warden: { email: "rajesh.kumar@hostel.edu", password: "warden123", hint: "Use rajesh.kumar@hostel.edu / warden123" },
  student: { email: "aarav.sharma@student.edu", password: "student123", hint: "Use any student email / student123" },
};

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuthStore();
  const { theme } = useThemeStore();
  const [selectedRole, setSelectedRole] = useState<UserRole>("admin");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: roleCredentials.admin.email,
      password: roleCredentials.admin.password,
    },
  });

  const handleRoleChange = (role: string) => {
    setSelectedRole(role as UserRole);
    setError(null);
    form.setValue("email", roleCredentials[role as UserRole].email);
    form.setValue("password", roleCredentials[role as UserRole].password);
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = await authService.login(data.email, data.password, selectedRole);
      login(user);

      const routes: Record<UserRole, string> = {
        admin: "/admin/dashboard",
        warden: "/warden/dashboard",
        student: "/student/dashboard",
      };
      setLocation(routes[user.role]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-border shadow-xl">
          <CardHeader className="text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground"
            >
              <Building2 className="w-8 h-8" />
            </motion.div>
            <CardTitle className="text-2xl font-bold">Hostel Management</CardTitle>
            <CardDescription>Sign in to access your dashboard</CardDescription>
          </CardHeader>

          <CardContent className="pt-4">
            <Tabs value={selectedRole} onValueChange={handleRoleChange} className="mb-6">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="admin" data-testid="tab-admin">Admin</TabsTrigger>
                <TabsTrigger value="warden" data-testid="tab-warden">Warden</TabsTrigger>
                <TabsTrigger value="student" data-testid="tab-student">Student</TabsTrigger>
              </TabsList>
            </Tabs>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className={cn(
                      "pl-10",
                      form.formState.errors.email && "border-destructive"
                    )}
                    {...form.register("email")}
                    data-testid="input-email"
                  />
                </div>
                {form.formState.errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-destructive"
                  >
                    {form.formState.errors.email.message}
                  </motion.p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className={cn(
                      "pl-10 pr-10 " ,
                      form.formState.errors.password && "border-destructive"
                    )}
                    {...form.register("password")}
                    data-testid="input-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute  -top-4 -translate-y-1/2 h-8 w-8 "
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {form.formState.errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-destructive"
                  >
                    {form.formState.errors.password.message}
                  </motion.p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  data-testid="button-login"
                >
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 p-4 rounded-lg bg-muted/50"
            >
              <p className="text-xs text-muted-foreground text-center">
                {roleCredentials[selectedRole].hint}
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
