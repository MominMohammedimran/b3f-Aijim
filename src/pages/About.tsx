import React from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Users, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
              ABOUT <span className="text-accent">AIJIM</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              We're redefining streetwear with oversized perfection. 
              Every piece is crafted for comfort, style, and self-expression.
            </p>
            <Link to="/products">
              <Button className="bg-accent hover:bg-accent/90 text-white font-bold px-8 py-4 rounded-none">
                SHOP OUR COLLECTION
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Our Story */}
        <section className="py-16 px-4 bg-card">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-black mb-6">
                  OUR STORY
                </h2>
                <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                  Founded with a passion for comfortable, oversized streetwear, AIJIM emerged 
                  from the need for clothing that doesn't compromise on style or comfort. 
                  We believe that fashion should be an extension of your personality.
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  From oversized hoodies to baggy tees, every piece in our collection 
                  is designed to make you feel confident, comfortable, and authentically you.
                </p>
              </div>
              <div className="bg-muted aspect-square rounded-lg flex items-center justify-center">
                <span className="text-4xl font-black text-muted-foreground">AIJIM</span>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-center mb-12">
              WHAT WE STAND FOR
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <Star className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4">QUALITY FIRST</h3>
                <p className="text-muted-foreground">
                  Premium materials and meticulous craftsmanship in every piece we create.
                </p>
              </div>
              <div className="text-center p-6">
                <Users className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4">COMMUNITY</h3>
                <p className="text-muted-foreground">
                  Building a community of individuals who value comfort and authentic style.
                </p>
              </div>
              <div className="text-center p-6">
                <Award className="h-12 w-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-4">INNOVATION</h3>
                <p className="text-muted-foreground">
                  Constantly evolving our designs to meet the needs of modern streetwear.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-card">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-6">
              READY TO EXPERIENCE AIJIM?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Discover our latest drops and join the oversized revolution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products">
                <Button className="bg-accent hover:bg-accent/90 text-white font-bold px-8 py-4 rounded-none">
                  SHOP NOW
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline" className="border-accent text-accent hover:bg-accent hover:text-white font-bold px-8 py-4 rounded-none">
                  CONTACT US
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default About;