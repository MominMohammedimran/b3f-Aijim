
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatbaseAIWidget from '../ui/ChatbaseAIWidget';
import StructuredData from '../seo/StructuredData';

interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideFooter = false }) => {
  const organizationData = {
    name: "AIJIM",
    url: "https://aijm.shop",
    logo: "https://aijim.shop/logo.png",
    description: "Premium Oversized Tees @Affordable.",
    contactPoint: {
      telephone: "+91-XXXXXXXXXX",
      contactType: "Customer Service",
      areaServed: "India"
    },
    sameAs: [
    
      "https://instagram.com/aijim.shop",
     
    ]
  };

  const websiteData = {
    name: "AIJIM",
    url: "https://aijim.shop",
    description: "Premium fashion platform for trendy apparel",
    potentialAction: {
      target: "https://aijim.shop/search?q={search_term_string}",
      queryInput: "required name=search_term_string"
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <StructuredData type="organization" data={organizationData} />
      <StructuredData type="website" data={websiteData} />
      <Navbar />
      <main className="flex-grow  bg-black">
        {children}
      </main>
      {!hideFooter && <Footer />}
      
    </div>
  );
};

export default Layout;
