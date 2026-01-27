import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Wrench, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MaintenanceRequest {
  id: string;
  room_number: string;
  category: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
}

const categories = [
  "Electrical",
  "Plumbing",
  "AC/Cooling",
  "Furniture",
  "Cleaning",
  "Internet/WiFi",
  "Door/Lock",
  "Other"
];

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" }
];

export default function MaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  // Form state
  const [roomNumber, setRoomNumber] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Error", description: "Please login to submit a request", variant: "destructive" });
        return;
      }

      const { error } = await supabase
        .from("maintenance_requests")
        .insert({
          user_id: user.id,
          room_number: roomNumber.trim(),
          category,
          description: description.trim(),
          priority
        });

      if (error) throw error;

      toast({ title: "Success", description: "Maintenance request submitted successfully" });
      setRoomNumber("");
      setCategory("");
      setDescription("");
      setPriority("medium");
      setShowForm(false);
      fetchRequests();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case "in_progress":
        return <Badge variant="default" className="gap-1"><AlertCircle className="h-3 w-3" /> In Progress</Badge>;
      case "resolved":
        return <Badge variant="outline" className="gap-1 border-primary text-primary"><CheckCircle className="h-3 w-3" /> Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <Badge variant="outline" className="text-muted-foreground">Low</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium</Badge>;
      case "high":
        return <Badge variant="default">High</Badge>;
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <DashboardLayout role="guest">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Maintenance</h1>
            <p className="text-muted-foreground">Request repairs and maintenance for your room</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Request
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Submit Maintenance Request
              </CardTitle>
              <CardDescription>Fill in the details about your maintenance issue</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="room">Room Number *</Label>
                    <Input
                      id="room"
                      placeholder="e.g., 101, A-12"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      required
                      maxLength={20}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((p) => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the issue in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={4}
                    maxLength={1000}
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting || !category}>
                    {submitting ? "Submitting..." : "Submit Request"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Your Requests</CardTitle>
            <CardDescription>Track the status of your maintenance requests</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : requests.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No maintenance requests yet</p>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{request.category}</h3>
                        <p className="text-sm text-muted-foreground">Room {request.room_number}</p>
                      </div>
                      <div className="flex gap-2">
                        {getPriorityBadge(request.priority)}
                        {getStatusBadge(request.status)}
                      </div>
                    </div>
                    <p className="text-sm">{request.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Submitted: {new Date(request.created_at).toLocaleDateString()}
                      {request.resolved_at && ` • Resolved: ${new Date(request.resolved_at).toLocaleDateString()}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
