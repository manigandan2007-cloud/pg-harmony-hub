import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shirt, Utensils, Package, MessageSquare, Search, Receipt, Users, BarChart3, Sun, Moon, Clock } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const quickActions = [
  { icon: Shirt, label: "Book Laundry", path: "/guest/laundry", color: "bg-blue-500" },
  { icon: Package, label: "View Packages", path: "/guest/packages", color: "bg-green-500" },
  { icon: Utensils, label: "Today's Menu", path: "/guest/menu", color: "gradient-warm" },
  { icon: BarChart3, label: "Food Poll", path: "/guest/food-poll", color: "bg-purple-500" },
  { icon: MessageSquare, label: "Complaints", path: "/guest/complaints", color: "bg-orange-500" },
  { icon: Search, label: "Lost & Found", path: "/guest/lost-found", color: "bg-pink-500" },
  { icon: Receipt, label: "View Bills", path: "/guest/bills", color: "bg-teal-500" },
  { icon: Users, label: "Residents", path: "/guest/residents", color: "bg-indigo-500" },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good Morning", icon: Sun };
  if (hour < 17) return { text: "Good Afternoon", icon: Sun };
  return { text: "Good Evening", icon: Moon };
};

const GuestDashboard = () => {
  const [userName, setUserName] = useState("");
  const greeting = getGreeting();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserName(user?.user_metadata?.name || "Guest");
    };
    getUser();
  }, []);

  return (
    <DashboardLayout role="guest">
      <div className="space-y-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card variant="gradient" className="overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <greeting.icon className="w-5 h-5" />
                    <span className="text-sm opacity-90">{greeting.text}</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
                    Welcome back, {userName}! 👋
                  </h1>
                  <p className="opacity-80">
                    Hope you're having a great stay at StayNest!
                  </p>
                </div>
                <div className="hidden md:block text-6xl">🏠</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-display font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
              >
                <Link to={action.path}>
                  <Card variant="elevated" className="h-full cursor-pointer group">
                    <CardContent className="p-4 text-center">
                      <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="font-medium text-sm">{action.label}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card variant="glass" className="border-secondary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-secondary" />
                Helpful Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <span className="text-xl">🧺</span>
                <div>
                  <p className="font-medium">Laundry Peak Hours</p>
                  <p className="text-sm text-muted-foreground">
                    Try booking slots before 8 AM or after 8 PM to avoid waiting!
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <span className="text-xl">🍽️</span>
                <div>
                  <p className="font-medium">Food Preferences</p>
                  <p className="text-sm text-muted-foreground">
                    Vote in food polls to help shape the menu you love!
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <span className="text-xl">💡</span>
                <div>
                  <p className="font-medium">Save Energy</p>
                  <p className="text-sm text-muted-foreground">
                    Turn off lights and AC when leaving your room to save on bills.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default GuestDashboard;
