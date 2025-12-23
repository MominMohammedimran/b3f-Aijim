import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import DesignContextProviders from '@/context/DesignContextProviders';
import TextModal from '@/components/design/TextModal';
import ImageModal from '@/components/design/ImageModal';
import EmojiModal from '@/components/design/EmojiModal';
import ProductSelector from '@/components/design/ProductSelector';
import DesignCanvas from '@/components/design/DesignCanvas';
import CustomizationSidebar from '@/components/design/CustomizationSidebar';
import ShareModal from '@/components/products/ShareModal';
import DesignHeader from '@/components/design/DesignHeader';
import DesignActionButtons from '@/components/design/DesignActionButtons';
import DualSidedIndicator from '@/components/design/DualSidedIndicator';
import DesignLoading from '@/components/design/DesignLoading';
import { useDesignCanvas } from '@/hooks/useDesignCanvas';
import { validateObjectsWithinBoundary, moveObjectsIntoBoundary } from '@/components/design/BoundaryValidator';
import { useActiveProduct } from '@/context/ActiveProductContext';
import { supabase } from '@/integrations/supabase/client';

interface ProductVariant {
  size: string;
  stock: number;
}

interface DesignProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  code: string;
  variants: ProductVariant[];
}

interface ProductsMap {
  [key: string]: DesignProduct;
}

