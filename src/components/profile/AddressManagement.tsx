import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAddresses } from '@/hooks/useAddresses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Pencil, Trash, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AddressFormData {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  phone: string;
  country: string;
  isDefault: boolean;
}

const AddressManagement = () => {
  const { currentUser } = useAuth();
  const { addresses, defaultAddress, loading, refetch, deleteAddress } = useAddresses(currentUser?.id);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<AddressFormData>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipcode: '',
    phone: '',
    country: 'India',
    isDefault: false,
  });

  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      state: '',
      zipcode: '',
      phone: '',
      country: 'India',
      isDefault: false,
    });
  };

  const handleAddNew = () => {
    resetForm();
    setEditingAddress(null);
    setShowAddForm(true);
  };

  const handleEdit = (address: any) => {
    setFormData({
      firstName: address.first_name || '',
      lastName: address.last_name || '',
      address: address.street || '',
      city: address.city || '',
      state: address.state || '',
      zipcode: address.zipcode || '',
      phone: address.phone || '',
      country: address.country || 'India',
      isDefault: address.is_default || false,
    });
    setEditingAddress(address);
    setShowAddForm(true);
  };

  const handleDelete = async (addressId: string) => {
    setDeletingId(addressId);
    try {
      const success = await deleteAddress(addressId);
      if (success) {
        refetch();
      }
    } catch (error) {
      console.error('Error deleting address:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    setSaving(true);
    try {
      if (editingAddress) {
        // Update existing address
        const { error } = await supabase
          .from('addresses')
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipcode,
            phone: formData.phone,
            country: formData.country,
            is_default: formData.isDefault,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAddress.id)
          .eq('user_id', currentUser.id);

        if (error) throw error;
        toast.success('Address updated successfully!');
      } else {
        // Create new address
        const { error } = await supabase
          .from('addresses')
          .insert({
            user_id: currentUser.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipcode,
            phone: formData.phone,
            country: formData.country,
            is_default: formData.isDefault
          });

        if (error) throw error;
        toast.success('Address saved successfully!');
      }
      
      refetch();
      setShowAddForm(false);
      setEditingAddress(null);
      resetForm();
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingAddress(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading addresses...</span>
      </div>
    );
  }

  return (
    <div className="p-2">
      {!showAddForm && (
        <Button 
          onClick={handleAddNew}
          className="mb-6 bg-primary hover:bg-primary/90"
        >
          <PlusCircle size={16} className="mr-2" />
          Add New Address
        </Button>
      )}
      
      {showAddForm ? (
        <div className="bg-muted/50 p-2 rounded-lg mb-6">
          <h3 className="font-medium mb-4">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <select
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  className="w-full p-2 border bg-muted/50 font-medium border-input rounded-md"
                  required
                >
                  <option className="bg-muted/50 font-medium"value="">Select State</option>
                  {indianStates.map(state => (
                    <option className="bg-muted/50 font-medium"key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="zipcode">ZIP Code</Label>
                <Input
                  id="zipcode"
                  value={formData.zipcode}
                  onChange={(e) => setFormData(prev => ({ ...prev, zipcode: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={formData.isDefault}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: !!checked }))}
              />
              <Label htmlFor="isDefault">Set as default address</Label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingAddress ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  editingAddress ? 'Update Address' : 'Save Address'
                )}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      ) : addresses.length > 0 ? (
        <div className="space-y-4">
          {addresses.map((address) => (
            <div 
              key={address.id}
              className={`border rounded-none p-1 transition-colors ${
                address.is_default ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">
                      {address.first_name} {address.last_name}
                    </h3>
                    {address.is_default && (
                      <span className="bg-muted/50 text-primary text-xs px-2 py-0.5 rounded-full font-medium">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{address.phone}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleEdit(address)}
                    className="text-black bg-white rounded-full hover:text-primary transition-colors p-1.5"
                    title="Edit address"
                  >
                    <Pencil className="w-4 h-4"size={16} /> 
                  </button>
                  
                  <button 
                    onClick={() => handleDelete(address.id)}
                    disabled={deletingId === address.id}
                    className="text-muted-foreground bg-red-500 rounded-full text-white hover:text-destructive transition-colors p-1.5 disabled:opacity-50"
                    title="Delete address"
                  >
                    {deletingId === address.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash className="text-white w-4 h-4" size={16} />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="mt-1 text-sm text-muted-foreground">
                <p>{address.city}- {address.zipcode}</p>
                
                <p>{address.country}</p>
              </div>
              
              <div className="mt-2">
                <p className="text-xs text-muted-foreground flex items-center">
                  <MapPin size={12} className="mr-1" />
                  Delivery Address
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <MapPin size={48} className="mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-medium text-lg mb-2">No addresses yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your first delivery address to get started with orders.
          </p>
          <Button onClick={handleAddNew} variant="outline">
            <PlusCircle size={16} className="mr-2" />
            Add First Address
          </Button>
        </div>
      )}
    </div>
  );
};

export default AddressManagement;