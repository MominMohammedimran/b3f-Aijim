import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Truck,
  MapPin,
  Clock,
  Package,
  Globe,
  Info,
  CheckCircle,
  XCircle,
} from "lucide-react";
// Assuming these are custom components you have
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { motion, AnimatePresence } from "framer-motion";
import NewSEOHelmet from "@/components/seo/NewSEOHelmet";

// --- EXTERNAL IMPORTS ---
// Assuming this utility exists at the specified path
import { validatePincode } from "@/utils/pincodeService"; 

// Helper function for simplified toast notification (Replace with your actual toast implementation)
const toast = {
  error: (message: string) => console.error(`[TOAST ERROR]: ${message}`),
};

// --- TYPES ---
interface PincodeResult {
  isServiceable: boolean;
  message: string;
}


const ShippingDelivery = () => {
  // --- State ---
  const [activeSection, setActiveSection] = useState("overview");
  const [scrollProgress, setScrollProgress] = useState(0);

  // Pincode Logic
  const [pincode, setPincode] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false); // New state to track if a check has been performed
  const [result, setResult] = useState<PincodeResult | null>(null);

  // --- Data ---
  const sections = [
    { id: "overview", title: "Overview", icon: Info },
    { id: "shipping-methods", title: "Shipping Methods", icon: Truck },
    { id: "check-delivery", title: "Check Delivery", icon: MapPin },
  ];

  const highlights = [
    {
      icon: Truck,
      title: "FREE SHIPPING",
      desc: "On all prepaid orders across India.",
    },
    {
      icon: Clock,
      title: "FAST DELIVERY",
      desc: "Dispatched within 24 hours.",
    },
    {
      icon: Globe,
      title: "PAN INDIA",
      desc: "Delivering to 19,000+ pincodes.",
    },
  ];

  const shippingMethods = [
    {
      name: "Standard Shipping",
      icon: Package,
      time: "5-7 Business Days",
      price: "FREE",
      features: [
        "Free for every order",
        "Fully tracked package",
        "SMS & Email updates",
      ],
      recommended: true,
    },
 
  ];

  // --- Effects ---
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
  
  // --- UPDATED PINCODE CHECK LOGIC ---
  const checkPincode = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null); // Clear previous result

    if (!pincode || pincode.length !== 6) {
      toast.error("Please enter a valid 6-digit pincode");
      return;
    }

    setLoading(true);
    setChecked(true);

    try {
      // Assuming validatePincode returns an object like: 
      // { isServiceable: boolean, message: string }
      const res = await validatePincode(pincode);
      setResult({ isServiceable: res.isServiceable, message: res.message });
    } catch {
      setResult({
        isServiceable: false,
        message: "Unable to verify pincode. Please try again later.",
      });
      // Optionally toast error here as well for visibility
      toast.error("An unexpected error occurred during check.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <Layout>
      <NewSEOHelmet
        pageSEO={{
          title: "Shipping & Delivery | AIJIM",
          description: "Check shipping times and delivery areas.",
        }}
      />
      <div className="relative min-h-screen bg-black text-white">
        {/* Scroll Progress Bar */}
        <div
          className="fixed top-0 left-0 h-[3px] bg-yellow-400 z-50 transition-all duration-200"
          style={{ width: `${scrollProgress}%` }}
        />

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
      Shipping Information
    </span>
  </nav>

  {/* Title */}
  <div className="mb-2">
    <h1 className="text-2xl font-semibold uppercase tracking-wider">
      Shipping Information
    </h1>
    <p className="text-xs text-gray-400 font-semibold">
      Fast, reliable delivery across India
    </p>
  </div>

  {/* Divider */}
  <div className="h-[2px] bg-yellow-400 w-full rounded-full mt-2"></div>
</div>


        {/* Main Layout */}
        <div className="container-custom flex flex-col lg:flex-row gap-10 pb-20">
          {/* Left Sidebar Navigation */}
          <aside className="lg:w-72">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sticky top-24 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              <h3 className="text-lg font-semibold text-yellow-400 mb-4 uppercase tracking-wide">
                Sections
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
            {/* 1. Overview Cards */}
            <motion.section
              id="overview"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-3 gap-6"
            >
              {highlights.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="bg-black border border-gray-800 p-6 rounded-lg text-center hover:border-yellow-400/50 transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.02)]"
                  >
                    <div className="w-12 h-12 mx-auto bg-black border border-yellow-400 rounded-lg flex items-center justify-center mb-4">
                      <Icon size={24} className="text-yellow-400" />
                    </div>
                    <h3 className="font-bold text-white uppercase text-sm mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-400 text-xs font-medium">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </motion.section>

            {/* 2. Shipping Methods */}
            <motion.section
              id="shipping-methods"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-900 border border-gray-800 p-6 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            >
              <div className="flex items-start mb-3">
                <Package className="text-yellow-400 mr-3" size={26} />
                <h2 className="text-xl font-bold uppercase tracking-wide">
                  Shipping Options
                </h2>
              </div>
              <div className="h-[1px] w-full bg-yellow-400 mb-8"></div>

              <div className="grid md:grid-cols-2 gap-6">
                {shippingMethods.map((method, index) => {
                  const Icon = method.icon;
                  return (
                    <div
                      key={index}
                      className={`relative bg-black border rounded-lg p-6 transition-all duration-300 ${
                        method.recommended
                          ? "border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.15)]"
                          : "border-gray-800 hover:border-gray-600"
                      }`}
                    >
                      {method.recommended && (
                        <div className="absolute -top-3 left-6 bg-yellow-400 text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                          Recommended
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                            <Icon size={20} className="text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-sm uppercase">
                              {method.name}
                            </h3>
                            <p className="text-gray-400 text-xs font-semibold">
                              {method.time}
                            </p>
                          </div>
                        </div>
                        <span className="text-lg font-bold text-yellow-400">
                          {method.price}
                        </span>
                      </div>

                      <ul className="space-y-2 border-t border-gray-800 pt-4">
                        {method.features.map((feature, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-gray-300 text-xs font-medium"
                          >
                            <div className="w-1 h-1 bg-yellow-400 rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </motion.section>

            {/* 3. Check Delivery */}
            <motion.section
              id="check-delivery"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-black border border-gray-800 p-8 text-center rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.03)]"
            >
              <MapPin className="text-yellow-400 mx-auto mb-4" size={32} />
              <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">
                Check Delivery Availability
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Enter your **6-digit Pincode** to check estimated delivery date.
              </p>

              <form
                onSubmit={checkPincode}
                className="max-w-md mx-auto flex gap-2"
              >
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="Enter Pincode (e.g. 500081)"
                  value={pincode}
                  onChange={(e) =>
                    // Only allow digits
                    setPincode(e.target.value.replace(/\D/g, ""))
                  }
                  className="bg-gray-900 border-gray-700 text-white focus:border-yellow-400 h-12 placeholder:text-gray-600 text-center tracking-widest font-mono"
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold h-12 px-6"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin text-lg">⚙️</span> CHECKING
                    </span>
                  ) : (
                    "CHECK"
                  )}
                </Button>
              </form>

              {/* Status Messages */}
              <AnimatePresence>
                {checked && result && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mt-6 p-4 rounded-lg flex items-center justify-center gap-3 ${
                      result.isServiceable
                        ? "bg-green-500/10 text-green-400 border border-green-500/30"
                        : "bg-red-500/10 text-red-400 border border-red-500/30"
                    }`}
                  >
                    {result.isServiceable ? (
                      <CheckCircle size={20} />
                    ) : (
                      <XCircle size={20} />
                    )}
                    <span className="font-semibold text-sm">
                      {result.message}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          </main>
        </div>

        {/* Footer */}
        <div className="text-center font-semibold py-10 text-gray-400 text-sm bg-black">
          © {new Date().getFullYear()} AIJIM. All Rights Reserved.
        </div>
      </div>
    </Layout>
  );
};

export default ShippingDelivery;