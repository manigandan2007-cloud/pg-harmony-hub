import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shirt, Clock, AlertTriangle, Calendar, Check } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const timeSlots = [
  { time: "06:00 - 07:00", isPeak: false },
  { time: "07:00 - 08:00", isPeak: true },
  { time: "08:00 - 09:00", isPeak: true },
  { time: "09:00 - 10:00", isPeak: false },
  { time: "10:00 - 11:00", isPeak: false },
  { time: "11:00 - 12:00", isPeak: false },
  { time: "12:00 - 13:00", isPeak: false },
  { time: "13:00 - 14:00", isPeak: false },
  { time: "14:00 - 15:00", isPeak: false },
  { time: "15:00 - 16:00", isPeak: false },
  { time: "16:00 - 17:00", isPeak: false },
  { time: "17:00 - 18:00", isPeak: true },
  { time: "18:00 - 19:00", isPeak: true },
  { time: "19:00 - 20:00", isPeak: true },
  { time: "20:00 - 21:00", isPeak: false },
  { time: "21:00 - 22:00", isPeak: false },
];

const machines = ["Machine 1", "Machine 2", "Machine 3"];

const getNextDays = () => {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    days.push({
      value: date.toISOString().split("T")[0],
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    });
  }
  return days;
};

interface LaundryBooking {
  id: string;
  user_id: string;
  machine: string;
  time_slot: string;
  booking_date: string;
  status: string;
}

const LaundryPage = () => {
  const [selectedDate, setSelectedDate] = useState(getNextDays()[0].value);
  const [selectedMachine, setSelectedMachine] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [myBookings, setMyBookings] = useState<LaundryBooking[]>([]);

  const days = getNextDays();

  useEffect(() => {
    fetchBookings();
  }, [selectedDate]);

  const fetchBookings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: bookings } = await supabase
      .from("laundry_bookings")
      .select("*")
      .eq("booking_date", selectedDate) as { data: LaundryBooking[] | null };

    if (bookings) {
      setBookedSlots(bookings.map(b => `${b.machine}-${b.time_slot}`));
      setMyBookings(bookings.filter(b => b.user_id === user.id));
    }
  };

  const handleBook = async () => {
    if (!selectedMachine || !selectedSlot) {
      toast.error("Please select a machine and time slot");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("laundry_bookings").insert({
        user_id: user.id,
        booking_date: selectedDate,
        machine: selectedMachine,
        time_slot: selectedSlot,
      } as any);

      if (error) throw error;
      toast.success("Laundry slot booked successfully!");
      setSelectedSlot("");
      setSelectedMachine("");
      fetchBookings();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const isSlotBooked = (machine: string, slot: string) => {
    return bookedSlots.includes(`${machine}-${slot}`);
  };

  return (
    <DashboardLayout role="guest">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-display font-bold mb-2">Laundry Booking</h1>
          <p className="text-muted-foreground">Book a washing machine slot for your convenience</p>
        </motion.div>

        {/* Peak Time Warning */}
        <Card className="border-warning/50 bg-warning/10">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
            <p className="text-sm">
              <strong>Peak Hours:</strong> 7-9 AM and 5-8 PM. Slots fill up quickly during these times!
            </p>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Booking Form */}
          <div className="lg:col-span-2 space-y-4">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Select Date & Machine
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Select value={selectedDate} onValueChange={setSelectedDate}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select date" />
                      </SelectTrigger>
                      <SelectContent>
                        {days.map((day) => (
                          <SelectItem key={day.value} value={day.value}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Machine</label>
                    <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select machine" />
                      </SelectTrigger>
                      <SelectContent>
                        {machines.map((machine) => (
                          <SelectItem key={machine} value={machine}>
                            {machine}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Time Slots */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Available Time Slots
                </CardTitle>
                <CardDescription>
                  {selectedMachine ? `Showing slots for ${selectedMachine}` : "Select a machine to see available slots"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedMachine ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {timeSlots.map((slot) => {
                      const isBooked = isSlotBooked(selectedMachine, slot.time);
                      const isSelected = selectedSlot === slot.time;
                      
                      return (
                        <button
                          key={slot.time}
                          onClick={() => !isBooked && setSelectedSlot(slot.time)}
                          disabled={isBooked}
                          className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                            isBooked
                              ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                              : isSelected
                              ? "gradient-warm text-white shadow-glow scale-105"
                              : slot.isPeak
                              ? "bg-warning/20 text-warning-foreground hover:bg-warning/30 border border-warning/30"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                        >
                          <span className="block">{slot.time}</span>
                          {slot.isPeak && !isBooked && (
                            <span className="text-xs opacity-70">Peak</span>
                          )}
                          {isBooked && <span className="text-xs">Booked</span>}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shirt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Select a machine to view available slots</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Book Button */}
            {selectedMachine && selectedSlot && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Button
                  variant="hero"
                  size="xl"
                  className="w-full"
                  onClick={handleBook}
                  disabled={loading}
                >
                  {loading ? "Booking..." : `Book ${selectedMachine} at ${selectedSlot}`}
                </Button>
              </motion.div>
            )}
          </div>

          {/* My Bookings */}
          <div>
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-success" />
                  My Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myBookings.length > 0 ? (
                  <div className="space-y-3">
                    {myBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="p-3 bg-success/10 rounded-xl border border-success/20"
                      >
                        <p className="font-medium">{booking.machine}</p>
                        <p className="text-sm text-muted-foreground">{booking.time_slot}</p>
                        <p className="text-xs text-success mt-1">Confirmed</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Shirt className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No bookings for this date</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LaundryPage;
