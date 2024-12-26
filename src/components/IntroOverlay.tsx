import React from 'react';

interface IntroOverlayProps {
  onStart: () => void;
}

export const IntroOverlay: React.FC<IntroOverlayProps> = ({ onStart }) => {
  const isMobile = 'ontouchstart' in window;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
      <div role="dialog" aria-modal="true" className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Minesweeper</h1>
        
        <div className="space-y-6 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-3">How to Play</h2>
            {isMobile ? (
              <ul className="list-disc list-inside space-y-2">
                <li>Tap a cell to flag it as a mine</li>
                <li>Long press a cell to reveal it</li>
                <li>Numbers show adjacent mines</li>
                <li>Flag all mines to win!</li>
              </ul>
            ) : (
              <ul className="list-disc list-inside space-y-2">
                <li>Left click to flag a mine</li>
                <li>Right click to reveal a cell</li>
                <li>Numbers show adjacent mines</li>
                <li>Flag all mines to win!</li>
              </ul>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Objective</h2>
            <p>Find and flag all the mines without revealing any of them. Use the numbers as clues - they show how many mines are in the adjacent cells.</p>
          </div>
        </div>

        <button
          onClick={onStart}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}; 