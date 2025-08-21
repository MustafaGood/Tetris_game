import React from 'react';
import { TETROMINO_COLORS } from '../tetris';
import MiniPreview from '../MiniPreview';

interface NextPiecesProps {
  nextIds: number[];
  className?: string;
  showCount?: number; // Antal brickor att visa (1-6)
  highlightTetris?: boolean; // Highlight brickor som kan göra Tetris
  showHints?: boolean; // Visa strategitips
  currentBoard?: number[][]; // Nuvarande spelbräde för hints
}

const NextPieces: React.FC<NextPiecesProps> = ({ 
  nextIds, 
  className = '', 
  showCount = 5,
  highlightTetris = false,
  showHints = false,
  currentBoard = []
}) => {
  // Funktion för att kontrollera om en bricka kan göra Tetris
  const canMakeTetris = (pieceId: number): boolean => {
    if (!highlightTetris || !currentBoard.length) return false;
    
    // Enkel logik: I-bricka (id: 1) har störst chans för Tetris
    return pieceId === 1;
  };

  // Funktion för att generera strategitips
  const getStrategyHint = (pieceId: number): string => {
    if (!showHints) return '';
    
    const hints: Record<number, string> = {
      1: 'I-bricka: Perfekt för Tetris!',
      2: 'J-bricka: Bra för hörn',
      3: 'L-bricka: Bra för hörn',
      4: 'O-bricka: Stabil 2x2',
      5: 'S-bricka: Bra för S-spin',
      6: 'T-bricka: Perfekt för T-spin',
      7: 'Z-bricka: Bra för Z-spin'
    };
    
    return hints[pieceId] || '';
  };

  // Visa bara det konfigurerade antalet brickor
  const visiblePieces = nextIds.slice(0, showCount);

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="font-bold text-blue-400 mb-3 text-center">
        Kommande {showCount > 1 ? `(${showCount})` : ''}
      </h3>
      
      <div className="space-y-3">
        {visiblePieces.map((pieceId, index) => {
          const isTetrisPotential = canMakeTetris(pieceId);
          const hint = getStrategyHint(pieceId);
          
          return (
            <div 
              key={`${pieceId}-${index}`} 
              className={`flex items-center justify-between p-2 rounded-lg border transition-all duration-200 ${
                isTetrisPotential 
                  ? 'bg-yellow-500/20 border-yellow-400/50 shadow-lg shadow-yellow-500/20' 
                  : 'bg-gray-800/30 border-gray-600/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`text-sm font-mono w-6 ${
                  isTetrisPotential ? 'text-yellow-400' : 'text-gray-400'
                }`}>
                  {index + 1}
                </span>
                <div className="relative">
                  <MiniPreview 
                    pieceId={pieceId} 
                    size={3} 
                    className={`border-0 bg-transparent ${
                      isTetrisPotential ? 'animate-pulse' : ''
                    }`}
                  />
                  {isTetrisPotential && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div 
                  className={`w-3 h-3 rounded-sm ${
                    isTetrisPotential ? 'ring-2 ring-yellow-400' : ''
                  }`}
                  style={{ 
                    backgroundColor: TETROMINO_COLORS[pieceId as keyof typeof TETROMINO_COLORS] || '#666',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)'
                  }}
                />
                {hint && (
                  <div className="text-xs text-blue-300 mt-1 max-w-20 text-right">
                    {hint}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="text-center text-xs text-gray-500 mt-3">
        {nextIds.length} brickor kvar
        {showCount < nextIds.length && (
          <span className="block text-yellow-400">
            {nextIds.length - showCount} dolda
          </span>
        )}
      </div>
    </div>
  );
};

export default NextPieces;
