import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Utensils, Plus, Calendar, Coffee, Sun, Cookie, Moon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MenuItem {
  items: string[];
}

interface DailyMenu {
  id: string;
  date: string;
  breakfast: MenuItem | null;
  lunch: MenuItem | null;
  snacks: MenuItem | null;
  dinner: MenuItem | null;
  created_at: string;
}

const mealConfig = [
  { key: "breakfast", label: "Breakfast", icon: Coffee, time: "7:00 - 9:00 AM", color: "bg-amber-500" },
  { key: "lunch", label: "Lunch", icon: Sun, time: "12:00 - 2:00 PM", color: "bg-orange-500" },
  { key: "snacks", label: "Snacks", icon: Cookie, time: "4:00 - 5:00 PM", color: "bg-pink-500" },
  { key: "dinner", label: "Dinner", icon: Moon, time: "7:00 - 9:00 PM", color: "bg-indigo-500" },
];

const HeadMenuPage = () => {
  const [menus, setMenus] = useState<DailyMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [breakfast, setBreakfast] = useState("");
  const [lunch, setLunch] = useState("");
  const [snacks, setSnacks] = useState("");
  const [dinner, setDinner] = useState("");

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const { data, error } = await supabase
        .from("daily_menus")
        .select("*")
        .order("date", { ascending: false })
        .limit(14);

      if (error) throw error;
      setMenus((data as unknown as DailyMenu[]) || []);
    } catch (error) {
      console.error("Error fetching menus:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseItems = (text: string): MenuItem | null => {
    const items = text.split(",").map((s) => s.trim()).filter(Boolean);
    return items.length > 0 ? { items } : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if menu exists for this date
      const { data: existing } = await supabase
        .from("daily_menus")
        .select("id")
        .eq("date", selectedDate)
        .maybeSingle();

      const menuData = {
        date: selectedDate,
        breakfast: parseItems(breakfast) as any,
        lunch: parseItems(lunch) as any,
        snacks: parseItems(snacks) as any,
        dinner: parseItems(dinner) as any,
        created_by: user.id,
      };

      if (existing) {
        const { error } = await supabase
          .from("daily_menus")
          .update(menuData)
          .eq("id", existing.id);
        if (error) throw error;
        toast.success("Menu updated successfully");
      } else {
        const { error } = await supabase.from("daily_menus").insert(menuData);
        if (error) throw error;
        toast.success("Menu created successfully");
      }

      setDialogOpen(false);
      resetForm();
      fetchMenus();
    } catch (error: any) {
      toast.error(error.message || "Failed to save menu");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
    setBreakfast("");
    setLunch("");
    setSnacks("");
    setDinner("");
  };

  const loadMenuForEdit = (menu: DailyMenu) => {
    setSelectedDate(menu.date);
    setBreakfast(menu.breakfast?.items?.join(", ") || "");
    setLunch(menu.lunch?.items?.join(", ") || "");
    setSnacks(menu.snacks?.items?.join(", ") || "");
    setDinner(menu.dinner?.items?.join(", ") || "");
    setDialogOpen(true);
  };

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
              <Utensils className="h-6 w-6" />
              Manage Menu
            </h1>
            <p className="text-muted-foreground">Create and update daily menus</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={resetForm}>
                <Plus className="h-4 w-4" />
                Add Menu
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create/Update Menu</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Coffee className="h-4 w-4" /> Breakfast
                  </Label>
                  <Textarea
                    value={breakfast}
                    onChange={(e) => setBreakfast(e.target.value)}
                    placeholder="Poha, Tea, Toast (comma separated)"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Sun className="h-4 w-4" /> Lunch
                  </Label>
                  <Textarea
                    value={lunch}
                    onChange={(e) => setLunch(e.target.value)}
                    placeholder="Rice, Dal, Sabzi, Roti (comma separated)"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Cookie className="h-4 w-4" /> Snacks
                  </Label>
                  <Textarea
                    value={snacks}
                    onChange={(e) => setSnacks(e.target.value)}
                    placeholder="Samosa, Chai (comma separated)"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Moon className="h-4 w-4" /> Dinner
                  </Label>
                  <Textarea
                    value={dinner}
                    onChange={(e) => setDinner(e.target.value)}
                    placeholder="Roti, Paneer, Rice (comma separated)"
                    rows={2}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Menu"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Menus List */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : menus.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Utensils className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No menus created yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {menus.map((menu, index) => (
              <motion.div
                key={menu.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => loadMenuForEdit(menu)}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(menu.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {mealConfig.map((meal) => {
                        const mealData = menu[meal.key as keyof DailyMenu] as MenuItem | null;
                        return (
                          <div key={meal.key} className="space-y-1">
                            <div className="flex items-center gap-1 text-sm font-medium">
                              <meal.icon className="h-3 w-3" />
                              {meal.label}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {mealData?.items?.join(", ") || "Not set"}
                            </p>
                          </div>
                        );
                      })}
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

export default HeadMenuPage;
