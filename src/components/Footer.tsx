import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-secondary/50 border-t border-border/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold bg-hero-gradient bg-clip-text text-transparent mb-4">
              YourBrand
            </h3>
            <p className="text-muted-foreground">
              Building the future, one project at a time.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Features</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Pricing</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Documentation</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">API</a></li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">About</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Blog</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Careers</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-smooth">Contact</a></li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Stay Updated</h4>
            <p className="text-muted-foreground mb-4">
              Get the latest news and updates.
            </p>
            <Button variant="accent" size="sm" className="w-full">
              Subscribe
            </Button>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/50 text-center">
          <p className="text-muted-foreground">
            © 2024 YourBrand. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;