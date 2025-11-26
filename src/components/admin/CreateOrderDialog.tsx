import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, ImageIcon } from "lucide-react";

interface CreateOrderDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: () => void;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sizes?: string[];
  color?: string;
}

const CreateOrderDialog: React.FC<CreateOrderDialogProps> = ({
  isOpen,
  onClose,
  onOrderCreated,
}) => {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [orderData, setOrderData] = useState({
    user_id: "",
    items: [] as OrderItem[],
    shipping_address: {
      name: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "India",
    },
    delivery_fee: 80,
    reward_points_earned: 0,
    payment_method: "admin_created",
    payment_status: "paid",
    status: "processing",
  });

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      fetchProducts();
    }
  }, [isOpen]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name, display_name")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      //console.error('Error fetching customers:', error);
      toast.error("Failed to load customers");
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      //console.error('Error fetching products:', error);
      toast.error("Failed to load products");
    }
  };

  const addProduct = (product: any) => {
    const newItem: OrderItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
      sizes: [],
      color: "",
    };

    setOrderData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setOrderData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const removeItem = (index: number) => {
    setOrderData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calculateTotal = () => {
    const subtotal = orderData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return subtotal + orderData.delivery_fee;
  };

  const generateOrderNumber = () => {
    return `ADM${Date.now()}${Math.floor(Math.random() * 1000)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderData.user_id || orderData.items.length === 0) {
      toast.error("Please select a customer and add at least one item");
      return;
    }

    setLoading(true);
    try {
      const orderNumber = generateOrderNumber();
      const total = calculateTotal();

      const { error } = await supabase.from("orders").insert({
        order_number: orderNumber,
        user_id: orderData.user_id,
        total,
        items: JSON.stringify(orderData.items),
        shipping_address: JSON.stringify(orderData.shipping_address),
        delivery_fee: orderData.delivery_fee || 0,
        reward_points_earned: orderData.reward_points_earned || 0,
        payment_method: orderData.payment_method || "",
        payment_status: orderData.payment_status || "",
        status: orderData.status || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success("Order created successfully");
      onOrderCreated();
      onClose();

      // Reset form
      setOrderData({
        user_id: "",
        items: [],
        shipping_address: {
          name: "",
          phone: "",
          email: "",
          address: "",
          city: "",
          state: "",
          zipCode: "",
          country: "India",
        },
        delivery_fee: 80,
        reward_points_earned: 0,
        payment_method: "admin_created",
        payment_status: "paid",
        status: "processing",
      });
    } catch (error) {
      // console.error('Error creating order:', error);
      toast.error("Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection */}
          <div>
            <Label>Select Customer</Label>
            <Select
              value={orderData.user_id}
              onValueChange={(value) =>
                setOrderData((prev) => ({ ...prev, user_id: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a customer" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.display_name ||
                      `${customer.first_name} ${customer.last_name}`}{" "}
                    - {customer.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product Selection */}
          <div>
            <Label>Add Products</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto border rounded p-2">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => addProduct(product)}
                  className="cursor-pointer p-2 border rounded hover:bg-gray-50 text-sm"
                >
                  {product.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-16 object-cover rounded mb-1"
                    />
                  )}
                  <div className="font-medium truncate">{product.name}</div>
                  <div className="text-green-600">₹{product.price}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Items */}
          {orderData.items.length > 0 && (
            <div>
              <Label>Order Items</Label>
              <div className="space-y-2">
                {orderData.items.map((item, index) => (
                  <Card key={index}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-sm text-gray-600">
                            ₹{item.price} each
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-16 text-center"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(index)}
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Shipping Address */}
          <div>
            <Label>Shipping Address</Label>
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Full Name"
                value={orderData.shipping_address.name}
                onChange={(e) =>
                  setOrderData((prev) => ({
                    ...prev,
                    shipping_address: {
                      ...prev.shipping_address,
                      name: e.target.value,
                    },
                  }))
                }
              />
              <Input
                placeholder="Phone Number"
                value={orderData.shipping_address.phone}
                onChange={(e) =>
                  setOrderData((prev) => ({
                    ...prev,
                    shipping_address: {
                      ...prev.shipping_address,
                      phone: e.target.value,
                    },
                  }))
                }
              />
              <Input
                placeholder="Email"
                value={orderData.shipping_address.email}
                onChange={(e) =>
                  setOrderData((prev) => ({
                    ...prev,
                    shipping_address: {
                      ...prev.shipping_address,
                      email: e.target.value,
                    },
                  }))
                }
              />
              <Input
                placeholder="City"
                value={orderData.shipping_address.city}
                onChange={(e) =>
                  setOrderData((prev) => ({
                    ...prev,
                    shipping_address: {
                      ...prev.shipping_address,
                      city: e.target.value,
                    },
                  }))
                }
              />
              <Input
                placeholder="State"
                value={orderData.shipping_address.state}
                onChange={(e) =>
                  setOrderData((prev) => ({
                    ...prev,
                    shipping_address: {
                      ...prev.shipping_address,
                      state: e.target.value,
                    },
                  }))
                }
              />
              <Input
                placeholder="ZIP Code"
                value={orderData.shipping_address.zipCode}
                onChange={(e) =>
                  setOrderData((prev) => ({
                    ...prev,
                    shipping_address: {
                      ...prev.shipping_address,
                      zipCode: e.target.value,
                    },
                  }))
                }
              />
              <div className="col-span-2">
                <Textarea
                  placeholder="Full Address"
                  value={orderData.shipping_address.address}
                  onChange={(e) =>
                    setOrderData((prev) => ({
                      ...prev,
                      shipping_address: {
                        ...prev.shipping_address,
                        address: e.target.value,
                      },
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Order Settings */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Delivery Fee</Label>
              <Input
                type="number"
                value={orderData.delivery_fee}
                onChange={(e) =>
                  setOrderData((prev) => ({
                    ...prev,
                    delivery_fee: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
            <div>
              <Label>Reward Points to Earn</Label>
              <Input
                type="number"
                value={orderData.reward_points_earned}
                onChange={(e) =>
                  setOrderData((prev) => ({
                    ...prev,
                    reward_points_earned: parseInt(e.target.value) || 0,
                  }))
                }
              />
            </div>
          </div>

          {/* Order Total */}
          {orderData.items.length > 0 && (
            <div className="border-t pt-4">
              <div className="text-lg font-semibold">
                Total: ₹{calculateTotal()}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || orderData.items.length === 0}
            >
              {loading ? "Creating..." : "Create Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateOrderDialog;
