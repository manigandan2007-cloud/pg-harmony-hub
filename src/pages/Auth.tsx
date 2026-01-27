import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Building2, Users, Mail, Lock, Phone, User, ArrowLeft, GraduationCap, Briefcase, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const phoneSchema = z.string().regex(/^[0-9]{10}$/, "Please enter a valid 10-digit phone number");

const courses = [
  "B.Tech", "B.E.", "B.Sc", "B.Com", "BBA", "BCA",
  "M.Tech", "M.E.", "M.Sc", "M.Com", "MBA", "MCA",
  "MBBS", "MD", "B.Pharm", "M.Pharm", "LLB", "LLM",
  "Other"
];

const years = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "Internship"];

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const role = searchParams.get("role") || "guest";
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [occupation, setOccupation] = useState<"student" | "work">("student");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("");
  const [workType, setWorkType] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  useEffect(() => {
    // Check if already logged in
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate(role === "head" ? "/head/dashboard" : "/guest/dashboard");
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        // Create profile after signup
        const metadata = session.user.user_metadata;
        if (metadata?.name) {
          const { error } = await supabase.from("profiles").insert({
            user_id: session.user.id,
            name: metadata.name,
            mobile: metadata.phone || "",
            occupation: metadata.occupation || "student",
            course: metadata.course,
            year: metadata.year,
            work_type: metadata.work_type,
          } as any);
          
          if (error && !error.message.includes("duplicate")) {
            console.error("Error creating profile:", error);
          }

          // Create user role
          await supabase.from("user_roles").insert({
            user_id: session.user.id,
            role: metadata.role || "guest",
          } as any);
        }
        
        navigate(role === "head" ? "/head/dashboard" : "/guest/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs
      emailSchema.parse(email);
      passwordSchema.parse(password);
      
      if (!isLogin) {
        phoneSchema.parse(phone);
        
        if (!name.trim()) {
          throw new Error("Please enter your name");
        }
        
        if (role === "guest" && occupation === "student" && (!course || !year)) {
          throw new Error("Please select your course and year");
        }
        
        if (role === "guest" && occupation === "work" && !workType.trim()) {
          throw new Error("Please enter your work type");
        }

        // Validate invite code for head registration
        if (role === "head") {
          if (!inviteCode.trim()) {
            throw new Error("Please enter your admin invite code");
          }
          
          // Validate the invite code via database function
          const { data: isValid, error: validateError } = await supabase
            .rpc('validate_head_invite_code', { invite_code: inviteCode.trim() });
          
          if (validateError) {
            throw new Error("Failed to validate invite code");
          }
          
          if (!isValid) {
            throw new Error("Invalid or expired invite code");
          }
        }
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      } else {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              name,
              phone,
              role,
              occupation: role === "guest" ? occupation : undefined,
              course: role === "guest" && occupation === "student" ? course : undefined,
              year: role === "guest" && occupation === "student" ? year : undefined,
              work_type: role === "guest" && occupation === "work" ? workType : undefined,
            }
          }
        });
        if (error) throw error;
        
        // Consume the invite code after successful head registration
        if (role === "head" && signUpData.user) {
          await supabase.rpc('consume_head_invite_code', { 
            invite_code: inviteCode.trim(),
            user_uuid: signUpData.user.id
          });
        }
        
        toast.success("Account created successfully!");
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 gradient-sunset opacity-10" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <Card variant="elevated" className="overflow-hidden">
          <div className={`h-2 ${role === "head" ? "bg-secondary" : "gradient-warm"}`} />
          
          <CardHeader className="text-center pb-2">
            <div className={`w-16 h-16 rounded-2xl ${role === "head" ? "bg-secondary" : "gradient-warm"} flex items-center justify-center mx-auto mb-4`}>
              {role === "head" ? (
                <Building2 className="w-8 h-8 text-secondary-foreground" />
              ) : (
                <Users className="w-8 h-8 text-primary-foreground" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {role === "head" ? "PG Head" : "Guest"} {isLogin ? "Login" : "Sign Up"}
            </CardTitle>
            <CardDescription>
              {isLogin ? "Welcome back! Please sign in to continue" : "Create your account to get started"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4"
                  >
                    {/* Admin Invite Code - Only for Head registration */}
                    {role === "head" && (
                      <div className="space-y-2">
                        <Label htmlFor="inviteCode">Admin Invite Code</Label>
                        <div className="relative">
                          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="inviteCode"
                            placeholder="Enter your admin invite code"
                            value={inviteCode}
                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                            className="pl-10 font-mono"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Contact the existing PG admin to get an invite code
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="name"
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Mobile Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          placeholder="10-digit mobile number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {role === "guest" && (
                      <>
                        <div className="space-y-2">
                          <Label>Occupation</Label>
                          <RadioGroup
                            value={occupation}
                            onValueChange={(value: "student" | "work") => setOccupation(value)}
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="student" id="student" />
                              <Label htmlFor="student" className="flex items-center gap-2 cursor-pointer">
                                <GraduationCap className="w-4 h-4" /> Student
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="work" id="work" />
                              <Label htmlFor="work" className="flex items-center gap-2 cursor-pointer">
                                <Briefcase className="w-4 h-4" /> Working
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {occupation === "student" && (
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label>Course</Label>
                              <Select value={course} onValueChange={setCourse}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select course" />
                                </SelectTrigger>
                                <SelectContent>
                                  {courses.map((c) => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Year</Label>
                              <Select value={year} onValueChange={setYear}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                  {years.map((y) => (
                                    <SelectItem key={y} value={y}>{y}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        )}

                        {occupation === "work" && (
                          <div className="space-y-2">
                            <Label htmlFor="workType">Work Type</Label>
                            <div className="relative">
                              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                id="workType"
                                placeholder="e.g. Software Engineer, Doctor"
                                value={workType}
                                onChange={(e) => setWorkType(e.target.value)}
                                className="pl-10"
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                variant={role === "head" ? "secondary" : "hero"}
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
