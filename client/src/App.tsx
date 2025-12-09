import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuthStore } from "@/lib/store";
import NotFound from "@/pages/not-found";

import LoginPage from "@/pages/LoginPage";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminStudentsPage from "@/pages/admin/StudentsPage";
import AdminWardensPage from "@/pages/admin/WardensPage";
import AdminRoomsPage from "@/pages/admin/RoomsPage";
import AdminFeesPage from "@/pages/admin/FeesPage";
import AdminAttendancePage from "@/pages/admin/AttendancePage";
import AdminLeavesPage from "@/pages/admin/LeavesPage";
import AdminVisitorsPage from "@/pages/admin/VisitorsPage";
import AdminComplaintsPage from "@/pages/admin/ComplaintsPage";
import AdminMessPage from "@/pages/admin/MessPage";
import AdminNotificationsPage from "@/pages/admin/NotificationsPage";

import WardenDashboard from "@/pages/warden/WardenDashboard";
import WardenAttendancePage from "@/pages/warden/AttendancePage";
import WardenStudentsPage from "@/pages/warden/StudentsPage";
import WardenLeavesPage from "@/pages/warden/LeavesPage";
import WardenVisitorsPage from "@/pages/warden/VisitorsPage";
import WardenMessPage from "@/pages/warden/MessPage";

import StudentDashboard from "@/pages/student/StudentDashboard";
import StudentRoomPage from "@/pages/student/RoomPage";
import StudentAttendancePage from "@/pages/student/AttendancePage";
import StudentFeesPage from "@/pages/student/FeesPage";
import StudentLeavePage from "@/pages/student/LeavePage";
import StudentVisitorsPage from "@/pages/student/VisitorsPage";
import StudentComplaintsPage from "@/pages/student/ComplaintsPage";
import StudentMessPage from "@/pages/student/MessPage";
import StudentProfilePage from "@/pages/student/ProfilePage";

function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode; 
  allowedRoles: string[];
}) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Redirect to="/" />;
  }

  if (user && !allowedRoles.includes(user.role)) {
    const redirectPath = user.role === "admin" 
      ? "/admin/dashboard" 
      : user.role === "warden" 
        ? "/warden/dashboard" 
        : "/student/dashboard";
    return <Redirect to={redirectPath} />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    const redirectPath = user.role === "admin" 
      ? "/admin/dashboard" 
      : user.role === "warden" 
        ? "/warden/dashboard" 
        : "/student/dashboard";
    return <Redirect to={redirectPath} />;
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      </Route>

      <Route path="/admin/dashboard">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/students">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminStudentsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/wardens">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminWardensPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/rooms">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminRoomsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/fees">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminFeesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/attendance">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminAttendancePage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/leaves">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminLeavesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/visitors">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminVisitorsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/complaints">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminComplaintsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/mess">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminMessPage />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/notifications">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminNotificationsPage />
        </ProtectedRoute>
      </Route>

      <Route path="/warden/dashboard">
        <ProtectedRoute allowedRoles={["warden"]}>
          <WardenDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/warden/attendance">
        <ProtectedRoute allowedRoles={["warden"]}>
          <WardenAttendancePage />
        </ProtectedRoute>
      </Route>
      <Route path="/warden/students">
        <ProtectedRoute allowedRoles={["warden"]}>
          <WardenStudentsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/warden/leaves">
        <ProtectedRoute allowedRoles={["warden"]}>
          <WardenLeavesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/warden/visitors">
        <ProtectedRoute allowedRoles={["warden"]}>
          <WardenVisitorsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/warden/mess">
        <ProtectedRoute allowedRoles={["warden"]}>
          <WardenMessPage />
        </ProtectedRoute>
      </Route>

      <Route path="/student/dashboard">
        <ProtectedRoute allowedRoles={["student"]}>
          <StudentDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/student/room">
        <ProtectedRoute allowedRoles={["student"]}>
          <StudentRoomPage />
        </ProtectedRoute>
      </Route>
      <Route path="/student/attendance">
        <ProtectedRoute allowedRoles={["student"]}>
          <StudentAttendancePage />
        </ProtectedRoute>
      </Route>
      <Route path="/student/fees">
        <ProtectedRoute allowedRoles={["student"]}>
          <StudentFeesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/student/leave">
        <ProtectedRoute allowedRoles={["student"]}>
          <StudentLeavePage />
        </ProtectedRoute>
      </Route>
      <Route path="/student/visitors">
        <ProtectedRoute allowedRoles={["student"]}>
          <StudentVisitorsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/student/complaints">
        <ProtectedRoute allowedRoles={["student"]}>
          <StudentComplaintsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/student/mess">
        <ProtectedRoute allowedRoles={["student"]}>
          <StudentMessPage />
        </ProtectedRoute>
      </Route>
      <Route path="/student/profile">
        <ProtectedRoute allowedRoles={["student"]}>
          <StudentProfilePage />
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
