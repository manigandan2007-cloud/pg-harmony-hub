import { useState } from "react";
import { motion } from "framer-motion";
import { Package, Check, CreditCard, Smartphone, Calendar, Star } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const packages = [
  {
    name: "Normal",
    price: 8000,
    yearlyPrice: 88000,
    color: "bg-muted",
    popular: false,
    features: [
      "Basic room amenities",
      "2 meals per day",
      "Common WiFi access",
      "Weekly cleaning",
      "Shared bathroom",
    ],
  },
  {
    name: "Mid",
    price: 12000,
    yearlyPrice: 132000,
    color: "gradient-cool",
    popular: true,
    features: [
      "AC room with balcony",
      "3 meals per day",
      "High-speed WiFi",
      "Daily cleaning",
      "Attached bathroom",
      "Laundry service (2x/week)",
    ],
  },
  {
    name: "Premium",
    price: 18000,
    yearlyPrice: 198000,
    color: "gradient-warm",
    popular: false,
    features: [
      "Deluxe AC room",
      "All meals + snacks",
      "Premium WiFi + TV",
      "Daily housekeeping",
      "Private bathroom",
      "Unlimited laundry",
      "24/7 room service",
      "Gym access",
    ],
  },
];

const PackagesPage = () => {
  const [selectedPackage, setSelectedPackage] = useState<typeof packages[0] | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card">("upi");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSelectPackage = (pkg: typeof packages[0]) => {
    setSelectedPackage(pkg);
    setIsDialogOpen(true);
  };

  const handlePayment = () => {
    toast.success(`${selectedPackage?.name} package booked successfully! Payment link sent to your registered email.`);
    setIsDialogOpen(false);
  };

  const calculatePrice = (pkg: typeof packages[0]) => {
    if (billingCycle === "yearly") {
      return pkg.yearlyPrice;
    }
    return pkg.price;
  };

  return (
    <DashboardLayout role="guest">
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-display font-bold mb-2">Living Packages</h1>
          <p className="text-muted-foreground">Choose the perfect package for your stay</p>
        </motion.div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 p-2 bg-muted rounded-xl max-w-xs mx-auto">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              billingCycle === "monthly"
                ? "bg-card shadow-soft"
                : "text-muted-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              billingCycle === "yearly"
                ? "bg-card shadow-soft"
                : "text-muted-foreground"
            }`}
          >
            Yearly
            <span className="ml-1 text-xs text-success">Save 8%</span>
          </button>
        </div>

        {/* Packages Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg, index) => (
            <motion.div
              key={pkg.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                variant={pkg.popular ? "elevated" : "default"}
                className={`relative h-full flex flex-col ${pkg.popular ? "ring-2 ring-primary" : ""}`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                      <Star className="w-3 h-3" /> Most Popular
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center pt-8">
                  <div className={`w-14 h-14 ${pkg.color} rounded-2xl flex items-center justify-center mx-auto mb-3`}>
                    <Package className="w-7 h-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">{pkg.name}</CardTitle>
                  <CardDescription>
                    <span className="text-3xl font-bold text-foreground">
                      ₹{calculatePrice(pkg).toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">/{billingCycle === "yearly" ? "year" : "month"}</span>
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    variant={pkg.popular ? "hero" : "outline"}
                    className="w-full"
                    onClick={() => handleSelectPackage(pkg)}
                  >
                    Select {pkg.name}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Your Booking</DialogTitle>
            <DialogDescription>
              {selectedPackage?.name} Package - ₹{selectedPackage ? calculatePrice(selectedPackage).toLocaleString() : 0}/{billingCycle === "yearly" ? "year" : "month"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label>Billing Cycle</Label>
              <div className="flex gap-3">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                    billingCycle === "monthly"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Calendar className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Monthly</span>
                </button>
                <button
                  onClick={() => setBillingCycle("yearly")}
                  className={`flex-1 p-3 rounded-xl border-2 transition-all ${
                    billingCycle === "yearly"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Calendar className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Yearly</span>
                  <span className="block text-xs text-success">Save 8%</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Payment Method</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value: "upi" | "card") => setPaymentMethod(value)}
                className="grid grid-cols-2 gap-3"
              >
                <div>
                  <RadioGroupItem value="upi" id="upi" className="peer sr-only" />
                  <Label
                    htmlFor="upi"
                    className="flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:border-primary/50"
                  >
                    <Smartphone className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">UPI</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="card" id="card" className="peer sr-only" />
                  <Label
                    htmlFor="card"
                    className="flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:border-primary/50"
                  >
                    <CreditCard className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">Card</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="p-4 bg-muted rounded-xl">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Package</span>
                <span className="font-medium">{selectedPackage?.name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium capitalize">{billingCycle}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-primary">
                  ₹{selectedPackage ? calculatePrice(selectedPackage).toLocaleString() : 0}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="hero" onClick={handlePayment}>
              Pay ₹{selectedPackage ? calculatePrice(selectedPackage).toLocaleString() : 0}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PackagesPage;
