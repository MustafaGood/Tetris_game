import React from 'react';
import MiniPreview from '../MiniPreview';
import { Score } from '../api';
import { LocalScore } from '../tetris';

interface SidePanelProps {
  next: number[];
  hold: number | null;
  level: number;
  lines: number;
  points: number;
  combo: number;
  scores: Score[];
  localScores: LocalScore[];
  backendConnected: boolean | null;
  onQuit?: () => void;
  ghostPieceEnabled?: boolean;
  onToggleGhostPiece?: () => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ 
  next, 
  hold, 
  level, 
  lines, 
  points, 
  combo,
  scores, 
  localScores,
  backendConnected,
  onQuit,
  ghostPieceEnabled = true,
  onToggleGhostPiece
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
        <h3 className="text-white font-bold text-lg mb-3 text-center">Next (2)</h3>
        <div className="flex flex-col gap-2">
          {next.slice(0, 2).map((pieceId, index) => (
            <div key={index} className="flex justify-center">
              <MiniPreview pieceId={pieceId} size={4} />
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
          {combo > 0 && (
            <div className="flex justify-between">
              <span className="text-orange-300">Combo:</span>
              <span className="text-orange-300 font-bold">{combo}x</span>
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="bg-gray-800 p-4 rounded-xl border border-gray-600">
        <h3 className="text-white font-bold text-lg mb-3 text-center">Settings</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">Ghost Piece</span>
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
          <div className="text-gray-400 text-xs text-center">
            Visar var pjäsen kommer landa
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
      {(scores.length > 0 || localScores.length > 0) && (
        <div className="bg-gray-800 p-4 rounded-xl border border-gray-600">
          <h3 className="text-white font-bold text-lg mb-3 text-center">Top Scores</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {/* Backend scores */}
            {scores.slice(0, 3).map((score, index) => (
              <div key={`backend-${score.id}`} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 w-4">#{index + 1}</span>
                  <span className="text-white truncate max-w-20">{score.name}</span>
                </div>
                <span className="text-white font-bold">{score.points.toLocaleString()}</span>
              </div>
            ))}
            {/* Local scores */}
            {localScores.slice(0, 3).map((score, index) => (
              <div key={`local-${score.id}`} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 w-4">#{index + 1}</span>
                  <span className="text-gray-300 truncate max-w-20">{score.playerName}</span>
                </div>
                <span className="text-gray-300 font-bold">{score.score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SidePanel;
