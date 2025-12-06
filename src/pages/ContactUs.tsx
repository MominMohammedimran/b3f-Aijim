import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Send,
  MessageCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import NewSEOHelmet from "@/components/seo/NewSEOHelmet";
const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  

  // Auto-close popup after 10 seconds
  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => setShowPopup(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  const contactInfo = [
    {
      icon: Mail,
      title: "EMAIL US",
      primary: "aijim.official@gmail.com",
      secondary: "orders@aijim.com",
      description: "Get quick responses within 24 hours",
    },
    {
      icon: Phone,
      title: "CALL US",
      primary: "+91 - 7672080881 , +91 - 9581319687",
      description: "Available Mon-Sat, 10 AM - 7 PM",
    },
    {
      icon: MapPin,
      title: "VISIT",
      primary: "Our Online Store",
      secondary: "Premium Streetwear & Accessories",
      description: "At the most affordable price",
    },
  ];

  return (
    <Layout>
      <NewSEOHelmet
        pageSEO={{
          title: "About Us | AIJIM",
          description: "Learn about AIJIM brand & story.",
        }}
      />
      <div className="min-h-screen bg-background relative">
        <div className="container-custom pt-16">
          <div className="flex items-center mb-4">
            <Link
              to="/"
              className="mr-4 text-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                CONTACT US
              </h1>
              <p className="text-muted-foreground not-italic font-semibold">
                Get in touch with our team
              </p>
            </div>
          </div>
        </div>

        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Contact Info */}
            <div className="space-y-8">
              <h2 className="text-xl font-bold text-foreground mb-1 uppercase tracking-wide">
                GET IN TOUCH
              </h2>
              <p className="text-muted-foreground font-semibold text-sm leading-snug mb-8">
                Have questions about our products, need style advice, or want to
                share feedback? We're here to help. Choose the best way to reach
                us below.
              </p>

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
                          <h3 className="font-bold text-foreground uppercase tracking-wide text-md">
                            {contact.title}
                          </h3>
                          <p className="text-foreground/90 text-sm font-semibold mb-1 mt-1">
                            {contact.primary}
                          </p>
                          <p className="text-muted-foreground text-xs font-semibold">
                            {contact.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Contact Form */}
            <div>
              <div className="bg-card border border-border rounded-lg p-8 shadow-glow">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-12 bg-accent text-accent-foreground rounded-lg flex items-center justify-center">
                    <MessageCircle size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground uppercase tracking-wide">
                      SEND MESSAGE
                    </h2>
                    <p className="text-muted-foreground font-semibold text-sm">
                      We'll get back to you within 24 hours
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, name: e.target.value }))
                    }
                    required
                    className="bg-background border-border focus:border-accent h-12 font-medium"
                  />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, email: e.target.value }))
                    }
                    required
                    className="bg-background border-border focus:border-accent h-12 font-medium"
                  />
                  <Textarea
                    placeholder="Your Message..."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, message: e.target.value }))
                    }
                    required
                    className="bg-background border-border focus:border-accent min-h-32 font-medium resize-none"
                  />
                  <Button
                    type="submit"
                    size="lg"
                    disabled={loading}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-bold h-12 shadow-glow"
                  >
                    <Send size={20} className="mr-2" />
                    {loading ? "Sending..." : "SEND MESSAGE"}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Thank You Popup */}
        {showPopup && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white text-gray-900 rounded-lg p-6 w-[90%] sm:w-[400px] text-center relative shadow-xl">
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-3 right-3 text-gray-600 hover:text-black"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold mb-2">Thank You!</h2>
              <p className="text-sm text-gray-600 font-medium">
                Your message has been sent to <b>AIJIM</b>.<br />
                We appreciate you reaching out to us. Our team will reply within
                24 hours.
              </p>
              <div className="mt-4">
                <Button
                  onClick={() => setShowPopup(false)}
                  className="bg-yellow-500 hover:bg-yellow-400 text-black font-semibold"
                >
                  Close
                </Button>
              </div>
              <p className="mt-3 text-xs text-gray-400">
                (This popup will close automatically)
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ContactUs;
