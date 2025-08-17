
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Order } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Package } from 'lucide-react';

interface OrdersHistoryProps {
  orders: Order[];
}

const OrdersHistory: React.FC<OrdersHistoryProps> = ({ orders }) => {
  const navigate = useNavigate();

  const handleTrackOrder = (orderNumber: string) => {
    navigate(`/track-order?orderNumber=${orderNumber}`);
  };

  const handleOrderIssue = (orderNumber: string) => {
    navigate(`/order-related-issue?orderNumber=${orderNumber}`);
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Order #{order.orderNumber || order.order_number}</CardTitle>
              <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
                {order.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Date: {new Date(order.createdAt || order.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                Total: {formatCurrency(order.total)}
              </p>
              <div className="space-y-1">
                <p className="text-sm font-medium">Items:</p>
                {order.items.map((item, index) => {
                  const totalItemQuantity = item.sizes.reduce((sum, size) => sum + size.quantity, 0);
                  return (
                    <div key={index} className="text-sm text-gray-600 ml-2">
                      {item.name} - Qty: {totalItemQuantity}
                      {item.sizes.length > 0 && (
                        <span className="ml-2">
                          ({item.sizes.map(s => `${s.size}: ${s.quantity}`).join(', ')})
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleTrackOrder(order.orderNumber || order.order_number)}
                  className="flex items-center gap-2"
                >
                  <Package className="w-4 h-4" />
                  Track Order
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleOrderIssue(order.orderNumber || order.order_number)}
                  className="flex items-center gap-2 text-orange-600 border-orange-300 hover:bg-orange-50"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Order Related Issue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OrdersHistory;
