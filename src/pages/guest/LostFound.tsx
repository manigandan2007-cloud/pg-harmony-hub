import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Plus, MapPin, Calendar, User, CheckCircle, Clock, Upload } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LostItem {
  id: string;
  item_name: string;
  description: string;
  found_location: string;
  finder_name: string;
  finder_contact: string;
  image_url?: string;
  status: "unclaimed" | "claimed";
  created_at: string;
}

const LostFoundPage = () => {
  const [items, setItems] = useState<LostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [foundLocation, setFoundLocation] = useState("");
  const [finderContact, setFinderContact] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("lost_found_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!itemName.trim() || !foundLocation.trim()) {
      toast.error("Please fill required fields");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let imageUrl = null;

      // Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("lost-found-images")
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("lost-found-images")
          .getPublicUrl(fileName);
        
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase.from("lost_found_items").insert({
        user_id: user.id,
        item_name: itemName,
        description,
        found_location: foundLocation,
        finder_name: user.user_metadata?.name || "Anonymous",
        finder_contact: finderContact,
        image_url: imageUrl,
        status: "unclaimed",
      });

      if (error) throw error;
      
      toast.success("Item posted successfully!");
      setIsDialogOpen(false);
      resetForm();
      fetchItems();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setItemName("");
    setDescription("");
    setFoundLocation("");
    setFinderContact("");
    setImageFile(null);
  };

  return (
    <DashboardLayout role="guest">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl font-display font-bold mb-2">Lost & Found</h1>
            <p className="text-muted-foreground">Found something? Help reunite items with their owners</p>
          </div>
          <Button variant="hero" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Report Found Item
          </Button>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : items.length === 0 ? (
          <Card variant="elevated" className="text-center py-12">
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Items Posted</h3>
            <p className="text-muted-foreground mb-4">
              Found something that doesn't belong to you? Help someone find it!
            </p>
            <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
              Report Found Item
            </Button>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card variant="elevated" className="h-full">
                  {item.image_url && (
                    <div className="aspect-video relative overflow-hidden rounded-t-2xl">
                      <img
                        src={item.image_url}
                        alt={item.item_name}
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === "claimed"
                          ? "bg-success/90 text-white"
                          : "bg-warning/90 text-white"
                      }`}>
                        {item.status === "claimed" ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Claimed
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Unclaimed
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  <CardContent className={item.image_url ? "pt-4" : "pt-6"}>
                    {!item.image_url && (
                      <div className={`inline-flex items-center gap-1 mb-2 px-2 py-1 rounded-full text-xs font-medium ${
                        item.status === "claimed"
                          ? "bg-success/20 text-success"
                          : "bg-warning/20 text-warning"
                      }`}>
                        {item.status === "claimed" ? (
                          <>
                            <CheckCircle className="w-3 h-3" /> Claimed
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3" /> Unclaimed
                          </>
                        )}
                      </div>
                    )}
                    <h3 className="font-bold text-lg mb-2">{item.item_name}</h3>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>Found at: {item.found_location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="w-4 h-4" />
                        <span>By: {item.finder_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {item.finder_contact && item.status === "unclaimed" && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-sm font-medium">Contact: {item.finder_contact}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Item Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Report Found Item</DialogTitle>
            <DialogDescription>
              Help someone find their lost item by providing details
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name *</Label>
              <Input
                id="itemName"
                placeholder="e.g. Blue Wallet, Silver Watch"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the item in detail..."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="foundLocation">Where did you find it? *</Label>
              <Input
                id="foundLocation"
                placeholder="e.g. Common Room, Near Washroom"
                value={foundLocation}
                onChange={(e) => setFoundLocation(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="finderContact">Your Contact (optional)</Label>
              <Input
                id="finderContact"
                placeholder="Phone or room number"
                value={finderContact}
                onChange={(e) => setFinderContact(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Upload Photo</Label>
              <div className="border-2 border-dashed border-border rounded-xl p-4 text-center">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="image-upload"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {imageFile ? imageFile.name : "Click to upload image"}
                  </p>
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="hero" disabled={submitting}>
                {submitting ? "Posting..." : "Post Item"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default LostFoundPage;
