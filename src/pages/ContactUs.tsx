import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: 'EMAIL US',
      primary: 'support@aijim.com',
      secondary: 'orders@aijim.com',
      description: 'Get quick responses within 24 hours'
    },
    {
      icon: Phone,
      title: 'CALL US',
      primary: '+91 7672080881 , +91 9581319687',
      secondary: '+91 9581319687',
      description: 'Available Mon-Sat, 10 AM - 7 PM'
    },
    {
      icon: MapPin,
      title: 'VISIT ',
      primary: 'Our Online Store ',
      secondary: 'To grab the best quality Premium ',
      description: 'Products at affordable price '
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container-custom pt-16 pb-8">
          <div className="flex items-center mb-8">
            <Link to="/" className="mr-4 text-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">CONTACT US</h1>
              <p className="text-muted-foreground italic font-semibold">Get in touch with our team</p>
            </div>
          </div>
        </div>

        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-black text-foreground mb-1 uppercase tracking-wide">
                  GET IN TOUCH
                </h2>
                <p className="text-muted-foreground font-semibold italic leading-relaxed mb-8">
                  Have questions about our products, need style advice, or want to share feedback? 
                  We're here to help. Choose the best way to reach us below.
                </p>
              </div>

              <div className="space-y-6">
                {contactInfo.map((contact, index) => {
                  const Icon = contact.icon;
                  return (
                    <div
                      key={index}
                      className="bg-card border border-border rounded-lg p-6 shadow-glow hover:shadow-glow-strong transition-all duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-white border-2 border-accent rounded-lg flex items-center justify-center">
                          <Icon size={24} className="text-accent" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-foreground  uppercase tracking-wide text-md">
                            {contact.title}
                          </h3>
                          <p className="text-foreground/90 font-bold mb-1">{contact.primary}</p>
                         <p className="text-muted-foreground text-sm font-semibold italic ">{contact.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="bg-card border border-border rounded-lg p-8 shadow-glow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-accent text-accent-foreground rounded-lg flex items-center justify-center">
                    <MessageCircle size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-foreground uppercase tracking-wide">
                      SEND MESSAGE
                    </h2>
                    <p className="text-muted-foreground font-semibold italic text-sm">We'll get back to you within 24 hours</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-foreground font-bold mb-2 uppercase text-sm tracking-wide">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                      className="bg-background border-border focus:border-accent h-12 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-foreground font-bold mb-2 uppercase text-sm tracking-wide">
                      Email Address *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email address"
                      className="bg-background border-border focus:border-accent h-12 font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-foreground font-bold mb-2 uppercase text-sm tracking-wide">
                      Message *
                    </label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Tell us how we can help you..."
                      className="bg-background border-border focus:border-accent min-h-32 font-medium resize-none"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold h-12 shadow-glow"
                  >
                    <Send size={20} className="mr-2" />
                    SEND MESSAGE
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactUs;