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

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('introduction');

  const sections = [
    { id: 'introduction', title: 'Introduction', icon: Shield },
    { id: 'data-collection', title: 'Information We Collect', icon: Eye },
    { id: 'data-usage', title: 'How We Use Your Information', icon: FileText },
    { id: 'cookies', title: 'Cookies & Tracking', icon: Cookie },
    { id: 'third-party', title: 'Third-Party Disclosure', icon: Globe },
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
        <div className="container-custom pt-20 pb-6">
          <div className="flex items-center mb-8">
            <Link to="/" className="mr-4 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">PRIVACY POLICY</h1>
              <p className="text-muted-foreground font-semibold ">Last Updated: Sept 27, 2025</p>
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
                        <span className="text-xs font-semibold leading-tight">{section.title}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Mobile Accordion View */}
             

              {/* Desktop Full Content */}
              <div className="block space-y-12">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <section key={section.id} id={section.id} className="scroll-mt-24">
                      <div className="bg-card border border-border rounded-lg p-2 shadow-glow">
                        <div    className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 bg-foreground border-2 border-accent rounded-lg flex items-center justify-center">
                            <Icon size={24} className="text-accent" />
                          </div>
                          <div>
                            <h2 
                            className="text-2xl font-black text-foreground uppercase tracking-wide">{section.title}</h2>
                            <div className="w-full h-1 bg-accent mt-2"></div>
                          </div>
                        </div>

                        {/* Section Content */}
                        <div className="text-muted-foreground text-xs font-semibold space-y-4 italic leading-tight">
                          {section.id === 'introduction' || (
                            <p>
                              Aijim ("we," "our," or "us") is committed to protecting your privacy.
                              This Privacy Policy explains how we collect, use, disclose, and safeguard your information
                              when you visit our website and use our services.
                            </p>
                          )}

                          {section.id === 'data-collection' || (
                            <ul className="list-disc pl-6 space-y-2">
                              <li><strong>Personal Data:</strong> Name, email, phone, billing & shipping address, payment info</li>
                              <li><strong>Order Information:</strong> Products purchased, order history, preferences</li>
                              <li><strong>Usage Data:</strong> Browsing history, search queries, site interactions</li>
                              <li><strong>Device Information:</strong> IP, browser type, OS, device identifiers</li>
                            </ul>
                          )}

                          {section.id === 'data-usage' && (
                            <ul className="list-disc pl-6 space-y-2">
                              <li>To process and fulfill your orders</li>
                              <li>To manage your account and provide customer support</li>
                              <li>To communicate about your orders or account</li>
                              <li>To personalize your experience and improve services</li>
                              <li>To analyze usage trends & optimize performance</li>
                              <li>To detect and prevent fraud</li>
                              <li>To comply with legal obligations</li>
                            </ul>
                          )}

                          {section.id === 'cookies' || (
                            <p>
                              We use cookies and similar tracking technologies to monitor website activity and store
                              certain information. You can disable cookies in your browser, but this may affect
                              functionality.
                            </p>
                          )}

                          {section.id === 'third-party' || (
                            <ul className="list-disc pl-6 space-y-2">
                              <li>Service providers who operate our business</li>
                              <li>Payment processors to complete transactions</li>
                              <li>Shipping partners to deliver orders</li>
                              <li>When required by law or to protect our rights</li>
                            </ul>
                          )}

                          {section.id === 'data-security' || (
                            <p>
                              We implement industry-standard measures to protect your personal information.
                              However, no method of transmission or storage is 100% secure, so we cannot guarantee absolute protection.
                            </p>
                          )}

                          {section.id === 'user-rights' || (
                            <ul className="list-disc pl-6 space-y-2">
                              <li>The right to access, correct, or update your personal data</li>
                              <li>The right to delete your personal information</li>
                              <li>The right to object to or restrict processing</li>
                              <li>The right to data portability</li>
                            </ul>
                          )}
                        </div>
                      </div>
                    </section>
                  );
                })}
              </div>

              {/* Contact Section */}
             
            </div>
          </div>
        </div>
      </div> 
    </Layout>
  );
};

export default PrivacyPolicy;