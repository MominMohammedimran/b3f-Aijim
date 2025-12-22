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
        return { width: 400, height: 500 };
      case 'mug':
        return { width: 400, height: 350 };
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
        ?'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/design-tool-page/tshirt-sub-images/tshirt-back.webp'
     
          : 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/design-tool-page/tshirt-sub-images/tshirt-front.webp';
           case 'mug':
        return 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/design-tool-page/mug-sub-images/mug-plain.webp';
      case 'cap':
        return 'https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/design-tool-page/cap-sub-images/cap-plain.webp';
      case 'photo_frame':
        return 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=300&h=300';
      default:
        return '';
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
    }

    const dimensions = getCanvasDimensions();
    const fabricCanvas = new FabricCanvas(canvasRef.current, {
      width: dimensions.width,
      height: dimensions.height,
      backgroundColor: 'transparent',
      selection: true,
    });

    fabricCanvasRef.current = fabricCanvas;
    setCanvas(fabricCanvas);
    setCanvasInitialized(true);

    return () => {
      fabricCanvas.dispose();
    };
  }, [activeProduct, productView]);

  const getDesignBoundaryStyle = () => {
    switch (activeProduct) {
      case 'tshirt':
        return {
          top: 210,
          left: 140,
          right: 140,
          bottom: 140,
        };
      case 'mug':
        return {
          top: 150,
          left: 120,
          right: 160,
          bottom: 110,
        };
        case 'cap':
          return {
            top: 50,
            left: 100,
            right: 100,
            bottom: 100,
          };
      default:
        return {
          top: 130,
          left: 90,
          right: 90,
          bottom: 205,
        };
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl m-2 shadow-lg">
      <div className="text-center mt-4">
        <span className="text-white/70 text-sm">
          {activeProduct === 'tshirt' && `${productView === 'front' ? 'Front' : 'Back'} View`}
          {activeProduct === 'photo_frame' && `Frame Size: ${productView}`}
          {activeProduct === 'mug' && 'Mug Design Area'}
          {activeProduct === 'cap' && 'Cap Design Area'}
        </span>
      </div>

      <div 
        ref={containerRef}
        className="relative flex justify-center items-center "
        style={{ minHeight: '100px' }}
      >
        <div 
          className="absolute inset-0 flex justify-center items-center pointer-events-none"
          style={{ zIndex: 0 }}
        >
          <img 
            src={getProductImage()} 
            alt={activeProduct}
            className="max-w-full max-h-full object-contain opacity-100"
          />
        </div>

        <div 
          id={`design-boundary-${activeProduct}`}
          className="absolute border-2 border-dashed border-gray rounded-lg pointer-events-none"
          style={{
            ...getDesignBoundaryStyle(),
            zIndex: 1,
          }}
        />

        <div className="relative z-10">
          <canvas ref={canvasRef} className="rounded-lg bg-transparent" />
        </div>
      </div>

      
      <div className="flex justify-center gap-2 mt-2  mb-2">
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
    </div>
  );
};

export default DesignCanvas;
