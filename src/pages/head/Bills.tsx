import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Receipt, Plus, Zap, Droplets, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Bill {
  id: string;
  user_id: string;
  bill_type: string;
  amount: number;
  month: string;
  year: number;
  due_date: string;
  status: string;
  created_at: string;
}

interface Resident {
  user_id: string;
  name: string;
  room_number: string | null;
}

const HeadBillsPage = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedUser, setSelectedUser] = useState("");
  const [billType, setBillType] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [billsRes, residentsRes] = await Promise.all([
        supabase.from("bills").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("user_id, name, room_number"),
      ]);

      if (billsRes.error) throw billsRes.error;
      if (residentsRes.error) throw residentsRes.error;

      setBills((billsRes.data as Bill[]) || []);
      setResidents((residentsRes.data as Resident[]) || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !billType || !amount || !month || !year || !dueDate) {
      toast.error("Please fill all fields");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("bills").insert({
        user_id: selectedUser,
        bill_type: billType,
        amount: parseFloat(amount),
        month,
        year: parseInt(year),
        due_date: dueDate,
        created_by: user.id,
      });

      if (error) throw error;

      toast.success("Bill posted successfully");
      setDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to post bill");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedUser("");
    setBillType("");
    setAmount("");
    setMonth("");
    setYear(new Date().getFullYear().toString());
    setDueDate("");
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getResidentName = (userId: string) => {
    const resident = residents.find((r) => r.user_id === userId);
    return resident ? `${resident.name} (Room ${resident.room_number || "N/A"})` : "Unknown";
  };

  const pendingBills = bills.filter((b) => b.status === "pending");
  const paidBills = bills.filter((b) => b.status === "paid");

  return (
    <DashboardLayout role="head">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Receipt className="h-6 w-6" />
              Manage Bills
            </h1>
            <p className="text-muted-foreground">Post and track resident bills</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Post New Bill
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Post New Bill</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Resident</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select resident" />
                    </SelectTrigger>
                    <SelectContent>
                      {residents.map((r) => (
                        <SelectItem key={r.user_id} value={r.user_id}>
                          {r.name} (Room {r.room_number || "N/A"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Bill Type</Label>
                  <Select value={billType} onValueChange={setBillType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electricity">Electricity</SelectItem>
                      <SelectItem value="water">Water</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Month</Label>
                    <Select value={month} onValueChange={setMonth}>
                      <SelectTrigger>
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="2024"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Amount (₹)</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Posting..." : "Post Bill"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-orange-500/10">
                  <Receipt className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Bills</p>
                  <p className="text-2xl font-bold">{pendingBills.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <Receipt className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paid Bills</p>
                  <p className="text-2xl font-bold">{paidBills.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Residents</p>
                  <p className="text-2xl font-bold">{residents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bills List */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : bills.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No bills posted yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {bills.map((bill, index) => (
              <motion.div
                key={bill.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${bill.bill_type === "electricity" ? "bg-yellow-500/10" : "bg-blue-500/10"}`}>
                          {bill.bill_type === "electricity" ? (
                            <Zap className="h-5 w-5 text-yellow-500" />
                          ) : (
                            <Droplets className="h-5 w-5 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold capitalize">{bill.bill_type} Bill</h3>
                          <p className="text-sm text-muted-foreground">
                            {getResidentName(bill.user_id)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {bill.month} {bill.year} • Due: {new Date(bill.due_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">₹{bill.amount}</p>
                        <Badge variant={bill.status === "paid" ? "default" : "secondary"}>
                          {bill.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HeadBillsPage;
