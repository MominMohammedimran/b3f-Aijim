import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Shield, Rocket, Heart, Users, Star } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Experience blazing fast performance with our optimized infrastructure and cutting-edge technology."
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Enterprise-grade security with 99.9% uptime guarantee. Your data is safe with us."
  },
  {
    icon: Rocket,
    title: "Easy to Use",
    description: "Get started in minutes with our intuitive interface and comprehensive documentation."
  },
  {
    icon: Heart,
    title: "Made with Love",
    description: "Crafted with attention to detail and passion for creating exceptional user experiences."
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Work together seamlessly with powerful collaboration tools and real-time updates."
  },
  {
    icon: Star,
    title: "Premium Support",
    description: "Get help when you need it with our 24/7 customer support and extensive knowledge base."
  }
];

const Features = () => {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Why Choose Us?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the features that make our platform the perfect choice for your next project.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-elegant transition-smooth hover:-translate-y-1 border-border/50 hover:border-primary/20"
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-hero-gradient rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-smooth shadow-glow">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;