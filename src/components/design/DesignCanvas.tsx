import React, { useEffect, useRef } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import { Button } from '@/components/ui/button';
import { Undo2, Redo2 } from 'lucide-react';

interface DesignCanvasProps {
  activeProduct: string;
  productView: string;
  canvas: FabricCanvas | null;
  setCanvas: (canvas: FabricCanvas | null) => void;
  undoStack: string[];
  redoStack: string[];
  setUndoStack: React.Dispatch<React.SetStateAction<string[]>>;
  setRedoStack: React.Dispatch<React.SetStateAction<string[]>>;
  setDesignImage: (image: string | null) => void;
  setCanvasInitialized: (initialized: boolean) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  fabricCanvasRef: React.MutableRefObject<FabricCanvas | null>;
  setDesignComplete: React.Dispatch<React.SetStateAction<{ front: boolean; back: boolean }>>;
  designComplete: { front: boolean; back: boolean };
  checkDesignStatus: () => boolean;
  undo: () => void;
  redo: () => void;
  clearCanvas: () => void;
}

const DesignCanvas: React.FC<DesignCanvasProps> = ({
  activeProduct,
  productView,
  canvas,
  setCanvas,
  undoStack,
  redoStack,
  setUndoStack,
  setRedoStack,
  setDesignImage,
  setCanvasInitialized,
  canvasRef,
  fabricCanvasRef,
  setDesignComplete,
  designComplete,
  checkDesignStatus,
  undo,
  redo,
  clearCanvas
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const getCanvasDimensions = () => {
    switch (activeProduct) {
      case 'tshirt':
        return { width: 320, height: 380 };
      case 'mug':
        return { width: 280, height: 320 };
      case 'cap':
        return { width: 280, height: 200 };
      case 'photo_frame':
        if (productView === '8X12inch') return { width: 300, height: 350 };
        if (productView === '12x16inch') return { width: 300, height: 320 };
        return { width: 300, height: 280 };
      default:
        return { width: 320, height: 380 };
    }
  };

  const getProductImage = () => {
    switch (activeProduct) {
      case 'tshirt':
        return productView === 'back' 
          ? 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/product_images/print-images/tshirt-print/tshirt-back.webp'
          : 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/product_images/print-images/tshirt-print/tshirt-print.webp';
      case 'mug':
        return 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/product_images/print-images/mug-print/mug-print.webp';
      case 'cap':
        return 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/product_images/print-images/cap-print/cap-print.webp';
      case 'photo_frame':
        return 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=300';
      default:
        return '';
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    // Dispose previous canvas
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
    }

    const dimensions = getCanvasDimensions();
    const fabricCanvas = new FabricCanvas(canvasRef.current, {
      width: dimensions.width,
      height: dimensions.height,
      backgroundColor: '#1a1a2e',
      selection: true,
    });

    fabricCanvasRef.current = fabricCanvas;
    setCanvas(fabricCanvas);
    setCanvasInitialized(true);

    // Clean up on unmount
    return () => {
      fabricCanvas.dispose();
    };
  }, [activeProduct, productView]);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-lg">
      {/* Undo/Redo Controls */}
      <div className="flex justify-center gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={undo}
          disabled={undoStack.length === 0}
          className="flex items-center gap-1 bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-50"
        >
          <Undo2 size={16} />
          Undo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={redo}
          disabled={redoStack.length === 0}
          className="flex items-center gap-1 bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-50"
        >
          <Redo2 size={16} />
          Redo
        </Button>
      </div>

      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="relative flex justify-center items-center"
        style={{ minHeight: '400px' }}
      >
        {/* Product Background Image */}
        <div 
          className="absolute inset-0 flex justify-center items-center pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <img 
            src={getProductImage()} 
            alt={activeProduct}
            className="max-w-full max-h-full object-contain opacity-30"
          />
        </div>

        {/* Design Boundary */}
        <div 
          id={`design-boundary-${activeProduct}`}
          className="absolute border-2 border-dashed border-white/50 rounded-lg pointer-events-none"
          style={{
            width: getCanvasDimensions().width - 40,
            height: getCanvasDimensions().height - 40,
            zIndex: 1,
          }}
        />

        {/* Fabric Canvas */}
        <div className="relative z-10">
          <canvas ref={canvasRef} className="rounded-lg" />
        </div>
      </div>

      {/* View indicator */}
      <div className="text-center mt-4">
        <span className="text-white/70 text-sm">
          {activeProduct === 'tshirt' && `${productView === 'front' ? 'Front' : 'Back'} View`}
          {activeProduct === 'photo_frame' && `Frame Size: ${productView}`}
          {activeProduct === 'mug' && 'Mug Design Area'}
          {activeProduct === 'cap' && 'Cap Design Area'}
        </span>
      </div>
    </div>
  );
};

export default DesignCanvas;
