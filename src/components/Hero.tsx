import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroImage from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-subtle-gradient">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-hero-gradient opacity-5" />
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="animate-fade-in">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Build Something
            <span className="bg-hero-gradient bg-clip-text text-transparent"> Amazing</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Transform your ideas into reality with our cutting-edge platform. 
            Join thousands of creators building the future.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button variant="hero" size="lg" className="text-lg px-8 py-4 h-auto">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 h-auto">
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-accent/20 rounded-full blur-xl animate-float" />
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-float" style={{ animationDelay: "1s" }} />
      </div>
    </section>
  );
};

export default Hero;