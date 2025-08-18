import React from 'react';
import Layout from '../components/layout/Layout';
import SEOHelmet from '@/components/seo/SEOHelmet';
import useSEO from '@/hooks/useSEO';

import { Link } from 'react-router-dom';
import{ArrowLeft} from 'lucide-react'
const AboutUs = () => {
 const seo = useSEO('/about-us');
  return (
    <Layout>
    <SEOHelmet {...{ ...seo, keywords: seo.keywords?.join(', ') }} />


      <div className="container-custom pt-2 pb-24 mt-10">
        <div className="flex items-center mb-4 pt-10">
                  <Link to="/" className="mr-2">
                    <ArrowLeft size={24} className="back-arrow font-bold" />
                  </Link>
                  <h1 className="text-2xl font-bold text-gray-100">Back</h1>
                </div>
        
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4">About Us</h1>
          
          <div className="bg-gray-800 text-white  shadow-sm p-6 pb-0">
            <h2 className="text-2xl font-semibold underline mb-4">Our Story</h2>
            <p className="mb-1">
              Founded in 2025, our company was born out of a passion for creating custom apparel and 
              products that help individuals and businesses express their unique identity.
            </p>
            <p>
              We believe that everyone deserves the opportunity to wear and use products that truly 
              represent who they are. That's why we've built an easy-to-use platform that puts the 
              power of design in your hands.
            </p>
          </div>
          
          <div className="bg-gray-800 text-white shadow-sm p-6 pb-0">
            <h2 className="text-2xl font-semibold underline mb-4">Our Mission</h2>
            <p>
              Our mission is to provide high-quality customizable products with exceptional 
              customer service. We strive to make the design process simple and enjoyable, 
              while delivering products that exceed our customers' expectations.
            </p>
          </div>
          
          <div className="bg-gray-800 text-white  shadow-sm p-6">
            <h2 className="text-2xl font-semibold underline  mb-4">Contact Us</h2>
            <p className="mb-4">
              We'd love to hear from you! Whether you have questions about our products, 
              need help with an order, or want to discuss a business opportunity, we're here to help.
            </p>
            <p>
              <a 
                href="/contact-us" 
                className="text-yellow-300 hover:text-yellow-500 font-medium"
              >
                Visit our Contact page →
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutUs;
