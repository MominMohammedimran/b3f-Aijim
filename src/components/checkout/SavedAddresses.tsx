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
  onDeleteAddress?: (addressId: string) => void;
}

const SavedAddresses: React.FC<SavedAddressesProps> = ({
  addresses,
  selectedAddressId,
  onAddressSelect,
  onUseNewAddress,
  useNewAddress,
  onEditAddress,
  onDeleteAddress,
}) => {
  const [showAll, setShowAll] = useState(false);

  if (!addresses || addresses.length === 0) return null;

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
            const isSelected = selectedAddressId === address.id && !useNewAddress;

            return (
              <motion.div
                key={address.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                whileHover={{ scale: 1.01 }}
                onClick={() => onAddressSelect(address.id)}
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

                    <p className="text-xs text-gray-300 font-medium">{address.street}</p>
                    <p className="text-xs text-gray-400 font-medium">
                      {address.city}, {address.state} - {address.zipcode}
                    </p>
                    <p className="text-xs text-gray-400 font-medium">Phone no - {address.phone}</p>
                  </div>

                  {/* optional edit / delete small actions */}
                  <div className="hidden md:flex md:flex-col md:items-end md:gap-2">
                    {onEditAddress && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditAddress(address);
                        }}
                        className="text-xs text-gray-300 underline"
                      >
                        Edit
                      </button>
                    )}
                    {onDeleteAddress && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteAddress(address.id);
                        }}
                        className="text-xs text-red-400 underline"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
 <p className="text-[11px] text-yellow-400 mt-2 text-center font-medium">
          Please click on any one address to proceed — after selection you'll see the Order Summary.
        </p>
      {/* --- Show More / Less Button --- */}
      {addresses.length > 3 && (
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

      {/* --- Instruction Text: Please click to select address --- */}
       
       
      

      {/* --- Use New Address Section --- */}
     <motion.div
  layout
  whileHover={{ scale: 1.01 }}
  onClick={() => {
    onUseNewAddress();
    window.scrollBy({ top: 250, behavior: 'smooth' }); // scroll 20px down
  }}
  className={`border p-2 mt-3 rounded-none cursor-pointer block transition-all duration-300 ${
    useNewAddress
      ? "border-yellow-400 bg-black text-white shadow-md"
      : "border-gray-700 bg-none hover:bg-gray-900 text-white"
  }`}
>
  <p className="text-xs font-semibold">Use a New Address</p>
  <p className="text-xs text-gray-400 mt-1">Add a new shipping address below</p>
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
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(234, 179, 8, 0.7);
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
