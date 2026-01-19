import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUp,
  Shield,
  Cookie,
  Users,
  FileText,
  Eye,
  Lock,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState("introduction");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showTopBtn, setShowTopBtn] = useState(false);

  const sections = [
    { id: "introduction", title: "Introduction", icon: Shield },
    { id: "data-collection", title: "Information We Collect", icon: Eye },
    { id: "data-usage", title: " Your Information", icon: FileText },
    { id: "cookies", title: "Cookies & Tracking", icon: Cookie },
    { id: "third-party", title: "Third-Party Disclosure", icon: Globe },
    { id: "data-security", title: "Data Security", icon: Lock },
    { id: "user-rights", title: "Your Rights", icon: Users },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const height =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      setScrollProgress((scrollTop / height) * 100);
      setShowTopBtn(scrollTop > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Layout>
      <div className="relative min-h-screen bg-black text-white">
        {/* Scroll Progress */}
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
      Privacy Policy
    </span>
  </nav>

  {/* Title */}
  <div className="mb-2">
    <h1 className="text-2xl font-semibold uppercase tracking-wider">
      Privacy Policy
    </h1>
    <p className="text-xs text-gray-400 font-semibold">
      Last Updated: Jan 17, 2026
    </p>
  </div>

  {/* Divider */}
  <div className="h-[2px] bg-yellow-400 w-full rounded-full mt-2"></div>
</div>

        {/* Main Section */}
        <div className="container-custom flex flex-col lg:flex-row gap-10">
          {/* Left Navigation */}
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

          {/* Right Content */}
          <main className="flex-1 space-y-10">
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
                  <div className="flex items-start mb-3">
                    <Icon className="text-yellow-400 mr-3" size={26} />
                    <h2 className="text-xl font-bold uppercase tracking-wide">
                      {s.title}
                    </h2>
                  </div>
                  <div className="h-[1px] w-full bg-yellow-400 mb-4"></div>

                  {/* Content */}
                  <div className="text-gray-300 text-sm leading-relaxed font-semibold space-y-3">
                    {s.id === "introduction" && (
                      <p>
                        At AIJIM, we respect your privacy and value your trust.
                        This policy explains how we handle your data when you
                        visit our website or use our services. By accessing our
                        platform, you agree to the terms described here.
                      </p>
                    )}

                    {s.id === "data-collection" && (
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>
                          <strong>Personal Info:</strong> Name, email, phone,
                          shipping/billing address.
                        </li>
                        <li>
                          <strong>Order Details:</strong> Items purchased, order
                          history, and preferences.
                        </li>
                        <li>
                          <strong>Usage Data:</strong> Search queries and page
                          visits for performance tracking.
                        </li>
                        <li>
                          <strong>Device Info:</strong> IP, browser type, and
                          OS.
                        </li>
                      </ul>
                    )}

                    {s.id === "data-usage" && (
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>To process and deliver your orders.</li>
                        <li>To provide customer support and updates.</li>
                        <li>To enhance user experience and optimize content.</li>
                        <li>To prevent fraud and ensure security.</li>
                        <li>To comply with legal obligations.</li>
                      </ul>
                    )}

                    {s.id === "cookies" && (
                      <p>
                        We use cookies and similar tools to personalize your
                        experience and analyze traffic. You can manage or delete
                        cookies via your browser settings, but certain site
                        features may not function properly.
                      </p>
                    )}

                    {s.id === "third-party" && (
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>
                          Third-party service providers assisting in operations.
                        </li>
                        <li>
                          Payment processors ensuring secure transactions.
                        </li>
                        <li>
                          Shipping partners handling product deliveries.
                        </li>
                        <li>
                          Legal authorities when required by law.
                        </li>
                      </ul>
                    )}

                    {s.id === "data-security" && (
                      <p>
                        We use SSL encryption and strict internal policies to
                        protect your personal information. While no system is
                        entirely invulnerable, we continuously update our
                        safeguards against unauthorized access.
                      </p>
                    )}

                    {s.id === "user-rights" && (
                      <ul className="list-disc list-inside ml-4 space-y-1">
                        <li>
                          You can request access, correction, or deletion of
                          your personal data.
                        </li>
                        <li>You can opt out of promotional emails anytime.</li>
                        <li>
                          You can request data portability or restriction of
                          processing.
                        </li>
                        <li>
                          For any privacy concerns, contact us at{" "}
                          <span className="text-yellow-400 font-semibold">
                          aijim.official@gmail.com
                          </span>
                          .
                        </li>
                      </ul>
                    )}
                  </div>
                </motion.section>
              );
            })}
          </main>
        </div>

        {/* Footer */}
        <div className="text-center font-semibold py-10 text-gray-200 text-xs">
          © {new Date().getFullYear()} AIJIM. All Rights Reserved.
        </div>

        {/* Back to Top 
        {showTopBtn && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 bg-yellow-400 text-black p-3 rounded-full shadow-lg hover:bg-yellow-300 transition-transform duration-300 hover:scale-110"
          >
            <ArrowUp size={20} />
          </button>
        )}*/}
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
