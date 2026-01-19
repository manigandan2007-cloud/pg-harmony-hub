import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, CheckCircle, MapPin, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LostFoundItem {
  id: string;
  item_name: string;
  description: string;
  location_found: string;
  image_url: string | null;
  status: string;
  created_at: string;
  claimed_by: string | null;
  claimed_at: string | null;
  user_id: string;
}

interface Resident {
  user_id: string;
  name: string;
  room_number: string | null;
}

const HeadLostFoundPage = () => {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimDialogOpen, setClaimDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LostFoundItem | null>(null);
  const [selectedClaimant, setSelectedClaimant] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, residentsRes] = await Promise.all([
        supabase.from("lost_found_items").select("*").order("created_at", { ascending: false }),
        supabase.from("profiles").select("user_id, name, room_number"),
      ]);

      if (itemsRes.error) throw itemsRes.error;
      if (residentsRes.error) throw residentsRes.error;

      setItems((itemsRes.data as LostFoundItem[]) || []);
      setResidents((residentsRes.data as Resident[]) || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const openClaimDialog = (item: LostFoundItem) => {
    setSelectedItem(item);
    setSelectedClaimant("");
    setClaimDialogOpen(true);
  };

  const handleApproveClaim = async () => {
    if (!selectedItem || !selectedClaimant) {
      toast.error("Please select a claimant");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("lost_found_items")
        .update({
          status: "claimed",
          claimed_by: selectedClaimant,
          claimed_at: new Date().toISOString(),
        })
        .eq("id", selectedItem.id);

      if (error) throw error;

      toast.success("Item marked as claimed");
      setClaimDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve claim");
    } finally {
      setSubmitting(false);
    }
  };

  const getResidentName = (userId: string | null) => {
    if (!userId) return "Unknown";
    const resident = residents.find((r) => r.user_id === userId);
    return resident ? `${resident.name} (Room ${resident.room_number || "N/A"})` : "Unknown";
  };

  const foundItems = items.filter((i) => i.status === "found");
  const claimedItems = items.filter((i) => i.status === "claimed");

  return (
    <DashboardLayout role="head">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Search className="h-6 w-6" />
            Lost & Found Management
          </h1>
          <p className="text-muted-foreground">Approve claims for found items</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-orange-500/10">
                  <Search className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unclaimed Items</p>
                  <p className="text-2xl font-bold">{foundItems.length}</p>
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
                  <p className="text-sm text-muted-foreground">Claimed Items</p>
                  <p className="text-2xl font-bold">{claimedItems.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Items List */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No items reported</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="overflow-hidden">
                  {item.image_url && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.item_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{item.item_name}</h3>
                      <Badge variant={item.status === "claimed" ? "default" : "secondary"}>
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {item.location_found}
                      </p>
                      <p className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                      <p>Posted by: {getResidentName(item.user_id)}</p>
                      {item.claimed_by && (
                        <p className="text-green-600">
                          Claimed by: {getResidentName(item.claimed_by)}
                        </p>
                      )}
                    </div>
                    {item.status === "found" && (
                      <Button
                        className="w-full mt-4"
                        size="sm"
                        onClick={() => openClaimDialog(item)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Claim
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {/* Claim Dialog */}
        <Dialog open={claimDialogOpen} onOpenChange={setClaimDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Approve Claim</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                Mark <strong>{selectedItem?.item_name}</strong> as claimed by:
              </p>
              <div className="space-y-2">
                <Label>Select Claimant</Label>
                <Select value={selectedClaimant} onValueChange={setSelectedClaimant}>
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
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setClaimDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleApproveClaim} disabled={submitting}>
                {submitting ? "Approving..." : "Approve Claim"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default HeadLostFoundPage;
