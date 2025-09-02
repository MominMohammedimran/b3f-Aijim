
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SavedAddress {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipcode: string;
  phone: string;
  is_default: boolean;
}

interface SavedAddressSelectorProps {
  onSelect: (address: SavedAddress) => void;
  selectedAddress?: SavedAddress | null;
}

const SavedAddressSelector: React.FC<SavedAddressSelectorProps> = ({ 
  onSelect, 
  selectedAddress 
}) => {
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchSavedAddresses();
  }, [currentUser]);

  const fetchSavedAddresses = async () => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('is_default', { ascending: false });

      if (error) throw error;

      // Map database addresses to SavedAddress format
      const mappedAddresses: SavedAddress[] = (data || []).map(addr => ({
        id: addr.id,
        name: `${addr.first_name} ${addr.last_name}`,
        street: addr.address,
        city: addr.city,
        state: addr.state,
        zipcode: addr.zip_code,
        phone: addr.phone,
        is_default: addr.is_default || false
      }));

      setSavedAddresses(mappedAddresses);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load saved addresses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading saved addresses...</div>;
  }

  if (savedAddresses.length === 0) {
    return <div className="p-4 text-gray-500">No saved addresses found</div>;
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium">Saved Addresses</h3>
      {savedAddresses.map((address) => (
        <Card 
          key={address.id} 
          className={`cursor-pointer transition-colors ${
            selectedAddress?.id === address.id 
              ? 'border-blue-500 bg-gray--800' 
              : 'hover:bg-gray-800 text-white'
          }`}
          onClick={() => onSelect(address)}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{address.name}</p>
                <p className="text-sm text-gray-600">{address.street}</p>
                <p className="text-sm text-gray-600">
                  {address.city}, {address.state} {address.zipcode}
                </p>
                <p className="text-sm text-gray-600">{address.phone}</p>
              </div>
              {address.is_default && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  Default
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SavedAddressSelector;
