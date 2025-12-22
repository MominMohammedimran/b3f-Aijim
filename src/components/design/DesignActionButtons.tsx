import React from 'react';
import { Trash2, RotateCcw, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DesignActionButtonsProps {
  onRemoveSelected: () => void;
  onClearCanvas: () => void;
  onShare: () => void;
}

const DesignActionButtons: React.FC<DesignActionButtonsProps> = ({
  onRemoveSelected,
  onClearCanvas,
  onShare,
}) => {
  return (
    <div className="mt-4 flex justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onRemoveSelected}
        className="flex items-center gap-2 bg-transparent text-red-400 hover:text-red-300 border-red-500/50 hover:border-red-400 hover:bg-red-500/10"
      >
        <Trash2 size={16} />
        Remove 
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={onClearCanvas}
        className="flex items-center gap-2 bg-transparent text-purple-400 hover:text-purple-300 border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10"
      >
        <RotateCcw size={16} />
        Clear 
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        onClick={onShare}
        className="hidden bg-transparent text-green-400 hover:text-green-300 border-green-500/50 hover:border-green-400 hover:bg-green-500/10"
      >
        <Share className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default DesignActionButtons;
