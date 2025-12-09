import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Mail, Home, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

const DAY_START = 6;
const DAY_END = 17;

export default function NotFound() {
  const location = useLocation();
  const [isDay, setIsDay] = useState(() => {
    const hour = new Date().getHours();
    return hour >= DAY_START && hour <= DAY_END;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const hour = new Date().getHours();
      setIsDay(hour >= DAY_START && hour <= DAY_END);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const bgGradient = isDay
    ? "bg-gradient-to-br from-[#ffffff] via-[#eef6ff] to-[#dbeafe]"
    : "bg-gradient-to-br from-[#020617] via-[#0b1226] to-[#1e293b]";

  const cardStyles = `
    backdrop-blur-xl 
    border border-white/20 
    shadow-2xl 
    rounded-2xl 
    p-8 
    max-w-lg 
    w-full 
    transition-all 
    duration-500
    ${isDay ? "bg-white/70 text-gray-900" : "bg-black/30 text-gray-100"}
  `;

  return (
    <div className={`min-h-screen flex items-center justify-center px-6 ${bgGradient}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className={cardStyles}
      >
        {/* Animated Icon Scene */}
        <div className="flex justify-center mb-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative w-28 h-28 flex items-center justify-center"
          >
            {isDay ? (
              <motion.div
                animate={{ rotate: [0, 12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 flex items-center justify-center rounded-full bg-yellow-300/30 backdrop-blur-md shadow-inner"
              >
                <Sun className="w-12 h-12 text-yellow-500" />
              </motion.div>
            ) : (
              <motion.div
                animate={{ y: [-6, 6, -6] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 flex items-center justify-center rounded-full bg-gray-300/10 backdrop-blur-md shadow-inner"
              >
                <Moon className="w-12 h-12 text-gray-200" />
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-center text-6xl font-black tracking-tight"
        >
          404
        </motion.h1>
        <p className="text-center text-sm opacity-80 mt-1">Lost in the void</p>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mt-4 text-sm text-center opacity-90 leading-relaxed"
        >
          The page{" "}
          <code className="bg-black/20 px-2 py-0.5 rounded text-xs font-medium break-all">
            {location.pathname}
          </code>{" "}
          doesn’t exist — or maybe it moved to another universe.
        </motion.p>

        {/* CTA Buttons */}
        <div className="mt-7 flex flex-col gap-3">
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-2.5 rounded-lg font-semibold shadow-md bg-yellow-400 text-black flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Return Home
            </motion.button>
          </Link>

          <Link to="/contact-us">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="w-full py-2.5 rounded-lg border border-white/30 font-semibold backdrop-blur-sm flex items-center justify-center gap-2 hover:bg-white/10 transition"
            >
              <Mail className="w-5 h-5" />
              Contact Support
            </motion.button>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6 opacity-60 tracking-wide">
          {isDay ? "☀️ Day Mode" : "🌙 Night Mode"} • <ClockDisplay />
        </p>
      </motion.div>
    </div>
  );
}

function ClockDisplay() {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);
  return <span>{time}</span>;
}
