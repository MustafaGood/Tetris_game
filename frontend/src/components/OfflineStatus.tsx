import React, { useState, useEffect } from 'react';

interface OfflineStatusProps {
  className?: string;
}

export const OfflineStatus: React.FC<OfflineStatusProps> = ({ className = '' }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigga synkronisering när anslutningen återställs
      if (lastSync) {
        handleSync();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Lyssna på online/offline-händelser
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Kontrollera service worker-registrering
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        // Kontrollera om det finns väntande synkroniseringar
        if ('sync' in registration) {
          // Detta skulle implementeras med Background Sync API
          console.log('Bakgrundssynkronisering tillgänglig');
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [lastSync]);

  const handleSync = async () => {
    if (!isOnline) return;

    setIsSyncing(true);
    
    try {
      // Simulera synkroniseringsprocess
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Uppdatera senaste synkroniseringstid
      const now = new Date();
      setLastSync(now);
      
      // Spara i localStorage
      localStorage.setItem('lastSync', now.toISOString());
      
      console.log('Synkronisering slutförd framgångsrikt');
    } catch (error) {
      console.error('Synkronisering misslyckades:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Ladda senaste synkroniseringstid från localStorage
  useEffect(() => {
    const stored = localStorage.getItem('lastSync');
    if (stored) {
      setLastSync(new Date(stored));
    }
  }, []);

  // Formatera tid på svenska
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('sv-SE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formatera datum på svenska
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('sv-SE', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (isOnline && !isSyncing && lastSync) {
    // Visa minimal status när allt fungerar bra
    return (
      <div className={`fixed top-4 right-4 z-40 ${className}`}>
        <div className="flex items-center space-x-2 bg-green-500 text-white text-xs px-3 py-2 rounded-full shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span>Online</span>
          {lastSync && (
            <span className="opacity-75 ml-1">
              • Synkad {formatTime(lastSync)}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed top-4 right-4 z-40 ${className}`}>
      <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg ${
        isOnline 
          ? isSyncing 
            ? 'bg-yellow-500 text-yellow-900' 
            : 'bg-green-500 text-white'
          : 'bg-red-500 text-white'
      }`}>
        {/* Statusindikator */}
        <div className={`w-3 h-3 rounded-full ${
          isOnline 
            ? isSyncing 
              ? 'bg-yellow-700 animate-pulse' 
              : 'bg-white'
            : 'bg-white'
        }`}></div>
        
        {/* Statustext */}
        <span className="text-sm font-medium">
          {isOnline 
            ? isSyncing 
              ? 'Synkar data...' 
              : 'Online'
            : 'Offline'
          }
        </span>
        
        {/* Synkroniseringsknapp */}
        {isOnline && !isSyncing && (
          <button
            onClick={handleSync}
            className="ml-2 px-3 py-1 bg-white bg-opacity-20 rounded-md text-xs hover:bg-opacity-30 transition-all duration-200 font-medium"
            title="Synkronisera speldata"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
        
        {/* Senaste synkroniseringsinfo */}
        {lastSync && (
          <div className="text-xs opacity-75 ml-2">
            {isOnline ? 'Senast synkad:' : 'Senast online:'} {formatTime(lastSync)}
          </div>
        )}
      </div>
      
      {/* Offline-meddelande */}
      {!isOnline && (
        <div className="mt-2 bg-red-600 text-white text-xs px-4 py-3 rounded-lg shadow-lg max-w-xs">
          <div className="flex items-start space-x-3">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <div className="font-medium mb-1">Du är offline</div>
              <div className="opacity-90">
                Speldata sparas lokalt och synkas automatiskt när anslutningen återställs.
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Synkroniseringsmeddelande */}
      {isSyncing && (
        <div className="mt-2 bg-yellow-600 text-yellow-900 text-xs px-4 py-3 rounded-lg shadow-lg max-w-xs">
          <div className="flex items-start space-x-3">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <div>
              <div className="font-medium mb-1">Synkar speldata...</div>
              <div className="opacity-90">
                Vänta medan dina poäng och inställningar synkas med servern.
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Senaste synkroniseringsinfo (utökad) */}
      {lastSync && !isSyncing && (
        <div className="mt-2 bg-slate-700 text-slate-300 text-xs px-4 py-2 rounded-lg shadow-lg max-w-xs">
          <div className="flex items-center justify-between">
            <span>Senaste synkronisering:</span>
            <span className="font-medium">
              {formatDate(lastSync)} {formatTime(lastSync)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineStatus;
