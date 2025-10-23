import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_to: string;
  active: boolean;
}

const CouponManagement = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_type: 'flat',
    discount_value: '',
    min_order_amount: '',
    max_uses: '',
    valid_from: '',
    valid_to: ''
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
     // console.error('Error loading coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoupon = async () => {
    if (!newCoupon.code || !newCoupon.discount_value || !newCoupon.valid_to) {
      toast.error('Please fill all required fields');
      return;
    }

    setAdding(true);
    try {
      const { error } = await supabase
        .from('coupons')
        .insert({
          code: newCoupon.code.toUpperCase(),
          discount_type: newCoupon.discount_type,
          discount_value: Number(newCoupon.discount_value),
          min_order_amount: Number(newCoupon.min_order_amount) || 0,
          max_uses: newCoupon.max_uses ? Number(newCoupon.max_uses) : null,
          valid_from: newCoupon.valid_from || new Date().toISOString(),
          valid_to: newCoupon.valid_to,
          active: true
        });

      if (error) throw error;

      toast.success('Coupon added successfully');
      setNewCoupon({
        code: '',
        discount_type: 'flat',
        discount_value: '',
        min_order_amount: '',
        max_uses: '',
        valid_from: '',
        valid_to: ''
      });
      loadCoupons();
    } catch (error: any) {
     // console.error('Error adding coupon:', error);
      toast.error('Failed to add coupon: ' + (error?.message || 'Unknown error'));
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete coupon ${code}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Coupon deleted successfully');
      loadCoupons();
    } catch (error: any) {
     // console.error('Error deleting coupon:', error);
      toast.error('Failed to delete coupon: ' + (error?.message || 'Unknown error'));
    }
  };

  const toggleCouponStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ active: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      loadCoupons();
    } catch (error: any) {
      //console.error('Error updating coupon status:', error);
      toast.error('Failed to update coupon status');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coupon Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Coupon Form */}
        <div className="border p-4 rounded-lg space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Plus size={16} />
            Add New Coupon
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="coupon_code">Coupon Code *</Label>
              <Input
                id="coupon_code"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="SAVE20"
              />
            </div>
            
            <div>
              <Label htmlFor="discount_type">Discount Type *</Label>
              <Select value={newCoupon.discount_type} onValueChange={(value) => setNewCoupon(prev => ({ ...prev, discount_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                  <SelectItem value="percent">Percentage (%)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="discount_value">
                Discount Value * {newCoupon.discount_type === 'flat' ? '(₹)' : '(%)'}
              </Label>
              <Input
                id="discount_value"
                type="number"
                value={newCoupon.discount_value}
                onChange={(e) => setNewCoupon(prev => ({ ...prev, discount_value: e.target.value }))}
                placeholder={newCoupon.discount_type === 'flat' ? '100' : '20'}
              />
            </div>
            
            <div>
              <Label htmlFor="min_order_amount">Minimum Order Amount (₹)</Label>
              <Input
                id="min_order_amount"
                type="number"
                value={newCoupon.min_order_amount}
                onChange={(e) => setNewCoupon(prev => ({ ...prev, min_order_amount: e.target.value }))}
                placeholder="500"
              />
            </div>
            
            <div>
              <Label htmlFor="max_uses">Max Uses (Leave empty for unlimited)</Label>
              <Input
                id="max_uses"
                type="number"
                value={newCoupon.max_uses}
                onChange={(e) => setNewCoupon(prev => ({ ...prev, max_uses: e.target.value }))}
                placeholder="100"
              />
            </div>
            
            <div>
              <Label htmlFor="valid_from">Valid From</Label>
              <Input
                id="valid_from"
                type="datetime-local"
                value={newCoupon.valid_from}
                onChange={(e) => setNewCoupon(prev => ({ ...prev, valid_from: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="valid_to">Valid Until *</Label>
              <Input
                id="valid_to"
                type="datetime-local"
                value={newCoupon.valid_to}
                onChange={(e) => setNewCoupon(prev => ({ ...prev, valid_to: e.target.value }))}
              />
            </div>
          </div>
          
          <Button onClick={handleAddCoupon} disabled={adding}>
            {adding ? 'Adding...' : 'Add Coupon'}
          </Button>
        </div>

        {/* Existing Coupons List */}
        <div>
          <h4 className="font-semibold mb-4">Existing Coupons</h4>
          
          {loading ? (
            <div className="text-center py-4">Loading coupons...</div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No coupons found</div>
          ) : (
            <div className="space-y-3">
              {coupons.map((coupon) => (
                <div key={coupon.id} className={`border p-4 rounded-lg ${!coupon.active ? 'opacity-60' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="font-semibold text-lg">{coupon.code}</div>
                        <div className="text-sm text-gray-600">
                          {coupon.discount_type === 'flat' ? `₹${coupon.discount_value}` : `${coupon.discount_value}%`} off
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <div>Min Order: ₹{coupon.min_order_amount}</div>
                        <div>
                          Uses: {coupon.current_uses}{coupon.max_uses ? `/${coupon.max_uses}` : ' (unlimited)'}
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <div>Valid Until: {new Date(coupon.valid_to).toLocaleDateString()}</div>
                        <div className={`font-semibold ${coupon.active ? 'text-green-600' : 'text-red-600'}`}>
                          {coupon.active ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant={coupon.active ? "outline" : "default"}
                        onClick={() => toggleCouponStatus(coupon.id, coupon.active)}
                      >
                        {coupon.active ? 'Deactivate' : 'Activate'}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteCoupon(coupon.id, coupon.code)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CouponManagement;
