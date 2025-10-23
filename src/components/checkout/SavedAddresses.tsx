import React, { useState } from "react";
import { Address } from "@/hooks/useAddresses";
import { Button } from "@/components/ui/button";
import { Edit /*, Trash2, Loader2*/ } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface SavedAddressesProps {
  addresses: Address[];
  selectedAddressId: string | null;
  onAddressSelect: (addressId: string) => void;
  onUseNewAddress: () => void;
  useNewAddress: boolean;
  onEditAddress?: (address: Address) => void;
}

const SavedAddresses: React.FC<SavedAddressesProps> = ({
  addresses,
  selectedAddressId,
  onAddressSelect,
  onUseNewAddress,
  useNewAddress,
  onEditAddress,
}) => {
  const [hasUserSelected, setHasUserSelected] = useState(false);

  if (!addresses || addresses.length === 0) return null;

  const handleSelect = (id: string) => {
    setHasUserSelected(true);
    onAddressSelect(id);
  };

  const handleEdit = (address: Address, e: React.MouseEvent) => {
    e.stopPropagation();
    onEditAddress?.(address);
  };

  return (
    <div className="mb-6">
      <h3 className="font-semibold text-sm mb-4 text-white uppercase tracking-wide">
        Shipping Address
      </h3>

      {/* --- Saved Addresses List --- */}
      <div className="space-y-3">
        {addresses.map((address) => {
          const isSelected =
            hasUserSelected && selectedAddressId === address.id && !useNewAddress;

          return (
            <motion.div
              key={address.id}
              layout
              onClick={() => handleSelect(address.id)}
              whileHover={{ scale: 1.01 }}
              className={`border p-4 rounded-none cursor-pointer transition-all duration-300 ${
                isSelected
                  ? "border-yellow-400 bg-gray-900 text-yellow-300 shadow-lg shadow-yellow-800/20"
                  : "border-gray-700 bg-black hover:bg-gray-900 text-white"
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                {/* --- Left: Address Info (Now Full Display) --- */}
                <div className="flex-1">
                  <div className="font-semibold text-sm text-yellow-400 underline flex items-center gap-2 mb-1">
                    {address.first_name}
                    {address.is_default && (
                      <span className="text-[10px] bg-yellow-400 text-black px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-300 font-medium">
                    {address.street}
                  </p>
                  <p className="text-xs text-gray-400 font-medium">
                    {address.city}, {address.state} - {address.zipcode}
                  </p>
                  <p className="text-xs text-gray-400 font-medium">
                    Phone no - {address.phone}
                  </p>
                </div>

                {/* --- Right: Action Buttons (Commented Out for Now) --- */}
                {/*
                <div className="flex items-center gap-2 ml-3">
                  {onEditAddress && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEdit(address, e)}
                      className="p-2 h-8 w-8 rounded-full bg-white text-black hover:bg-yellow-400 hover:text-black transition-all"
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
                      className="p-2 h-8 w-8 rounded-full bg-red-600 text-white hover:bg-red-700 transition-all"
                    >
                      {deletingId === address.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
                */}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* --- Use New Address Section --- */}
      <motion.div
        layout
        whileHover={{ scale: 1.01 }}
        onClick={() => {
          setHasUserSelected(true);
          onUseNewAddress();
        }}
        className={`border p-2 mt-2 rounded-none cursor-pointer block transition-all duration-300 ${
          useNewAddress
            ? "border-yellow-400 bg-gray-900 text-white shadow-md"
            : "border-gray-700 bg-black hover:bg-gray-900 text-white"
        }`}
      >
        <p className="text-xs font-semibold">Use a New Address</p>
        <p className="text-xs text-gray-400 mt-1">
          Add a new shipping address below
        </p>
      </motion.div>

      {/* --- New Address Form Animation --- */}
     
    </div>
  );
};

export default SavedAddresses;
