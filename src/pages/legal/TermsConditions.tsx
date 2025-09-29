import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { User, ShoppingBag, CreditCard, FileText, Scale, Gavel } from 'lucide-react';

const TermsConditions = () => {
  const [activeSection, setActiveSection] = useState('account');

  const sections = [
    { id: 'account', title: 'Account Terms', icon: User },
    { id: 'orders', title: 'Orders & Purchases', icon: ShoppingBag },
    { id: 'payments', title: 'Payment Terms', icon: CreditCard },
    { id: 'usage', title: 'Website Usage', icon: FileText },
    { id: 'legal', title: 'Legal Terms', icon: Scale },
   
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container-custom italic  py-10 mt-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-foreground ">TERMS OF SERVICE</h1>
            <div className="w-full h-1 bg-foreground mx-auto"></div>
            <p className="text-foreground mt-4 font-semibold max-full mx-auto">
              By using AIJIM's services, you agree to these terms. Please read them carefully.
            </p>
          </div>

          <div className="flex gap-8">
            {/* Left Index */}
            <aside className="hidden lg:block w-80">
              <div className="bg-card border border-border rounded-lg p-6 shadow-glow sticky top-24">
                <h3 className="text-lg font-bold mb-6 text-foreground">SECTIONS</h3>
                <nav className="space-y-2">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <a
                        key={section.id}
                        href={`#${section.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setActiveSection(section.id);
                          document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                          activeSection === section.id
                            ? 'bg-accent text-white font-bold shadow-glow'
                            : 'text-foreground hover:text-foreground hover:bg-foreground'
                        }`}
                      >
                        <Icon size={20} className="mr-3" />
                        {section.title}
                      </a>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* Content */}
            <main className="flex-1">
              <div className="bg-card border border-border rounded-lg shadow-glow">
                
                {/* Account Terms */}
                <section id="account" className="p-8 border-b border-border">
                  <div className="flex items-center mb-2">
                    <User className="text-white mr-3" size={28} />
                    <h2 className="text-2xl font-bold text-foreground">ACCOUNT TERMS</h2>
                  </div>
                  <div className="w-full h-0.5 bg-white mb-6"></div>
                  <div className="space-y-2 text-muted-foreground font-semibold leading-tight">
                    <p>When you create an account with AIJIM, you must provide accurate and complete information.</p>
                    <ul className="list-disc list-inside font-semibold space-y-1 ml-4">
                      <li>You are responsible for maintaining the security of your account</li>
                      <li>You must be at least 18 years old to create an account</li>
                      <li>One account per person is permitted</li>
                      <li>You must notify us immediately of any unauthorized use</li>
                    </ul>
                    <p className="text-foreground font-semibold">Account termination may occur if these terms are violated.</p>
                  </div>
                </section>

                {/* Orders */}
                <section id="orders" className="p-8 border-b border-border">
                  <div className="flex items-center mb-2">
                    <ShoppingBag className="text-white mr-3" size={28} />
                    <h2 className="text-2xl font-bold text-foreground">ORDERS & PURCHASES</h2>
                  </div>
                  <div className="w-full h-0.5 bg-white mb-6 "></div>
                  <div className="space-y-4 text-muted-foreground font-semibold leading-tight">
                    <p>All orders are subject to availability and acceptance by AIJIM.</p>
                    <ul className="list-disc list-inside font-semibold space-y-2 leading-tight  ml-4">
                      <li>Orders are processed within 1-2 business days</li>
                      <li>Product availability is not guaranteed until payment is confirmed</li>
                      <li>We reserve the right to cancel orders for any reason</li>
                      <li>Bulk orders may require additional verification</li>
                    </ul>
                    <p className="font-semibold text-foreground">
                      Order confirmations are sent via email and constitute acceptance of your order.
                    </p>
                  </div>
                </section>

                {/* Payments */}
                <section id="payments" className="p-8 border-b border-border">
                  <div className="flex items-center mb-2">
                    <CreditCard className="text-white mr-3" size={28} />
                    <h2 className="text-2xl font-bold text-foreground">PAYMENT TERMS</h2>
                  </div>
                  <div className="w-full h-0.5 bg-white mb-6"></div>
                  <div className="space-y-4 text-muted-foreground leading-tight">
                    <p>Payment is due at the time of purchase and must be made through our secure payment gateway.</p>
                    <ul className="list-disc list-inside space-y-2 ml-4 leading-tight">
                      <li>We accept major credit cards, debit cards, and digital wallets</li>
                      <li>All prices are in Indian Rupees (INR) unless otherwise stated</li>
                      <li>Payment failures may result in order cancellation</li>
                      <li>Refunds are processed according to our refund policy</li>
                    </ul>
                    <div className="bg-muted border border-border rounded-none p-4 mt-4">
                      <p className="font-medium text-foreground">Security Notice:</p>
                      <p className="text-sm font-semibold">We use industry-standard encryption to protect your payment information.</p>
                    </div>
                  </div>
                </section>

                {/* Usage */}
                <section id="usage" className="p-8 border-b border-border">
                  <div className="flex items-center mb-2">
                    <FileText className="text-white mr-3" size={28} />
                    <h2 className="text-2xl font-bold text-foreground">WEBSITE USAGE</h2>
                  </div>
                  <div className="w-full h-0.5 bg-accent mb-6"></div>
                  <div className="space-y-4 text-muted-foreground font-semibold leading-tight">
                    <p>You may use our website for lawful purposes only. Prohibited activities include:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4 leading-tight">
                      <li>Attempting to gain unauthorized access to our systems</li>
                      <li>Using automated tools to scrape or harvest data</li>
                      <li>Posting harmful, offensive, or illegal content</li>
                      <li>Interfering with the proper functioning of the website</li>
                    </ul>
                    <p className="font-semibold text-foreground">
                      Violation of these terms may result in immediate account suspension.
                    </p>
                  </div>
                </section>

                {/* Legal */}
                <section id="legal" className="p-8 border-b border-border">
                  <div className="flex items-center mb-2">
                    <Scale className="text-white mr-3" size={28} />
                    <h2 className="text-2xl font-bold text-foreground">LEGAL TERMS</h2>
                  </div>
                  <div className="w-full h-0.5 bg-white mb-6"></div>
                  <div className="space-y-4 text-muted-foreground font-semibold leading-tight">
                    <p>These terms are governed by the laws of India and subject to the jurisdiction of Mumbai courts.</p>
                    <div className="grid md:grid-cols-2 gap-4 font-semibold leading-relaxed  mt-6">
                      <div className="bg-muted border border-border rounded-lg p-4">
                        <h4 className="font-semibold text-foreground mb-2 leading-tight">Limitation of Liability</h4>
                        <p className="text-sm font-semibold">AIJIM's liability is limited to the amount paid for the specific product or service.</p>
                      </div>
                      <div className="bg-muted border border-border rounded-lg p-4">
                        <h4 className="font-semibold text-foreground mb-2">Indemnification</h4>
                        <p className="text-sm font-semibold leading-tight">Users agree to indemnify AIJIM against claims arising from their use of our services.</p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Disputes */}
                {/*<section id="disputes" className="p-8">
                  <div className="flex items-center mb-6">
                    <Gavel className="text-accent mr-3" size={28} />
                    <h2 className="text-2xl font-bold text-foreground">DISPUTE RESOLUTION</h2>
                  </div>
                  <div className="w-20 h-0.5 bg-accent mb-6"></div>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>We encourage customers to contact us directly to resolve any issues before pursuing legal action.</p>
                    <div className="bg-muted border border-border rounded-lg p-6 mt-4">
                      <h4 className="font-semibold text-foreground mb-3">Contact for Disputes:</h4>
                      <div className="space-y-1">
                        <p>Email: legal@aijim.com</p>
                        <p>Phone: +91 7672080881</p>
                        <p>Address: 123 Fashion Street, Mumbai, India 400001</p>
                      </div>
                    </div>
                    <p className="text-sm">
                      Last updated: {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </section>*/}
              </div>
            </main>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TermsConditions;