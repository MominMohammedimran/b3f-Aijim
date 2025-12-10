import React from 'react';
import { useLocation } from "react-router-dom";
import Navbar from './Navbar';
import Footer from './Footer';
import Feedback from '@/pages/legal/Feedback'
import ChatbaseAIWidget from '../ui/ChatbaseAIWidget';
import StructuredData from '../seo/StructuredData';
import InstallAppButton from '../InstallAppButton';
import { FeaturedArticles } from "@/components/articles/FeaturedArticles";
interface LayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideFooter = false }) => {
  const location = useLocation(); 
  const isHomePage = location.pathname === "/"; // <–– detect homepage

  const organizationData = {
    name: "AIJIM",
    url: "https://aijim.shop",
    logo: "https://aijim.shop/aijim.svg",
    description: "Premium fashion and apparel including oversized tees trendy clothing with great discounts.",
    contactPoint: {
      email: "aijim.official@gmail.com",
      contactType: "Customer Service",
      areaServed: "India"
    },
    sameAs: [
      "https://facebook.com/aijim.shop",
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
      
      <Navbar  />

      <main className="flex-grow bg-black mt-2 py-4">
        {children}
      </main>

      {/* Only show Feedback component on Home page */}
      {isHomePage && <FeaturedArticles/>}
      {isHomePage && <Feedback mode='inline'/>}
    

      {!hideFooter && <Footer />}

      <ChatbaseAIWidget />
    </div>
  );
};

export default Layout;
