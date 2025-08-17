
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import Layout from '../components/layout/Layout';
import PaymentRetry from '../components/payment/PaymentRetry';

const PaymentRetryPage = () => {
  const { productId } = useParams();
  console.log(productId)
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!productId) {
        toast.error('No order code provided');
        navigate('/orders');
        return;
      }

      try {
        console.log('Fetching order:', productId);
        
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('order_number', productId)
          .single();

        if (error) {
          console.error('Supabase error:', error);
          throw error;
        }

        console.log('Order data fetched:', data);

        if (data.payment_status === 'paid') {
          toast.info('Payment already completed for this order');
          navigate('/orders');
          return;
        }

        setOrder(data);
      } catch (error: any) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [productId, navigate]);

  const handlePaymentSuccess = async () => {
    try {
      // Update order status to paid
      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: 'paid',
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('order_number', productId);

      if (error) {
        console.error('Error updating order status:', error);
      }

      toast.success('Payment completed successfully!');
      navigate('/order-complete');
    } catch (error) {
      console.error('Error in payment success handler:', error);
      toast.success('Payment completed successfully!');
      navigate('/order-complete');
    }
  };

  const handlePaymentFailure = () => {
    console.log('Payment failed for retry');
    toast.error('Payment failed. Please try again.');
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="text-lg">Loading order details...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or has been completed.</p>
            <button 
              onClick={() => navigate('/orders')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              View Orders
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-black pt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Retry Payment</h1>
            <p className="text-gray-40 text-xl font-bold">Order #{order.order_number}</p>
          </div>
          
          <div className="flex justify-center">
            <PaymentRetry
              orderId={order.id}
              amount={order.total}
              orderNumber={order.order_number}
              data={order}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentRetryPage;
