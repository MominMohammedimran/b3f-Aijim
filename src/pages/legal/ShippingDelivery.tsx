import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { ArrowLeft, Truck, MapPin, Clock, Package, Search, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ShippingDelivery = () => {
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<string | null>(null);

  const shippingMethods = [
    {
      name: 'Standard Shipping',
      icon: Package,
      time: '5-7 Business Days',
      price: '₹ Free Delivery',
      features: ['Free for Every order', 'Tracking included'],
      highlight: false
    },
    
  ];

  const checkPincode = () => {
    if (pincode.length === 6) {
      const deliveryTime = Math.random() > 0.1 ? '3-5 days' : 'Not serviceable';
      setPincodeResult(deliveryTime);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container-custom  pt-16 pb-8">
          <div className="flex items-center mb-4">
            <Link to="/" className="mr-4 text-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">SHIPPING INFORMATION</h1>
              <p className="text-muted-foreground mt-0 font-semibold">Fast, reliable delivery across India</p>
            </div>
          </div>
        </div>

        <div className="container-custom space-y-12">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-lg p-6 text-center shadow-glow">
              <div className="w-12 h-12 bg-white border-2 border-accent rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Truck size={24} className="text-accent" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">FREE SHIPPING</h3>
              <p className="text-muted-foreground font-semibold text-sm">Enjoy free Shipping on all orders for a Limited time.</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 text-center shadow-glow">
              <div className="w-12 h-12 bg-white border-2 border-accent rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Clock size={24} className="text-accent" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">FAST DELIVERY</h3>
              <p className="text-muted-foreground font-semibold text-sm">Delhivery Partner  3-5 days</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 text-center shadow-glow">
              <div className="w-12 h-12 bg-white border-2 border-accent rounded-lg mx-auto mb-4 flex items-center justify-center">
                <MapPin size={24} className="text-accent" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">PAN INDIA</h3>
              <p className="text-muted-foreground text-sm font-semibold">We deliver everywhere</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black text-foreground mb-8 text-center uppercase tracking-wide">
              SHIPPING OPTIONS
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {shippingMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <div
                    key={index}
                    className={`bg-card border rounded-lg p-6 shadow-glow transition-all duration-300 hover:scale-105 ${
                      method.highlight 
                        ? 'border-accent shadow-glow-strong' 
                        : 'border-border hover:border-accent'
                    }`}
                  >
                    {method.highlight && (
                      <div className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full inline-block mb-4 uppercase tracking-wide">
                        RECOMMENDED
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        method.highlight 
                          ? 'bg-white text-accent-foreground' 
                          : 'bg-white/90 border-2 border-accent text-accent'
                      }`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-lg">{method.name}</h3>
                        <p className="text-muted-foreground font-semibold text-sm">{method.time}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className={`text-lg font-semibold ${
                        method.highlight ? 'text-accent' : 'text-foreground'
                      }`}>
                        {method.price}
                      </span>
                    </div>

                    <ul className="space-y-2">
                      {method.features.map((feature, i) => (
                        <li key={i} className="flex items-center font-semibold gap-2 text-muted-foreground text-sm">
                          <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

         
        </div>
      </div>
    </Layout>
  );
};

export default ShippingDelivery;