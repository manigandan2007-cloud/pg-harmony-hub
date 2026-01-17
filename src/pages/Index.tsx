import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Building2, Users, Heart, Shield, Utensils, Shirt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import heroImage from "@/assets/hero-pg.jpg";

const features = [
  { icon: Shirt, title: "Laundry Booking", description: "Book washing machine slots easily" },
  { icon: Utensils, title: "Meal Management", description: "Daily menus & food polls" },
  { icon: Shield, title: "Complaint System", description: "Quick resolution for issues" },
  { icon: Heart, title: "Community Living", description: "Feel at home, always" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Cozy PG living space"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6"
            >
              <Building2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Your Home Away From Home</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
              Welcome to{" "}
              <span className="text-gradient">StayNest</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Experience comfortable PG living with modern amenities. 
              We believe you should never miss your family when you're chasing your dreams.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/auth?role=guest">
                <Button variant="hero" size="xl" className="w-full sm:w-auto">
                  <Users className="w-5 h-5 mr-2" />
                  I'm a Guest
                </Button>
              </Link>
              <Link to="/auth?role=head">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  <Building2 className="w-5 h-5 mr-2" />
                  I'm a PG Head
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 rounded-full border-2 border-primary/40 flex items-start justify-center p-2"
          >
            <div className="w-1 h-2 rounded-full bg-primary" />
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-display font-bold mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              StayNest provides a complete living experience with all the amenities you need
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card variant="elevated" className="h-full text-center p-6">
                  <CardContent className="p-0">
                    <div className="w-14 h-14 rounded-2xl gradient-warm flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="text-6xl mb-6">🏠</div>
            <blockquote className="text-2xl md:text-3xl font-display font-medium text-foreground mb-6 italic">
              "Home is not where you are from, it is where you belong. 
              Some of us travel the whole world to find it. Others find it in a person."
            </blockquote>
            <p className="text-muted-foreground">— Making you feel at home, one stay at a time</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 StayNest. Your comfort is our priority.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
