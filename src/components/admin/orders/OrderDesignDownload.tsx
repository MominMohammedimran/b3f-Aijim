import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Eye, Printer } from 'lucide-react';
import { toast } from 'sonner';

interface OrderDesignDownloadProps {
  items: any[];
  orderNumber: string;
  shippingAddress?: any;
}

const OrderDesignDownload: React.FC<OrderDesignDownloadProps> = ({ items, orderNumber, shippingAddress }) => {
  const designItems = items.filter(item => 
    item.metadata?.previewImage || 
    item.metadata?.designData || 
    item.metadata?.backImage ||
    (item.product_id && item.product_id.includes('custom-')) ||
    item.name.toLowerCase().includes('custom') ||
    item.name.toLowerCase().includes('printed')
  );

  // Helper to render Fabric.js objects to canvas
  const renderFabricObjects = async (
    ctx: CanvasRenderingContext2D, 
    objects: any[], 
    designArea: { x: number; y: number; width: number; height: number },
    originalCanvasSize: { width: number; height: number }
  ): Promise<void> => {
    const scaleX = designArea.width / originalCanvasSize.width;
    const scaleY = designArea.height / originalCanvasSize.height;
    const scale = Math.min(scaleX, scaleY);

    for (const obj of objects) {
      try {
        // Skip background objects
        if (obj.data?.isBackground) continue;

        const left = designArea.x + (obj.left || 0) * scale;
        const top = designArea.y + (obj.top || 0) * scale;

        if (obj.type === 'text' || obj.type === 'i-text' || obj.type === 'textbox') {
          // Render text elements (including emojis as text)
          const fontSize = Math.max(12, (obj.fontSize || 24) * scale);
          const fontFamily = obj.fontFamily || 'Arial';
          const fontWeight = obj.fontWeight || 'normal';
          const fontStyle = obj.fontStyle || 'normal';
          
          ctx.save();
          ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px ${fontFamily}`;
          
          // Handle text color - ensure visibility on white background
          let fillColor = obj.fill || '#000000';
          if (fillColor.toLowerCase() === '#ffffff' || fillColor.toLowerCase() === 'white' || fillColor === 'rgb(255,255,255)') {
            fillColor = '#333333';
          }
          ctx.fillStyle = fillColor;
          
          // Handle rotation
          if (obj.angle) {
            const centerX = left + ((obj.width || 100) * scale * (obj.scaleX || 1)) / 2;
            const centerY = top + ((obj.height || 20) * scale * (obj.scaleY || 1)) / 2;
            ctx.translate(centerX, centerY);
            ctx.rotate((obj.angle * Math.PI) / 180);
            ctx.translate(-centerX, -centerY);
          }
          
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          
          // Render text with proper underline if needed
          const text = obj.text || '';
          ctx.fillText(text, left, top);
          
          if (obj.underline) {
            const textWidth = ctx.measureText(text).width;
            ctx.beginPath();
            ctx.moveTo(left, top + fontSize + 2);
            ctx.lineTo(left + textWidth, top + fontSize + 2);
            ctx.strokeStyle = fillColor;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
          
          ctx.restore();
        } else if (obj.type === 'image') {
          // Render image elements
          if (obj.src) {
            await new Promise<void>((resolve) => {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              
              img.onload = () => {
                ctx.save();
                
                const imgWidth = (obj.width || img.width) * scale * (obj.scaleX || 1);
                const imgHeight = (obj.height || img.height) * scale * (obj.scaleY || 1);
                
                // Handle rotation
                if (obj.angle) {
                  const centerX = left + imgWidth / 2;
                  const centerY = top + imgHeight / 2;
                  ctx.translate(centerX, centerY);
                  ctx.rotate((obj.angle * Math.PI) / 180);
                  ctx.translate(-centerX, -centerY);
                }
                
                ctx.drawImage(img, left, top, imgWidth, imgHeight);
                ctx.restore();
                resolve();
              };
              
              img.onerror = () => {
                console.warn('Failed to load image:', obj.src?.substring(0, 50));
                resolve();
              };
              
              img.src = obj.src;
            });
          }
        } else if (obj.type === 'circle') {
          // Render circle/emoji shapes
          ctx.save();
          ctx.beginPath();
          const radius = (obj.radius || 25) * scale;
          ctx.arc(left + radius, top + radius, radius, 0, 2 * Math.PI);
          ctx.fillStyle = obj.fill || '#FFFF00';
          ctx.fill();
          ctx.restore();
        } else if (obj.type === 'rect') {
          // Render rectangle shapes
          ctx.save();
          const width = (obj.width || 100) * scale * (obj.scaleX || 1);
          const height = (obj.height || 100) * scale * (obj.scaleY || 1);
          ctx.fillStyle = obj.fill || '#000000';
          ctx.fillRect(left, top, width, height);
          ctx.restore();
        }
      } catch (objError) {
        console.warn('Error rendering object:', objError);
      }
    }
  };

  const createPrintReadyImage = async (item: any, side: 'front' | 'back' = 'front'): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set high resolution for print quality
        canvas.width = 2400;  // 8 inches at 300 DPI
        canvas.height = 3000; // 10 inches at 300 DPI
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // ENSURE WHITE BACKGROUND
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add print guidelines
        ctx.strokeStyle = '#E5E7EB';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);
        ctx.setLineDash([]);

        // Product template area
        const templateArea = {
          x: canvas.width * 0.2,
          y: canvas.height * 0.1,
          width: canvas.width * 0.6,
          height: canvas.height * 0.65
        };

        // Draw product template based on type
        ctx.strokeStyle = '#D1D5DB';
        ctx.lineWidth = 3;
        
        const productName = item.name?.toLowerCase() || '';
        
        if (productName.includes('t-shirt') || productName.includes('tshirt')) {
          ctx.beginPath();
          ctx.moveTo(templateArea.x + templateArea.width * 0.3, templateArea.y);
          ctx.lineTo(templateArea.x + templateArea.width * 0.7, templateArea.y);
          ctx.lineTo(templateArea.x + templateArea.width * 0.85, templateArea.y + templateArea.height * 0.2);
          ctx.lineTo(templateArea.x + templateArea.width, templateArea.y + templateArea.height * 0.4);
          ctx.lineTo(templateArea.x + templateArea.width, templateArea.y + templateArea.height);
          ctx.lineTo(templateArea.x, templateArea.y + templateArea.height);
          ctx.lineTo(templateArea.x, templateArea.y + templateArea.height * 0.4);
          ctx.lineTo(templateArea.x + templateArea.width * 0.15, templateArea.y + templateArea.height * 0.2);
          ctx.closePath();
          ctx.stroke();
        } else if (productName.includes('mug')) {
          ctx.strokeRect(templateArea.x, templateArea.y + templateArea.height * 0.2, 
                        templateArea.width, templateArea.height * 0.6);
        } else if (productName.includes('cap')) {
          ctx.beginPath();
          ctx.arc(templateArea.x + templateArea.width / 2, templateArea.y + templateArea.height * 0.4, 
                 templateArea.width * 0.35, 0, Math.PI, false);
          ctx.stroke();
        } else {
          ctx.strokeRect(templateArea.x, templateArea.y, templateArea.width, templateArea.height);
        }

        // Design area boundary
        const designArea = {
          x: templateArea.x + templateArea.width * 0.1,
          y: templateArea.y + templateArea.height * 0.15,
          width: templateArea.width * 0.8,
          height: templateArea.height * 0.6
        };

        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;
        ctx.setLineDash([15, 10]);
        ctx.strokeRect(designArea.x, designArea.y, designArea.width, designArea.height);
        ctx.setLineDash([]);

        // White background for design area
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(designArea.x, designArea.y, designArea.width, designArea.height);

        // Process design data - Fabric.js format
        if (item.metadata?.designData) {
          try {
            const designData = typeof item.metadata.designData === 'string' 
              ? JSON.parse(item.metadata.designData) 
              : item.metadata.designData;
            
            // Fabric.js stores objects in the 'objects' array
            if (designData.objects && Array.isArray(designData.objects)) {
              const originalCanvasSize = {
                width: designData.width || 320,
                height: designData.height || 380
              };
              
              await renderFabricObjects(ctx, designData.objects, designArea, originalCanvasSize);
            }
          } catch (error) {
            console.warn('Error processing Fabric.js design data:', error);
          }
        }
        
        // Also draw preview image if available (as overlay or fallback)
        const imageUrl = side === 'back' ? item.metadata?.backImage : item.metadata?.previewImage;
        
        if (imageUrl) {
          await new Promise<void>((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
              // If we already rendered objects, use preview as secondary reference
              // Otherwise, use it as primary design
              const hasDesignData = item.metadata?.designData?.objects?.length > 0;
              
              if (!hasDesignData) {
                const scaleX = designArea.width / img.width;
                const scaleY = designArea.height / img.height;
                const scale = Math.min(scaleX, scaleY, 1);
                
                const drawWidth = img.width * scale;
                const drawHeight = img.height * scale;
                const drawX = designArea.x + (designArea.width - drawWidth) / 2;
                const drawY = designArea.y + (designArea.height - drawHeight) / 2;
                
                ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
              }
              resolve();
            };
            
            img.onerror = () => resolve();
            img.src = imageUrl;
          });
        }

        // Add order information
        ctx.fillStyle = '#1F2937';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Order: ${orderNumber}`, canvas.width / 2, canvas.height - 320);
        
        ctx.font = '28px Arial';
        ctx.fillText(`Product: ${item.name}`, canvas.width / 2, canvas.height - 270);
        ctx.fillText(`Side: ${side.charAt(0).toUpperCase() + side.slice(1)}`, canvas.width / 2, canvas.height - 220);
        
        if (item.sizes && item.sizes.length > 0) {
          ctx.fillText(`Sizes: ${item.sizes.map((s: any) => `${s.size}(${s.quantity})`).join(', ')}`, canvas.width / 2, canvas.height - 170);
        }

        // Add shipping address if available
        if (shippingAddress) {
          ctx.font = 'bold 24px Arial';
          ctx.textAlign = 'left';
          ctx.fillText('Shipping Address:', 100, canvas.height - 120);
          ctx.font = '20px Arial';
          let yPos = canvas.height - 90;
          
          if (shippingAddress.fullName || (shippingAddress.firstName && shippingAddress.lastName)) {
            ctx.fillText(`Name: ${shippingAddress.fullName || `${shippingAddress.firstName} ${shippingAddress.lastName}`}`, 100, yPos);
            yPos += 25;
          }
          if (shippingAddress.name) {
            ctx.fillText(`Name: ${shippingAddress.name}`, 100, yPos);
            yPos += 25;
          }
          if (shippingAddress.addressLine1 || shippingAddress.street || shippingAddress.address) {
            ctx.fillText(`Address: ${shippingAddress.addressLine1 || shippingAddress.street || shippingAddress.address}`, 100, yPos);
            yPos += 25;
          }
          if (shippingAddress.city && shippingAddress.state) {
            ctx.fillText(`${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.postalCode || shippingAddress.zipCode || shippingAddress.zip_code || ''}`, 100, yPos);
            yPos += 25;
          }
          if (shippingAddress.phone) {
            ctx.fillText(`Phone: ${shippingAddress.phone}`, 100, yPos);
          }
        }

        const dataUrl = canvas.toDataURL('image/png', 1.0);
        resolve(dataUrl);
        
      } catch (error) {
        reject(error);
      }
    });
  };

  // Download just the raw design (without template)
  const downloadRawDesign = async (item: any, side: 'front' | 'back' = 'front') => {
    try {
      const imageUrl = side === 'back' ? item.metadata?.backImage : item.metadata?.previewImage;
      
      if (imageUrl) {
        // If it's a data URL, download directly
        const link = document.createElement('a');
        link.download = `${orderNumber}-${item.name.replace(/[^a-zA-Z0-9]/g, '_')}-${side}-RAW.png`;
        link.href = imageUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Raw design image downloaded!');
      } else {
        toast.error('No raw design image available');
      }
    } catch (error) {
      console.error('Error downloading raw design:', error);
      toast.error('Failed to download raw design');
    }
  };

  const downloadDesign = async (item: any, side: 'front' | 'back' = 'front') => {
    try {
      toast.info('Generating print-ready file...', {
        description: 'Creating high-resolution template with design'
      });

      const printReadyImage = await createPrintReadyImage(item, side);
      
      const link = document.createElement('a');
      link.download = `${orderNumber}-${item.name.replace(/[^a-zA-Z0-9]/g, '_')}-${side}-PRINT.png`;
      link.href = printReadyImage;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Design downloaded!', {
        description: 'Print-ready template with design elements'
      });
    } catch (error) {
      console.error('Error creating design preview:', error);
      toast.error('Failed to create design preview');
    }
  };

  const downloadAllDesigns = async () => {
    try {
      toast.info('Generating all designs...', {
        description: 'This may take a moment'
      });

      for (let i = 0; i < designItems.length; i++) {
        const item = designItems[i];
        
        // Download print-ready version
        await downloadDesign(item, 'front');
        
        // Also download raw design
        if (item.metadata?.previewImage) {
          await new Promise(resolve => setTimeout(resolve, 500));
          await downloadRawDesign(item, 'front');
        }
        
        // Download back if dual-sided
        if (item.metadata?.backImage) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await downloadDesign(item, 'back');
          await new Promise(resolve => setTimeout(resolve, 500));
          await downloadRawDesign(item, 'back');
        }
        
        if (i < designItems.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }
      
      toast.success(`Downloaded all designs!`);
    } catch (error) {
      console.error('Error downloading all designs:', error);
      toast.error('Failed to download all files');
    }
  };

  const viewDesign = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };

  if (designItems.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-900">Custom Design Downloads</h4>
        <Button
          onClick={downloadAllDesigns}
          variant="default"
          size="sm"
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Download className="h-4 w-4 mr-2" />
          <Printer className="h-4 w-4 mr-1" />
          Download All ({designItems.length})
        </Button>
      </div>
      
      <div className="space-y-3">
        {designItems.map((item, index) => (
          <div key={index} className="border rounded-lg p-3 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-sm text-blue-900">{item.name}</p>
              <div className="flex items-center space-x-1 text-xs text-blue-600">
                {item.sizes && item.sizes.length > 0 && (
                  <span className="bg-blue-100 px-2 py-1 rounded">
                    {item.sizes.map((s: any) => `${s.size}(${s.quantity})`).join(', ')}
                  </span>
                )}
                {item.metadata?.view && <span className="bg-blue-100 px-2 py-1 rounded">{item.metadata.view}</span>}
              </div>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              {/* Print-ready download */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => downloadDesign(item, 'front')}
                className="bg-white hover:bg-blue-50 border-blue-200"
              >
                <Printer className="h-3 w-3 mr-1" />
                Print Template
              </Button>
              
              {/* Raw design download */}
              {item.metadata?.previewImage && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadRawDesign(item, 'front')}
                    className="bg-white hover:bg-green-50 border-green-200"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Raw Design
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => viewDesign(item.metadata.previewImage)}
                    className="bg-white hover:bg-purple-50 border-purple-200"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                </>
              )}
              
              {/* Back design for dual-sided */}
              {item.metadata?.backImage && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadDesign(item, 'back')}
                    className="bg-white hover:bg-orange-50 border-orange-200"
                  >
                    <Printer className="h-3 w-3 mr-1" />
                    Back Template
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadRawDesign(item, 'back')}
                    className="bg-white hover:bg-orange-50 border-orange-200"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Back Raw
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-3 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
        💡 <strong>Print Template:</strong> High-resolution with product outline, design placement, and order details. 
        <strong> Raw Design:</strong> Just the user's design as they created it.
      </div>
    </div>
  );
};

export default OrderDesignDownload;
