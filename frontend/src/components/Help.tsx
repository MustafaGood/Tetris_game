import React from 'react';

interface HelpProps {
  onBack: () => void;
}

const Help: React.FC<HelpProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="bg-gray-800 p-8 rounded-xl border border-gray-600 text-center max-w-4xl w-full max-h-[90vh] overflow-y-auto help-container">
        <h2 className="text-3xl font-bold text-white mb-6">Hjälp & Instruktioner</h2>
        
        <div className="grid md:grid-cols-2 gap-8 text-left help-grid">
          {/* Game Instructions */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-3">🎮 Hur man spelar</h3>
              <div className="space-y-3 text-gray-300">
                <p>• Rotera och flytta fallande pjäser för att skapa kompletta rader</p>
                <p>• När en rad blir full, försvinner den och ger poäng</p>
                <p>• Spelet slutar när pjäser når toppen av spelplanen</p>
                <p>• Använd Hold-funktionen för att spara en pjäs till senare</p>
                <p>• Titta på Next-kön för att planera dina drag</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-3">🏆 Poängsystem</h3>
              <div className="space-y-2 text-gray-300">
                <p><strong>Single:</strong> 100 × nivå</p>
                <p><strong>Double:</strong> 300 × nivå</p>
                <p><strong>Triple:</strong> 500 × nivå</p>
                <p><strong>Tetris (4 rader):</strong> 800 × nivå</p>
                <p><strong>Soft Drop:</strong> 1 poäng per rad × nivå</p>
                <p><strong>Hard Drop:</strong> 2 poäng per rad</p>
                <p><strong>Combo:</strong> 50 poäng per combo × nivå</p>
                <p><strong>Back-to-Back:</strong> 50% bonus för upprepade Tetris/T-spins</p>
                <p><strong>T-Spin:</strong> Extra bonus för T-pjäser</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-3">📈 Nivåer</h3>
              <div className="space-y-2 text-gray-300">
                <p>• Nivån ökar var 10:e raderade rad</p>
                <p>• Högre nivå = snabbare fallande pjäser</p>
                <p>• Du kan välja startnivå i inställningarna</p>
              </div>
            </div>
          </div>

          {/* Keyboard Controls */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-3">⌨️ Tangentbordskontroller</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-700 p-2 rounded">
                    <span className="text-cyan-400 font-bold">← →</span>
                    <span className="text-gray-300 ml-2">Flytta vänster/höger</span>
                  </div>
                  <div className="bg-gray-700 p-2 rounded">
                    <span className="text-cyan-400 font-bold">↓</span>
                    <span className="text-gray-300 ml-2">Soft drop</span>
                  </div>
                  <div className="bg-gray-700 p-2 rounded">
                    <span className="text-cyan-400 font-bold">↑</span>
                    <span className="text-gray-300 ml-2">Rotera medurs</span>
                  </div>
                  <div className="bg-gray-700 p-2 rounded">
                    <span className="text-cyan-400 font-bold">Space</span>
                    <span className="text-gray-300 ml-2">Hard drop</span>
                  </div>
                  <div className="bg-gray-700 p-2 rounded">
                    <span className="text-cyan-400 font-bold">C</span>
                    <span className="text-gray-300 ml-2">Hold pjäs</span>
                  </div>
                  <div className="bg-gray-700 p-2 rounded">
                    <span className="text-cyan-400 font-bold">P</span>
                    <span className="text-gray-300 ml-2">Pausa/Fortsätt</span>
                  </div>
                  <div className="bg-gray-700 p-2 rounded">
                    <span className="text-cyan-400 font-bold">Esc</span>
                    <span className="text-gray-300 ml-2">Pausa</span>
                  </div>
                  <div className="bg-gray-700 p-2 rounded">
                    <span className="text-cyan-400 font-bold">R</span>
                    <span className="text-gray-300 ml-2">Starta om</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-3">🎯 Avancerade tekniker</h3>
              <div className="space-y-3 text-gray-300">
                <div>
                  <p className="font-semibold text-yellow-400">T-Spin</p>
                  <p className="text-sm">Rotera en T-pjäs in i ett hörn för extra poäng</p>
                </div>
                <div>
                  <p className="font-semibold text-orange-400">Combo</p>
                  <p className="text-sm">Rensa flera rader i rad för combo-bonus</p>
                </div>
                <div>
                  <p className="font-semibold text-purple-400">Back-to-Back</p>
                  <p className="text-sm">Gör flera Tetris eller T-spins i rad</p>
                </div>
                <div>
                  <p className="font-semibold text-green-400">Ghost Piece</p>
                  <p className="text-sm">Ser var pjäsen kommer landa (kan stängas av)</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-3">💡 Tips</h3>
              <div className="space-y-2 text-gray-300 text-sm">
                <p>• Håll spelplanen jämn - undvik höga stackar</p>
                <p>• Använd Hold för att spara I-pjäser till Tetris</p>
                <p>• Planera dina drag med Next-kön</p>
                <p>• Öva T-spins för högre poäng</p>
                <p>• Använd soft drop för precision</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white py-3 px-8 rounded-lg font-bold transition-colors mt-8"
        >
          Tillbaka
        </button>
      </div>
    </div>
  );
};

export default Help;
