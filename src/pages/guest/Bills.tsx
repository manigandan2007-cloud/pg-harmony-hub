import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Receipt, Zap, Droplets, Calendar, Download } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Bill {
  id: string;
  type: "electricity" | "water";
  amount: number;
  month: string;
  year: number;
  due_date: string;
  created_at: string;
}

const billTypeConfig = {
  electricity: {
    icon: Zap,
    color: "bg-yellow-500",
    label: "Electricity Bill",
  },
  water: {
    icon: Droplets,
    color: "bg-blue-500",
    label: "Water Bill",
  },
};

const BillsPage = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const { data, error } = await supabase
        .from("bills")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBills(data || []);
    } catch (error) {
      console.error("Error fetching bills:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalElectricity = bills
    .filter((b) => b.type === "electricity")
    .reduce((sum, b) => sum + b.amount, 0);

  const totalWater = bills
    .filter((b) => b.type === "water")
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <DashboardLayout role="guest">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-display font-bold mb-2">Bills</h1>
          <p className="text-muted-foreground">View your electricity and water bills</p>
        </motion.div>

        {/* Summary Cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card variant="elevated" className="border-yellow-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-yellow-500 rounded-2xl flex items-center justify-center">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Electricity</p>
                    <p className="text-2xl font-bold">₹{totalElectricity.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Card variant="elevated" className="border-blue-500/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center">
                    <Droplets className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Water</p>
                    <p className="text-2xl font-bold">₹{totalWater.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bills List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : bills.length === 0 ? (
          <Card variant="elevated" className="text-center py-12">
            <Receipt className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Bills Posted</h3>
            <p className="text-muted-foreground">Bills will appear here once posted by the PG Head</p>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Recent Bills</h2>
            <div className="grid gap-4">
              {bills.map((bill, index) => {
                const config = billTypeConfig[bill.type];
                const Icon = config.icon;

                return (
                  <motion.div
                    key={bill.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card variant="elevated">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${config.color} rounded-xl flex items-center justify-center`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold">{config.label}</h3>
                              <p className="text-sm text-muted-foreground">
                                {bill.month} {bill.year}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold">₹{bill.amount.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Due: {new Date(bill.due_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default BillsPage;
