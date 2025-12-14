import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { ArrowRight, CheckCircle, Clock, Package, RefreshCw, HelpCircle, ChevronDown } from 'lucide-react';

const RefundReturnPolicyNew = () => {
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const returnSteps = [
    {
      icon: Package,
      title: 'REQUEST RETURN',
      description: 'Contact us within 30 days of delivery to initiate a return request.',
      color: 'text-primary'
    },
    {
      icon: Clock,
      title: 'PICKUP SCHEDULED',
      description: 'We schedule a free pickup from your location within 2-3 business days.',
      color: 'text-primary'
    },
    {
      icon: CheckCircle,
      title: 'QUALITY INSPECTION',
      description: 'Items are inspected for damage and authenticity at our facility.',
      color: 'text-primary'
    },
    {
      icon: RefreshCw,
      title: 'REFUND PROCESSED',
      description: 'Approved refunds are processed within 5-7 business days.',
      color: 'text-green-500'
    }
  ];

  const faqs = [
    {
      id: 'timeframe',
      question: 'What is the return timeframe?',
      answer: 'You have 30 days from the delivery date to initiate a return. Items must be in original condition with tags attached.'
    },
    {
      id: 'condition',
      question: 'What condition should items be in?',
      answer: 'Items must be unworn, unwashed, and in original packaging with all tags attached. Items showing signs of wear will not be accepted.'
    },
    {
      id: 'shipping',
      question: 'Who pays for return shipping?',
      answer: 'We provide free return pickup for all eligible returns. You don\'t need to pay any shipping charges.'
    },
    {
      id: 'refund-time',
      question: 'How long does refund take?',
      answer: 'Once your return is approved after inspection, refunds are processed within 5-7 business days to your original payment method.'
    },
    {
      id: 'exchange',
      question: 'Can I exchange instead of return?',
      answer: 'Yes! You can request an exchange for a different size or color. Exchange processing follows the same timeline as returns.'
    },
    {
      id: 'final-sale',
      question: 'Are there any non-returnable items?',
      answer: 'Underwear, swimwear, and items marked as "Final Sale" cannot be returned for hygiene and policy reasons.'
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container-custom py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">REFUND & RETURN POLICY</h1>
            <div className="w-24 h-1 bg-accent mx-auto"></div>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              Easy returns, hassle-free refunds. We want you to love your AIJIM purchase.
            </p>
          </div>

          {/* Return Process Timeline */}
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">RETURN PROCESS</h2>
            
            {/* Desktop Timeline */}
            <div className="hidden md:block">
              <div className="relative">
                {/* Timeline Line */}
                <div className="absolute top-12 left-0 right-0 h-0.5 bg-border"></div>
                <div className="absolute top-12 left-0 w-3/4 h-0.5 bg-accent"></div>
                
                <div className="grid grid-cols-4 gap-8">
                  {returnSteps.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={index} className="text-center relative">
                        <div className={`w-24 h-24 rounded-full border-4 border-accent bg-card mx-auto mb-4 flex items-center justify-center shadow-glow`}>
                          <Icon size={32} className={step.color} />
                        </div>
                        <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                        
                        {index < returnSteps.length - 1 && (
                          <ArrowRight className="hidden md:block absolute top-12 -right-4 transform -translate-y-1/2 text-accent" size={24} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Mobile Timeline */}
            <div className="md:hidden space-y-6">
              {returnSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-full border-4 border-accent bg-card flex items-center justify-center shadow-glow flex-shrink-0`}>
                      <Icon size={24} className={step.color} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Policy Details */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Return Policy */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-glow">
              <div className="flex items-center mb-6">
                <RefreshCw className="text-green-500 mr-3" size={24} />
                <h3 className="text-xl font-bold text-foreground">RETURN POLICY</h3>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={16} />
                  <p>30-day return window from delivery date</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={16} />
                  <p>Free pickup from your location</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={16} />
                  <p>Items must be in original condition</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={16} />
                  <p>All original tags must be attached</p>
                </div>
              </div>
            </div>

            {/* Refund Policy */}
            <div className="bg-card border border-border rounded-lg p-6 shadow-glow">
              <div className="flex items-center mb-6">
                <CheckCircle className="text-green-500 mr-3" size={24} />
                <h3 className="text-xl font-bold text-foreground">REFUND POLICY</h3>
              </div>
              <div className="space-y-4 text-muted-foreground">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={16} />
                  <p>Full refund to original payment method</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={16} />
                  <p>Processing time: 5-7 business days</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={16} />
                  <p>No questions asked for eligible items</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={16} />
                  <p>Email confirmation sent upon processing</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground text-center mb-8">FREQUENTLY ASKED QUESTIONS</h2>
            
            <div className="max-w-4xl mx-auto">
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div key={faq.id} className="bg-card border border-border rounded-lg shadow-glow overflow-hidden">
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-muted transition-colors"
                    >
                      <span className="font-semibold text-foreground">{faq.question}</span>
                      <ChevronDown 
                        className={`text-accent transition-transform duration-200 ${
                          expandedFaq === faq.id ? 'rotate-180' : ''
                        }`} 
                        size={20} 
                      />
                    </button>
                    
                    {expandedFaq === faq.id && (
                      <div className="px-6 pb-4 border-t border-border">
                        <p className="text-muted-foreground leading-relaxed pt-4">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="text-center bg-card border border-border rounded-lg p-8 shadow-glow">
            <HelpCircle className="text-accent mx-auto mb-4" size={48} />
            <h3 className="text-xl font-bold text-foreground mb-4">NEED HELP WITH YOUR RETURN?</h3>
            <p className="text-muted-foreground mb-6">
              Our customer service team is here to help you with any return or refund questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:returns@aijim.com"
                className="bg-accent text-accent-foreground px-6 py-3 rounded-lg font-bold hover:bg-accent/90 transition-colors shadow-glow"
              >
                EMAIL US
              </a>
              <a 
                href="tel:+915551234567"
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors shadow-glow"
              >
                CALL US
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RefundReturnPolicyNew;