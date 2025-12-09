import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  UserCog,
  Building2,
  DollarSign,
  CalendarCheck,
  ClipboardList,
  Users2,
  MessageSquare,
  Bell,
  UtensilsCrossed,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  FileText,
  Calendar,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore, useSidebarStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { UserRole } from "@shared/schema";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

const adminNavItems: NavItem[] = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Students", href: "/admin/students", icon: Users },
  { title: "Wardens", href: "/admin/wardens", icon: UserCog },
  { title: "Rooms", href: "/admin/rooms", icon: Building2 },
  { title: "Fees", href: "/admin/fees", icon: DollarSign },
  { title: "Attendance", href: "/admin/attendance", icon: CalendarCheck },
  { title: "Leaves", href: "/admin/leaves", icon: ClipboardList },
  { title: "Visitors", href: "/admin/visitors", icon: Users2 },
  { title: "Complaints", href: "/admin/complaints", icon: MessageSquare },
  { title: "Mess Menu", href: "/admin/mess", icon: UtensilsCrossed },
  { title: "Notifications", href: "/admin/notifications", icon: Bell },
];

const wardenNavItems: NavItem[] = [
  { title: "Dashboard", href: "/warden/dashboard", icon: LayoutDashboard },
  { title: "Attendance", href: "/warden/attendance", icon: CalendarCheck },
  { title: "Students", href: "/warden/students", icon: Users },
  { title: "Leaves", href: "/warden/leaves", icon: ClipboardList },
  { title: "Visitors", href: "/warden/visitors", icon: Users2 },
  { title: "Mess Menu", href: "/warden/mess", icon: UtensilsCrossed },
];

const studentNavItems: NavItem[] = [
  { title: "Dashboard", href: "/student/dashboard", icon: Home },
  { title: "My Room", href: "/student/room", icon: Building2 },
  { title: "Attendance", href: "/student/attendance", icon: CalendarCheck },
  { title: "Fees", href: "/student/fees", icon: DollarSign },
  { title: "Leave", href: "/student/leave", icon: Calendar },
  { title: "Visitors", href: "/student/visitors", icon: History },
  { title: "Complaints", href: "/student/complaints", icon: MessageSquare },
  { title: "Mess Menu", href: "/student/mess", icon: UtensilsCrossed },
  { title: "Profile", href: "/student/profile", icon: FileText },
];

function getNavItems(role: UserRole): NavItem[] {
  switch (role) {
    case "admin":
      return adminNavItems;
    case "warden":
      return wardenNavItems;
    case "student":
      return studentNavItems;
    default:
      return [];
  }
}

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuthStore();
  const { isCollapsed, toggleCollapse, isMobileOpen, setMobileOpen } = useSidebarStore();

  if (!user) return null;

  const navItems = getNavItems(user.role);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="flex items-center justify-between gap-2 p-4 border-b border-sidebar-border">
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-3"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-sidebar-foreground">Hostel MS</span>
                <span className="text-xs text-muted-foreground capitalize">{user.role} Panel</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleCollapse}
          className="hidden lg:flex"
          data-testid="button-toggle-sidebar"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href + "/"));
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover-elevate"
                  )}
                  data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="text-sm font-medium whitespace-nowrap"
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-3 border-t border-sidebar-border">
        <Separator className="mb-3" />
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            "w-full justify-start gap-3 text-destructive hover:text-destructive",
            isCollapsed && "justify-center px-0"
          )}
          data-testid="button-logout"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>Logout</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="hidden lg:flex flex-col h-screen border-r border-sidebar-border bg-sidebar"
      >
        {sidebarContent}
      </motion.aside>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="fixed left-0 top-0 z-50 h-screen w-[280px] lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
