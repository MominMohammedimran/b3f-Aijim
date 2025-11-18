import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { validatePincode } from '@/utils/pincodeService';

interface AddressFormData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  saveAddress: boolean;
}

interface AddressFormProps {
  formData: AddressFormData;
  setFormData: React.Dispatch<React.SetStateAction<AddressFormData>>;
  onSubmit: (values: AddressFormData) => void;
  isLoading: boolean;
  onAddressSaved?: (newAddress?: any) => void; // Returns newly saved address
  editingAddress?: any;
  onAddressUpdated?: (address: any) => void;
  refetchAddresses?: () => void;
}

// List of Indian states
const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman & Nicobar Islands', 'Chandigarh', 'Dadra & Nagar Haveli', 'Delhi',
  'Jammu & Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const AddressForm: React.FC<AddressFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  isLoading,
  onAddressSaved,
  editingAddress,
  onAddressUpdated,
  refetchAddresses,
}) => {
  const { currentUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [pincodeValidation, setPincodeValidation] = useState<{isServiceable: boolean; message: string} | null>(null);
  const [checkingPincode, setCheckingPincode] = useState(false);

  const handleChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const checkPincodeServiceability = async (zipCode: string) => {
    if (zipCode.length === 6) {
      setCheckingPincode(true);
      const result = await validatePincode(zipCode);
      setPincodeValidation(result);
      setCheckingPincode(false);
    } else {
      setPincodeValidation(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pincodeValidation?.isServiceable) {
      toast.error('Please enter a serviceable PIN code before saving address');
      return;
    }

    setSaving(true);

    try {
      // Update existing address
      if (editingAddress && currentUser) {
        const { error } = await supabase
          .from('addresses')
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipCode,
            country: formData.country,
          })
          .eq('id', editingAddress.id);

        if (error) throw error;

        toast.success('Address updated successfully!');
        onAddressUpdated?.({
          ...editingAddress,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          country: formData.country,
        });
      } 
      // Save new address
      else if (formData.saveAddress && currentUser) {
        const { data: insertedData, error } = await supabase
          .from('addresses')
          .insert({
            user_id: currentUser.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipCode,
            country: formData.country,
            is_default: false
          })
          .select()
          .single();

        if (error) throw error;

        toast.success('Address saved successfully!');
        onAddressSaved?.(insertedData); // Return new address
        refetchAddresses?.();
      } 
      // If not saving, just notify parent
      else {
        onAddressSaved?.();
      }
    } catch (error: any) {
      toast.error(editingAddress ? 'Failed to update address' : 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName" className="text-xs font-semibold">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="First Name"
            required
            className="font-semibold text-xs text-gray-100"
          />
        </div>
        <div>
          <Label htmlFor="lastName" className="text-xs font-semibold">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            placeholder="Last Name"
            required
            className="font-semibold text-xs text-gray-100"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="phone" className="text-xs font-semibold">Phone *</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="10-digit Mobile Number"
          pattern="[0-9]{10}"
          maxLength={10}
          required
          className="font-semibold text-xs text-gray-100"
        />
        <p className="text-[9px] lowercase font-semibold text-yellow-400 tracking-[1px] mt-1 leading-snug">
          Enter a valid <span className="font-semibold tracking-[1px] text-white">10-digit mobile number</span> to receive OTP & Calls for verification and delivery updates.
        </p>
      </div>

      <div>
        <Label htmlFor="address" className="text-xs font-semibold">Address *</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Full Address"
          minLength={10}
          required
          className="font-semibold text-xs text-gray-100"
        />
      </div>

      <div>
        <Label htmlFor="city" className="text-xs font-semibold">City *</Label>
        <Input
          id="city"
          value={formData.city}
          onChange={(e) => handleChange('city', e.target.value)}
          placeholder="City"
          required
          className="font-semibold text-xs text-gray-100"
        />
      </div>

      <div>
        <Label htmlFor="state" className="text-xs font-semibold">State *</Label>
        <Select value={formData.state} onValueChange={(value) => handleChange('state', value)}>
          <SelectTrigger className="text-xs font-semibold text-gray-100">
            <SelectValue placeholder="-- Select State --" />
          </SelectTrigger>
          <SelectContent>
            {indianStates.map((state) => (
              <SelectItem className="font-semibold text-xs" key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="zipCode" className="text-xs font-semibold">PIN Code *</Label>
        <Input
          id="zipCode"
          value={formData.zipCode}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '');
            handleChange('zipCode', value);
            if (value.length === 6) checkPincodeServiceability(value);
            else setPincodeValidation(null);
          }}
          placeholder="6-digit PIN Code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          className="font-semibold text-xs text-gray-100"
        />
        {checkingPincode && <p className="text-[9px] font-semibold text-yellow-400 mt-1">Checking serviceability...</p>}
        {pincodeValidation && <p className={`text-[11px] font-semibold mt-1 ${pincodeValidation.isServiceable ? 'text-green-400' : 'text-red-400'}`}>{pincodeValidation.message}</p>}
      </div>

      <div>
        <Label htmlFor="country" className="text-xs font-semibold">Country</Label>
        <Input
          id="country"
          value="India"
          readOnly
          className="font-semibold bg-gray-100 text-gray-800"
        />
      </div>

      {currentUser && !editingAddress && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="saveAddress"
            checked={formData.saveAddress}
            onCheckedChange={(checked) => handleChange('saveAddress', checked as boolean)}
          />
          <Label htmlFor="saveAddress" className="text-xs font-semibold text-yellow-400">
            Save this address for future use
          </Label>
        </div>
      )}

      <Button 
        type="submit" 
        disabled={isLoading || saving} 
        className="w-full font-bold rounded-none text-lg"
      >
        {isLoading || saving ? 'Saving...' : editingAddress ? 'Update Address' : 'Save Address'}
      </Button>
    </form>
  );
};

export default AddressForm;
