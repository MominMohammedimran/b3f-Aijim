import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    const checkInstallationStatus = () => {
      const installed = localStorage.getItem('isInstalled') === 'true';
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;

      if (isStandalone || installed) {
        setIsInstalled(true);
        setShowButton(false);
        localStorage.setItem('isInstalled', 'true');
      } else {
        setIsInstalled(false);
      }
    };

    checkInstallationStatus();

    // Listen for beforeinstallprompt event (Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const event = e as BeforeInstallPromptEvent;
      setDeferredPrompt(event);
      setShowButton(true);
 
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
  
      toast.success('AIJIM installed successfully!');
      setIsInstalled(true);
      setShowButton(false);
      localStorage.setItem('isInstalled', 'true');
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.info('Install AIJIM', {
        description:
          'To install manually:\n1️⃣ Tap the browser menu (⋮)\n2️⃣ Select "Add to Home screen"\n3️⃣ Follow the prompts',
        duration: 9000,
      });
      return;
    }

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      toast.success('App installed successfully!', {
        description: 'AIJIM is now on your home screen.',
      });
      localStorage.setItem('isInstalled', 'true');
      setIsInstalled(true);
      setShowButton(false);
    } else {
      toast.info('Installation dismissed', {
        description: 'You can install it later from your browser menu.',
      });
    }

    setDeferredPrompt(null);
  };

  // Don’t render button if already installed or not installable
  if (isInstalled || !showButton) return null;

  return (
    <Button
      onClick={handleInstallClick}
      className="p-3 rounded-full bg-gray-800 hover:bg-yellow-500 text-white hover:text-black transition-all duration-300 transform hover:-translate-y-1"
               title="Install AIJIM App"
    >
      <Download className="w-5 h-5" />
    </Button>
  );
};

export default InstallAppButton;