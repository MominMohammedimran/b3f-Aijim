import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SEOHelmet from '../components/seo/SEOHelmet';
import useSEO from '@/hooks/useSEO';

const Home = () => {
  const seo = useSEO('/');

  return (
    <Layout>
      <SEOHelmet {...{ ...seo, keywords: seo.keywords?.join(', ') }} />
      
      {/* Hero Section with Premium Typography */}
      <section className="py-16 px-4 text-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="container mx-auto max-w-4xl">
          <h1 className="font-space-grotesk font-bold text-4xl md:text-6xl uppercase tracking-wider text-white mb-6">
            PREMIUM FASHION
          </h1>
          <p className="font-inter text-lg md:text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto">
            Discover our exclusive collection of oversized tees, hoodies, and custom printed apparel. 
            Quality meets style in every thread.
          </p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
            <h2 className="font-space-grotesk font-bold text-2xl uppercase tracking-wide text-white mb-4">
              🔥 FLASH SALE
            </h2>
            <p className="font-inter text-white">
              Flat ₹500 off on orders above ₹2500. Limited time offer!
            </p>
          </div>
          
          <Link to="/products">
            <button className="bg-white text-black font-space-grotesk font-bold px-8 py-4 text-lg uppercase tracking-wider hover:bg-gray-100 transition-colors">
              Shop Now
            </button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-black">
        <div className="container mx-auto">
          <h2 className="font-space-grotesk font-bold text-3xl uppercase tracking-wide text-center text-white mb-12">
            Why Choose AIJIM
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="font-space-grotesk font-bold text-xl uppercase tracking-wide text-white mb-4">
                Premium Quality
              </h3>
              <p className="font-inter text-gray-300">
                High-quality materials and perfect stitching for long-lasting wear.
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="font-space-grotesk font-bold text-xl uppercase tracking-wide text-white mb-4">
                Custom Designs
              </h3>
              <p className="font-inter text-gray-300">
                Personalize your apparel with our custom printing services.
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="font-space-grotesk font-bold text-xl uppercase tracking-wide text-white mb-4">
                Fast Delivery
              </h3>
              <p className="font-inter text-gray-300">
                Quick and secure delivery to your doorstep nationwide.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
