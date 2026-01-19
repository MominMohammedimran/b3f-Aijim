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
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import NewSEOHelmet from "@/components/seo/NewSEOHelmet";

const ContactUs = () => {
  // --- Form State ---
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // --- Scroll & Nav State (Matched from Privacy Policy) ---
  const [activeSection, setActiveSection] = useState("contact-info");
  const [scrollProgress, setScrollProgress] = useState(0);

  // Sections for Sidebar
  const sections = [
    { id: "contact-info", title: "Get In Touch", icon: Info },
    { id: "send-message", title: "Send Message", icon: MessageCircle },
  ];

  const contactInfo = [
    {
      icon: Mail,
      title: "EMAIL US",
      primary: "aijim.official@gmail.com",
      secondary: "",
      description: "Get quick responses within 24 hours",
    },
    {
      icon: Phone,
      title: "CALL US",
      primary: "+91 - 7672080881",
      secondary: "+91 - 9581319687",
      description: "Available Mon-Sat, 10 AM - 7 PM",
    },
    {
      icon: MapPin,
      title: "VISIT",
      primary: "Our Online Store",
      secondary: "Premium Streetwear",
      description: "At the most affordable price",
    },
  ];

  // --- Effects ---
  // Auto-close popup
  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => setShowPopup(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  // Scroll Progress Listener
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      setScrollProgress((scrollTop / height) * 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Handlers ---
  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      access_key: "e695e1f9-0c1a-4e6f-88ab-b7aa04b23dae",
      name: formData.name,
      email: formData.email || "Not Provided",
      message: formData.message,
      to: "aijim.official@gmail.com",
    };

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.success) {
        setFormData({ name: "", email: "", message: "" });
        setShowPopup(true);
      }
    } catch {
      alert("⚠ Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <NewSEOHelmet
        pageSEO={{
          title: "Contact Us | AIJIM",
          description: "Get in touch with the AIJIM team.",
        }}
      />
      <div className="relative min-h-screen bg-black text-white">
        {/* Scroll Progress Bar */}
        <div
          className="fixed top-0 left-0 h-[3px] bg-yellow-400 z-50 transition-all duration-200"
          style={{ width: `${scrollProgress}%` }}
        />

        {/* Header */}
        {/* Header */}
<div className="container-custom pt-20 pb-8">
  {/* Breadcrumb */}
  <nav className="flex items-center gap-2 text-sm text-gray-400 mb-3">
    <Link
      to="/"
      className="hover:text-yellow-400 transition-colors"
    >
      Home
    </Link>

    <span>/</span>

    <span className="text-white font-semibold">
      Contact Us
    </span>
  </nav>

  {/* Title */}
  <div className="mb-2">
    <h1 className="text-2xl font-semibold uppercase tracking-wider">
      Contact Us
    </h1>
    <p className="text-xs text-gray-200 font-medium">
      We're here to help you
    </p>
  </div>

  {/* Divider */}
  <div className="h-[2px] bg-yellow-400 w-full rounded-full mt-2"></div>
</div>


        {/* Main Layout: Sidebar + Content */}
        <div className="container-custom flex flex-col lg:flex-row gap-10 pb-20">
          {/* Left Sidebar Navigation */}
          <aside className="lg:w-72">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sticky top-24 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              <h3 className="text-lg font-semibold text-yellow-400 mb-4 uppercase tracking-wide">
                Navigation
              </h3>
              <nav className="space-y-2">
                {sections.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() => scrollToSection(s.id)}
                      className={`w-full flex items-start gap-3 px-3 py-2 text-sm rounded-none transition-all ${
                        activeSection === s.id
                          ? "bg-yellow-400 text-black font-semibold"
                          : "text-gray-300 hover:bg-gray-800 hover:text-yellow-400"
                      }`}
                    >
                      <Icon size={18} />
                      {s.title}
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Right Content Area */}
          <main className="flex-1 space-y-10">
            {/* --- Section 1: Contact Details --- */}
            <motion.section
              id="contact-info"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-gray-900 border border-gray-800 p-6 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            >
              <div className="flex items-start mb-3">
                <Info className="text-yellow-400 mr-3" size={26} />
                <h2 className="text-xl font-bold uppercase tracking-wide">
                  Get In Touch
                </h2>
              </div>
              <div className="h-[1px] w-full bg-yellow-400 mb-6"></div>

              <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                Have questions about our products, need style advice, or want to
                share feedback? Choose the best way to reach us below.
              </p>

              <div className="grid gap-6">
                {contactInfo.map((contact, index) => {
                  const Icon = contact.icon;
                  return (
                    <div
                      key={index}
                      className="bg-black/40 border border-gray-800 p-4 rounded-lg flex items-start gap-4 hover:border-yellow-400/50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-yellow-400 text-black rounded-lg flex items-center justify-center shrink-0">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-white uppercase tracking-wide text-sm">
                          {contact.title}
                        </h3>
                        <p className="text-gray-200 text-sm mt-1">
                          {contact.primary}
                        </p>
                        {contact.secondary && (
                          <p className="text-gray-400 text-xs font-medium">
                            {contact.secondary}
                          </p>
                        )}
                        <p className="text-yellow-400/80 text-xs mt-1 italic">
                          {contact.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.section>

            {/* --- Section 2: Form --- */}
            <motion.section
              id="send-message"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-900 border border-gray-800 p-6 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            >
              <div className="flex items-start mb-3">
                <MessageCircle className="text-yellow-400 mr-3" size={26} />
                <h2 className="text-xl font-bold uppercase tracking-wide">
                  Send Message
                </h2>
              </div>
              <div className="h-[1px] w-full bg-yellow-400 mb-6"></div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">
                    Your Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, name: e.target.value }))
                    }
                    required
                    className="bg-black border-gray-700 text-white focus:border-yellow-400 h-12 placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, email: e.target.value }))
                    }
                    required
                    className="bg-black border-gray-700 text-white focus:border-yellow-400 h-12 placeholder:text-gray-600"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-400 uppercase font-bold mb-2 block">
                    Message
                  </label>
                  <Textarea
                    placeholder="How can we help you?"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, message: e.target.value }))
                    }
                    required
                    className="bg-black border-gray-700 text-white focus:border-yellow-400 min-h-32 resize-none placeholder:text-gray-600"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="w-full bg-yellow-400 text-black hover:bg-yellow-300 font-bold h-12 rounded-none transition-transform active:scale-95"
                >
                  <Send size={18} className="mr-2" />
                  {loading ? "Sending..." : "SEND MESSAGE"}
                </Button>
              </form>
            </motion.section>
          </main>
        </div>

        {/* Footer Copyright */}
        <div className="text-center font-semibold py-10 text-gray-300 text-sm bg-black">
        
          © {new Date().getFullYear()} AIJIM. All Rights Reserved.
        </div>

        {/* Dark Theme Popup */}
        {showPopup && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-900 border border-yellow-400 text-white rounded-lg p-8 w-[90%] sm:w-[400px] text-center relative shadow-[0_0_30px_rgba(250,204,21,0.2)]"
            >
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X size={20} />
              </button>
              <div className="w-16 h-16 bg-yellow-400 text-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Send size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-yellow-400">
                Message Sent!
              </h2>
              <p className="text-sm text-gray-300 font-medium mb-6">
                Thank you for reaching out to <b>AIJIM</b>. We will get back to
                you within 24 hours.
              </p>
              <Button
                onClick={() => setShowPopup(false)}
                className="bg-white hover:bg-gray-200 text-black font-bold w-full"
              >
                CLOSE
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ContactUs;