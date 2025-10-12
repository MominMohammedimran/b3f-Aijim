
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ChatbaseAIWidget from '../ui/ChatbaseAIWidget';
import StructuredData from '../seo/StructuredData';
import InstallAppButton from '../InstallAppButton';

interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideFooter = false }) => {
  const organizationData = {
    name: "AIJIM",
    url: "https://aijm.shop",
    logo: "https://aijim.shop/logo.png",
    description: "Premium fashion and apparel including oversized tees, hoodies and trendy clothing with great discounts.",
    contactPoint: {
      email: "aijim.official@gmail.com",
      contactType: "Customer Service",
      areaServed: "India"
    },
    sameAs: [
      "https://facebook.com/aijim",
      "https://instagram.com/aijim.shop",
      "https://twitter.com/aijim"
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
      <ChatbaseAIWidget />
    
    </div>
  );
};

export default Layout;