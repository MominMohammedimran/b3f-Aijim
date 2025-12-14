import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Cookie, Users, FileText, Eye, Lock, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PrivacyPolicyNew = () => {
  const [activeSection, setActiveSection] = useState('introduction');

  const sections = [
    { id: 'introduction', title: 'Introduction', icon: Shield },
    { id: 'data-collection', title: 'Data Collection', icon: Eye },
    { id: 'data-usage', title: 'How We Use Data', icon: FileText },
    { id: 'cookies', title: 'Cookies & Tracking', icon: Cookie },
    { id: 'third-party', title: 'Third-Party Services', icon: Globe },
    { id: 'data-security', title: 'Data Security', icon: Lock },
    { id: 'user-rights', title: 'Your Rights', icon: Users },
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="container-custom pt-16 pb-8">
          <div className="flex items-center mb-8">
            <Link to="/" className="mr-4 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-4xl font-black text-foreground tracking-tight">PRIVACY POLICY</h1>
              <p className="text-muted-foreground mt-2">Last updated: December 2024</p>
            </div>
          </div>
        </div>

        <div className="container-custom">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Desktop Navigation */}
            <div className="hidden lg:block">
              <div className="sticky top-24 bg-card border border-border rounded-lg p-6 shadow-glow">
                <h3 className="font-bold text-foreground mb-4 uppercase text-sm tracking-wide">Quick Navigation</h3>
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                          activeSection === section.id
                            ? 'bg-accent text-accent-foreground font-bold shadow-glow'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon size={16} />
                        <span className="text-sm">{section.title}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Mobile Accordion View */}
              <div className="lg:hidden">
                <Accordion type="single" collapsible className="space-y-4">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <AccordionItem 
                        key={section.id} 
                        value={section.id}
                        className="bg-card border border-border rounded-lg shadow-glow overflow-hidden"
                      >
                        <AccordionTrigger className="px-6 py-4 hover:no-underline">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-accent/20 border border-accent rounded-lg flex items-center justify-center">
                              <Icon size={16} className="text-accent" />
                            </div>
                            <span className="font-bold text-foreground uppercase tracking-wide">{section.title}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                          <div className="text-muted-foreground space-y-4">
                            {section.id === 'introduction' && (
                              <div>
                                <p className="mb-4">
                                  AIJIM ("we," "our," or "us") is committed to protecting your privacy. 
                                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                                  when you visit our website and use our services.
                                </p>
                                <p>
                                  By using our service, you agree to the collection and use of information in accordance 
                                  with this policy. We will not use or share your information except as described in this policy.
                                </p>
                              </div>
                            )}
                            {/* Add content for other sections as needed */}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>

              {/* Desktop Full Content */}
              <div className="hidden lg:block space-y-12">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <section key={section.id} id={section.id} className="scroll-mt-24">
                      <div className="bg-card border border-border rounded-lg p-8 shadow-glow">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 bg-accent/20 border-2 border-accent rounded-lg flex items-center justify-center">
                            <Icon size={24} className="text-accent" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-black text-foreground uppercase tracking-wide">{section.title}</h2>
                            <div className="w-16 h-1 bg-accent mt-2"></div>
                          </div>
                        </div>

                        <div className="text-muted-foreground space-y-4 leading-relaxed">
                          {section.id === 'introduction' && (
                            <div>
                              <p className="mb-4">
                                AIJIM ("we," "our," or "us") is committed to protecting your privacy. 
                                This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                                when you visit our website and use our services.
                              </p>
                              <p>
                                By using our service, you agree to the collection and use of information in accordance 
                                with this policy. We will not use or share your information except as described in this policy.
                              </p>
                            </div>
                          )}

                          {section.id === 'data-collection' && (
                            <div>
                              <p className="mb-4">We collect information you provide directly to us, such as:</p>
                              <ul className="list-disc pl-6 space-y-2">
                                <li><strong className="text-foreground">Personal Information:</strong> Name, email, phone number, shipping address</li>
                                <li><strong className="text-foreground">Payment Information:</strong> Credit card details, billing address</li>
                                <li><strong className="text-foreground">Account Data:</strong> Username, password, profile preferences</li>
                                <li><strong className="text-foreground">Purchase History:</strong> Orders, returns, preferences</li>
                                <li><strong className="text-foreground">Device Information:</strong> IP address, browser type, operating system</li>
                              </ul>
                            </div>
                          )}

                          {/* Continue with other sections content */}
                        </div>
                      </div>
                    </section>
                  );
                })}
              </div>

              {/* Contact Section */}
              <div className="bg-gradient-to-r from-accent/20 via-accent/10 to-accent/20 rounded-lg p-8 text-center">
                <h3 className="text-2xl font-bold text-foreground mb-4">Questions About Your Privacy?</h3>
                <p className="text-muted-foreground mb-6">
                  Our privacy team is here to help. Contact us for any questions or concerns.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg"
                    className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold shadow-glow"
                  >
                    EMAIL PRIVACY TEAM
                  </Button>
                  <Button 
                    size="lg"
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent hover:text-accent-foreground font-bold"
                  >
                    VIEW DATA POLICY
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicyNew;