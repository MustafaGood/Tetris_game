import React from 'react';

interface MainMenuProps {
  onStart: () => void;
  onHelp: () => void;
  onInfo: () => void;
  onHighscores: () => void;
  onSettings: () => void;
  onExit: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart, onHelp, onInfo, onHighscores, onSettings, onExit }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="text-center space-y-8">
        {/* Title */}
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-white drop-shadow-2xl">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              TETRIS
            </span>
          </h1>
          <p className="text-gray-300 text-lg">Klassisk Tetris med moderna funktioner</p>
        </div>

        {/* Menu Buttons */}
        <div className="space-y-4 max-w-md mx-auto">
          <MenuButton onClick={onStart} color="from-green-500 to-emerald-600" delay="0">
            🎮 Starta Spel
          </MenuButton>
          
          <MenuButton onClick={onHighscores} color="from-yellow-500 to-orange-500" delay="100">
            🏆 Highscores
          </MenuButton>
          
          <MenuButton onClick={onSettings} color="from-purple-500 to-pink-500" delay="200">
            ⚙️ Inställningar
          </MenuButton>
          
          <MenuButton onClick={onHelp} color="from-blue-500 to-cyan-500" delay="300">
            ❓ Hjälp
          </MenuButton>
          
          <MenuButton onClick={onInfo} color="from-indigo-500 to-purple-500" delay="400">
            ℹ️ Info
          </MenuButton>
          
          <MenuButton onClick={onExit} color="from-red-500 to-pink-500" delay="500">
            🚪 Avsluta
          </MenuButton>
        </div>

        {/* Footer */}
        <div className="text-gray-400 text-sm mt-8">
          <p>Version 2.0.0 • Byggd med React & TypeScript</p>
          <p className="mt-1">Använd piltangenter  för att spela</p>
        </div>
      </div>
    </div>
  );
};

interface MenuButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  color: string;
  delay?: string;
}

const MenuButton: React.FC<MenuButtonProps> = ({ children, onClick, color, delay = "0" }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full py-4 px-6 rounded-xl font-bold text-lg text-white
        bg-gradient-to-r ${color}
        transform transition-all duration-200 hover:scale-105 hover:shadow-lg
        active:scale-95 focus:outline-none focus:ring-4 focus:ring-white/20
        border border-white/10 backdrop-blur-sm
      `}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </button>
  );
};

export default MainMenu;
