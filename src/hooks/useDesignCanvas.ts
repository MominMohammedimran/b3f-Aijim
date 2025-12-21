import { useState, useRef, useCallback } from 'react';
import { Canvas as FabricCanvas, FabricText, FabricImage } from 'fabric';

interface UseDesignCanvasProps {
  activeProduct: string;
}

export const useDesignCanvas = ({ activeProduct }: UseDesignCanvasProps) => {
  const [canvas, setCanvas] = useState<FabricCanvas | null>(null);
  const [designImage, setDesignImage] = useState<string | null>(null);
  const [canvasInitialized, setCanvasInitialized] = useState(false);
  const [undoStack, setUndoStack] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [frontDesign, setFrontDesign] = useState<string | null>(null);
  const [backDesign, setBackDesign] = useState<string | null>(null);
  const [designComplete, setDesignComplete] = useState({ front: false, back: false });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);

  const hasDesignElements = useCallback(() => {
    if (!canvas) return false;
    const objects = canvas.getObjects();
    return objects.some(obj => !(obj as any).data?.isBackground);
  }, [canvas]);

  const loadDesignToCanvas = useCallback((dataUrl: string) => {
    if (!canvas) return;
    
    FabricImage.fromURL(dataUrl).then((img) => {
      canvas.clear();
      canvas.add(img);
      canvas.renderAll();
    });
  }, [canvas]);

  const addTextToCanvas = useCallback((text: string, options?: any) => {
    if (!canvas) return;
    
    const fabricText = new FabricText(text, {
      left: 150,
      top: 150,
      fontSize: options?.fontSize || 24,
      fill: options?.fill || '#ffffff',
      fontFamily: options?.fontFamily || 'Arial',
      fontWeight: options?.fontWeight || 'normal',
      fontStyle: options?.fontStyle || 'normal',
      underline: options?.underline || false,
      ...options
    });
    
    canvas.add(fabricText);
    canvas.setActiveObject(fabricText);
    canvas.renderAll();
    
    // Save state for undo
    setUndoStack(prev => [...prev, JSON.stringify(canvas.toJSON())]);
  }, [canvas]);

  const handleAddImage = useCallback(async (imageUrl: string) => {
    if (!canvas) return;
    
    try {
      const img = await FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' });
      
      // Scale image to fit canvas
      const maxWidth = 200;
      const maxHeight = 200;
      const scale = Math.min(maxWidth / (img.width || 200), maxHeight / (img.height || 200));
      
      img.set({
        left: 100,
        top: 100,
        scaleX: scale,
        scaleY: scale,
      });
      
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      
      setUndoStack(prev => [...prev, JSON.stringify(canvas.toJSON())]);
    } catch (error) {
      console.error('Error adding image:', error);
    }
  }, [canvas]);

  const addEmojiToCanvas = useCallback((emoji: string) => {
    if (!canvas) return;
    
    const emojiText = new FabricText(emoji, {
      left: 150,
      top: 150,
      fontSize: 48,
    });
    
    canvas.add(emojiText);
    canvas.setActiveObject(emojiText);
    canvas.renderAll();
    
    setUndoStack(prev => [...prev, JSON.stringify(canvas.toJSON())]);
  }, [canvas]);

  const checkDesignStatus = useCallback(() => {
    return hasDesignElements();
  }, [hasDesignElements]);

  const undo = useCallback(() => {
    if (!canvas || undoStack.length === 0) return;
    
    const currentState = JSON.stringify(canvas.toJSON());
    setRedoStack(prev => [...prev, currentState]);
    
    const previousState = undoStack[undoStack.length - 1];
    setUndoStack(prev => prev.slice(0, -1));
    
    canvas.loadFromJSON(JSON.parse(previousState)).then(() => {
      canvas.renderAll();
    });
  }, [canvas, undoStack]);

  const redo = useCallback(() => {
    if (!canvas || redoStack.length === 0) return;
    
    const currentState = JSON.stringify(canvas.toJSON());
    setUndoStack(prev => [...prev, currentState]);
    
    const nextState = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    
    canvas.loadFromJSON(JSON.parse(nextState)).then(() => {
      canvas.renderAll();
    });
  }, [canvas, redoStack]);

  const clearCanvas = useCallback(() => {
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = '#000000';
    canvas.renderAll();
    setUndoStack([]);
    setRedoStack([]);
  }, [canvas]);

  return {
    canvas,
    canvasRef,
    fabricCanvasRef,
    designImage,
    canvasInitialized,
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
    clearCanvas
  };
};
