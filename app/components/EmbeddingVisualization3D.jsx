'use client'

import { useEffect, useRef } from 'react'
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
  isRotating,
  onPointClick
}) {
  const plotRef = useRef(null)

  // 3D Auto-rotation effect
  useEffect(() => {
    if (!plotRef.current || !isRotating || typeof window === 'undefined') return

    const interval = setInterval(() => {
      if (plotRef.current && plotRef.current.layout && window.Plotly) {
        const currentEye = plotRef.current.layout.scene.camera.eye
        const angle = 0.02
        
        const newX = currentEye.x * Math.cos(angle) - currentEye.y * Math.sin(angle)
        const newY = currentEye.x * Math.sin(angle) + currentEye.y * Math.cos(angle)
        
        window.Plotly.relayout(plotRef.current, {
          'scene.camera.eye': { x: newX, y: newY, z: currentEye.z }
        })
      }
    }, 50)

    return () => clearInterval(interval)
  }, [isRotating])

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
      camera: {
        eye: { x: 1.5, y: 1.5, z: 1.5 }
      }
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
    uirevision: 'true'
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
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </div>
  )
} 