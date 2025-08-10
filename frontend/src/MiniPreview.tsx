import React from 'react';
import { shape, TETROMINO_COLORS } from './tetris';

interface MiniPreviewProps {
  pieceId: number;
  size?: number;
  className?: string;
}

const MiniPreview: React.FC<MiniPreviewProps> = ({ pieceId, size = 4, className = '' }) => {
  const pieceShape = shape({ id: pieceId, r: 0, x: 0, y: 0 });
  const color = TETROMINO_COLORS[pieceId as keyof typeof TETROMINO_COLORS] || '#666';

  return (
    <div 
      className={`grid gap-0.5 bg-gray-800 p-2 rounded-lg border border-gray-600 ${className}`}
      style={{
        gridTemplateColumns: `repeat(${pieceShape[0]?.length || 4}, 1fr)`,
        gridTemplateRows: `repeat(${pieceShape.length}, 1fr)`,
        width: `${size * (pieceShape[0]?.length || 4) + 16}px`,
        height: `${size * pieceShape.length + 16}px`,
      }}
    >
      {pieceShape.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            className="w-full h-full rounded-sm transition-colors duration-150"
            style={{
              backgroundColor: cell ? color : 'transparent',
              boxShadow: cell ? 'inset 0 0 0 1px rgba(255,255,255,0.1)' : 'none',
            }}
          />
        ))
      )}
    </div>
  );
};

export default MiniPreview;
