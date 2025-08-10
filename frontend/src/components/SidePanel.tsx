import React from 'react';
import MiniPreview from '../MiniPreview';
import { Score } from '../api';

interface SidePanelProps {
  next: number[];
  hold: number | null;
  level: number;
  lines: number;
  points: number;
  scores: Score[];
  backendConnected: boolean | null;
  onQuit?: () => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ 
  next, 
  hold, 
  level, 
  lines, 
  points, 
  scores, 
  backendConnected,
  onQuit 
}) => {
  return (
    <div className="flex flex-col gap-6 w-64">
      {/* Hold Section */}
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-600">
        <h3 className="text-white font-bold text-lg mb-3 text-center">Hold</h3>
        <div className="flex justify-center">
          {hold ? (
            <MiniPreview pieceId={hold} size={6} />
          ) : (
            <div className="w-20 h-20 bg-gray-700 rounded-lg border-2 border-dashed border-gray-500 flex items-center justify-center">
              <span className="text-gray-400 text-xs">Empty</span>
            </div>
          )}
        </div>
      </div>

      {/* Next Pieces */}
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-600">
        <h3 className="text-white font-bold text-lg mb-3 text-center">Next</h3>
        <div className="flex flex-col gap-2">
          {next.slice(0, 3).map((pieceId, index) => (
            <div key={index} className="flex justify-center">
              <MiniPreview pieceId={pieceId} size={5} />
            </div>
          ))}
        </div>
      </div>

      {/* Game Stats */}
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-600">
        <h3 className="text-white font-bold text-lg mb-3 text-center">Stats</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-300">Level:</span>
            <span className="text-white font-bold">{level}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Lines:</span>
            <span className="text-white font-bold">{lines}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Score:</span>
            <span className="text-white font-bold">{points.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Quit Button */}
      {onQuit && (
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-600">
          <button
            onClick={onQuit}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-bold transition-colors"
          >
            Avsluta
          </button>
        </div>
      )}

      {/* Backend Status */}
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-600">
        <h3 className="text-white font-bold text-lg mb-3 text-center">Server</h3>
        <div className="flex items-center justify-center gap-2">
          <div 
            className={`w-3 h-3 rounded-full ${
              backendConnected === null 
                ? 'bg-yellow-500' 
                : backendConnected 
                ? 'bg-green-500' 
                : 'bg-red-500'
            }`}
          />
          <span className="text-gray-300 text-sm">
            {backendConnected === null 
              ? 'Connecting...' 
              : backendConnected 
              ? 'Connected' 
              : 'Disconnected'
            }
          </span>
        </div>
      </div>

      {/* Top Scores */}
      {scores.length > 0 && (
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-600">
          <h3 className="text-white font-bold text-lg mb-3 text-center">Top Scores</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {scores.slice(0, 5).map((score, index) => (
              <div key={score.id} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 w-4">#{index + 1}</span>
                  <span className="text-white truncate max-w-20">{score.name}</span>
                </div>
                <span className="text-white font-bold">{score.points.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SidePanel;
