import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Utensils, Coffee, Sun, Moon, Calendar } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface MenuItem {
  id: string;
  date: string;
  breakfast: string[];
  lunch: string[];
  dinner: string[];
}

const mealIcons = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
};

const mealColors = {
  breakfast: "bg-amber-500",
  lunch: "bg-orange-500",
  dinner: "gradient-cool",
};

const MenuPage = () => {
  const [todayMenu, setTodayMenu] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayMenu();
  }, []);

  const fetchTodayMenu = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      
      const { data, error } = await supabase
        .from("daily_menus")
        .select("*")
        .eq("date", today)
        .maybeSingle();

      if (error) throw error;
      setTodayMenu(data);
    } catch (error) {
      console.error("Error fetching menu:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderMealCard = (mealType: "breakfast" | "lunch" | "dinner", items: string[]) => {
    const Icon = mealIcons[mealType];
    const color = mealColors[mealType];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-full"
      >
        <Card variant="elevated" className="h-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="capitalize">{mealType}</CardTitle>
                <CardDescription>
                  {mealType === "breakfast" && "7:00 AM - 9:00 AM"}
                  {mealType === "lunch" && "12:30 PM - 2:00 PM"}
                  {mealType === "dinner" && "7:30 PM - 9:30 PM"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {items && items.length > 0 ? (
              <ul className="space-y-2">
                {items.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/50"
                  >
                    <span className="w-2 h-2 rounded-full gradient-warm" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Menu not available yet
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <DashboardLayout role="guest">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-display font-bold mb-2">Today's Menu</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : todayMenu ? (
          <div className="grid md:grid-cols-3 gap-6">
            {renderMealCard("breakfast", todayMenu.breakfast)}
            {renderMealCard("lunch", todayMenu.lunch)}
            {renderMealCard("dinner", todayMenu.dinner)}
          </div>
        ) : (
          <Card variant="elevated" className="text-center py-12">
            <Utensils className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Menu Posted</h3>
            <p className="text-muted-foreground">
              Today's menu hasn't been posted yet. Check back later!
            </p>
          </Card>
        )}

        {/* Meal Timings */}
        <Card variant="glass" className="border-primary/20">
          <CardHeader>
            <CardTitle>Meal Timings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <Coffee className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="font-medium">Breakfast</p>
                  <p className="text-sm text-muted-foreground">7:00 AM - 9:00 AM</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <Sun className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="font-medium">Lunch</p>
                  <p className="text-sm text-muted-foreground">12:30 PM - 2:00 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <Moon className="w-5 h-5 text-secondary" />
                <div>
                  <p className="font-medium">Dinner</p>
                  <p className="text-sm text-muted-foreground">7:30 PM - 9:30 PM</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MenuPage;
