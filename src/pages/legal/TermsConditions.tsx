import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUp,
  User,
  ShoppingBag,
  CreditCard,
  FileText,
  Scale,
} from "lucide-react";
import { motion } from "framer-motion";

const TermsConditions = () => {
  const [activeSection, setActiveSection] = useState("account");
  const [showTopBtn, setShowTopBtn] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  const sections = [
    { id: "account", title: "Account Terms", icon: User },
    { id: "orders", title: "Orders & Purchases", icon: ShoppingBag },
    { id: "payments", title: "Payment Terms", icon: CreditCard },
    { id: "usage", title: "Website Usage", icon: FileText },
    { id: "legal", title: "Legal Terms", icon: Scale },
  ];

  // track scroll for progress bar + back to top
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrolled = (scrollTop / height) * 100;
      setScrollProgress(scrolled);
      setShowTopBtn(scrollTop > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Layout>
      <div className="relative min-h-screen bg-black text-white">
        {/* --- Scroll Progress Bar --- */}
        <div
          className="fixed top-0 left-0 h-[3px] bg-yellow-400 z-50 transition-all duration-200"
          style={{ width: `${scrollProgress}%` }}
        />

        {/* HEADER */}
        <div className="container-custom pt-20 pb-8">
          <div className="flex items-center gap-4 mb-2">
            <Link
              to="/"
              className="text-gray-400 hover:text-yellow-400 transition-colors"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-xl font-semibold uppercase tracking-wider">
                Terms & Conditions
              </h1>
              <p className="text-xs text-gray-400 font-semibold">
                Last Updated: Sept 27, 2025
              </p>
            </div>
          </div>
          <div className="h-[2px] bg-yellow-400 w-full rounded-full mt-2"></div>
        </div>

        {/* MAIN SECTION */}
        <div className="container-custom flex flex-col lg:flex-row gap-10">
          {/* LEFT INDEX */}
          <aside className="lg:w-72">
            <div className="bg-gray-900 border border-gray-800 rounded-none p-6 sticky top-24 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
              <h3 className="text-lg font-semibold text-yellow-400 mb-4 uppercase tracking-wide">
                Sections
              </h3>
              <nav className="space-y-2">
                {sections.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setActiveSection(s.id);
                        document
                          .getElementById(s.id)
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all ${
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

          {/* RIGHT CONTENT */}
          <main className="flex-1 space-y-5">
            {sections.map((s, idx) => {
              const Icon = s.icon;
              const fadeIn = {
                initial: { opacity: 0, y: 40 },
                whileInView: { opacity: 1, y: 0 },
                transition: { duration: 0.5, delay: idx * 0.05 },
                viewport: { once: true },
              };
              return (
                <motion.section
                  key={s.id}
                  id={s.id}
                  {...fadeIn}
                  className="bg-gray-900 border border-gray-800 rounded-none p-3 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                >
                  <div className="flex items-center mb-3">
                    <Icon className="text-yellow-400 mr-3" size={26} />
                    <h2 className="text-xl font-bold uppercase tracking-wide">
                      {s.title}
                    </h2>
                  </div>
                  <div className="h-[1px] w-full bg-yellow-400 mb-4"></div>

                  <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
                    {s.id === "account" && (
                      <>
                        <p>
                          When you create an account with AIJIM, you must
                          provide accurate and complete information.
                        </p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>You are responsible for your account security.</li>
                          <li>Users must be at least 18 years old.</li>
                          <li>One account per person is allowed.</li>
                          <li>Notify us of unauthorized access immediately.</li>
                        </ul>
                      </>
                    )}

                    {s.id === "orders" && (
                      <>
                        <p>
                          All orders are processed based on availability and
                          acceptance by AIJIM.
                        </p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>Orders are processed within 1–2 days.</li>
                          <li>Availability confirmed only after payment.</li>
                          <li>AIJIM may cancel unverified orders.</li>
                        </ul>
                      </>
                    )}

                    {s.id === "payments" && (
                      <>
                        <p>
                          Payments are due at checkout via secure gateways.
                        </p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>We accept cards, UPI, wallets.</li>
                          <li>All prices in INR.</li>
                          <li>Failed payments may cancel orders.</li>
                        </ul>
                      </>
                    )}

                    {s.id === "usage" && (
                      <>
                        <p>Use our website responsibly and lawfully.</p>
                        <ul className="list-disc list-inside ml-4 space-y-1">
                          <li>No hacking or unauthorized access.</li>
                          <li>No harmful or offensive content.</li>
                          <li>No data scraping or spamming.</li>
                        </ul>
                      </>
                    )}

                    {s.id === "legal" && (
                      <>
                        <p>
                          Governed by Indian law and subject to Mumbai court
                          jurisdiction.
                        </p>
                        <div className="grid md:grid-cols-2 gap-4 mt-3">
                          <div className="border border-gray-700 rounded-lg p-4 bg-black/40">
                            <h4 className="text-yellow-400 font-semibold mb-1">
                              Limitation of Liability
                            </h4>
                            <p className="text-xs">
                              AIJIM’s liability is limited to the value of the
                              purchased item.
                            </p>
                          </div>
                          <div className="border border-gray-700 rounded-lg p-4 bg-black/40">
                            <h4 className="text-yellow-400 font-semibold mb-1">
                              Indemnification
                            </h4>
                            <p className="text-xs">
                              Users agree to indemnify AIJIM against misuse or
                              violations.
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </motion.section>
              );
            })}
          </main>
        </div>

        {/* FOOTER NOTE */}
        <div className="text-center font-semibold py-10 text-gray-200 text-xs">
          © {new Date().getFullYear()} AIJIM. All Rights Reserved.
        </div>

        {/* --- BACK TO TOP BUTTON --
        {showTopBtn && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 bg-yellow-400 text-black p-3 rounded-full shadow-lg hover:bg-yellow-300 transition-transform duration-300 hover:scale-110"
            aria-label="Back to top"
          >
            <ArrowUp size={20} />
          </button>
        )}*/}
      </div>
    </Layout>
  );
};

export default TermsConditions;
