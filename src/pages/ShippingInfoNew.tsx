import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { ArrowLeft, Truck, MapPin, Clock, Package, Search, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const ShippingInfoNew = () => {
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<string | null>(null);

  const shippingMethods = [
    {
      name: 'Standard Shipping',
      icon: Package,
      time: '5-7 Business Days',
      price: '₹80',
      features: ['Free for orders above ₹1999', 'Tracking included', 'Insurance covered'],
      highlight: false
    },
    {
      name: 'Express Shipping',
      icon: Truck,
      time: '2-3 Business Days',
      price: '₹150',
      features: ['Priority handling', 'Real-time tracking', 'SMS updates'],
      highlight: true
    }
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
        <div className="container-custom pt-16 pb-8">
          <div className="flex items-center mb-8">
            <Link to="/" className="mr-4 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-4xl font-black text-foreground tracking-tight">SHIPPING INFORMATION</h1>
              <p className="text-muted-foreground mt-2">Fast, reliable delivery across India</p>
            </div>
          </div>
        </div>

        <div className="container-custom space-y-12">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-lg p-6 text-center shadow-glow">
              <div className="w-12 h-12 bg-accent/20 border-2 border-accent rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Truck size={24} className="text-accent" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">FREE SHIPPING</h3>
              <p className="text-muted-foreground text-sm">On orders above ₹1999</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 text-center shadow-glow">
              <div className="w-12 h-12 bg-accent/20 border-2 border-accent rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Clock size={24} className="text-accent" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">FAST DELIVERY</h3>
              <p className="text-muted-foreground text-sm">Express in 2-3 days</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6 text-center shadow-glow">
              <div className="w-12 h-12 bg-accent/20 border-2 border-accent rounded-lg mx-auto mb-4 flex items-center justify-center">
                <MapPin size={24} className="text-accent" />
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">PAN INDIA</h3>
              <p className="text-muted-foreground text-sm">We deliver everywhere</p>
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
                          ? 'bg-accent text-accent-foreground' 
                          : 'bg-accent/20 border-2 border-accent text-accent'
                      }`}>
                        <Icon size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-lg">{method.name}</h3>
                        <p className="text-muted-foreground text-sm">{method.time}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className={`text-2xl font-black ${
                        method.highlight ? 'text-accent' : 'text-foreground'
                      }`}>
                        {method.price}
                      </span>
                    </div>

                    <ul className="space-y-2">
                      {method.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-2 text-muted-foreground text-sm">
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

          <div className="bg-card border border-border rounded-lg p-8 shadow-glow">
            <h2 className="text-2xl font-black text-foreground mb-6 text-center uppercase tracking-wide">
              CHECK DELIVERY AVAILABILITY
            </h2>
            
            <div className="max-w-md mx-auto">
              <div className="flex gap-3 mb-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                  <Input
                    placeholder="Enter your pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="pl-10 bg-background border-border focus:border-accent"
                  />
                </div>
                <Button 
                  onClick={checkPincode}
                  disabled={pincode.length !== 6}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 font-bold px-6 shadow-glow"
                >
                  <Search size={16} className="mr-2" />
                  CHECK
                </Button>
              </div>

              {pincodeResult && (
                <div className={`text-center p-4 rounded-lg ${
                  pincodeResult === 'Not serviceable' 
                    ? 'bg-red-500/10 border border-red-500/30' 
                    : 'bg-green-500/10 border border-green-500/30'
                }`}>
                  <p className={`font-bold ${
                    pincodeResult === 'Not serviceable' ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {pincodeResult === 'Not serviceable' 
                      ? '❌ Sorry, we don\'t deliver to this location yet' 
                      : `✅ Delivery available in ${pincodeResult}`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ShippingInfoNew;