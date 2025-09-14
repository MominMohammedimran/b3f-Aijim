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
import{SavedAddress} from '@/components/checkout/SavedAddresses'
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
  onAddressSaved?: () => void;
  editingAddress?: any;
  onAddressUpdated?: (address: any) => void;
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
    
    // Check if pincode is serviceable before proceeding
    if (!pincodeValidation?.isServiceable) {
      toast.error('Please enter a serviceable PIN code before saving address');
      return;
    }
    
    setSaving(true);
    try {
      // If editing an existing address, update it
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
          street: formData.address,
          city: formData.city,
          state: formData.state,
          zipcode: formData.zipCode,
          country: formData.country,
        });
      } else if (formData.saveAddress && currentUser) {
        // Save new address if checkbox is checked
        const { error } = await supabase
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
          });

        if (error) throw error;
        toast.success('Address saved successfully!');
        onAddressSaved?.();
        setSaving(false);
        window.location.reload();


      } else {
        // Just notify that form is complete if not saving
        onAddressSaved?.();
        setSaving(false);

      }
      setSaving(false);
     
    } catch (error: any) {
      console.error('Error saving/updating address:', error);
      toast.error(editingAddress ? 'Failed to update address' : 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName" className="text-sm font-semibold">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="First Name"
            required
            className="font-semibold text-gray-100"
          />
        </div>
        <div>
          <Label htmlFor="lastName" className="text-sm font-semibold">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            placeholder="Last Name"
            required
            className="font-semibold text-gray-100"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="phone" className="text-sm font-semibold">Phone *</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="10-digit Mobile Number"
          pattern="[0-9]{10}"
          maxLength={10}
          required
          className="font-semibold text-gray-100"
        />
        <p className="text-[11px] lowercase font-semibold text-yellow-400 tracking-[1px] mt-1 leading-snug">
          Enter a valid <span className=" font-semibold tracking-[1px] text-white">10-digit mobile number</span> to receive OTP & Calls for verification and delivery updates.
        </p>
      </div>

      <div>
        <Label htmlFor="address" className="text-sm font-semibold">Address *</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Full Address"
          minLength={10}
          required
          className="font-semibold text-gray-100"
        />
        <p className="text-[11px] tracking-[1px] lowercase font-semibold text-yellow-400 mt-1 leading-snug">
          Please enter a correct and complete address to ensure smooth and timely delivery.
        </p>
      </div>

      <div>
        <Label htmlFor="city" className="text-sm font-semibold">City *</Label>
        <Input
          id="city"
          value={formData.city}
          onChange={(e) => handleChange('city', e.target.value)}
          placeholder="City"
          required
          className="font-semibold text-gray-100 "
        />
      </div>

      <div>
        <Label htmlFor="state" className="text-sm font-bold">State *</Label>
        <Select value={formData.state} onValueChange={(value) => handleChange('state', value)}>
          <SelectTrigger className=" text-sm font-bold  text-gray-100">
            <SelectValue placeholder="-- Select State --" />
          </SelectTrigger>
          <SelectContent>
            {indianStates.map((state) => (
              <SelectItem className="font-bold"key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="zipCode" className="text-sm font-semibold">PIN Code *</Label>
        <Input
          id="zipCode"
          value={formData.zipCode}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '');
            handleChange('zipCode', value);
            if (value.length === 6) {
              checkPincodeServiceability(value);
            } else {
              setPincodeValidation(null);
            }
          }}
          placeholder="6-digit PIN Code"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          className="font-semibold text-gray-100"
        />
        {checkingPincode && (
          <p className="text-[11px] font-semibold text-blue-400 mt-1">Checking serviceability...</p>
        )}
        {pincodeValidation && (
          <p className={`text-[11px] font-semibold mt-1 ${pincodeValidation.isServiceable ? 'text-green-400' : 'text-red-400'}`}>
            {pincodeValidation.message}
          </p>
        )}
        {!pincodeValidation && !checkingPincode && (
          <p className="text-[11px] lowercase tracking-[1px] font-semibold text-yellow-400 mt-1">Enter a valid 6-digit Indian PIN code</p>
        )}
      </div>

      <div>
        <Label htmlFor="country" className="text-sm font-semibold">Country</Label>
        <Input
          id="country"
          value="India"
          readOnly
          className="font-semibold bg-gray-100 text-gray-800"
        />
        <p className="text-[11px] lowercase font-semibold text-yellow-400 mt-1 leading-snug">
          Currently deliver available <span className="font-semibold text-white">India</span> only
        </p>
      </div>

      {currentUser && !editingAddress && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="saveAddress"
            checked={formData.saveAddress}
            onCheckedChange={(checked) => handleChange('saveAddress', checked as boolean)}
          />
          <Label htmlFor="saveAddress" className="text-sm font-semibold text-yellow-400">
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