'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import Plot to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => (
    <div className="h-96 flex items-center justify-center">
      <div className="text-center space-y-4">
        <svg className="w-8 h-8 animate-spin mx-auto text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <p className="text-gray-400">Loading 3D plot...</p>
      </div>
    </div>
  )
})

export default function EmbeddingVisualization3D({
  plotData3D,
  onPointClick
}) {
  const plotRef = useRef(null)
  
  // State to track camera position (using Plotly's default "home" position)
  const [cameraPosition, setCameraPosition] = useState({
    eye: { x: 1.25, y: 1.25, z: 1.25 },
    center: { x: 0, y: 0, z: 0 },
    up: { x: 0, y: 0, z: 1 }
  })

  // Handle camera position changes (when user manually rotates/zooms)
  const handleRelayout = (eventData) => {
    if (eventData['scene.camera']) {
      setCameraPosition(eventData['scene.camera'])
    }
  }

  // 3D Plot configuration
  const plot3DLayout = {
    scene: {
      bgcolor: '#1a1a1a',
      xaxis: {
        title: 'X',
        gridcolor: '#333333',
        zerolinecolor: '#333333',
        showgrid: true,
        zeroline: true,
        showline: true,
        linecolor: '#333333',
        tickfont: { color: '#b0b0b0' },
        titlefont: { color: '#e5e5e5' }
      },
      yaxis: {
        title: 'Y',
        gridcolor: '#333333',
        zerolinecolor: '#333333',
        showgrid: true,
        zeroline: true,
        showline: true,
        linecolor: '#333333',
        tickfont: { color: '#b0b0b0' },
        titlefont: { color: '#e5e5e5' }
      },
      zaxis: {
        title: 'Z',
        gridcolor: '#333333',
        zerolinecolor: '#333333',
        showgrid: true,
        zeroline: true,
        showline: true,
        linecolor: '#333333',
        tickfont: { color: '#b0b0b0' },
        titlefont: { color: '#e5e5e5' }
      },
      camera: cameraPosition
    },
    paper_bgcolor: '#1a1a1a',
    plot_bgcolor: '#1a1a1a',
    font: {
      color: '#e5e5e5'
    },
    margin: {
      l: 0,
      r: 0,
      t: 0,
      b: 0
    },
    showlegend: true,
    legend: {
      x: 0.02,
      y: 0.98,
      bgcolor: 'rgba(26, 26, 26, 0.8)',
      bordercolor: '#333333',
      borderwidth: 1,
      font: { color: '#e5e5e5' }
    },
    // Prevent unnecessary re-renders that reset camera position
    uirevision: 'preserve-camera'
  }

  const plot3DConfig = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
    responsive: true
  }

  return (
    <div className="flex-1 min-h-0">
      <Plot
        ref={plotRef}
        data={plotData3D}
        layout={plot3DLayout}
        config={plot3DConfig}
        onClick={onPointClick}
        onRelayout={handleRelayout}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </div>
  )
} 