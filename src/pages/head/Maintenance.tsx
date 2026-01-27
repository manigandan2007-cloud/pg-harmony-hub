import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wrench, Clock, CheckCircle, AlertCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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

export default function HeadMaintenancePage() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const updateData: { status: string; resolved_at?: string | null } = { status };
      if (status === "resolved") {
        updateData.resolved_at = new Date().toISOString();
      } else {
        updateData.resolved_at = null;
      }

      const { error } = await supabase
        .from("maintenance_requests")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Updated", description: `Request marked as ${status}` });
      fetchRequests();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
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

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = 
      req.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || req.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === "pending").length,
    inProgress: requests.filter(r => r.status === "in_progress").length,
    resolved: requests.filter(r => r.status === "resolved").length
  };

  return (
    <DashboardLayout role="head">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Maintenance Requests</h1>
          <p className="text-muted-foreground">Manage and resolve maintenance issues</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total Requests</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-muted-foreground">{stats.pending}</div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary">{stats.inProgress}</div>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-accent-foreground">{stats.resolved}</div>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by room, category, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Requests List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              All Requests
            </CardTitle>
            <CardDescription>Click on status buttons to update request status</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : filteredRequests.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No maintenance requests found</p>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between flex-wrap gap-2">
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
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <p className="text-xs text-muted-foreground">
                        Submitted: {new Date(request.created_at).toLocaleDateString()}
                        {request.resolved_at && ` • Resolved: ${new Date(request.resolved_at).toLocaleDateString()}`}
                      </p>
                      <div className="flex gap-2">
                        {request.status !== "in_progress" && (
                          <Button size="sm" variant="outline" onClick={() => updateStatus(request.id, "in_progress")}>
                            Mark In Progress
                          </Button>
                        )}
                        {request.status !== "resolved" && (
                          <Button size="sm" onClick={() => updateStatus(request.id, "resolved")}>
                            Mark Resolved
                          </Button>
                        )}
                        {request.status === "resolved" && (
                          <Button size="sm" variant="outline" onClick={() => updateStatus(request.id, "pending")}>
                            Reopen
                          </Button>
                        )}
                      </div>
                    </div>
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
