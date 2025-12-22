import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Smile, Hand, Heart, Cat, Pizza, Plane, Lightbulb, Flag } from 'lucide-react';

interface EmojiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmoji: (emoji: string) => void;
}

const emojiCategories = {
  Smileys: { icon: Smile, emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏'] },
  Gestures: { icon: Hand, emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'] },
  Hearts: { icon: Heart, emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💖', '💗', '💓', '💞', '💕', '💟', '❣️', '💘', '💝', '💌'] },
  Animals: { icon: Cat, emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞'] },
  Food: { icon: Pizza, emojis: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🥦', '🥕', '🌽', '🌶️', '🫑', '🥒', '🧄', '🧅', '🥔', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮'] },
  Travel: { icon: Plane, emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🛵', '🏍️', '🚲', '🛴', '🚨', '🚔', '✈️', '🛩️', '🚀', '🛸', '🚁', '⛵', '🚤', '🛥️', '🛳️', '⚓', '🗼', '🏰'] },
  Objects: { icon: Lightbulb, emojis: ['⌚', '📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📺', '📻', '🎙️', '🎚️', '🎛️', '⏱️', '⏲️', '⏰', '🕰️', '💡', '🔦', '🏮'] },
  Symbols: { icon: Flag, emojis: ['❤️', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💣', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤', '🔥', '✨', '⭐', '🌟', '💫', '⚡', '☀️', '🌙', '🌈', '☁️', '❄️', '💧', '🌊', '🎵', '🎶', '🔔', '🎼'] },
};

const EmojiModal: React.FC<EmojiModalProps> = ({ isOpen, onClose, onAddEmoji }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Smileys');

  const allEmojis = useMemo(() => Object.values(emojiCategories).flatMap(cat => cat.emojis), []);

  const filteredEmojis = useMemo(() => {
    if (searchTerm) {
      return allEmojis.filter(emoji => emoji.includes(searchTerm));
    }
    return emojiCategories[selectedCategory as keyof typeof emojiCategories]?.emojis || [];
  }, [searchTerm, selectedCategory, allEmojis]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col bg-gray-900 border-gray-800 text-white shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-gray-100">Select an Emoji</DialogTitle>
        </DialogHeader>
        
        <div className="relative mt-4 hidden">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search all emojis..."
            className="pl-10 w-full bg-gray-800 border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {!searchTerm && (
          <div className="flex justify-center gap-2 border-b border-gray-800 pb-3 mt-4">
            {Object.entries(emojiCategories).map(([category, { icon: Icon }]) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'secondary' : 'ghost'}
                size="icon"
                onClick={() => setSelectedCategory(category)}
                className="rounded-full hover:bg-gray-800 data-[state=active]:bg-indigo-600"
                title={category}
              >
                <Icon className="h-5 w-5" />
              </Button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto mt-4 pr-2">
          <div className="grid grid-cols-8 gap-2">
            {filteredEmojis.map((emoji, index) => (
              <button
                key={`${emoji}-${index}`}
                onClick={() => onAddEmoji(emoji)}
                className="p-2 text-3xl rounded-lg transition-transform duration-200 transform hover:scale-125 hover:bg-gray-800/50"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} className="border-gray-700 text-gray-300">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmojiModal;
