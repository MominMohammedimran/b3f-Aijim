import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Copy, X, MessageCircle, Send } from "lucide-react";
import { Product } from "@/lib/types";
import { toast } from "sonner";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Pick<Product, 'name' | 'price' | 'image'> & Partial<Product>;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, product }) => {
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("🔗 Link copied successfully!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=🔥 Check this out on AIJIM:\n${product.name}\n👉 ${window.location.href}`;
    window.open(url, "_blank");
  };

  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(
      window.location.href
    )}&text=🔥 Check this out on AIJIM: ${product.name}`;
    window.open(url, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="
          w-[95vw] max-w-[480px] sm:max-w-[520px] md:max-w-[600px]
          mx-auto h-auto max-h-[90vh] overflow-y-auto 
          bg-gradient-to-b from-[#0a0a0a] via-[#111] to-[#0a0a0a]
          border border-gray-800/70 rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.07)]
          backdrop-blur-lg text-white p-5 sm:p-6 md:p-8
          transition-all duration-300
        "
        aria-describedby="share-product-description"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 transition-colors"
        >
          
        </button>

        <DialogHeader className="text-center">
          <DialogTitle className="text-xl md:text-2xl font-semibold text-white flex justify-center items-center gap-2">
            <Share2 className="w-5 h-5 text-yellow-400" />
            Share Product
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-sm mt-1 text-center">
            Share this item with your friends or copy the product link below.
          </DialogDescription>
        </DialogHeader>

        {/* Product Preview */}
        <div className="flex flex-col items-center mt-6 md:mt-8">
          <div className="relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 object-contain rounded-lg  p-2 "
            />
          </div>
          <div className="mt-3 text-base sm:text-lg font-medium text-gray-100 text-center px-4 leading-snug">
            {product.name}
          </div>
          
        </div>

        {/* Share Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 justify-center items-center mt-8 w-full">
          <Button
            onClick={handleWhatsAppShare}
            className="flex items-center justify-center gap-2 py-3 sm:py-2 text-sm sm:text-xs font-semibold rounded-lg 
              bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-500 
              text-white"
          >
            <MessageCircle className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            WhatsApp
          </Button>

          

          <Button
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-2 py-3 sm:py-2 text-sm sm:text-xs font-semibold rounded-lg 
              bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 
              text-white "
          >
            <Copy className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
            Copy Link
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center text-[11px] sm:text-xs font-semibold text-gray-500 ">
          ✨ Powered by <span className="text-yellow-400">AIJIM</span> — share your style effortlessly.
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
