
import { Button } from '@/components/ui/button';
import { Trash2, RotateCcw, Share, Undo, Redo } from 'lucide-react';

interface CanvasActionButtonsProps {
  onRemoveSelected: () => void;
  onClearCanvas: () => void;
  onShare: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

const CanvasActionButtons: React.FC<CanvasActionButtonsProps> = ({
  onRemoveSelected,
  onClearCanvas,
  onShare,
  onUndo,
  onRedo,
}) => {
  return (
    <div className="mt-4 flex justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onRemoveSelected}
        className="flex items-center gap-2 text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
      >
        <Trash2 size={16} />
        Remove Selected
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onClearCanvas}
        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 border-purple-300 hover:border-purple-400"
      >
        <RotateCcw size={16} />
        Clear Canvas
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={onUndo}
        className="flex items-center text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400"
      >
        <Undo size={16} />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={onRedo}
        className="flex items-center text-blue-600 hover:text-blue-700 border-blue-300 hover:border-blue-400"
      >
        <Redo size={16} />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={onShare}
        className="hidden flex items-center text-green-600 hover:text-green-700 border-black-300 hover:border-black-400"
      >
        <Share className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CanvasActionButtons;
