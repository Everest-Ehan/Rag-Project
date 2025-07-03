'use client'

export default function ChunkDetailsPanel({ 
  selectedChunk, 
  onClearSelection, 
  is3D, 
  vectorDimensions 
}) {
  if (!selectedChunk) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 mx-auto neuro-card rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-400 font-medium text-sm">Select a chunk</p>
            <p className="text-gray-500 text-xs">Click any point to view details</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="space-y-4">
        <div className="neuro-card p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-blue-400 text-sm">
              {selectedChunk.documentName}
            </h4>
            <span className="text-xs text-gray-400">
              Chunk #{selectedChunk.chunkIndex}
            </span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">
            {selectedChunk.text}
          </p>
        </div>
        
        <div className="neuro-card p-4 rounded-xl">
          <h4 className="font-medium text-gray-300 mb-2 text-sm">Vector Info</h4>
          <div className="space-y-2 text-xs">
            {!is3D && (
              <div className="flex justify-between">
                <span className="text-gray-400">Position:</span>
                <span className="text-blue-400">
                  ({selectedChunk.x?.toFixed(1)}, {selectedChunk.y?.toFixed(1)})
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Magnitude:</span>
              <span className="text-blue-400">
                {selectedChunk.vector ? Math.sqrt(selectedChunk.vector.reduce((sum, val) => sum + val * val, 0)).toFixed(2) : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Dimensions:</span>
              <span className="text-blue-400">{selectedChunk.vector?.length || vectorDimensions}</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={onClearSelection}
          className="neuro-btn w-full py-2 text-sm"
        >
          Clear Selection
        </button>
      </div>
    </div>
  )
} 