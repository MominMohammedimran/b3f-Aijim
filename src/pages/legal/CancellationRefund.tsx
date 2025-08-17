
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const CancellationRefund = () => {
  return (
    <Layout>
      <div className="container-custom mt-10 ">
        <div className="flex items-center pt-10 mb-6">
          <Link to="/" className="mr-2">
            <ArrowLeft size={20} className="text-blue-600 hover:text-blue-800" />
          </Link>
          <h1 className="text-2xl font-bold">Cancellation and Refund Policy</h1>
        </div>
        
        <div className="bg-gray-800 text-white rounded-lg shadow-sm p-6">
          <div className="prose max-w-none">
            <p>Last Updated: June 27, 2025</p>
            
            <p className="text-sm sm:text-base mb-4 leading-relaxed">
        At Aijim, we value your shopping experience. Here's how you can cancel or request a refund for your order:
      </p>

      <h2 className="text-lg underline sm:text-xl font-semibold mt-6 mb-2">Order Cancellation</h2>

      <ul className="list-disc list-inside space-y-2 mb-4 text-sm sm:text-base leading-relaxed">
        <li>
          <strong className='underline'>Before Payment:</strong> If your payment fails or you change your mind before completing the payment, you can remove items from your cart using the <strong>"Remove Item"</strong> button. The order will be automatically cancelled and removed.
        </li>
        <li>
          <strong className='underline'>After Payment but Before Shipping:</strong> If you wish to cancel your order after successful payment but before shipping, please contact our support team immediately at <strong>support@aijim.in</strong>.
        </li>
        <li>
          <strong className='underline'>After Shipping:</strong> Once your order has been shipped, we are unable to cancel the order.
        </li>
      </ul>
 <h2 className="text-xl font-bold underline mt-6 mb-4">Returns</h2>
       <p className="text-sm sm:text-base leading-relaxed mb-4">
  We want you to love what you ordered! At this time, we’re unable to accept returns as our delivery partners do not support return pickups. We appreciate your understanding.
</p>

 {/*
            <h3 className="text-lg font-semibold mt-4 mb-2">Return Eligibility</h3>
            <p>To be eligible for a return, your item must be:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Unused and in the same condition that you received it</li>
              <li>In the original packaging</li>
              <li>Accompanied by the original receipt or proof of purchase</li>
            </ul>
            
            <h3 className="text-lg font-semibold mt-4 mb-2">Non-Returnable Items</h3>
            <p>The following items cannot be returned:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Custom-designed products</li>
              <li>Sale items (unless defective)</li>
              <li>Intimate or sanitary goods</li>
              <li>Products with broken seals or missing tags</li>
            </ul>
            
            <h3 className="text-lg font-semibold mt-4 mb-2">Return Process</h3>
            <p>To initiate a return:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Contact our customer support team with your order number and reason for return</li>
              <li>Receive a Return Merchandise Authorization (RMA) number</li>
              <li>Package the item securely with all original packaging and the RMA number clearly marked</li>
              <li>Ship the item to the address provided by our customer support team</li>
            </ol>
            
            <h2 className="text-xl font-bold mt-6 mb-4">Refunds</h2>
            <p>
              Once we receive and inspect your return, we will notify you about the status of your refund.
            </p>
            
            <h3 className="text-lg font-semibold mt-4 mb-2">Refund Processing</h3>
            <p>
              If your return is approved, we will initiate a refund to your original payment method. 
              The time it takes for the refund to appear in your account depends on your payment provider 
              and typically takes 5-7 business days.
            </p>
            
            <h3 className="text-lg font-semibold mt-4 mb-2">Refund Deductions</h3>
            <p>
              Please note that the following costs are non-refundable:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Shipping fees for the original delivery</li>
              <li>Return shipping costs</li>
              <li>Handling fees (if applicable)</li>
            </ul>
            
            <h3 className="text-lg font-semibold mt-4 mb-2">Defective or Damaged Products</h3>
            <p>
              If you receive a defective or damaged product, please contact our customer support team 
              within 48 hours of delivery with photos of the damage. We will arrange for a replacement 
              or full refund, including shipping costs.
            </p>
            */}
            <h2 className="text-xl font-bold underline mt-6 mb-4">Contact Us</h2>
            <p>
              If you have questions about our Cancellation and Refund Policy, please contact us at:
            </p>
            <p className="mt-2">
              <strong>Email :</strong> b3fprintingsolutions@gmail.com<br />
              <strong>Phone :</strong> 7672080881
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CancellationRefund;
