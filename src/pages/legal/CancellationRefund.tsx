import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Package,
  RefreshCw,
  HelpCircle,
  ChevronDown,
  CreditCard,
  FileText,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NewSEOHelmet from "@/components/seo/NewSEOHelmet";

const RefundReturnPolicyNew = () => {
  // --- State ---
  const [activeSection, setActiveSection] = useState("return-process");
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // --- Data ---
  const sections = [
    { id: "return-process", title: "Return Process", icon: Clock },
    { id: "return-policy", title: "Return Policy", icon: FileText },
    { id: "refund-policy", title: "Refund Policy", icon: CreditCard },
    { id: "faqs", title: "FAQs", icon: HelpCircle },
  ];

  const returnSteps = [
    {
      icon: Package,
      title: "REQUEST RETURN",
      description:
        "Contact us within 7 days of delivery to initiate a return request.",
    },
    {
      icon: Clock,
      title: "PICKUP SCHEDULED",
      description:
        "We schedule a free pickup from your location within 2-3 business days.",
    },
    {
      icon: CheckCircle,
      title: "QUALITY INSPECTION",
      description:
        "Items are inspected for damage and authenticity at our facility.",
    },
    {
      icon: RefreshCw,
      title: "REFUND PROCESSED",
      description: "Approved refunds are processed within 5-7 business days.",
    },
  ];

  const faqs = [
    {
      id: "timeframe",
      question: "What is the return timeframe?",
      answer:
        "You have 7 days from the delivery date to initiate a return. Items must be in original condition with tags attached.",
    },
    {
      id: "condition",
      question: "What condition should items be in?",
      answer:
        "Items must be unworn, unwashed, and in original packaging with all tags attached. Items showing signs of wear will not be accepted.",
    },
    {
      id: "shipping",
      question: "Who pays for return shipping?",
      answer:
        "We provide free return pickup for all eligible returns. You don't need to pay any shipping charges.",
    },
    {
      id: "refund-time",
      question: "How long does refund take?",
      answer:
        "Once your return is approved after inspection, refunds are processed within 5-7 business days to your original payment method.",
    },
    {
      id: "exchange",
      question: "Can I exchange instead of return?",
      answer:
        "Yes! You can request an exchange for a different size or color. Exchange processing follows the same timeline as returns.",
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

  return (
    <Layout>
      <NewSEOHelmet
        pageSEO={{
          title: "Refund & Return Policy | AIJIM",
          description: "Read about AIJIM's return and refund policies.",
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
      Refund & Return Policy
    </span>
  </nav>

  {/* Title */}
  <div className="mb-2">
    <h1 className="text-2xl font-semibold uppercase tracking-wider">
      Refund & Return Policy
    </h1>
    <p className="text-xs text-gray-400 font-semibold">
      Easy returns, hassle-free refunds
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
            {/* 1. Return Process Timeline */}
            <motion.section
              id="return-process"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-gray-900 border border-gray-800 p-6 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            >
              <div className="flex items-start mb-3">
                <RefreshCw className="text-yellow-400 mr-3" size={26} />
                <h2 className="text-xl font-bold uppercase tracking-wide">
                  Return Process Timeline
                </h2>
              </div>
              <div className="h-[1px] w-full bg-yellow-400 mb-8"></div>

              {/* Desktop Grid / Mobile Stack */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {returnSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={index}
                      className="relative bg-black border border-gray-800 p-4 rounded-lg flex flex-col items-center text-center hover:border-yellow-400/50 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-yellow-400 text-black flex items-center justify-center mb-3 shadow-[0_0_10px_rgba(250,204,21,0.4)]">
                        <Icon size={20} />
                      </div>
                      <h3 className="text-sm font-bold text-white uppercase mb-2">
                        {step.title}
                      </h3>
                      <p className="text-xs text-gray-300 leading-relaxed font-semibold">
                        {step.description}
                      </p>
                      {/* Arrow for Desktop Visual */}
                      {index < returnSteps.length - 1 && (
                        <div className="hidden lg:block absolute top-10 -right-4 z-10 text-gray-600">
                          ▶
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.section>

            {/* 2. Return Policy */}
            <motion.section
              id="return-policy"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gray-900 border border-gray-800 p-6 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            >
              <div className="flex items-start mb-3">
                <AlertCircle className="text-yellow-400 mr-3" size={26} />
                <h2 className="text-xl font-bold uppercase tracking-wide">
                  Return Policy
                </h2>
              </div>
              <div className="h-[1px] w-full bg-yellow-400 mb-6"></div>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "7-day return window from delivery date",
                  "Free pickup from your location",
                  "Items must be in original condition",
                  "All original tags must be attached",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-black border border-gray-800 rounded-md"
                  >
                    <CheckCircle
                      className="text-yellow-400 flex-shrink-0"
                      size={18}
                    />
                    <p className="text-sm text-gray-300 font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* 3. Refund Policy */}
            <motion.section
              id="refund-policy"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gray-900 border border-gray-800 p-6 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            >
              <div className="flex items-start mb-3">
                <CreditCard className="text-yellow-400 mr-3" size={26} />
                <h2 className="text-xl font-bold uppercase tracking-wide">
                  Refund Policy
                </h2>
              </div>
              <div className="h-[1px] w-full bg-yellow-400 mb-6"></div>

              <div className="space-y-3">
                {[
                  "Full refund to original payment method",
                  "Processing time: 5-7 business days after approval",
                  "No questions asked for eligible items",
                  "Email confirmation sent upon processing",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.8)]"></div>
                    <p className="text-sm text-gray-300 font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* 4. FAQs */}
            <motion.section
              id="faqs"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h2 className="text-xl font-bold uppercase tracking-wide mb-6 text-center text-white">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                {faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden transition-all hover:border-gray-600"
                  >
                    <button
                      onClick={() =>
                        setExpandedFaq(expandedFaq === faq.id ? null : faq.id)
                      }
                      className="w-full px-6 py-4 text-left flex items-center justify-between"
                    >
                      <span className="font-semibold text-gray-200 text-sm">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`text-yellow-400 transition-transform duration-200 ${
                          expandedFaq === faq.id ? "rotate-180" : ""
                        }`}
                        size={20}
                      />
                    </button>
                    <AnimatePresence>
                      {expandedFaq === faq.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-6 pb-4 border-t border-gray-800"
                        >
                          <p className="text-gray-400 text-sm leading-relaxed pt-3">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* Help CTA */}
            <div className="mt-8 bg-black border border-yellow-400/30 rounded-lg p-8 text-center shadow-[0_0_20px_rgba(250,204,21,0.05)]">
              <HelpCircle className="text-yellow-400 mx-auto mb-3" size={40} />
              <h3 className="text-lg font-bold text-white mb-2">
                Need help with your return?
              </h3>
              <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                Our customer service team is here to help you with any return or
                refund questions.
              </p>
              <a
                href="mailto:aijim.official@gmail.com"
                className="inline-block bg-yellow-400 text-black px-8 py-3 font-bold hover:bg-yellow-300 transition-colors shadow-glow"
              >
                EMAIL SUPPORT
              </a>
            </div>
          </main>
        </div>

        {/* Footer */}
        <div className="text-center font-semibold py-10 text-gray-200 text-sm bg-black">
          © {new Date().getFullYear()} AIJIM. All Rights Reserved.
        </div>
      </div>
    </Layout>
  );
};

export default RefundReturnPolicyNew;