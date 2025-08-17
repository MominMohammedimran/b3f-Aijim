
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { sendOrderStatusUpdateEmail } from '@/services/unifiedEmailService';

interface OrderStatusActionsProps {
  orderId: string;
  currentStatus: string;
  onStatusUpdate: (orderId: string, status: string, reason?: string) => void;
  userEmail?: string;
  orderNumber?: string;
  orderItems?: any[];
  totalAmount?: number;
  shippingAddress?: any;
}

const OrderStatusActions: React.FC<OrderStatusActionsProps> = ({
  orderId,
  currentStatus,
  onStatusUpdate,
  userEmail,
  orderNumber,
  orderItems = [],
  totalAmount = 0,
  shippingAddress
}) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [cancellationReason, setCancellationReason] = useState('');
  const [showCancellationReason, setShowCancellationReason] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    setShowCancellationReason(newStatus === 'cancelled');
  };

  const handleUpdateStatus = async () => {
    if (selectedStatus === 'cancelled' && !cancellationReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    setIsUpdating(true);
    try {
      // Update order status in database
      const { error } = await supabase
        .from('orders')
        .update({
          status: selectedStatus,
          status_note:cancellationReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order status:', error);
        toast.error('Failed to update order status');
        return;
      }

      // Send email notification if user email exists
      if (userEmail && userEmail !== 'N/A') {
        try {
          const emailData = {
            orderId: orderNumber || orderId,
            customerEmail: userEmail,
            customerName: shippingAddress?.name || shippingAddress?.fullName || 'Customer',
            status: selectedStatus,
            orderItems: orderItems,
            totalAmount: totalAmount,
            shippingAddress: shippingAddress,
            paymentMethod: 'razorpay'
          };

          const emailSent = await sendOrderStatusUpdateEmail(emailData);
          if (emailSent) {
            console.log('✅ Status update email sent successfully');
          } else {
            console.warn('⚠️ Status update email failed to send');
            toast.warning('Status updated but failed to send email notification');
          }
        } catch (emailError) {
          console.error('Failed to send status update email:', emailError);
          toast.error('Status updated but failed to send email notification');
        }
      }

      // Call parent callback
      onStatusUpdate(orderId, selectedStatus, cancellationReason);
      
      setShowCancellationReason(false);
      setCancellationReason('');
      toast.success('Order status updated successfully');
      
    } catch (error) {
      console.error('Error in status update process:', error);
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Update Order Status</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={selectedStatus} onValueChange={handleStatusChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
             
              <SelectItem value="cancelled">Cancelled</SelectItem>
              {/* Return Statuses with Shorter Values */}
  <SelectItem value="return-accepted">Return Accepted</SelectItem>
  
  <SelectItem value="return-picked">Return Picked</SelectItem>
  <SelectItem value="return-warehouse">Returned to Warehouse</SelectItem>
  <SelectItem value="payment-refund">Payment Initiated</SelectItem>
  <SelectItem value="payment-refund-successfull">Payment Successful</SelectItem>

  <SelectItem value="cancelled">Cancelled</SelectItem>
            
            </SelectContent>
          </Select>
        </div>

        {showCancellationReason && (
          <div className="md:col-span-2">
            <Label htmlFor="cancellationReason">Cancellation Reason</Label>
            <Textarea
              id="cancellationReason"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Enter reason for cancellation..."
              required
            />
          </div>
        )}
      </div>

      <Button 
        onClick={handleUpdateStatus}
        disabled={
          selectedStatus === currentStatus || 
          (selectedStatus === 'cancelled' && !cancellationReason.trim()) ||
          isUpdating
        }
      >
        {isUpdating ? 'Updating...' : 'Update Status'}
      </Button>
    </div>
  );
};

export default OrderStatusActions;
