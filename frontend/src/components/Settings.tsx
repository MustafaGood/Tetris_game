import React from 'react';

interface SettingsProps {
  ghostPieceEnabled: boolean;
  soundEnabled: boolean;
  startLevel: number;
  onToggleGhostPiece: () => void;
  onToggleSound: () => void;
  onStartLevelChange: (level: number) => void;
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({
  ghostPieceEnabled,
  soundEnabled,
  startLevel,
  onToggleGhostPiece,
  onToggleSound,
  onStartLevelChange,
  onBack
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="bg-gray-800 p-8 rounded-xl border border-gray-600 text-center max-w-md w-full settings-container">
        <h2 className="text-3xl font-bold text-white mb-6">Inställningar</h2>
        
        <div className="space-y-6">
          {/* Ghost Piece Setting */}
          <div className="flex items-center justify-between">
            <div className="text-left">
              <span className="text-white font-semibold">Ghost Piece</span>
              <p className="text-gray-400 text-sm">Visa var pjäsen kommer landa</p>
            </div>
            <button
              onClick={onToggleGhostPiece}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                ghostPieceEnabled ? 'bg-blue-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  ghostPieceEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Sound Setting */}
          <div className="flex items-center justify-between">
            <div className="text-left">
              <span className="text-white font-semibold">Ljud</span>
              <p className="text-gray-400 text-sm">Aktivera ljudeffekter</p>
            </div>
            <button
              onClick={onToggleSound}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                soundEnabled ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  soundEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Start Level Setting */}
          <div className="text-left">
            <span className="text-white font-semibold">Startnivå</span>
            <p className="text-gray-400 text-sm mb-3">Välj vilken nivå spelet ska börja på</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => onStartLevelChange(Math.max(1, startLevel - 1))}
                className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-lg transition-colors"
                disabled={startLevel <= 1}
              >
                -
              </button>
              <span className="text-white font-bold text-xl min-w-[3rem]">{startLevel}</span>
              <button
                onClick={() => onStartLevelChange(Math.min(20, startLevel + 1))}
                className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-lg transition-colors"
                disabled={startLevel >= 20}
              >
                +
              </button>
            </div>
            <div className="mt-2">
              <input
                type="range"
                min="1"
                max="20"
                value={startLevel}
                onChange={(e) => onStartLevelChange(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg font-bold transition-colors mt-8"
        >
          Tillbaka
        </button>
      </div>
    </div>
  );
};

export default Settings;
