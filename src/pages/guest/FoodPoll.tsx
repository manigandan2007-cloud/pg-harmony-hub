import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart3, Star, ThumbsUp } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Poll {
  id: string;
  question: string;
  options: string[];
  created_at: string;
  votes: Record<string, number>;
  userVote?: string;
  ratings: { rating: number; count: number }[];
  userRating?: number;
}

const FoodPollPage = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: pollsData, error } = await supabase
        .from("food_polls")
        .select("*, food_poll_votes(*), food_poll_ratings(*)")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedPolls = (pollsData || []).map((poll: any) => {
        const votes: Record<string, number> = {};
        const options = poll.options || [];
        options.forEach((opt: string) => (votes[opt] = 0));
        
        poll.food_poll_votes?.forEach((vote: any) => {
          if (votes[vote.option] !== undefined) {
            votes[vote.option]++;
          }
        });

        const userVote = poll.food_poll_votes?.find((v: any) => v.user_id === user?.id)?.option;
        
        // Calculate ratings
        const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        poll.food_poll_ratings?.forEach((r: any) => {
          ratingCounts[r.rating]++;
        });
        const ratings = Object.entries(ratingCounts).map(([rating, count]) => ({
          rating: parseInt(rating),
          count: count as number,
        }));

        const userRating = poll.food_poll_ratings?.find((r: any) => r.user_id === user?.id)?.rating;

        return {
          id: poll.id,
          question: poll.question,
          options,
          created_at: poll.created_at,
          votes,
          userVote,
          ratings,
          userRating,
        };
      });

      setPolls(formattedPolls);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId: string, option: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if already voted
      const { data: existingVote } = await supabase
        .from("food_poll_votes")
        .select("*")
        .eq("poll_id", pollId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingVote) {
        // Update vote
        await supabase
          .from("food_poll_votes")
          .update({ option })
          .eq("id", existingVote.id);
      } else {
        // Insert new vote
        await supabase.from("food_poll_votes").insert({
          poll_id: pollId,
          user_id: user.id,
          option,
        });
      }

      toast.success("Vote recorded!");
      fetchPolls();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleRating = async (pollId: string, rating: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: existingRating } = await supabase
        .from("food_poll_ratings")
        .select("*")
        .eq("poll_id", pollId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingRating) {
        await supabase
          .from("food_poll_ratings")
          .update({ rating })
          .eq("id", existingRating.id);
      } else {
        await supabase.from("food_poll_ratings").insert({
          poll_id: pollId,
          user_id: user.id,
          rating,
        });
      }

      toast.success("Rating submitted!");
      fetchPolls();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getTotalVotes = (votes: Record<string, number>) => {
    return Object.values(votes).reduce((a, b) => a + b, 0);
  };

  const getAverageRating = (ratings: { rating: number; count: number }[]) => {
    const total = ratings.reduce((acc, r) => acc + r.rating * r.count, 0);
    const count = ratings.reduce((acc, r) => acc + r.count, 0);
    return count > 0 ? (total / count).toFixed(1) : "0.0";
  };

  return (
    <DashboardLayout role="guest">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-display font-bold mb-2">Food Polls</h1>
          <p className="text-muted-foreground">Vote for your favorite dishes and rate the food!</p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : polls.length === 0 ? (
          <Card variant="elevated" className="text-center py-12">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No Active Polls</h3>
            <p className="text-muted-foreground">Check back later for new food polls!</p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {polls.map((poll, index) => (
              <motion.div
                key={poll.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="elevated">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ThumbsUp className="w-5 h-5 text-primary" />
                      {poll.question}
                    </CardTitle>
                    <CardDescription>
                      {getTotalVotes(poll.votes)} votes • Created {new Date(poll.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Voting Options */}
                    <div className="space-y-3">
                      {poll.options.map((option) => {
                        const voteCount = poll.votes[option] || 0;
                        const totalVotes = getTotalVotes(poll.votes);
                        const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                        const isSelected = poll.userVote === option;

                        return (
                          <button
                            key={option}
                            onClick={() => handleVote(poll.id, option)}
                            className={`w-full p-4 rounded-xl text-left transition-all relative overflow-hidden ${
                              isSelected
                                ? "border-2 border-primary"
                                : "border-2 border-border hover:border-primary/50"
                            }`}
                          >
                            <div
                              className="absolute inset-0 gradient-warm opacity-20"
                              style={{ width: `${percentage}%` }}
                            />
                            <div className="relative flex items-center justify-between">
                              <span className="font-medium">{option}</span>
                              <span className="text-sm text-muted-foreground">
                                {voteCount} ({percentage.toFixed(0)}%)
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Rating Section */}
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Rate this poll</span>
                        <span className="text-sm text-muted-foreground">
                          Avg: {getAverageRating(poll.ratings)} ★
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => handleRating(poll.id, rating)}
                            className={`w-10 h-10 rounded-xl transition-all ${
                              poll.userRating && rating <= poll.userRating
                                ? "gradient-warm text-white"
                                : "bg-muted hover:bg-muted/80"
                            }`}
                          >
                            <Star
                              className={`w-5 h-5 mx-auto ${
                                poll.userRating && rating <= poll.userRating
                                  ? "fill-current"
                                  : ""
                              }`}
                            />
                          </button>
                        ))}
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

export default FoodPollPage;
