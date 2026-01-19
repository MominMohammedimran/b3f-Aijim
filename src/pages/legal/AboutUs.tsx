import React from "react";
import Layout from "@/components/layout/Layout";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Target, Heart, Leaf, Users } from "lucide-react";
import { motion } from "framer-motion";
import NewSEOHelmet from "@/components/seo/NewSEOHelmet";

const AboutUs = () => {
  const values = [
    {
      icon: Target,
      title: "Our Story",
      description:
        "Born from the streets, AIJIM blends urban culture with premium craftsmanship — made for the bold, the fearless, and the authentic.",
    },
    {
      icon: Heart,
      title: "Our Mission",
      description:
        "We aim to redefine streetwear by crafting elevated essentials that inspire individuality, comfort, and self-expression.",
    },
    {
      icon: Leaf,
      title: "Sustainability",
      description:
        "From eco-conscious materials to ethical production, we move with purpose — ensuring style never comes at the planet’s cost.",
    },
    {
      icon: Users,
      title: "The Community",
      description:
        "AIJIM is more than a label — it’s a collective of creators, thinkers, and doers shaping the culture of tomorrow.",
    },
  ];

  return (
    <Layout>
       <NewSEOHelmet 
        pageSEO={{ title: "About Us | AIJIM", description: "Learn about AIJIM brand & story." }}
      />
      <nav className="flex items-center gap-2 pt-10 mt-10  mb-5 text-white text-sm sm:text-base">
                                <Link to="/orders" className="opacity-70 hover:opacity-100 transition">
                                  Home
                                </Link>
                            
                               <span className="opacity-60">/</span>
                             
                            
                                <span className="font-semibold line-clamp-1">
                               
                                About Us
                                </span>
                              </nav>
      <div className="min-h-screen bg-black text-white overflow-hidden">
        {/* --- HERO SECTION --- */}
        <section className="relative h-[50vh] flex flex-col p-2 justify-center items-center text-center px-4 bg-[url('/aijim-uploads/aijim.svg')] bg-fit bg-center">
          <div className="absolute inset-0 bg-black/60" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-widest uppercase text-white">
              We Are <span className="text-yellow-400">AIJIM</span>
            </h1>
            <p className="mt-4 text-lg font-medium text-gray-200 max-w-xl mx-auto leading-snug">
              Premium streetwear crafted with purpose, passion, and precision.
            </p>
          </motion.div>
        </section>

        {/* --- VALUES SECTION --- */}
        <section className="py-8 px-6 md:px-12 lg:px-24 bg-gradient-to-b from-black via-gray-950 to-black">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-5 uppercase tracking-wider">
            What Defines Us
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/5 border border-gray-800 rounded-none p-3 backdrop-blur-md hover:scale-[1.03] transition-all duration-500 hover:border-yellow-400 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                >
                  <div className="flex flex-col items-start gap-4">
                    <div className="flex flex-wrap items-center gap-5">
                      <div className="p-2 rounded-lg bg-yellow-400/20 border border-yellow-500">
                        <Icon className="text-yellow-400" size={22} />
                      </div>
                      <h3 className="text-xl font-semibold uppercase tracking-wide">
                        {v.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {v.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* --- CRAFT SECTION --- */}
        <section className="relative bg-gradient-to-t from-black via-gray-900 to-black py-2 px-3 md:px-8 lg:px-16">
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <h2 className="text-xl md:text-2xl text-yellow-400 font-semibold uppercase tracking-snug">
                Crafted with Precision
              </h2>
              <p className="text-gray-300 text-sm md:text-base font-medium leading-relaxed">
                Each AIJIM piece undergoes rigorous inspection — from fabric
                sourcing to the final stitch. We design with intention, ensuring
                every detail speaks of authenticity, durability, and luxury.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="grid gap-6"
            >
              {[
                {
                  title: "Premium Fabrics",
                  desc: "Only the finest organic cottons and sustainable materials make it into our collections.",
                },
                {
                  title: "Ethical Production",
                  desc: "We believe great fashion shouldn’t come at the cost of people or the planet.",
                },
                {
                  title: "Quality Assurance",
                  desc: "Each drop goes through multiple quality checks to ensure unmatched craftsmanship.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-gray-800 rounded-none p-5 hover:border-yellow-400 transition-all"
                >
                  <h4 className="font-bold text-lg text-white mb-1">
                    {item.title}
                  </h4>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* --- LEGAL BUSINESS INFO --- */}
        <section className="bg-black border-t border-gray-800 text-center py-8 text-sm text-gray-400">
          <p>
            © 2025 <span className="text-white font-semibold">AIJIM</span>. All
            Rights Reserved.
          </p>
          <p className="mt-2">
            Legal Business Name:{" "}
            <span className="text-yellow-400 font-medium">
              Aijim Clothing
            </span>{" "}
          
          </p>
          <p className="mt-1">
            Aijim is a registered clothing brand owned and operated by{" "}
            <span className="text-white font-medium">Aijim Clothing</span>.
          </p>
        </section>
      </div>
    </Layout>
  );
};

export default AboutUs;
