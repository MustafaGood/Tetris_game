import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallProps {
  className?: string;
}

export const PWAInstall: React.FC<PWAInstallProps> = ({ className = '' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Kontrollera om appen redan är installerad
    const checkIfInstalled = () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        setShowInstallButton(false);
      }
    };

    // Lyssna på beforeinstallprompt-händelsen
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallButton(true);
    };

    // Lyssna på app-installerad-händelsen
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallButton(false);
      setDeferredPrompt(null);
    };

    // Kontrollera initialt tillstånd
    checkIfInstalled();

    // Lägg till händelseavlyssnare
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Rensa upp
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      // Visa installationsprompten
      await deferredPrompt.prompt();

      // Vänta på användarens svar på prompten
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        console.log('Användaren accepterade installationsprompten');
        setIsInstalled(true);
        setShowInstallButton(false);
      } else {
        console.log('Användaren avböjde installationsprompten');
      }
    } catch (error) {
      console.error('Fel under installation:', error);
    }

    // Rensa deferredPrompt
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallButton(false);
    setDeferredPrompt(null);
  };

  // Visa ingenting om appen redan är installerad
  if (isInstalled) {
    return null;
  }

  // Visa ingenting om ingen installationsprompt finns tillgänglig
  if (!showInstallButton) {
    return null;
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      <div className="bg-slate-800 border border-slate-600 rounded-lg shadow-lg p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-slate-100">
              Installera Tetris
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Installera denna app på din enhet för snabb och enkel åtkomst. 
              Spela offline och få bättre prestanda!
            </p>
            
            <div className="mt-3 flex space-x-2">
              <button
                onClick={handleInstallClick}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-3 py-2 rounded-md transition-colors duration-200"
              >
                Installera
              </button>
              <button
                onClick={handleDismiss}
                className="bg-slate-600 hover:bg-slate-700 text-slate-300 text-sm font-medium px-3 py-2 rounded-md transition-colors duration-200"
              >
                Inte nu
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-slate-400 hover:text-slate-300 transition-colors duration-200"
            aria-label="Stäng"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mt-3 pt-3 border-t border-slate-600">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Fungerar offline • Ingen app-butik krävs • Snabbare laddning</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PWAInstall;