const DesignTool = () => {
  const navigate = useNavigate();
  const params = useParams();
  const { activeProduct, setActiveProduct } = useActiveProduct();
  const [productView, setProductView] = useState<string>('front');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isTextModalOpen, setIsTextModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isEmojiModalOpen, setIsEmojiModalOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isDualSided, setIsDualSided] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [products, setProducts] = useState<ProductsMap>({});
  const [productsLoading, setProductsLoading] = useState(true);
  const [sizeInventory, setSizeInventory] = useState<Record<string, Record<string, number>>>({});

  const { currentUser } = useAuth();
  const { addToCart } = useCart();

  // Fetch products directly from Supabase
  const fetchProducts = useCallback(async () => {
    try {
      setProductsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, image, code, variants, sizes, stock')
        .ilike('code', '%CUSTOM%');

      if (error) throw error;

      const productsMap: ProductsMap = {};
      const inventoryMap: Record<string, Record<string, number>> = {};

      data?.forEach((product) => {
        // Determine product key from code
        let productKey = '';
        const code = product.code?.toUpperCase() || '';
        if (code.includes('TSHIRT')) productKey = 'tshirt';
        else if (code.includes('MUG')) productKey = 'mug';
        else if (code.includes('CAP')) productKey = 'cap';
        else if (code.includes('PHOTO_FRAME')) productKey = 'photo_frame';
        else return;

        // Parse variants
        let variants: ProductVariant[] = [];
        if (Array.isArray(product.variants)) {
          variants = (product.variants as any[])
            .filter(v => v && typeof v === 'object')
            .map(v => ({
              size: String(v.size || ''),
              stock: Number(v.stock) || 0
            }));
        }

        productsMap[productKey] = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image || '/placeholder.svg',
          code: product.code,
          variants
        };

        // Build inventory map
        inventoryMap[productKey] = {};
        variants.forEach(v => {
          inventoryMap[productKey][v.size.toLowerCase()] = v.stock;
        });
      });

      setProducts(productsMap);
      setSizeInventory(inventoryMap);
    } catch (err) {
      console.error('Error fetching design products:', err);
      toast.error('Failed to load products');
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const {
    canvas,
    canvasRef,
    fabricCanvasRef,
    undoStack,
    redoStack,
    frontDesign,
    backDesign,
    designComplete,
    setCanvas,
    setUndoStack,
    setRedoStack,
    setDesignImage,
    setCanvasInitialized,
    setFrontDesign,
    setBackDesign,
    setDesignComplete,
    hasDesignElements,
    loadDesignToCanvas,
    addTextToCanvas,
    handleAddImage,
    addEmojiToCanvas,
    checkDesignStatus,
    undo,
    redo,
  } = useDesignCanvas({ activeProduct });

  useEffect(() => {
    if (params.productCode) {
      const code = params.productCode.toUpperCase();
      if (code.includes('TSHIRT')) {
        setActiveProduct('tshirt');
      } else if (code.includes('MUG')) {
        setActiveProduct('mug');
      } else if (code.includes('CAP')) {
        setActiveProduct('cap');
      } else if (code.includes('PHOTO_FRAME')) {
        setActiveProduct('photo_frame');
        setProductView('8X12inch');
      }
    }
  }, [params.productCode, setActiveProduct]);

  // Products are fetched via fetchProducts useCallback

  const handleProductChange = (productId: string) => {
    if (products[productId]) {
      setActiveProduct(productId);
      setProductView(productId === 'photo_frame' ? '8X12inch' : 'front');
      setSelectedSizes([]);
      setQuantities({});
      setIsDualSided(false);
      setFrontDesign(null);
      setBackDesign(null);
      setDesignComplete({ front: false, back: false });
    }
  };

  const getCanvasDimensions = (view: string) => {
    switch (view) {
      case '8X12inch': return { width: 300, height: 350 };
      case '12x16inch': return { width: 300, height: 320 };
      case '5x7 inch': return { width: 300, height: 320 };
      default: return { width: 300, height: 320 };
    }
  };

  const handleViewChange = (view: string) => {
    if (canvas && isDualSided && activeProduct === 'tshirt') {
      if (productView === 'front') {
        const frontDataUrl = canvas.toDataURL({ format: 'webp', quality: 0.9, multiplier: 1 });
        setFrontDesign(frontDataUrl);
        setDesignComplete(prev => ({ ...prev, front: hasDesignElements() }));
      } else if (productView === 'back') {
        const backDataUrl = canvas.toDataURL({ format: 'webp', quality: 0.9, multiplier: 1 });
        setBackDesign(backDataUrl);
        setDesignComplete(prev => ({ ...prev, back: hasDesignElements() }));
      }
    }
   
    setProductView(view);

    if (activeProduct === 'photo_frame' && canvas) {
      const dimensions = getCanvasDimensions(view);
      canvas.setWidth(dimensions.width);
      canvas.setHeight(dimensions.height);
      canvas.renderAll();
    }
   
    setTimeout(() => {
      if (view === 'front' && frontDesign && isDualSided) {
        loadDesignToCanvas(frontDesign);
      } else if (view === 'back' && backDesign && isDualSided) {
        loadDesignToCanvas(backDesign);
      }
    }, 300);
  };

  const handleDualSidedChange = (checked: boolean) => {
    setIsDualSided(checked);
   
    if (checked) {
      if (canvas && productView === 'front') {
        const frontDataUrl = canvas.toDataURL({ format: 'webp', quality: 0.9, multiplier: 1 });
        setFrontDesign(frontDataUrl);
        setDesignComplete(prev => ({ ...prev, front: hasDesignElements() }));
      }
      toast("Dual-sided printing enabled", {
        description: "Please design both front and back sides",
      });
    } else {
      setFrontDesign(null);
      setBackDesign(null);
      setDesignComplete({ front: false, back: false });
    }
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev => {
      if (prev.includes(size)) {
        const newQuantities = { ...quantities };
        delete newQuantities[size];
        setQuantities(newQuantities);
        return prev.filter(s => s !== size);
      } else {
        setQuantities(prev => ({ ...prev, [size]: 1 }));
        return [...prev, size];
      }
    });
  };

  const handleQuantityChange = (size: string, qty: number) => {
    setQuantities(prev => ({ ...prev, [size]: qty }));
  };

  const handleRemoveSelected = () => {
    if (!canvas) {
      toast.warning('Canvas not available');
      return;
    }
    const activeObject = canvas.getActiveObject();
    if (!activeObject) {
      toast.warning('No object selected');
      return;
    }
    canvas.remove(activeObject);
    canvas.renderAll();
    toast.success('Selected object removed');
  };

  const handleClearCanvas = () => {
    if (!canvas) {
      toast.warning('Canvas not available');
      return;
    }
    canvas.clear();
    canvas.backgroundColor = 'black';
    canvas.renderAll();
    toast.success('Canvas cleared');
    setTimeout(() => window.location.reload(), 1000);
  };

  const getTotalPrice = () => {
    const product = products[activeProduct];
    const basePrice = product?.price || 200;
    const totalQuantity = Object.values(quantities).reduce((sum, qty) => sum + qty, 0) || 1;
    const dualSidedCost = isDualSided ? 100 * totalQuantity : 0;
    return (basePrice * totalQuantity) + dualSidedCost;
  };

  const validateDesign = () => {
    if (!hasDesignElements()) return false;
    if (!isDualSided) return hasDesignElements();
    return designComplete.front && designComplete.back;
  };

  const validateDesignWithBoundary = () => {
    if (!canvas) return false;
    if (!hasDesignElements()) return false;
    const boundaryId = `design-boundary-${activeProduct}`;
    return validateObjectsWithinBoundary(canvas, boundaryId);
  };

  const generateDesignPreview = () => {
    if (!canvas) return null;
    try {
      return canvas.toDataURL({
        format: 'png',
        quality: 1.0,
        multiplier: activeProduct === 'photo_frame' ? 2 : 1
      });
    } catch (error) {
      console.error('Error generating design preview:', error);
      return canvas.toDataURL({ format: 'png', quality: 1.0, multiplier: 1 });
    }
  };

  const handleAddToCart = async () => {
    if (!currentUser) {
      toast.error("Sign in required", { description: "Please sign in to add items to cart" });
      navigate('/signin');
      return;
    }

    const totalQuantity = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);
    if (totalQuantity === 0 || selectedSizes.length === 0) {
      toast.error("Size and quantity required", { description: "Please select at least one size with quantity" });
      return;
    }

    if (!hasDesignElements()) {
      toast.error("Design required", { description: "Please add at least one design element before adding to cart" });
      return;
    }

    if (!validateDesign()) {
      toast.error(isDualSided ? "Incomplete design" : "Empty design", {
        description: isDualSided ? "Please add design elements to both front and back sides" : "Please add at least one design element"
      });
      return;
    }

    if (!validateDesignWithBoundary()) {
      toast.error("Design elements outside boundary!", {
        description: "Please move all elements within the dotted design area.",
        duration: 4000,
      });
      const boundaryId = `design-boundary-${activeProduct}`;
      moveObjectsIntoBoundary(canvas!, boundaryId);
      toast.info("Design elements moved into boundary");
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    try {
      if (!canvas) return;
     
      for (const size of selectedSizes) {
        if (sizeInventory[activeProduct]?.[size.toLowerCase()] <= 0) {
          toast.error("Out of stock", { description: `${products[activeProduct]?.name} in size ${size} is currently out of stock` });
          return;
        }
      }

      const canvasJSON = canvas.toJSON();
      const previewImage = generateDesignPreview();
      const totalPrice = getTotalPrice();
     
      const customProduct = {
        product_id: `custom-${activeProduct}-${Date.now()}`,
        name: `Custom ${products[activeProduct]?.name || 'Product'}${isDualSided ? ' (Dual-Sided)' : ''}${activeProduct === 'photo_frame' ? ` (${productView})` : ''}`,
        price: totalPrice,
        image: previewImage || '/placeholder.svg',
        sizes: selectedSizes.map(size => ({ size, quantity: quantities[size] || 1 })),
        metadata: {
          view: isDualSided ? 'Dual-Sided' : productView,
          backImage: isDualSided ? backDesign : null,
          designData: canvasJSON,
          previewImage: previewImage,
          selectedSizes: selectedSizes,
          frameSize: activeProduct === 'photo_frame' ? productView : null
        }
      };
     
      await addToCart(customProduct);
     
      // Inventory update handled by order processing
      
      toast.success("Added to cart", { description: `Design added to cart for ${selectedSizes.length} size${selectedSizes.length > 1 ? 's' : ''}` });
      setTimeout(() => navigate('/cart'), 1000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error("Failed to add to cart");
    }
  };

  if (productsLoading) {
    return <DesignLoading />;
  }

  return (
    <Layout>
      <DesignContextProviders>
        <div className="min-h-screen bg-black">
          <div className="container-custom px-4 py-6">
            <DesignHeader />
           
            <ProductSelector
              products={products}
              activeProduct={activeProduct}
              isDualSided={isDualSided}
              onProductSelect={handleProductChange}
            />
           
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 justify-items-center">
                <DesignCanvas
                  activeProduct={activeProduct}
                  productView={productView}
                  canvas={canvas}
                  setCanvas={setCanvas}
                  undoStack={undoStack}
                  redoStack={redoStack}
                  setUndoStack={setUndoStack}
                  setRedoStack={setRedoStack}
                  setDesignImage={setDesignImage}
                  setCanvasInitialized={setCanvasInitialized}
                  canvasRef={canvasRef}
                  fabricCanvasRef={fabricCanvasRef}
                  setDesignComplete={setDesignComplete}
                  designComplete={designComplete}
                  checkDesignStatus={checkDesignStatus}
                  undo={undo}
                  redo={redo}
                  clearCanvas={handleClearCanvas}
                />

                <DesignActionButtons
                  onRemoveSelected={handleRemoveSelected}
                  onClearCanvas={handleClearCanvas}
                  onShare={() => setShowShareModal(true)}
                />
               
                <DualSidedIndicator
                  isDualSided={isDualSided}
                  activeProduct={activeProduct}
                  productView={productView}
                  designComplete={designComplete}
                />
              </div>
             
              <div className="md:col-span-1 space-y-6">
                <CustomizationSidebar
                  activeProduct={activeProduct}
                  productView={productView}
                  onViewChange={handleViewChange}
                  selectedSizes={selectedSizes}
                  onSizeToggle={handleSizeToggle}
                  isDualSided={isDualSided}
                  onDualSidedChange={handleDualSidedChange}
                  sizeInventory={sizeInventory}
                  products={products}
                  onOpenTextModal={() => setIsTextModalOpen(true)}
                  onOpenImageModal={() => setIsImageModalOpen(true)}
                  onOpenEmojiModal={() => setIsEmojiModalOpen(true)}
                  onAddToCart={handleAddToCart}
                  validateDesign={validateDesign}
                  getTotalPrice={getTotalPrice}
                  quantity={quantity}
                  onQuantityChange={setQuantity}
                  productId={activeProduct}
                  upi_input=""
                  quantities={quantities}
                  onQuantityChangeForSize={handleQuantityChange}
                />
              </div>
            </div>
          </div>
        </div>
       
        <TextModal
          isOpen={isTextModalOpen}
          onClose={() => setIsTextModalOpen(false)}
          onAddText={addTextToCanvas}
        />
       
        <ImageModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          onAddImage={handleAddImage}
        />
       
        <EmojiModal
          isOpen={isEmojiModalOpen}
          onClose={() => setIsEmojiModalOpen(false)}
          onAddEmoji={(emoji) => {
            addEmojiToCanvas(emoji);
            setIsEmojiModalOpen(false);
          }}
        />

        <ShareModal 
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          product={products[activeProduct]}
        />
      </DesignContextProviders>
    </Layout>
  );
};

export default DesignTool;