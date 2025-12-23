
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, RotateCcw, Share } from 'lucide-react';
import DesignCanvas from '../design/DesignCanvas';
import CanvasActionButtons from '../design/CanvasActionButtons';

interface CanvasSectionProps {
  activeProduct: string;
  productView: string;
  canvas: any;
  setCanvas: (canvas: any) => void;
  setDesignImage: (image: string | null) => void;
  setCanvasInitialized: (initialized: boolean) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  fabricCanvasRef: React.RefObject<any>;
  setDesignComplete: (complete: any) => void;
  designComplete: any;
  checkDesignStatus: () => boolean;
  undo: () => void;
  redo: () => void;
  handleClearCanvas: () => void;
  handleRemoveSelected: () => void;
  setShowShareModal: (show: boolean) => void;
  isDualSided: boolean;
  undoStack: any[];
  redoStack: any[];
  setUndoStack: (stack: any[]) => void;
  setRedoStack: (stack: any[]) => void;
}

const CanvasSection: React.FC<CanvasSectionProps> = ({
  activeProduct,
  productView,
  canvas,
  setCanvas,
  setDesignImage,
  setCanvasInitialized,
  canvasRef,
  fabricCanvasRef,
  setDesignComplete,
  designComplete,
  checkDesignStatus,
  undo,
  redo,
  handleClearCanvas,
  handleRemoveSelected,
  setShowShareModal,
  isDualSided,
  undoStack,
  redoStack,
  setUndoStack,
  setRedoStack,
}) => {
  return (
    <div className="md:col-span-2 justify-items-center">
      <DesignCanvas
        activeProduct={activeProduct}
        productView={productView}
        canvas={canvas}
        setCanvas={setCanvas}
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
        undoStack={undoStack}
        redoStack={redoStack}
        setUndoStack={setUndoStack}
        setRedoStack={setRedoStack}
      />

      <CanvasActionButtons
        onRemoveSelected={handleRemoveSelected}
        onClearCanvas={handleClearCanvas}
        onShare={() => setShowShareModal(true)}
        onUndo={undo}
        onRedo={redo}
      />

      {isDualSided && activeProduct === 'tshirt' && (
        <div className="mt-2 text-center">
          <span className="text-blue-600 font-medium">
            Currently designing: {productView === 'front' ? 'Front Side' : 'Back Side'}
            {productView === 'front' && designComplete.front && ' ✅'}
            {productView === 'back' && designComplete.back && ' ✅'}
          </span>
        </div>
      )}
    </div>
  );
};

export default CanvasSection;
