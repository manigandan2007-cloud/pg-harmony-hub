import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Shirt,
  Utensils,
  Package,
  MessageSquare,
  Search,
  Receipt,
  Users,
  LogOut,
  Menu,
  X,
  BarChart3,
  ClipboardList,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "guest" | "head";
}

const guestNavItems = [
  { icon: Home, label: "Dashboard", path: "/guest/dashboard" },
  { icon: Shirt, label: "Laundry", path: "/guest/laundry" },
  { icon: Package, label: "Packages", path: "/guest/packages" },
  { icon: BarChart3, label: "Food Poll", path: "/guest/food-poll" },
  { icon: Utensils, label: "Today's Menu", path: "/guest/menu" },
  { icon: MessageSquare, label: "Complaints", path: "/guest/complaints" },
  { icon: Search, label: "Lost & Found", path: "/guest/lost-found" },
  { icon: Receipt, label: "Bills", path: "/guest/bills" },
  { icon: Users, label: "Residents", path: "/guest/residents" },
];

const headNavItems = [
  { icon: Home, label: "Dashboard", path: "/head/dashboard" },
  { icon: ClipboardList, label: "Manage Menu", path: "/head/menu" },
  { icon: BarChart3, label: "Food Polls", path: "/head/polls" },
  { icon: MessageSquare, label: "Complaints", path: "/head/complaints" },
  { icon: Search, label: "Lost & Found", path: "/head/lost-found" },
  { icon: Receipt, label: "Post Bills", path: "/head/bills" },
  { icon: Users, label: "Manage Guests", path: "/head/guests" },
];

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = role === "head" ? headNavItems : guestNavItems;

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth?role=" + role);
      } else {
        setUser(session.user);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth?role=" + role);
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, role]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const userName = user?.user_metadata?.name || "User";

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-16 flex items-center px-4 justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display font-bold text-lg text-gradient">StayNest</span>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${role === "head" ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-primary"}`}>
          {role === "head" ? "Head" : "Guest"}
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-foreground/20 z-50"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg ${role === "head" ? "bg-secondary" : "gradient-warm"} flex items-center justify-center`}>
                <Building2 className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg">StayNest</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-sidebar-border">
            <div className={`p-3 rounded-xl ${role === "head" ? "bg-secondary/10" : "bg-primary/10"}`}>
              <p className="font-semibold truncate">{userName}</p>
              <p className="text-xs text-muted-foreground capitalize">{role}</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                    isActive
                      ? role === "head"
                        ? "bg-secondary text-secondary-foreground shadow-soft"
                        : "gradient-warm text-primary-foreground shadow-soft"
                      : "hover:bg-sidebar-accent text-sidebar-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
