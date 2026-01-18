import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Guest Pages
import GuestDashboard from "./pages/guest/Dashboard";
import Laundry from "./pages/guest/Laundry";
import Packages from "./pages/guest/Packages";
import FoodPoll from "./pages/guest/FoodPoll";
import Menu from "./pages/guest/Menu";
import Complaints from "./pages/guest/Complaints";
import LostFound from "./pages/guest/LostFound";
import Bills from "./pages/guest/Bills";
import Residents from "./pages/guest/Residents";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          
          {/* Guest Routes */}
          <Route path="/guest/dashboard" element={<GuestDashboard />} />
          <Route path="/guest/laundry" element={<Laundry />} />
          <Route path="/guest/packages" element={<Packages />} />
          <Route path="/guest/food-poll" element={<FoodPoll />} />
          <Route path="/guest/menu" element={<Menu />} />
          <Route path="/guest/complaints" element={<Complaints />} />
          <Route path="/guest/lost-found" element={<LostFound />} />
          <Route path="/guest/bills" element={<Bills />} />
          <Route path="/guest/residents" element={<Residents />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
