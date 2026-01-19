import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Complaint {
  id: string;
  user_id: string;
  category: string;
  description: string;
  room_number: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
}

interface Resident {
  user_id: string;
  name: string;
}

const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
  pending: { color: "bg-yellow-500", icon: Clock, label: "Pending" },
  in_progress: { color: "bg-blue-500", icon: AlertCircle, label: "In Progress" },
  resolved: { color: "bg-green-500", icon: CheckCircle, label: "Resolved" },
};

const HeadComplaintsPage = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [complaintsRes, residentsRes] = await Promise.all([
        supabase.from("complaints").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("user_id, name"),
      ]);

      if (complaintsRes.error) throw complaintsRes.error;
      if (residentsRes.error) throw residentsRes.error;

      setComplaints((complaintsRes.data as Complaint[]) || []);
      setResidents((residentsRes.data as Resident[]) || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (complaintId: string, newStatus: string) => {
    setUpdating(complaintId);
    try {
      const updateData: any = { status: newStatus };
      if (newStatus === "resolved") {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("complaints")
        .update(updateData)
        .eq("id", complaintId);

      if (error) throw error;

      toast.success(`Status updated to ${newStatus}`);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const getResidentName = (userId: string) => {
    const resident = residents.find((r) => r.user_id === userId);
    return resident?.name || "Unknown";
  };

  const pendingComplaints = complaints.filter((c) => c.status === "pending");
  const inProgressComplaints = complaints.filter((c) => c.status === "in_progress");
  const resolvedComplaints = complaints.filter((c) => c.status === "resolved");

  return (
    <DashboardLayout role="head">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Manage Complaints
          </h1>
          <p className="text-muted-foreground">Review and resolve resident complaints</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-yellow-500/10">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{pendingComplaints.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <AlertCircle className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{inProgressComplaints.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-2xl font-bold">{resolvedComplaints.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Complaints List */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : complaints.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No complaints submitted</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {complaints.map((complaint, index) => {
              const config = statusConfig[complaint.status] || statusConfig.pending;
              const StatusIcon = config.icon;

              return (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl ${config.color}/10`}>
                            <StatusIcon className={`h-5 w-5 ${config.color.replace("bg-", "text-")}`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="capitalize">
                                {complaint.category}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                Room {complaint.room_number}
                              </span>
                            </div>
                            <p className="text-sm mb-2">{complaint.description}</p>
                            <div className="text-xs text-muted-foreground">
                              <p>By: {getResidentName(complaint.user_id)}</p>
                              <p>Submitted: {new Date(complaint.created_at).toLocaleString()}</p>
                              {complaint.resolved_at && (
                                <p className="text-green-600">
                                  Resolved: {new Date(complaint.resolved_at).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={complaint.status}
                            onValueChange={(value) => updateStatus(complaint.id, value)}
                            disabled={updating === complaint.id}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HeadComplaintsPage;
