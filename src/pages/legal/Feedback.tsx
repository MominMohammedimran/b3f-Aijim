import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import Layout from "@/components/layout/Layout"; // adjust based on folder
import { Link } from "react-router-dom";
interface FeedbackProps {
  mode?: "inline" | "page"; // default inline
}

export default function Feedback({ mode = "inline" }: FeedbackProps) {
  const [open, setOpen] = useState(mode === "page"); // page view stays open
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
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.success) {
        setSubmitted(true);
        setFormData({ name: "", email: "", message: "" });
      }
    } catch {
      alert("⚠ Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // 💡 Form markup extracted so both modes use same UI.
  const formUI = (
    <>
      {submitted ? (
        <p className="text-green-400 text-sm text-center pt-2">
          ✔ Thank you! Your feedback matters.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-3"
        >
          <input
            type="text"
            required
            placeholder="Name"
            className="bg-black text-white border border-gray-600 px-3 py-2 text-sm focus:border-red-500 outline-none"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <input
            type="email"
            placeholder="Email"
            className="bg-black text-white border border-gray-600 px-3 py-2 text-sm focus:border-red-500 outline-none"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <textarea
            required
            rows={3}
            placeholder="Share your thoughts..."
            className="bg-black text-white border border-gray-600 px-3 py-2 text-sm focus:border-red-500 outline-none md:col-span-2"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          ></textarea>

          <button
            type="submit"
            disabled={loading}
            className="bg-red-600 text-white font-semibold py-2 hover:bg-red-700 transition disabled:opacity-50 md:col-span-2"
          >
            {loading ? "Sending..." : "Send Feedback"}
          </button>
        </form>
      )}
    </>
  );

  // ------------------------------------------------
  // 🔹 MODE 1: INLINE (Collapsible)
  // ------------------------------------------------
  if (mode === "inline") {
    return (
      <div className="bg-black border border-gray-500 px-4 py-3 w-[85%] sm:w-[65%] md:w-[60%] lg:w-[50%] mx-auto mt-10">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex justify-between items-center text-yellow-400 font-semibold text-[14px]"
        >
          Feedback Form
          {open ? (
            <ChevronUp size={18} className="text-red-500" />
          ) : (
            <ChevronDown size={18} className="text-gray-400" />
          )}
        </button>

        <div
          className={`overflow-hidden transition-all duration-300 ${
            open ? "max-h-[600px] mt-4" : "max-h-0"
          }`}
        >
          {formUI}
        </div>
      </div>
    );
  }

  // ------------------------------------------------
  // 🔹 MODE 2: FULL PAGE (Uses Layout)
  // ------------------------------------------------
  return (
    <Layout>
      <div className="max-w-lg mx-auto px-6 py-16 mt-5 text-center">
        {/* Header */}
<div className="container-custom  pb-8">
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
      Feedback
    </span>
  </nav>

 
  
</div>

        <h1 className="text-2xl font-bold text-yellow-400 mb-6">
          Share Your Feedback
        </h1>
        <div className="border border-gray-600 p-5">{formUI}</div>
      </div>
    </Layout>
  );
}
