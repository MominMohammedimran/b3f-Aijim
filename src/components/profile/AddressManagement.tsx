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
  const { addresses, loading, refetch, deleteAddress } = useAddresses(currentUser?.id);
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
    'Andhra Pradesh', 'Assam', 'Bihar', 'Goa', 'Gujarat', 'Haryana', 'Karnataka', 'Kerala',
    'Maharashtra', 'Madhya Pradesh', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana',
    'Uttar Pradesh', 'West Bengal'
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
      address: address.address || '',
      city: address.city || '',
      state: address.state || '',
      zipcode: address.zip_code || '',
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
      if (success) refetch();
    } catch (error) {
      console.error(error);
      toast.error('Error deleting address');
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
          })
          .eq('id', editingAddress.id)
          .eq('user_id', currentUser.id);

        if (error) throw error;
        toast.success('Address updated successfully!');
      } else {
        const { error } = await supabase.from('addresses').insert({
          user_id: currentUser.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipcode,
          phone: formData.phone,
          country: formData.country,
          is_default: formData.isDefault,
        });
        if (error) throw error;
        toast.success('Address saved successfully!');
      }

      refetch();
      setShowAddForm(false);
      setEditingAddress(null);
      resetForm();
    } catch (error) {
      toast.error('Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-10 text-yellow-400">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        Loading addresses...
      </div>
    );

  return (
    <div className="text-white p-1 rounded-none">
      {!showAddForm && (
        <Button
          onClick={handleAddNew}
          className="mb-6 bg-white  hover:bg-white hover:text-yellow-400  text-black rounded-none"
        >
          <PlusCircle size={16} className="mr-2" />
          Add New Address
        </Button>
      )}

      {showAddForm ? (
        <form onSubmit={handleSubmit} className="space-y-4 bg-neutral-900 border border-yellow-500/30 p-4 rounded-none">
          <h3 className="font-semibold text-yellow-400 text-lg uppercase mb-3">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))}
                className="bg-black border border-yellow-500/30 text-white"
                required
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))}
                className="bg-black border border-yellow-500/30 text-white"
                required
              />
            </div>
          </div>

          <div>
            <Label>Phone</Label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
              className="bg-black border border-yellow-500/30 text-white"
              required
            />
          </div>

          <div>
            <Label>Address</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
              className="bg-black border border-yellow-500/30 text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>City</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                className="bg-black border border-yellow-500/30 text-white"
                required
              />
            </div>
            <div>
              <Label>State</Label>
              <select
                value={formData.state}
                onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))}
                className="w-full bg-black border border-yellow-500/30 text-white rounded-none py-2"
                required
              >
                <option value="">Select State</option>
                {indianStates.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>ZIP</Label>
              <Input
                value={formData.zipcode}
                onChange={(e) => setFormData((p) => ({ ...p, zipcode: e.target.value }))}
                className="bg-black border border-yellow-500/30 text-white"
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isDefault"
              checked={formData.isDefault}
              onCheckedChange={(checked) =>
                setFormData((p) => ({ ...p, isDefault: !!checked }))
              }
            />
            <Label htmlFor="isDefault" className="text-yellow-400">
              Set as default
            </Label>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-400 text-black rounded-none"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  Saving...
                </>
              ) : (
                'Save Address'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddForm(false)}
              className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/20 rounded-none"
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : addresses.length > 0 ? (
        <div className="grid gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`p-3 border border-gray-200 bg-none hover:border-yellow-400 transition-all duration-300`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-yellow-400 uppercase">
                    {address.first_name} {address.last_name}
                  </h3>
                  <p className="text-sm text-gray-400">{address.phone}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {address.address}, {address.city}, {address.state} - {address.zip_code}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <MapPin className="w-3 h-3 mr-1 " />
                    {address.country}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="p-2 bg-yellow-500 text-black hover:bg-yellow-400 transition rounded-none"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    disabled={deletingId === address.id}
                    className="p-2 bg-red-600 hover:bg-red-500 transition rounded-none"
                  >
                    {deletingId === address.id ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Trash size={15} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border border-yellow-500/30 bg-neutral-900">
          <MapPin size={48} className="mx-auto text-yellow-400 mb-3" />
          <h3 className="text-yellow-400 font-semibold text-lg mb-2">No addresses yet</h3>
          <p className="text-gray-400 mb-4">Add your first delivery address</p>
          <Button
            onClick={handleAddNew}
            className="bg-yellow-500 hover:bg-yellow-400 text-black rounded-none"
          >
            <PlusCircle size={16} className="mr-2" /> Add Address
          </Button>
        </div>
      )}
    </div>
  );
};

export default AddressManagement;
