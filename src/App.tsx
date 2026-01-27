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
import Maintenance from "./pages/guest/Maintenance";

// Head Pages
import HeadDashboard from "./pages/head/Dashboard";
import HeadGuests from "./pages/head/Guests";
import HeadBills from "./pages/head/Bills";
import HeadLostFound from "./pages/head/LostFound";
import HeadComplaints from "./pages/head/Complaints";
import HeadMenu from "./pages/head/Menu";
import HeadPolls from "./pages/head/Polls";
import HeadMaintenance from "./pages/head/Maintenance";

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
          <Route path="/guest/maintenance" element={<Maintenance />} />
          
          {/* Head Routes */}
          <Route path="/head/dashboard" element={<HeadDashboard />} />
          <Route path="/head/guests" element={<HeadGuests />} />
          <Route path="/head/bills" element={<HeadBills />} />
          <Route path="/head/lost-found" element={<HeadLostFound />} />
          <Route path="/head/complaints" element={<HeadComplaints />} />
          <Route path="/head/menu" element={<HeadMenu />} />
          <Route path="/head/polls" element={<HeadPolls />} />
          <Route path="/head/maintenance" element={<HeadMaintenance />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
