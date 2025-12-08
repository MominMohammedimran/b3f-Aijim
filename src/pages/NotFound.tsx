import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Mail, Home, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

const DAY_START = 6; // 6:00
const DAY_END = 17; // 17:59 -> day until 17

export default function NotFound() {
  const location = useLocation();
  const [isDay, setIsDay] = useState<boolean>(() => {
    const hour = new Date().getHours();
    return hour >= DAY_START && hour <= DAY_END;
  });

  // update periodically so theme swaps if user stays on page across the threshold
  useEffect(() => {
    const tick = () => {
      const hour = new Date().getHours();
      setIsDay(hour >= DAY_START && hour <= DAY_END);
    };
    const id = setInterval(tick, 60_000); // check every minute
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const bgGradient = isDay
    ? "bg-gradient-to-b from-[#f8fafc] via-[#e6f0ff] to-[#dbeafe]"
    : "bg-gradient-to-b from-[#03040a] via-[#07071a] to-[#0b1226]";

  const cardBg = isDay ? "bg-white/90 text-slate-900" : "bg-gray-900/80 text-gray-100";
  const accent = isDay ? "text-yellow-500" : "text-yellow-400";

  return (
    <div className={`h-[100px] ${bgGradient} flex items-center justify-center px-4 py-12`}>
      <div className="max-w-5xl w-full grid lg:grid-cols-2 items-center">
        {/* Left visual */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative flex items-center justify-center"
        >
          {/* scene container */}
          <div className="w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-2xl">
            {/* Day scene */}
            {isDay ? (
              <div className="w-full h-full bg-[linear-gradient(180deg,#a7d8ff,transparent)] flex items-center justify-center">
                {/* Stylized sun */}
                <motion.div
                  animate={{ rotate: [0, 12, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <div className="w-40 h-20 rounded-full bg-yellow-400/95 shadow-xl flex items-center justify-center">
                    <Sun className="w-16 h-16 text-white" />
                  </div>
                </motion.div>
                {/* gentle cloud */}
                <motion.div
                  className="absolute -bottom-6 left-6 w-48 h-20 bg-white/90 rounded-3xl blur-sm opacity-70"
                  animate={{ x: [0, 10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            ) : (
              // Night scene
              <div className="w-full h-full bg-[linear-gradient(180deg,#071029,#000814)] relative">
                {/* stars */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <g fill="white" opacity="0.9">
                    <circle cx="12%" cy="18%" r="1.6" />
                    <circle cx="26%" cy="10%" r="0.9" />
                    <circle cx="38%" cy="24%" r="1.2" />
                    <circle cx="62%" cy="8%" r="0.8" />
                    <circle cx="72%" cy="25%" r="1.4" />
                    <circle cx="86%" cy="16%" r="1.0" />
                    <circle cx="55%" cy="36%" r="0.9" />
                    <circle cx="18%" cy="40%" r="0.9" />
                  </g>
                </svg>

                {/* moon */}
                <motion.div
                  initial={{ y: -6 }}
                  animate={{ y: [ -6, 6, -6 ] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-6 right-8"
                >
                  <div className="w-36 h-36 rounded-full bg-gradient-to-tr from-gray-200/90 to-gray-400/70 shadow-lg flex items-center justify-center">
                    <Moon className="w-16 h-16 text-gray-900" />
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right content */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.08 }}
          className={`p-2 rounded-2xl ${cardBg} shadow-xl border border-transparent`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className={`text-4xl font-extrabold tracking-tight ${accent}`}>404</h2>
              <p className="mt-1 text-sm font-semibold opacity-80">
                Page not found — looks like it wandered off.
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs opacity-70">Local time</p>
              <ClockDisplay className="mt-1 text-sm font-medium" />
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed opacity-90">
            The page <code className="rounded px-1 py-0.5 bg-muted/20 text-xs">{location.pathname}</code> doesn't exist or has been moved.
            Try one of the options below — or contact us if you think this is a mistake.
          </p>

          <div className="mt-6 flex gap-3">
            <Link to="/" className="w-full">
              <button
                aria-label="Return home"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold shadow hover:scale-[1.01] transition-transform bg-yellow-400 text-black"
              >
                <Home className="w-4 h-4" />
                Return Home
              </button>
            </Link>

            <Link to="/contact-us" className="w-full">
              <button
                aria-label="Contact support"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold border border-white/10 hover:bg-white/6 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Contact Us
              </button>
            </Link>
          </div>

          <div className="mt-6 border-t border-white/5 pt-4 text-sm flex items-center justify-between">
            <span className="text-xs opacity-80">
              Still stuck? report issue —{" "}
              <a
                href={`mailto:aijim.official@gmail.com?subject=Broken Link: ${encodeURIComponent(
                  location.pathname
                )}`}
                className="underline"
              >
                send email
              </a>
            </span>

            <span className="text-xs opacity-70 flex items-center gap-2">
              Theme:
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded">
                {isDay ? <Sun className="w-4 h-4 text-yellow-500" /> : <Moon className="w-4 h-4 text-yellow-400" />}
                <strong className="ml-1">{isDay ? "Day" : "Night"}</strong>
              </span>
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* Small clock component that updates time every second */
function ClockDisplay({ className }: { className?: string }) {
  const [time, setTime] = useState<string>(() => new Date().toLocaleTimeString());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span className={className}>{time}</span>;
}