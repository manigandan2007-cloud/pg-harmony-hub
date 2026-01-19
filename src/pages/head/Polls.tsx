import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Plus, Users, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FoodPoll {
  id: string;
  question: string;
  options: { options: string[] };
  is_active: boolean;
  ends_at: string | null;
  created_at: string;
  food_poll_votes: { option: string }[];
}

const HeadPollsPage = () => {
  const [polls, setPolls] = useState<FoodPoll[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", ""]);
  const [endsAt, setEndsAt] = useState("");

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const { data, error } = await supabase
        .from("food_polls")
        .select(`
          *,
          food_poll_votes (option)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPolls((data as unknown as FoodPoll[]) || []);
    } catch (error) {
      console.error("Error fetching polls:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validOptions = options.filter((o) => o.trim());
    if (!question.trim() || validOptions.length < 2) {
      toast.error("Please enter a question and at least 2 options");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("food_polls").insert({
        question: question.trim(),
        options: { options: validOptions },
        ends_at: endsAt || null,
        created_by: user.id,
      });

      if (error) throw error;

      toast.success("Poll created successfully");
      setDialogOpen(false);
      resetForm();
      fetchPolls();
    } catch (error: any) {
      toast.error(error.message || "Failed to create poll");
    } finally {
      setSubmitting(false);
    }
  };

  const togglePollStatus = async (pollId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("food_polls")
        .update({ is_active: !currentStatus })
        .eq("id", pollId);

      if (error) throw error;
      toast.success(`Poll ${!currentStatus ? "activated" : "deactivated"}`);
      fetchPolls();
    } catch (error: any) {
      toast.error(error.message || "Failed to update poll");
    }
  };

  const resetForm = () => {
    setQuestion("");
    setOptions(["", "", ""]);
    setEndsAt("");
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const getVoteCounts = (poll: FoodPoll) => {
    const counts: Record<string, number> = {};
    poll.options.options.forEach((opt) => {
      counts[opt] = poll.food_poll_votes.filter((v) => v.option === opt).length;
    });
    return counts;
  };

  const activePolls = polls.filter((p) => p.is_active);
  const inactivePolls = polls.filter((p) => !p.is_active);

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
              <BarChart3 className="h-6 w-6" />
              Food Polls
            </h1>
            <p className="text-muted-foreground">Create and manage food preference polls</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={resetForm}>
                <Plus className="h-4 w-4" />
                Create Poll
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Poll</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Question</Label>
                  <Input
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What should we serve for Sunday dinner?"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Options</Label>
                  {options.map((opt, index) => (
                    <Input
                      key={index}
                      value={opt}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                    />
                  ))}
                  {options.length < 6 && (
                    <Button type="button" variant="outline" size="sm" onClick={addOption}>
                      Add Option
                    </Button>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Input
                    type="datetime-local"
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Poll"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-500/10">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Polls</p>
                  <p className="text-2xl font-bold">{activePolls.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gray-500/10">
                  <BarChart3 className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Closed Polls</p>
                  <p className="text-2xl font-bold">{inactivePolls.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Polls List */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : polls.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No polls created yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {polls.map((poll, index) => {
              const voteCounts = getVoteCounts(poll);
              const totalVotes = poll.food_poll_votes.length;

              return (
                <motion.div
                  key={poll.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{poll.question}</CardTitle>
                        <div className="flex items-center gap-3">
                          <Badge variant={poll.is_active ? "default" : "secondary"}>
                            {poll.is_active ? "Active" : "Closed"}
                          </Badge>
                          <Switch
                            checked={poll.is_active}
                            onCheckedChange={() => togglePollStatus(poll.id, poll.is_active)}
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {totalVotes} votes
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {poll.options.options.map((option) => {
                          const count = voteCounts[option] || 0;
                          const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;

                          return (
                            <div key={option} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span>{option}</span>
                                <span className="text-muted-foreground">
                                  {count} ({percentage.toFixed(0)}%)
                                </span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default HeadPollsPage;
