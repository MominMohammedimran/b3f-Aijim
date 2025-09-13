
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ShippingDelivery = () => {
  return (
    <Layout>
      <div className="container-custom mt-10">
        <div className="flex items-center pt-10 mb-6">
          <Link to="/" className="mr-2">
            <ArrowLeft size={20} className="text-gray-100 font-bold" />
          </Link>
          <h1 className="text-2xl font-bold">Shipping and Delivery Policy</h1>
        </div>
        
        <div className="bg-gray-800 text-white rounded-lg shadow-sm p-6">
          <div className="prose max-w-none">
            <p>Last Updated: April 27, 2025</p>
            
            <h2 className="text-lg font-bold underline mt-2 mb-2">Processing Time</h2>
            <p className='text-sm '>
              All orders are processed within 1-3 business days after payment confirmation. 
             
            
              If there is an issue with your order, we will contact you using the email or phone number 
              provided during checkout.
            </p>
            
            <h2 className="text-xl font-bold underline mt-2 mb-2">Shipping Methods & Timeframes</h2>
            <p className='text-sm text'>
              We offer the following shipping options for deliveries within India:
            </p>
            
            <h3 className="text-lg font-semibold underline mt-2 mb-2">Standard Shipping</h3>
            <ul className="list-disc pl-6 ">
              <li>Delivery Time: 5-8 business days</li>
              <li>Cost : ₹80 for every delivery</li>
              <li>Free for orders above ₹1999</li>
            </ul>
            
           {/* <h3 className="text-lg font-semibold mt-4 mb-2">Express Shipping</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Delivery Time: 1-3 business days</li>
              <li>Cost: ₹100 (flat rate for all orders)</li>
            </ul> */}
            
            <p className="mt-2 text-sm">
              Please note that these delivery timeframes are estimates and may vary based on your location 
              and other factors outside our control.
            </p>
            
            <h2 className="text-xl font-bold underline mt-2 mb-2">Shipping Carriers</h2>
            <p className='text-sm'>
              We use reputable shipping carriers including:
            </p>
            <ul className="list-disc pl-6 ">
              <li>Exprees bee</li>
              <li>Delhivery</li>
            </ul>
            <p className="mt-4 text-sm ">
              The choice of carrier depends on your location and the shipping method selected.
            </p>
            
            <h2 className="text-xl font-bold underline mt-6 mb-4">Order Tracking</h2>
            <p className='text-sm'>
              Once your order ships, you will receive a tracking number via email. 
              You can track your package's status and estimated delivery date using the tracking 
              number on our website or the carrier's website.
            </p>
            
            <h2 className="text-xl font-bold underline mt-6 mb-4">Shipping Locations</h2>
            <p  className='text-sm '>
              We currently ship to all major cities and most locations across India. 
              If your location is not serviceable, we will notify you after you place your order.
            </p>
            
            <h3 className="text-lg font-semibold   underline mt-4 mb-2">Additional Information for Remote Areas</h3>
            <p className='text-sm '>
              For deliveries to remote or difficult-to-reach areas, additional shipping charges may apply, 
              and delivery times may be extended. We will inform you of any additional charges before processing your order.
            </p>
            
            <h2 className="text-xl font-bold underline mt-6 mb-4">International Shipping</h2>
            <p className='text-sm'>
              We currently do not offer international shipping. We are focused on serving customers within India.
            </p>
            
            <h2 className="text-xl font-bold underline mt-6 mb-4">Delivery Issues</h2>
            
            <h3 className="text-lg font-semibold  mt-4 mb-2">Failed Deliveries</h3>
            <p className='text-sm '>
              If a delivery attempt is unsuccessful, the carrier will leave a notice with instructions for 
              rescheduling or pickup. After three failed delivery attempts, the package may be returned to us. 
              In such cases, you will be responsible for any re-shipping costs.
            </p>
            
            <h3 className="text-lg font-semibold mt-4 mb-2">Incorrect Address</h3>
            <p className='text-sm '>
              Please ensure your shipping address is accurate and complete. We are not responsible for 
              packages delivered to incorrect addresses provided by customers. If your package is returned 
              to us due to an incorrect address, you will be responsible for the cost of reshipping.
            </p>
            
            <h2 className="text-xl font-bold underline mt-6 mb-4">Contact Us</h2>
            <p className='text-sm '>
              If you have questions about our Shipping and Delivery Policy, please contact us at:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> b3fprintingsolutions@gmail.com<br />
              <strong>Phone :</strong> 7672080881
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ShippingDelivery;
