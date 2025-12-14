import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, Mail } from 'lucide-react';

const NewFooter = () => {
  const footerSections = [
    {
      title: 'ABOUT',
      links: [
        { name: 'Our Story', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Press', href: '/press' },
        { name: 'Blog', href: '/blog' },
      ]
    },
    {
      title: 'HELP',
      links: [
        { name: 'Size Guide', href: '/size-guide' },
        { name: 'Returns', href: '/returns' },
        { name: 'Shipping', href: '/shipping' },
        { name: 'FAQ', href: '/faq' },
      ]
    },
    {
      title: 'CONTACT',
      links: [
        { name: 'Customer Service', href: '/contact' },
        { name: 'Track Your Order', href: '/track' },
        { name: 'Wholesale', href: '/wholesale' },
        { name: 'Privacy Policy', href: '/privacy' },
      ]
    }
  ];

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <h2 className="text-3xl font-black text-foreground tracking-wider mb-4">
                AIJIM
              </h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Premium oversized streetwear that defines your style. 
                Comfort meets attitude in every piece we create.
              </p>
              
              {/* Social Media */}
              <div className="flex space-x-4">
                <a 
                  href="#" 
                  className="text-muted-foreground hover:text-accent transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="text-muted-foreground hover:text-accent transition-colors duration-200"
                  aria-label="Twitter"
                >
                  <Twitter className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="text-muted-foreground hover:text-accent transition-colors duration-200"
                  aria-label="Facebook"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a 
                  href="#" 
                  className="text-muted-foreground hover:text-accent transition-colors duration-200"
                  aria-label="Email"
                >
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Footer Links */}
            {footerSections.map((section) => (
              <div key={section.title}>
                <h3 className="text-foreground font-bold text-sm tracking-wider mb-4">
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-muted-foreground text-sm hover:text-accent transition-colors duration-200"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-border py-8">
          <div className="max-w-md">
            <h3 className="text-foreground font-bold text-lg mb-2">
              STAY UPDATED
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Get the latest drops, exclusive offers, and style tips.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-input border border-border rounded-none text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button className="bg-accent hover:bg-accent/90 text-white font-bold px-6 py-2 rounded-none transition-colors duration-200">
                SUBSCRIBE
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>© 2024 AIJIM. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <Link to="/terms" className="hover:text-accent transition-colors duration-200">
                Terms of Service
              </Link>
              <Link to="/privacy" className="hover:text-accent transition-colors duration-200">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default NewFooter;
