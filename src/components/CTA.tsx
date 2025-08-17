import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";

export const CTA = () => {
  return (
    <section className="py-24 bg-gradient-primary relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border border-white/20 rounded-full" />
        <div className="absolute top-20 right-20 w-24 h-24 border border-white/20 rounded-full" />
        <div className="absolute bottom-20 left-1/4 w-16 h-16 border border-white/20 rounded-full" />
        <div className="absolute bottom-32 right-1/3 w-20 h-20 border border-white/20 rounded-full" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="ml-2 text-primary-foreground/80">Trusted by 10,000+ users</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 leading-relaxed">
            Join thousands of developers and creators who are already building amazing things. 
            Start your free trial today and see the difference.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-background text-primary hover:bg-background/90 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
            >
              Contact Sales
            </Button>
          </div>

          <div className="mt-8 text-sm text-primary-foreground/60">
            No credit card required • Cancel anytime • 24/7 support
          </div>
        </div>
      </div>
    </section>
  );
};