'use client'

export default function ViewModeToggle({ is3D, onToggle }) {
  return (
    <div className="neuro-card p-4 rounded-xl border-2 border-blue-500/20">
      {/* Desktop Version */}
      <div className="hidden lg:flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${!is3D ? 'neuro-btn-primary' : 'neuro-card-inset'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <span className={`text-sm font-medium transition-colors ${!is3D ? 'text-blue-400' : 'text-gray-500'}`}>
              2D
            </span>
          </div>
          
          <button
            onClick={onToggle}
            className={`neuro-toggle scale-125 ${is3D ? 'active' : ''}`}
            title={`Switch to ${is3D ? '2D' : '3D'} view`}
          />
          
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium transition-colors ${is3D ? 'text-blue-400' : 'text-gray-500'}`}>
              3D
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${is3D ? 'neuro-btn-primary' : 'neuro-card-inset'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="border-l border-gray-600 pl-4">
          <div className="text-xs text-gray-400 font-medium">
            {is3D ? 'Interactive 3D space' : 'Flat projection'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {is3D ? 'Rotate, zoom, and explore' : 'Click and hover to interact'}
          </div>
        </div>
      </div>

      {/* Mobile Version */}
      <div className="lg:hidden flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${!is3D ? 'neuro-btn-primary' : 'neuro-card-inset'}`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <span className={`text-sm font-medium transition-colors ${!is3D ? 'text-blue-400' : 'text-gray-500'}`}>
            2D
          </span>
        </div>
        
        <button
          onClick={onToggle}
          className={`neuro-toggle ${is3D ? 'active' : ''}`}
          title={`Switch to ${is3D ? '2D' : '3D'} view`}
        />
        
        <div className="flex items-center space-x-3">
          <span className={`text-sm font-medium transition-colors ${is3D ? 'text-blue-400' : 'text-gray-500'}`}>
            3D
          </span>
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${is3D ? 'neuro-btn-primary' : 'neuro-card-inset'}`}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
} 