import React from 'react';

interface SettingsProps {
  ghostPieceEnabled: boolean;
  soundEnabled: boolean;
  startLevel: number;
  musicEnabled: boolean;
  soundEffectsEnabled: boolean;
  theme: 'light' | 'dark';
  nextPiecesEnabled: boolean;
  nextPiecesCount: number;
  highlightTetris: boolean;
  showStrategyHints: boolean;
  onToggleGhostPiece: () => void;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onToggleSoundEffects: () => void;
  onStartLevelChange: (level: number) => void;
  onThemeChange: (theme: 'light' | 'dark') => void;
  onToggleNextPieces: () => void;
  onNextPiecesCountChange: (count: number) => void;
  onToggleHighlightTetris: () => void;
  onToggleStrategyHints: () => void;
  onBack: () => void;
}

const Settings: React.FC<SettingsProps> = ({
  ghostPieceEnabled,
  soundEnabled,
  startLevel,
  musicEnabled,
  soundEffectsEnabled,
  theme,
  nextPiecesEnabled,
  nextPiecesCount,
  highlightTetris,
  showStrategyHints,
  onToggleGhostPiece,
  onToggleSound,
  onToggleMusic,
  onToggleSoundEffects,
  onStartLevelChange,
  onThemeChange,
  onToggleNextPieces,
  onNextPiecesCountChange,
  onToggleHighlightTetris,
  onToggleStrategyHints,
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
              aria-pressed={ghostPieceEnabled}
              aria-label="Toggle Ghost Piece"
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

          {/* Master Sound Setting */}
          <div className="flex items-center justify-between">
            <div className="text-left">
              <span className="text-white font-semibold">Ljud</span>
              <p className="text-gray-400 text-sm">Aktivera alla ljud</p>
            </div>
            <button
              onClick={onToggleSound}
              aria-pressed={soundEnabled}
              aria-label="Toggle Sound"
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

          {/* Music Setting */}
          <div className="flex items-center justify-between">
            <div className="text-left">
              <span className="text-white font-semibold">Bakgrundsmusik</span>
              <p className="text-gray-400 text-sm">Spela bakgrundsmusik</p>
            </div>
            <button
              onClick={onToggleMusic}
              disabled={!soundEnabled}
              aria-pressed={musicEnabled}
              aria-label="Toggle Background Music"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                !soundEnabled ? 'bg-gray-500 cursor-not-allowed' :
                musicEnabled ? 'bg-blue-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  musicEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Sound Effects Setting */}
          <div className="flex items-center justify-between">
            <div className="text-left">
              <span className="text-white font-semibold">Ljudeffekter</span>
              <p className="text-gray-400 text-sm">Spela ljudeffekter</p>
            </div>
            <button
              onClick={onToggleSoundEffects}
              disabled={!soundEnabled}
              aria-pressed={soundEffectsEnabled}
              aria-label="Toggle Sound Effects"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                !soundEnabled ? 'bg-gray-500 cursor-not-allowed' :
                soundEffectsEnabled ? 'bg-purple-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  soundEffectsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Theme Setting */}
          <div className="flex items-center justify-between">
            <div className="text-left">
              <span className="text-white font-semibold">Tema</span>
              <p className="text-gray-400 text-sm">Välj ljust eller mörkt tema</p>
            </div>
            <button
              onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
              aria-label="Toggle Theme"
              className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {theme === 'light' ? '☀️ Ljust' : '🌙 Mörkt'}
            </button>
          </div>

          {/* Next Pieces Setting */}
          <div className="flex items-center justify-between">
            <div className="text-left">
              <span className="text-white font-semibold">Kommande Brickor</span>
              <p className="text-gray-400 text-sm">Visa kommande brickor</p>
            </div>
            <button
              onClick={onToggleNextPieces}
              aria-pressed={nextPiecesEnabled}
              aria-label="Toggle Next Pieces"
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                nextPiecesEnabled ? 'bg-blue-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  nextPiecesEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Next Pieces Count Setting */}
          {nextPiecesEnabled && (
            <div className="text-left">
              <span className="text-white font-semibold">Antal Brickor</span>
              <p className="text-gray-400 text-sm mb-3">Välj hur många kommande brickor som visas</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => onNextPiecesCountChange(Math.max(1, nextPiecesCount - 1))}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-lg transition-colors"
                  disabled={nextPiecesCount <= 1}
                >
                  -
                </button>
                <span className="text-white font-bold text-xl min-w-[3rem]">{nextPiecesCount}</span>
                <button
                  onClick={() => onNextPiecesCountChange(Math.min(6, nextPiecesCount + 1))}
                  className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-lg transition-colors"
                  disabled={nextPiecesCount >= 6}
                >
                  +
                </button>
              </div>
              <div className="mt-2">
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={nextPiecesCount}
                  onChange={(e) => onNextPiecesCountChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {nextPiecesCount === 1 ? 'Hard Mode' : nextPiecesCount >= 2 ? 'Easy Mode' : 'Normal Mode'}
              </div>
            </div>
          )}

          {/* Highlight Tetris Setting */}
          {nextPiecesEnabled && (
            <div className="flex items-center justify-between">
              <div className="text-left">
                <span className="text-white font-semibold">Highlight Tetris</span>
                <p className="text-gray-400 text-sm">Markera brickor som kan göra Tetris</p>
              </div>
              <button
                onClick={onToggleHighlightTetris}
                aria-pressed={highlightTetris}
                aria-label="Toggle Highlight Tetris"
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  highlightTetris ? 'bg-yellow-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    highlightTetris ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Strategy Hints Setting */}
          {nextPiecesEnabled && (
            <div className="flex items-center justify-between">
              <div className="text-left">
                <span className="text-white font-semibold">Strategitips</span>
                <p className="text-gray-400 text-sm">Visa tips för varje bricka</p>
              </div>
              <button
                onClick={onToggleStrategyHints}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showStrategyHints ? 'bg-green-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showStrategyHints ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

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
        <div className="mt-8">
          <button
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-500 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
          >
            Tillbaka
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
