import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallAppButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Check if already installed
    const installed = localStorage.getItem('isInstalled') === 'true';
    setIsInstalled(installed);

    // Check if running as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone || installed) {
      setIsInstalled(true);
      localStorage.setItem('isInstalled', 'true');
      return;
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback for browsers without install prompt
      toast.info('Install AIJIM', {
        description: 'To install this app:\n1. Tap the menu button (⋮)\n2. Select "Add to Home screen"\n3. Follow the prompts',
        duration: 8000,
      });
      return;
    }

    // Show the install prompt
    await deferredPrompt.prompt();

    // Wait for the user's response
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      toast.success('App installed successfully!', {
        description: 'AIJIM has been added to your home screen.',
      });
      localStorage.setItem('isInstalled', 'true');
      setIsInstalled(true);
      setShowButton(false);
    } else {
      toast.info('Installation cancelled', {
        description: 'You can install the app anytime from your browser menu.',
      });
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
  };

  if (isInstalled || !showButton) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3 }}
        onClick={handleInstallClick}
        className="p-2 rounded-full bg-gray-800 hover:bg-yellow-500 text-white hover:text-black transition-all duration-300 transform hover:-translate-y-1"
              >
        <Download className="w-5 h-5"  />
      
      </motion.button>
    </AnimatePresence>
  );
};

export default InstallAppButton;
