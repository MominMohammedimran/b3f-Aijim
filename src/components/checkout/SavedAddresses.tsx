import React, { useState } from "react";
import { Address } from "@/hooks/useAddresses";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

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
}) => {
  const [hasUserSelected, setHasUserSelected] = useState(false);
  const [showAll, setShowAll] = useState(false);

  if (!addresses || addresses.length === 0) return null;

  const handleSelect = (id: string) => {
    setHasUserSelected(true);
    onAddressSelect(id);
  };

  const visibleAddresses = showAll ? addresses : addresses.slice(0, 3);

  return (
    <div className="mb-6">
      {/* --- Saved Addresses List --- */}
      <div
        className={`space-y-3 transition-all duration-500 overflow-y-auto border border-gray-800 p-2 rounded-md ${
          showAll ? "max-h-[400px]" : "max-h-[230px]"
        } custom-scrollbar`}
      >
        <AnimatePresence>
          {visibleAddresses.map((address) => {
            const isSelected =
              hasUserSelected && selectedAddressId === address.id && !useNewAddress;

            return (
              <motion.div
                key={address.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => handleSelect(address.id)}
                className={`border p-3 rounded-none cursor-pointer transition-all duration-300 ${
                  isSelected
                    ? "border-yellow-400 text-yellow-300 shadow-lg shadow-yellow-800/20"
                    : "border-gray-700 text-white hover:border-gray-500"
                }`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-yellow-400 underline">
                          {address.first_name}
                        </span>
                        {address.is_default && (
                          <span className="text-[10px] bg-yellow-400 text-black px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>

                      {isSelected && (
                        <span className="text-[10px] bg-yellow-400 text-black px-2 py-0.5 rounded-none font-semibold tracking-wide">
                          Selected
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
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* --- Show More / Less Button --- */}
      {addresses.length > 2 && (
        <div className="flex justify-center mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAll((prev) => !prev)}
            className="text-xs font-semibold border-gray-600 text-yellow-400 hover:text-black hover:bg-yellow-400 transition-all"
          >
            {showAll ? "Show Less" : "Show More"}
          </Button>
        </div>
      )}

      {/* --- Use New Address Section --- */}
      <motion.div
        layout
        whileHover={{ scale: 1.01 }}
        onClick={() => {
          setHasUserSelected(true);
          onUseNewAddress();
        }}
        className={`border p-2 mt-3 rounded-none cursor-pointer block transition-all duration-300 ${
          useNewAddress
            ? "border-yellow-400 bg-black text-white shadow-md"
            : "border-gray-700 bg-none hover:bg-gray-900 text-white"
        }`}
      >
        <p className="text-xs font-semibold">Use a New Address</p>
        <p className="text-xs text-gray-400 mt-1">
          Add a new shipping address below
        </p>
      </motion.div>

      {/* --- Profile Info Message --- */}
      <p className="text-[11px] text-gray-400 mt-3 text-center font-medium">
        To <span className="text-yellow-400 font-semibold">edit</span> or{" "}
        <span className="text-yellow-400 font-semibold">remove</span> an address,
        visit{" "}
        <Link
          to="/profile"
          className="text-yellow-400 underline hover:text-yellow-300"
        >
          Profile
        </Link>
        .
      </p>

      {/* --- Custom Scrollbar Styling --- */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(234, 179, 8, 0.7); /* Yellow thumb */
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(234, 179, 8, 0.9);
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background-color: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
};

export default SavedAddresses;
