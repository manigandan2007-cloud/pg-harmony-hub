import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Phone, Briefcase, GraduationCap, MapPin } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Resident {
  id: string;
  name: string;
  room_number: string;
  occupation: "student" | "work";
  course?: string;
  year?: string;
  work_type?: string;
  mobile?: string;
  photo_url?: string;
}

const ResidentsPage = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("room_number") as { data: Resident[] | null; error: any };

      if (error) throw error;
      setResidents(data || []);
    } catch (error) {
      console.error("Error fetching residents:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="guest">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-display font-bold mb-2">Residents Directory</h1>
          <p className="text-muted-foreground">
            {residents.length} residents in our community
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card variant="elevated">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-primary">{residents.length}</p>
              <p className="text-sm text-muted-foreground">Total Residents</p>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-secondary">
                {residents.filter((r) => r.occupation === "student").length}
              </p>
              <p className="text-sm text-muted-foreground">Students</p>
            </CardContent>
          </Card>
          <Card variant="elevated">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-accent-foreground">
                {residents.filter((r) => r.occupation === "work").length}
              </p>
              <p className="text-sm text-muted-foreground">Working</p>
            </CardContent>
          </Card>
        </div>

        {/* Residents List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : residents.length === 0 ? (
          <Card variant="elevated" className="text-center py-12">
            <CardContent>
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Residents Yet</h3>
              <p className="text-muted-foreground">Residents will appear here once they register</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {residents.map((resident, index) => (
              <motion.div
                key={resident.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card variant="elevated" className="h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-14 h-14">
                        <AvatarImage src={resident.photo_url} />
                        <AvatarFallback className="gradient-warm text-white text-lg">
                          {resident.name?.charAt(0)?.toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{resident.name}</h3>
                        {resident.room_number && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span>Room {resident.room_number}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        {resident.occupation === "student" ? (
                          <>
                            <GraduationCap className="w-4 h-4 text-secondary" />
                            <span>
                              {resident.course} - {resident.year}
                            </span>
                          </>
                        ) : (
                          <>
                            <Briefcase className="w-4 h-4 text-primary" />
                            <span>{resident.work_type || "Working Professional"}</span>
                          </>
                        )}
                      </div>
                      {resident.mobile && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>{resident.mobile}</span>
                        </div>
                      )}
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

export default ResidentsPage;
