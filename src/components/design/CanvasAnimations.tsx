import { Canvas as FabricCanvas, FabricObject, Shadow, util } from 'fabric';

export const enableSmoothMovement = (canvas: FabricCanvas) => {
  if (!canvas) return;

  // Smooth object movement with shadow
  canvas.on('object:moving', (e) => {
    if (e.target) {
      e.target.shadow = new Shadow({
        color: 'rgba(0,0,0,0.3)',
        blur: 10,
        offsetX: 3,
        offsetY: 3
      });
    }
  });

  canvas.on('object:modified', (e) => {
    if (e.target) {
      e.target.shadow = null;
      canvas.renderAll();
    }
  });
};

export const animateObjectEntry = (obj: FabricObject, canvas: FabricCanvas) => {
  if (!obj || !canvas) return;

  obj.set({
    scaleX: 0.1,
    scaleY: 0.1,
    opacity: 0
  });

  canvas.add(obj);
  canvas.setActiveObject(obj);

  // Simple fade in
  obj.set({ scaleX: 1, scaleY: 1, opacity: 1 });
  canvas.renderAll();
};

export const animateObjectExit = (obj: FabricObject, canvas: FabricCanvas, onComplete?: () => void) => {
  if (!obj || !canvas) return;

  canvas.remove(obj);
  if (onComplete) onComplete();
};
