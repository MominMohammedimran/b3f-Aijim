
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from '@/lib/utils';
import OrderStatusActions from './orders/OrderStatusActions';
import OrderDesignDownload from './orders/OrderDesignDownload';
import { Trash2 } from 'lucide-react';
import { CartItem } from '@/lib/types';

interface AdminOrder {
  id: string;
  order_number: string;
  user_id?: string;
  user_email?: string;
  status: string;
  created_at: string;
  items: CartItem[];
  total: number;
  shipping_address?: {
    name?: string;
    fullName?: string;
    email?: string;
    street?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    zip_code?: string;
    country?: string;
  };
   coupon_code?:string ;
   coupon_code_discount:number;
    reward_points_used?: number;
    reward_points_used_available:number;
  reward_points_earned?: number;
  payment_method?: string;
  cancellation_reason?: string;
  delivery_fee?:number;
}

interface OrderDetailsDialogProps {
  order: AdminOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusUpdate: (orderId: string, status: string, reason?: string,
   
  ) => void;
  onDeleteOrder?: () => void;
}

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({ 
  order, 
  open, 
  onOpenChange,
  onStatusUpdate,
  onDeleteOrder
}) => {
  if (!order) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="md:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Order #{order.order_number}</span>
            {onDeleteOrder && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 "
                onClick={onDeleteOrder}
              >
                <Trash2 size={16} className="mr-1" />
                Delete Order
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            Placed on {formatDate(order.created_at)} by {order.user_email || 'Unknown User'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Order items */}
          <div className="space-y-4">
            <h3 className="font-medium">Order Items</h3>
            {order.items?.map((item, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center space-x-4">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    {item.sizes && item.sizes.length > 0 && (
                      <div className="text-sm text-gray-200">
                        {item.sizes.map((sizeItem, idx) => (
                          <div key={idx}>
                            Size: {sizeItem.size}, Qty: {sizeItem.quantity}
                          </div>
                        ))}
                      </div>
                    )}
                    {item.color && <p className="text-sm text-gray-600">Color: {item.color}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(item.price * (item.sizes?.reduce((sum, s) => sum + s.quantity, 0) || 1))}
                  </p>
                  <p className="text-sm text-gray-200">{formatCurrency(item.price)} each</p>
                </div>
              </div>
            ))}
          </div>
          <OrderDesignDownload
  orderNumber={order.order_number}
  items={
    order.items?.filter((item) =>
      /custom\s*(tshirt|t-shirt|tee|mug|cap)/i.test(item.name)
    ) || []
  }
/>


          
          
          {/* Order details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium text-red-400 underline">Payment Information</h3>
              <p className="text-sm">Status: <span className="font-medium">{order.status}</span></p>
              <p className="text-sm">Method: <span className="font-medium">{order.payment_method || 'Not specified'}</span></p>
              <p className="text-sm">Total: <span className="font-medium">{formatCurrency(order.total)}</span></p>
              {order.status === 'cancelled' && order.cancellation_reason && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm font-medium text-red-800">Cancellation Reason:</p>
                  <p className="text-sm text-red-700">{order.cancellation_reason}</p>
                </div>
              )}
              {order.status === 'admin cancelled' && order.cancellation_reason && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm font-medium text-red-800">Cancellation Reason:</p>
                  <p className="text-sm text-red-700">{order.cancellation_reason}</p>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              {order.shipping_address && (
                <>
                  <h3 className="font-medium text-yellow-400 underline">Shipping Address</h3>
                   <p className="font-medium">{order.shipping_address.fullName || order.shipping_address.name || ''}</p>
                  <p className="text-sm">{order.shipping_address.email || ''}</p>
                  <p className="text-sm">{order.shipping_address.address || order.shipping_address.street || ''}</p>
                  <p className="text-sm">{`${order.shipping_address.city || ''}, ${order.shipping_address.state || ''} ${order.shipping_address.zipCode || order.shipping_address.zip_code || ''}`}</p>
                  <p className="text-sm">{order.shipping_address.country || ''}</p>
                </>
              )}
            </div>
              <div className="space-y-1">
              {order.coupon_code && (
                <>
                  <h3 className="font-medium text-yellow-400 underline">Coupon Code used </h3>
                   <p className="font-medium">code - {order.coupon_code|| ''}</p>
                  <p className="font-medium">discount - {order.coupon_code_discount|| 0}</p>
                 
                </>
              )}
            </div>
            <div className='space-y-1'>
              {order.reward_points_used &&(
                <>
                <h3 className="font-medium text-yellow-400 underline">Reward Points used </h3>
                <p className='font-medium'> points available - {order.reward_points_used_available||0}</p>
                <p className='font-medium'>used - {order.reward_points_used||0}</p>
                </>
              )}
              </div>

          </div>
          
          {/* Status management */}
           <OrderStatusActions
          orderId={order.id}
          userId={order.user_id}
          currentStatus={order.status}
          userEmail={order.user_email}
          orderNumber={order.order_number}
          orderItems={order.items}
          totalAmount={order.total}
          shippingAddress={order.shipping_address}
          couponCode={order.coupon_code}
          couponDiscount={order.coupon_code_discount}
          rewardPointsUsed={order.reward_points_used}
          deliveryFee={order.delivery_fee}
          onStatusUpdate={onStatusUpdate}
        />


        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;