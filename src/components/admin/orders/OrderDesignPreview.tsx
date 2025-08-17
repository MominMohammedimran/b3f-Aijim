
import React from 'react';

interface OrderDesignPreviewProps {
  items: any[];
  orderNumber: string;
}

const OrderDesignPreview: React.FC<OrderDesignPreviewProps> = ({ items, orderNumber }) => {
  const designItems = items?.filter((item: any) => 
    item.metadata?.previewImage || 
    item.metadata?.designData || 
    item.metadata?.backImage ||
    (item.image && item.image.startsWith('data:'))
  ) || [];

  if (designItems.length === 0) {
    return <div className="p-4 text-gray-500">No design items found</div>;
  }

  return (
    <div className="p-4 bg-gray-50 rounded">
      <h3 className="font-medium mb-4">Design Previews - Order #{orderNumber}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {designItems.map((item: any, index: number) => (
          <div key={index} className="border rounded-lg p-3 bg-white">
            <h4 className="font-medium text-sm mb-2">{item.name}</h4>
            <div className="space-y-2">
              {item.metadata?.previewImage && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Preview:</p>
                  <img 
                    src={item.metadata.previewImage} 
                    alt="Design Preview"
                    className="max-w-full h-32 object-contain border rounded"
                  />
                </div>
              )}
              {item.metadata?.backImage && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Back Design:</p>
                  <img 
                    src={item.metadata.backImage} 
                    alt="Back Design"
                    className="max-w-full h-32 object-contain border rounded"
                  />
                </div>
              )}
              {item.image && item.image.startsWith('data:') && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Custom Design:</p>
                  <img 
                    src={item.image} 
                    alt="Custom Design"
                    className="max-w-full h-32 object-contain border rounded"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderDesignPreview;
