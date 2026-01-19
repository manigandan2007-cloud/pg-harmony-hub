import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Phone, Building2, GraduationCap, Briefcase, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";

interface Resident {
  id: string;
  name: string;
  room_number: string | null;
  occupation: string;
  course?: string | null;
  year?: string | null;
  work_type?: string | null;
  mobile: string;
  photo_url?: string | null;
}

const GuestsPage = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("room_number");

      if (error) throw error;
      setResidents((data as Resident[]) || []);
    } catch (error) {
      console.error("Error fetching residents:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResidents = residents.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.room_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.mobile.includes(searchTerm)
  );

  const students = residents.filter((r) => r.occupation === "student");
  const working = residents.filter((r) => r.occupation === "working");

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
              <Users className="h-6 w-6" />
              Manage Guests
            </h1>
            <p className="text-muted-foreground">View and manage all residents</p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Residents</p>
                  <p className="text-2xl font-bold">{residents.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/10">
                  <GraduationCap className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <Briefcase className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Working</p>
                  <p className="text-2xl font-bold">{working.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, room, or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Residents List */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : filteredResidents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No residents found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredResidents.map((resident, index) => (
              <motion.div
                key={resident.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={resident.photo_url || undefined} />
                        <AvatarFallback className="bg-secondary text-secondary-foreground">
                          {resident.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold truncate">{resident.name}</h3>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            Room {resident.room_number || "N/A"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          {resident.occupation === "student" ? (
                            <span className="flex items-center gap-1">
                              <GraduationCap className="h-3 w-3" />
                              {resident.course} - {resident.year}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {resident.work_type}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {resident.mobile}
                          </span>
                        </div>
                      </div>
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

export default GuestsPage;
