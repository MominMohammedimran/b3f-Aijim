import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import SEOHelmet from '@/components/seo/SEOHelmet';
import useSEO from '@/hooks/useSEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const ContactUs = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

   const seo = useSEO('/contact-us');
  return (
    <Layout>
      <SEOHelmet {...{ ...seo, keywords: seo.keywords?.join(', ') }} />
      
      <div className="container mx-auto px-4 mt-10 py-12">
        <div className="max-w-2xl mx-auto bg-gray-800 text-white  p-6  shadow-md border">
          <h1 className="text-3xl font-bold text-center mb-6 text-white">
            📬 Contact Us
          </h1>
          <p className="text-center text-white mb-8">
            We'd love to hear from you. Fill out the form below and our team will respond shortly.
          </p>

          <form
            action="https://formsubmit.co/b3f.prints.pages.dev@gmail.com"
            method="POST"
            className="space-y-6"
          >
            {/* Hidden FormSubmit Settings */}
            <input type="hidden" name="_captcha" value="false" />
            <input
              type="hidden"
              name="_subject"
              value="New Contact Form Submission from B3F Prints"
            />
            <input type="hidden" name="_template" value="table" />
            <input
              type="hidden"
              name="_next"
              value="https://aijim.pages.dev/thank-you"
            />

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-1">
                Your Name
              </label>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g. John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-1">
                Your Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="e.g. john@example.com"
              />
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-200 mb-1">
                Your Message
              </label>
              <Textarea
                id="message"
                name="message"
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                placeholder="Type your message here..."
              />
            </div>

            <Button type="submit" className="w-full bg-yellow-300 text-gray-800 text-base font-semibold">
              Send Message ✉️
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ContactUs;
