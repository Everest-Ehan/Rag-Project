'use client'

import { useState } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

// Custom tooltip component for 2D view
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="neuro-card p-3 max-w-xs shadow-lg z-50">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-blue-400">{data.documentName}</p>
          <p className="text-xs text-gray-500">#{data.chunkIndex}</p>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          {data.text.length > 80 ? data.text.substring(0, 80) + '...' : data.text}
        </p>
      </div>
    )
  }
  return null
}

export default function EmbeddingVisualization2D({
  projectedData,
  selectedChunk,
  hoveredPoint,
  onPointClick,
  onPointHover,
  onPointLeave,
  isTransitioning
}) {
  const [hiddenDocuments, setHiddenDocuments] = useState(new Set())

  // Get unique documents and their colors for legend
  const documentLegend = {}
  projectedData.forEach(point => {
    if (!documentLegend[point.documentName]) {
      documentLegend[point.documentName] = point.color || '#4a9eff'
    }
  })

  // Filter data based on hidden documents
  const visibleData = projectedData.filter(point => 
    !hiddenDocuments.has(point.documentName)
  )

  // Toggle document visibility
  const toggleDocument = (docName) => {
    setHiddenDocuments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(docName)) {
        newSet.delete(docName)
      } else {
        newSet.add(docName)
      }
      return newSet
    })
  }

  return (
    <div className={`flex-1 min-h-0 ${isTransitioning ? 'opacity-50' : 'opacity-100'} transition-opacity duration-300 flex flex-col`}>
      {/* Plot area */}
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              type="number" 
              dataKey="x" 
              stroke="#666"
              tick={{ fill: '#666' }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              stroke="#666"
              tick={{ fill: '#666' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Scatter 
              data={visibleData} 
              onClick={onPointClick}
              onMouseEnter={onPointHover}
              onMouseLeave={onPointLeave}
            >
              {visibleData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    selectedChunk?.id === entry.id ? '#60a5fa' :
                    hoveredPoint === entry.id ? '#93c5fd' :
                    (entry.color || '#4a9eff')
                  }
                  opacity={
                    selectedChunk?.id === entry.id ? 1 :
                    hoveredPoint === entry.id ? 0.9 :
                    0.8
                  }
                  r={
                    selectedChunk?.id === entry.id ? entry.size * 1.5 :
                    hoveredPoint === entry.id ? entry.size * 1.2 :
                    entry.size
                  }
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      
             {/* Interactive Legend - positioned below plot, completely outside */}
       {Object.keys(documentLegend).length > 1 && (
         <div className="flex-shrink-0 pt-3 border-t border-gray-700 mt-2">
           <div className="flex items-center justify-center flex-wrap gap-4">
             {Object.entries(documentLegend).map(([docName, color]) => {
               const isHidden = hiddenDocuments.has(docName)
               return (
                 <button
                   key={docName}
                   onClick={() => toggleDocument(docName)}
                   className={`flex items-center space-x-2 px-2 py-1 rounded-lg transition-all duration-200 hover:bg-gray-700/50 ${
                     isHidden ? 'opacity-50' : 'opacity-100'
                   }`}
                   title={`Click to ${isHidden ? 'show' : 'hide'} ${docName}`}
                 >
                   <div 
                     className={`w-3 h-3 rounded-full transition-all duration-200 ${
                       isHidden ? 'bg-gray-600' : ''
                     }`}
                     style={{ backgroundColor: isHidden ? '#666' : color }}
                   />
                   <span className={`text-xs transition-colors duration-200 ${
                     isHidden ? 'text-gray-500 line-through' : 'text-gray-400'
                   }`}>
                     {docName.length > 20 ? docName.substring(0, 20) + '...' : docName}
                   </span>
                 </button>
               )
             })}
           </div>
           <div className="text-center mt-2">
             <p className="text-xs text-gray-500">
               💡 Click legend items to show/hide documents
             </p>
           </div>
         </div>
       )}
    </div>
  )
} 