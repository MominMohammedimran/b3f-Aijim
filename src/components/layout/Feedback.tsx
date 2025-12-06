import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function Feedback() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

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
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        setSubmitted(true);
        setFormData({ name: "", email: "", message: "" });
      }
    } catch (error) {
      alert("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black border border-gray-500 rounded-none p-4 w-[85%] sm:w-[65%] md:w-[60%] lg:w-[50%] mx-auto mt-10 transition-all duration-300">
      
      {/* Toggle Header */}
      <button
      aria-label="toggle"
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between  items-center text-white font-semibold text-[14px]"
      >
        <span className="text-yellow-400">Feedback Form</span>
        {open ? (
          <ChevronUp size={18} className="text-red-500" />
        ) : (
          <ChevronDown size={18} className="text-gray-400" />
        )}
      </button>

      {/* Collapsible Section */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          open ? "max-h-[1000px] mt-4" : "max-h-0"
        }`}
      >
        {submitted ? (
          <p className="text-green-400 text-sm text-center pt-2">
            ✔ Thank you! Your feedback matters.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">

            {/* Name */}
            <input
              type="text"
              required
              placeholder="Name"
              className="bg-black text-white font-semibold border border-gray-600 rounded-none px-3 py-2 text-sm focus:border-red-500 outline-none"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />

            {/* Email */}
            <input
              type="email"
              placeholder="Email"
              className="bg-black text-white font-semibold border border-gray-600 rounded-none px-3 py-2 text-sm focus:border-red-500 outline-none"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />

            {/* Message (full width) */}
            <textarea
              required
              placeholder="Share your thoughts..."
              rows={3}
              className="bg-black text-white font-semibold border border-gray-600 rounded-none px-3 py-2 text-sm focus:border-red-500 outline-none md:col-span-2"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
            ></textarea>

            {/* Submit button full width */}
            <button
              type="submit"
              aria-label="submit"
              disabled={loading}
              className="bg-red-600 text-white font-semibold py-2 rounded-none hover:bg-red-700 transition text-sm disabled:opacity-50 md:col-span-2"
            >
              {loading ? "Sending..." : "Send Feedback"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
