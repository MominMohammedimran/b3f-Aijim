import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Bold, Italic, Underline, Palette } from 'lucide-react';

interface TextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddText: (text: string, options?: any) => void;
}

const fontFamilies = [
  'Arial', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New', 
  'Impact', 'Comic Sans MS', 'Trebuchet MS', 'Lobster', 'Roboto', 'Lato'
];

const TextModal: React.FC<TextModalProps> = ({ isOpen, onClose, onAddText }) => {
  const [text, setText] = useState('');
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);

  const handleAddText = () => {
    if (!text.trim()) return;
    onAddText(text, {
      fontSize,
      fontFamily,
      fill: textColor,
      fontWeight: isBold ? 'bold' : 'normal',
      fontStyle: isItalic ? 'italic' : 'normal',
      underline: isUnderline,
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setText('');
    setFontSize(32);
    setFontFamily('Arial');
    setTextColor('#FFFFFF');
    setIsBold(false);
    setIsItalic(false);
    setIsUnderline(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full bg-gray-900 border-gray-800 text-white shadow-2xl rounded-2xl">
       
        
        <div className="space-y-2 p-2">
          <div className="p-6 bg-gray-800/50 rounded-lg shadow-inner">
            <p
              style={{
                fontFamily,
                fontSize: `${Math.min(fontSize, 28)}px`,
                color: textColor,
                fontWeight: isBold ? 'bold' : 'normal',
                fontStyle: isItalic ? 'italic' : 'normal',
                textDecoration: isUnderline ? 'underline' : 'none',
                textAlign: 'center',
                wordBreak: 'break-word',
                minHeight: '30px'
              }}
            >
              {text || 'Preview Text'}
            </p>
          </div>

          <div>
            <Label htmlFor="text" className="text-gray-400">Your Text</Label>
            <Input
              id="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text..."
              className=" bg-gray-800 border-gray-700 rounded-md focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <Label className="text-gray-400">Font Family</Label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full  p-2 bg-gray-800 border-gray-700 rounded-md"
            >
              {fontFamilies.map((font) => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-gray-400">Font Size: {fontSize}px</Label>
            <Slider
              value={[fontSize]}
              onValueChange={(value) => setFontSize(value[0])}
              min={12}
              max={120}
              step={1}
              className="mt-2 [&>span:first-child]:bg-indigo-500"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="text-gray-400">Text Color</Label>
              <div className="flex items-center gap-2 mt-1">
                <Input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="p-1 h-10 w-10 rounded-md cursor-pointer bg-gray-800 border-gray-700"
                />
                <Input
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="bg-gray-800 border-gray-700 rounded-md"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-400">Style</Label>
              <div className="flex gap-2 ">
                {[...Array(3)].map((_, i) => (
                  <Button
                    key={i}
                    variant={ [isBold, isItalic, isUnderline][i] ? 'secondary' : 'outline'}
                    size="icon"
                    onClick={() => {
                      if (i === 0) setIsBold(!isBold);
                      if (i === 1) setIsItalic(!isItalic);
                      if (i === 2) setIsUnderline(!isUnderline);
                    }}
                    className="border-gray-700 hover:bg-gray-800"
                  >
                    { i === 0 && <Bold className="h-4 w-4" /> }
                    { i === 1 && <Italic className="h-4 w-4" /> }
                    { i === 2 && <Underline className="h-4 w-4" /> }
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-1 gap-2">
          <Button variant="outline" onClick={onClose} className="border-gray-700 text-gray-300">Cancel</Button>
          <Button onClick={handleAddText} disabled={!text.trim()} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Add Text to Design
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TextModal;
