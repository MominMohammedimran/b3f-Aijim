import React from 'react';
import Layout from '@/components/layout/Layout';
import { Target, Heart, Leaf, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AboutUsNew = () => {
  const values = [
    {
      icon: Target,
      title: 'BRAND STORY',
      description: 'Born from the streets, AIJIM represents the fusion of urban culture and premium craftsmanship. We create clothing that speaks to the bold, the fearless, and the authentic.'
    },
    {
      icon: Heart,
      title: 'MISSION',
      description: 'To redefine streetwear by creating premium, comfortable clothing that empowers individuals to express their unique style and confidence.'
    },
    {
      icon: Leaf,
      title: 'SUSTAINABILITY',
      description: 'We are committed to sustainable fashion practices, using eco-friendly materials and ethical manufacturing processes to reduce our environmental impact.'
    },
    {
      icon: Users,
      title: 'COMMUNITY',
      description: 'AIJIM is more than a brand - it\'s a community of like-minded individuals who value authenticity, creativity, and self-expression.'
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative h-screen flex items-center justify-center overflow-hidden">
          {/* Background with overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-accent/20"></div>
          
          {/* Content */}
          <div className="relative z-10 text-center container-custom">
            <div className="animate-fade-in">
              <h1 className="text-6xl md:text-8xl font-black text-foreground mb-6 tracking-tight">
                WE ARE <span className="text-accent">AIJIM</span>
              </h1>
              <div className="w-32 h-2 bg-accent mx-auto mb-8 animate-pulse"></div>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Defining streetwear for the <span className="text-accent font-bold">fearless</span>,
                <br />creating fashion for the <span className="text-accent font-bold">authentic</span>.
              </p>
            </div>
          </div>

          {/* Animated elements */}
          <div className="absolute top-20 left-10 w-2 h-2 bg-accent rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 right-16 w-3 h-3 bg-accent rounded-full animate-pulse delay-300"></div>
          <div className="absolute top-1/3 right-20 w-1 h-1 bg-accent rounded-full animate-pulse delay-700"></div>
        </div>

        {/* Values Grid */}
        <div className="container-custom py-16">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div 
                  key={index}
                  className="group bg-card border border-border rounded-lg p-8 shadow-glow hover:shadow-glow-strong transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-accent/20 border-2 border-accent rounded-lg flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
                      <Icon size={28} className="text-accent group-hover:text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-accent transition-colors">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Brand Philosophy */}
        <div className="bg-card border-y border-border py-16">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                PREMIUM STREETWEAR. <span className="text-accent">AUTHENTIC STYLE.</span>
              </h2>
              <div className="w-24 h-1 bg-accent mx-auto mb-8"></div>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Every piece we create is a statement. From the carefully selected fabrics to the precision 
                of our cuts, AIJIM represents the perfect intersection of street culture and premium quality. 
                We don't just make clothes; we craft experiences, emotions, and expressions of individuality.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Founded by creators who understand the pulse of the streets, AIJIM is for those who refuse 
                to compromise on quality or authenticity. We believe that great design should be accessible, 
                sustainable, and most importantly, true to the culture that inspires it.
              </p>
            </div>
          </div>
        </div>

        {/* Craft Section */}
        <div className="container-custom py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                CRAFTED WITH <span className="text-accent">PRECISION</span>
              </h2>
              <div className="w-16 h-1 bg-accent mb-6"></div>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Every AIJIM piece undergoes rigorous quality control. From fabric selection to final stitching, 
                  we maintain the highest standards of craftsmanship.
                </p>
                <p>
                  Our design team draws inspiration from global street culture, urban architecture, and 
                  contemporary art to create pieces that are both timeless and cutting-edge.
                </p>
                <p>
                  We work with skilled artisans who share our passion for excellence, ensuring that every 
                  garment meets our exacting standards for comfort, durability, and style.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6 shadow-glow">
                <h4 className="font-bold text-foreground mb-2">PREMIUM MATERIALS</h4>
                <p className="text-sm text-muted-foreground">100% organic cotton, sustainable fabrics, and premium blends</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 shadow-glow">
                <h4 className="font-bold text-foreground mb-2">ETHICAL PRODUCTION</h4>
                <p className="text-sm text-muted-foreground">Fair wages, safe working conditions, and transparent supply chains</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6 shadow-glow">
                <h4 className="font-bold text-foreground mb-2">QUALITY ASSURANCE</h4>
                <p className="text-sm text-muted-foreground">Multiple quality checks at every stage of production</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-accent/20 via-accent/10 to-accent/20 py-16">
          <div className="container-custom text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              JOIN THE <span className="text-accent">TRIBE</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Be part of a community that values authenticity, creativity, and premium streetwear. 
              Follow us on social media and never miss a drop.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold px-8 py-4 text-lg shadow-glow"
              >
                SHOP COLLECTION
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-accent text-accent hover:bg-accent hover:text-accent-foreground font-bold px-8 py-4 text-lg shadow-glow"
              >
                FOLLOW US
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutUsNew;