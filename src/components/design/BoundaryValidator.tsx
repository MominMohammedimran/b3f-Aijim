import { Canvas as FabricCanvas } from 'fabric';
import { toast } from 'sonner';

export const validateObjectsWithinBoundary = (canvas: FabricCanvas, boundaryId: string): boolean => {
  if (!canvas) return false;
  
  const objects = canvas.getObjects();
  // No objects means nothing outside boundary
  if (objects.length === 0) return true;
  
  const boundaryElement = document.getElementById(boundaryId);
  if (!boundaryElement) {
    console.warn(`Boundary element with id "${boundaryId}" not found`);
    return true; // Can't validate without boundary element
  }

  const canvasElement = canvas.getElement();
  if (!canvasElement) return true;

  const boundaryRect = boundaryElement.getBoundingClientRect();
  const canvasRect = canvasElement.getBoundingClientRect();

  // Calculate boundary relative to canvas
  const boundary = {
    left: boundaryRect.left - canvasRect.left,
    top: boundaryRect.top - canvasRect.top,
    right: (boundaryRect.left - canvasRect.left) + boundaryRect.width,
    bottom: (boundaryRect.top - canvasRect.top) + boundaryRect.height
  };

  // Check each object
  for (const obj of objects) {
    // Skip background objects
    if ((obj as any).data?.isBackground) continue;
    
    const objBounds = obj.getBoundingRect();
    
    // Check if object is outside boundary (with small tolerance of 5px)
    const tolerance = 5;
    const isOutsideLeft = objBounds.left < boundary.left - tolerance;
    const isOutsideTop = objBounds.top < boundary.top - tolerance;
    const isOutsideRight = objBounds.left + objBounds.width > boundary.right + tolerance;
    const isOutsideBottom = objBounds.top + objBounds.height > boundary.bottom + tolerance;
    
    if (isOutsideLeft || isOutsideTop || isOutsideRight || isOutsideBottom) {
      return false; // At least one object is outside boundary
    }
  }
  
  return true; // All objects within boundary
};

export const showBoundaryValidationError = () => {
  toast.error('Design elements outside boundary', {
    description: 'Please move all elements within the dotted design area before proceeding.',
    duration: 5000
  });
};

export const moveObjectsIntoBoundary = (canvas: FabricCanvas, boundaryId: string): void => {
  if (!canvas) return;
  
  const boundaryElement = document.getElementById(boundaryId);
  if (!boundaryElement) return;

  const canvasElement = canvas.getElement();
  if (!canvasElement) return;

  const boundaryRect = boundaryElement.getBoundingClientRect();
  const canvasRect = canvasElement.getBoundingClientRect();

  // Calculate boundary relative to canvas
  const boundary = {
    left: boundaryRect.left - canvasRect.left,
    top: boundaryRect.top - canvasRect.top,
    right: (boundaryRect.left - canvasRect.left) + boundaryRect.width,
    bottom: (boundaryRect.top - canvasRect.top) + boundaryRect.height
  };

  const objects = canvas.getObjects();
  
  for (const obj of objects) {
    // Skip background objects
    if ((obj as any).data?.isBackground) continue;
    
    const objBounds = obj.getBoundingRect();
    let newLeft = obj.left!;
    let newTop = obj.top!;
    
    // Calculate offsets needed to move object inside boundary
    if (objBounds.left < boundary.left) {
      newLeft = obj.left! + (boundary.left - objBounds.left) + 5;
    }
    if (objBounds.left + objBounds.width > boundary.right) {
      newLeft = obj.left! - ((objBounds.left + objBounds.width) - boundary.right) - 5;
    }
    if (objBounds.top < boundary.top) {
      newTop = obj.top! + (boundary.top - objBounds.top) + 5;
    }
    if (objBounds.top + objBounds.height > boundary.bottom) {
      newTop = obj.top! - ((objBounds.top + objBounds.height) - boundary.bottom) - 5;
    }
    
    // Check if object is too large for boundary and scale down
    const maxWidth = boundary.right - boundary.left - 10;
    const maxHeight = boundary.bottom - boundary.top - 10;
    
    if (objBounds.width > maxWidth || objBounds.height > maxHeight) {
      const scaleX = maxWidth / objBounds.width;
      const scaleY = maxHeight / objBounds.height;
      const scale = Math.min(scaleX, scaleY) * 0.9; // 90% of max to have some margin
      
      obj.set({
        scaleX: obj.scaleX! * scale,
        scaleY: obj.scaleY! * scale
      });
    }
    
    obj.set({
      left: newLeft,
      top: newTop
    });
    
    obj.setCoords();
  }
  
  canvas.renderAll();
};

// Highlight boundary when validation fails
export const highlightBoundary = (boundaryId: string, highlight: boolean): void => {
  const boundaryElement = document.getElementById(boundaryId);
  if (!boundaryElement) return;
  
  if (highlight) {
    boundaryElement.classList.add('border-red-500', 'animate-pulse');
    boundaryElement.classList.remove('border-gray');
    
    // Remove highlight after 3 seconds
    setTimeout(() => {
      boundaryElement.classList.remove('border-red-500', 'animate-pulse');
      boundaryElement.classList.add('border-gray');
    }, 3000);
  } else {
    boundaryElement.classList.remove('border-red-500', 'animate-pulse');
    boundaryElement.classList.add('border-gray');
  }
};
