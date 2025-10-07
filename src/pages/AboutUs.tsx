import React from 'react';
import Layout from '@/components/layout/Layout';
import { Target, Heart, Leaf, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AboutUs = () => {
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
        
          
          {/* Content */}
          <div className="absolute text-center container-custom">
            <div className="animate-fade-in">
              <h1 className="text-2xl md:text-3xl font-black text-foreground mb-0 tracking-tight">
                WE ARE <span className="text-accent  font-black text-foreground">AIJIM</span>
              </h1>
              <div className="w-full h-2 bg-accent mx-0 mb-1 bg-white animate-pulse"></div>
              <p className="text-md md:text-lg italic text-foreground max-w-3xl mx-auto font-semibold leading-relaxed">
                Defining streetwear for the <span className="text-accent text-foreground font-semibold">fearless</span>,
                <br />creating fashion for the <span className="text-accent text-foreground font-semibold">authentic</span>.
              </p>
            </div>
          </div>

          {/* Animated elements */}
          </div>

        {/* Values Grid */}
        <div className="container-custom py-10">
          <div className="grid md:grid-cols-2 gap-2 max-w-6xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div 
                  key={index}
                  className="group bg-card border border-border rounded-lg p-4 shadow-glow hover:shadow-glow-strong transition-all duration-300 hover:scale-105"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 text-white bg-white border-2 border-accent rounded-lg flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-300">
                      <Icon size={15} className="text-accent group-hover:text-accent-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                        {value.title}
                      </h3>
                      <p className="text-foreground/50 italic text-xs font-medium leading-snug">
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
        {/*<div className="bg-card border-y border-border py-16">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
                PREMIUM STREETWEAR. <span className="text-foregroungd font-semibold">AUTHENTIC STYLE.</span>
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
        </div>/*}

        {/* Craft Section */}
        <div className="container-custom py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-1">
                CRAFTED WITH <span className="text-foreground text-black">PRECISION</span>
              </h2>
              <div className="w-full h-1 bg-white mb-2"></div>
              <div className="space-y-0 text-foreground/60 font-semibold italic text-sm leading-tight">
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
            
            <div className="space-y-6 italic ">
              <div className="bg-card border border-border rounded-lg p-6   shadow-glow">
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
      
      </div>
    </Layout>
  );
};

export default AboutUs;