import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  sendOrderConfirmationEmail,
  sendReturnConfirmationEmail,
  sendOrderStatusEmail,
} from "@/components/admin/OrderStatusEmailService";
import { createOrderNotification } from "@/services/adminNotificationService";

interface OrderStatusActionsProps {
  orderId: string;
  userId?: string;
  currentStatus: string;
  onStatusUpdate: (orderId: string, status: string, reason?: string) => void;
  userEmail?: string;
  orderNumber?: string;
  orderItems?: any[];
  totalAmount?: number;
  shippingAddress?: any;
  couponCode?: string;
  couponDiscount?: number;
  rewardPointsUsed?: number;
  deliveryFee?: number;
}

const OrderStatusActions: React.FC<OrderStatusActionsProps> = ({
  orderId,
  userId,
  currentStatus,
  onStatusUpdate,
  userEmail,
  orderNumber,
  orderItems = [],
  totalAmount = 0,
  shippingAddress,
  couponCode,
  couponDiscount,
  rewardPointsUsed,
  deliveryFee,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [cancellationReason, setCancellationReason] = useState("");
  const [awb, setAwb] = useState("");
  const [showCourierFields, setShowCourierFields] = useState(false);
  const [showCancellationReason, setShowCancellationReason] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus);
    setShowCourierFields(newStatus === "shipped");
    setShowCancellationReason(newStatus === "cancelled");
  };

  const handleUpdateStatus = async () => {
    if (selectedStatus === currentStatus) {
      toast.info("No status change detected");
      return;
    }

    if (selectedStatus === "cancelled" && !cancellationReason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    setIsUpdating(true);
    try {
      // 🧠 Update Supabase
      const updateData: any = {
        status: selectedStatus,
        status_note: cancellationReason,
        updated_at: new Date().toISOString(),
      };

      if (selectedStatus === "shipped" && awb) {
        updateData.courier = { awb, provider: "delhivery" };
      }

      const { error } = await supabase.from("orders").update(updateData).eq("id", orderId);
      if (error) throw error;

      // ✅ Decide which email function to call
      if (userEmail && userEmail !== "N/A") {
        const emailPayload = {
          orderId: orderNumber || orderId,
          customerEmail: userEmail,
          customerName: shippingAddress?.name || shippingAddress?.fullName || "Customer",
          status: selectedStatus,
          orderItems,
          totalAmount,
          shippingAddress,
          paymentMethod: "razorpay",
          couponCode,
          couponDiscount,
          rewardPointsUsed,
          deliveryFee,
        };

        try {
          if (["processing", "confirmed", "shipped", "delivered"].includes(selectedStatus)) {
            await sendOrderStatusEmail(emailPayload);
           {/* console.log("📦 Order confirmation email sent");*/}
          } else if (
            ["return-acpt", "return-pcs", "return-pkd", "return-wh", "payment-rf", "payment-rf-ss"].includes(selectedStatus)
          ) {
            await sendReturnConfirmationEmail(emailPayload);
          {/*  console.log("🔁 Return/refund email sent");*/}
          } else {
            await sendOrderStatusEmail(emailPayload);
           {/* console.log("📧 Generic status email sent");*/}
          }
        } catch (emailErr) {
          toast.warning("Status updated but failed to send email");
        }
      }

      // 🔔 Send in-app notification
      if (userId) {
        try {
          await createOrderNotification(userId, orderNumber || orderId, selectedStatus, orderId);
        } catch (notifErr) {
          console.error("Failed to send in-app notification:", notifErr);
        }
      }

      // ✅ Update local UI
      onStatusUpdate(orderId, selectedStatus, cancellationReason);
      toast.success("✅ Order status updated successfully");
    } catch (err) {
      toast.error("Failed to update order status");
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
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="return-acpt">Return Accepted</SelectItem>
              <SelectItem value="return-pcs">Return Processing</SelectItem>
              <SelectItem value="return-pkd">Return Picked</SelectItem>
              <SelectItem value="return-wh">Returned to Warehouse</SelectItem>
              <SelectItem value="payment-rf">Payment Refund Initiated</SelectItem>
              <SelectItem value="payment-rf-ss">Payment Refund Successful</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showCourierFields && (
          <div>
            <Label htmlFor="awb">AWB Number</Label>
            <Input
              id="awb"
              value={awb}
              onChange={(e) => setAwb(e.target.value)}
              placeholder="Enter AWB number"
            />
          </div>
        )}

        {showCancellationReason && (
          <div className="md:col-span-2">
            <Label htmlFor="reason">Cancellation Reason</Label>
            <Textarea
              id="reason"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Enter reason"
            />
          </div>
        )}
      </div>

      <Button onClick={handleUpdateStatus} disabled={isUpdating}>
        {isUpdating ? "Updating..." : "Update Status"}
      </Button>
    </div>
  );
};

export default OrderStatusActions;