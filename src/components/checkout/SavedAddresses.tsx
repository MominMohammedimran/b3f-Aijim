
import React, { useState } from 'react';
import { Address } from '@/hooks/useAddresses';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Loader2,Delete } from 'lucide-react';
import { toast } from 'sonner';

interface SavedAddressesProps {
  addresses: Address[];
  selectedAddressId: string | null;
  onAddressSelect: (addressId: string) => void;
  onUseNewAddress: () => void;
  useNewAddress: boolean;
  onDeleteAddress?: (addressId: string) => Promise<boolean>;
  onEditAddress?: (address: Address) => void;
}

const SavedAddresses: React.FC<SavedAddressesProps> = ({
  addresses,
  selectedAddressId,
  onAddressSelect,
  onUseNewAddress,
  useNewAddress,
  onDeleteAddress,
  onEditAddress,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  if (!addresses || addresses.length === 0) return null;

  const handleDelete = async (addressId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDeleteAddress) return;
    
    setDeletingId(addressId);
    const success = await onDeleteAddress(addressId);
    setDeletingId(null);
  };

  const handleEdit = (address: Address, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditAddress) {
      onEditAddress(address);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="font-medium mb-2">Select a Shipping Address</h3>

      <RadioGroup
        value={useNewAddress ? 'new' : selectedAddressId || ''}
        onValueChange={(value) => {
          if (value === 'new') {
            onUseNewAddress();
          } else {
            onAddressSelect(value);
          }
        }}
        className="space-y-3"
      >
        {addresses.map((address) => (
          <Label
            key={address.id}
            htmlFor={`address-${address.id}`}
            className={`border p-3 rounded-none cursor-pointer block hover:bg-blue-900  hover:text-yellow-500 text-white ${
              selectedAddressId === address.id && !useNewAddress ? 'border-gray-200 bg-blue-900 text-red-500' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-1">
                <RadioGroupItem value={address.id} id={`address-${address.id}`} />
                <div className="flex-1">
                  <div className="font-semibold  not-italic tracking-wider text-gray-200 line-clamp-1">
                    {address.first_name} 
                    {address.is_default && (
                      <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Default</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400  mt-1 font-semibold not-italic line-clamp-1">
                    {address.street.length>8 ? address.street.substring(0,8) +"...":address.street}
                  </div>
                    <div className="text-xs text-gray-400   font-semibold not-italic line-clamp-1">
                   {address.city} -  {address.zipcode}
                  </div>
                  <div className="text-xs text-gray-400 font-semibold not-italic">{address.phone}</div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2 ml-4">
                {onEditAddress && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleEdit(address, e)}
                    
                    className="p-2 h-8 w-8 hover:bg-red-600"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                
                {onDeleteAddress && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDelete(address.id, e)}
                    disabled={deletingId === address.id}
                    className="p-2 h-8 w-8 hover:bg-red-600 text-white hover:text-white"
                  >
                    {deletingId === address.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Delete className="h-4 w-5"/>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Label>
        ))}

        {/* New Address Option */}
        <Label
          htmlFor="address-new"
          className={`border p-3 rounded-none cursor-pointer block hover:bg-gray-600 ${
            useNewAddress ? 'border-blue-500 bg-gray-800 text-white ' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="new" id="address-new" />
            <div>
              <div className="font-medium">Use a new address</div>
              <div className="text-sm text-gray-400 mt-1">Add a new shipping address</div>
            </div>
          </div>
        </Label>
      </RadioGroup>
    </div>
  );
};

export default SavedAddresses;
