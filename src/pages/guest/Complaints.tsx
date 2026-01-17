import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, Clock, CheckCircle, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Complaint {
  id: string;
  title: string;
  description: string;
  room_number: string;
  status: "pending" | "in_progress" | "resolved";
  created_at: string;
  resolved_at?: string;
}

const statusConfig = {
  pending: { color: "bg-warning/20 text-warning", icon: Clock, label: "Pending" },
  in_progress: { color: "bg-blue-500/20 text-blue-500", icon: AlertCircle, label: "In Progress" },
  resolved: { color: "bg-success/20 text-success", icon: CheckCircle, label: "Resolved" },
};

const ComplaintsPage = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComplaints(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !roomNumber.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("complaints").insert({
        user_id: user.id,
        title,
        description,
        room_number: roomNumber,
        status: "pending",
      });

      if (error) throw error;
      toast.success("Complaint submitted successfully!");
      setTitle("");
      setDescription("");
      setRoomNumber("");
      fetchComplaints();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="guest">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-display font-bold mb-2">Complaints</h1>
          <p className="text-muted-foreground">Report issues and track their resolution</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Submit Complaint Form */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                Submit a Complaint
              </CardTitle>
              <CardDescription>
                Describe your issue and we'll resolve it as soon as possible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="roomNumber">Room Number</Label>
                  <Input
                    id="roomNumber"
                    placeholder="e.g. 101, A-12"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Subject</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of the issue"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Provide details about your complaint..."
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Complaint"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Complaints List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">My Complaints</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : complaints.length === 0 ? (
              <Card variant="elevated" className="text-center py-8">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No complaints submitted yet</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {complaints.map((complaint, index) => {
                  const status = statusConfig[complaint.status];
                  const StatusIcon = status.icon;

                  return (
                    <motion.div
                      key={complaint.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card variant="default">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs text-muted-foreground">
                                  Room {complaint.room_number}
                                </span>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                  <StatusIcon className="w-3 h-3" />
                                  {status.label}
                                </span>
                              </div>
                              <h3 className="font-semibold">{complaint.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {complaint.description}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                Submitted: {new Date(complaint.created_at).toLocaleDateString()}
                              </p>
                              {complaint.resolved_at && (
                                <p className="text-xs text-success mt-1">
                                  Resolved: {new Date(complaint.resolved_at).toLocaleDateString()}
                                </p>
                              )}
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ComplaintsPage;
