import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Receipt, Search, MessageSquare, Utensils, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalResidents: number;
  pendingComplaints: number;
  unclaimedItems: number;
  pendingBills: number;
  activePolls: number;
}

const HeadDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalResidents: 0,
    pendingComplaints: 0,
    unclaimedItems: 0,
    pendingBills: 0,
    activePolls: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [residents, complaints, lostItems, bills, polls] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("complaints").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("lost_found_items").select("id", { count: "exact" }).eq("status", "found"),
        supabase.from("bills").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("food_polls").select("id", { count: "exact" }).eq("is_active", true),
      ]);

      setStats({
        totalResidents: residents.count || 0,
        pendingComplaints: complaints.count || 0,
        unclaimedItems: lostItems.count || 0,
        pendingBills: bills.count || 0,
        activePolls: polls.count || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { icon: Users, label: "Total Residents", value: stats.totalResidents, color: "bg-blue-500" },
    { icon: MessageSquare, label: "Pending Complaints", value: stats.pendingComplaints, color: "bg-orange-500" },
    { icon: Search, label: "Unclaimed Items", value: stats.unclaimedItems, color: "bg-purple-500" },
    { icon: Receipt, label: "Pending Bills", value: stats.pendingBills, color: "bg-red-500" },
    { icon: BarChart3, label: "Active Polls", value: stats.activePolls, color: "bg-green-500" },
  ];

  return (
    <DashboardLayout role="head">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold">PG Head Dashboard</h1>
          <p className="text-muted-foreground">Manage your paying guest facility</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.color}`}>
                    <stat.icon className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? "..." : stat.value}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HeadDashboard;
