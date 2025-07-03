'use client'

import { useState, useEffect } from 'react'
import ViewModeToggle from './ViewModeToggle'
import EmbeddingVisualization2D from './EmbeddingVisualization2D'
import EmbeddingVisualization3D from './EmbeddingVisualization3D'
import ChunkDetailsPanel from './ChunkDetailsPanel'
import { 
  formatEmbeddingData, 
  generateDummyEmbeddings, 
  projectEmbeddings, 
  process3DData 
} from '../utils/embeddingUtils'

// Export formatEmbeddingData for external use
export { formatEmbeddingData }

export default function EmbeddingVisualizer({ clientId, embeddingData = null }) {
  // View state
  const [is3D, setIs3D] = useState(false)
  
  // Common state
  const [embeddings, setEmbeddings] = useState([])
  const [selectedChunk, setSelectedChunk] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [documentOptions, setDocumentOptions] = useState([])
  const [vectorDimensions, setVectorDimensions] = useState(128)
  const [isUsingDummyData, setIsUsingDummyData] = useState(false)
  const [fetchedData, setFetchedData] = useState(null)
  
  // 2D specific state
  const [projectedData, setProjectedData] = useState([])
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  // 3D specific state
  const [plotData3D, setPlotData3D] = useState([])

  // Fetch embeddings from API
  const fetchEmbeddings = async (clientId) => {
    if (!clientId) return null
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/embeddings?clientId=${encodeURIComponent(clientId)}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`API Error: ${response.status}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching embeddings:', error)
      setError(error.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Process dynamic embedding data or fetch from API
  useEffect(() => {
    const processEmbeddingData = async () => {
      let realData = embeddingData
      
      if (!realData && clientId) {
        realData = await fetchEmbeddings(clientId)
        setFetchedData(realData)
      }
      
      if (realData && realData.documents && realData.documents.length > 0) {
        setIsUsingDummyData(false)
        const options = realData.documents.map(doc => ({
          id: doc.id,
          name: doc.name
        }))
        setDocumentOptions(options)
        
        if (realData.statistics?.vectorDimensions) {
          setVectorDimensions(realData.statistics.vectorDimensions)
        } else if (realData.documents[0].chunks[0]?.vector) {
          setVectorDimensions(realData.documents[0].chunks[0].vector.length)
        }
      } else {
        setIsUsingDummyData(true)
        const dummyOptions = [
          { id: 'technical-doc', name: 'Technical Documentation' },
          { id: 'business-report', name: 'Business Analysis Report' },
          { id: 'research-paper', name: 'Scientific Research Paper' }
        ]
        setDocumentOptions(dummyOptions)
        setVectorDimensions(128)
      }
    }
    
    processEmbeddingData()
  }, [embeddingData, clientId])

  // Process all embeddings for both 2D and 3D views
  useEffect(() => {
    if (documentOptions.length === 0) return

    const processAllData = async () => {
      let allChunks = []
      
      if (isUsingDummyData) {
        const allDummyDocs = ['technical-doc', 'business-report', 'research-paper']
        allDummyDocs.forEach(docId => {
          const dummyData = generateDummyEmbeddings(docId)
          allChunks = allChunks.concat(dummyData.chunks.map(chunk => ({
            ...chunk,
            documentName: dummyData.name
          })))
        })
      } else {
        const sourceData = embeddingData || fetchedData
        if (sourceData) {
          sourceData.documents.forEach(doc => {
            doc.chunks.forEach(chunk => {
              allChunks.push({
                id: chunk.id,
                text: chunk.text,
                documentName: doc.name,
                chunkIndex: chunk.chunkIndex,
                vector: chunk.vector || chunk.embedding || []
              })
            })
          })
        }
      }
      
      setEmbeddings(allChunks)
      
      // Process 2D data for all documents
      setIsTransitioning(true)
      setTimeout(() => {
        const projected = projectEmbeddings(allChunks, 'All Documents', null, documentOptions)
        setProjectedData(projected)
        setIsTransitioning(false)
      }, 300)

      // Process 3D data
      if (allChunks.length > 0) {
        const traces = await process3DData(allChunks, embeddingData, fetchedData)
        setPlotData3D(traces)
      }
    }
    
    processAllData()
  }, [embeddingData, fetchedData, isUsingDummyData, documentOptions, is3D])

  // Handle point clicks for both 2D and 3D
  const handlePointClick = (data) => {
    if (is3D) {
      if (data.points && data.points.length > 0) {
        const point = data.points[0]
        const chunkData = point.customdata
        
        if (chunkData) {
          setSelectedChunk(chunkData)
        }
      }
    } else {
      setSelectedChunk(data)
    }
  }

  const handlePointHover = (data) => {
    if (!is3D) {
      setHoveredPoint(data?.id)
    }
  }



  // Loading state
  if (documentOptions.length === 0 && !isLoading) {
    return (
      <div className="space-y-6 h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto neuro-card-inset rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-400 text-lg font-medium">No Documents</p>
            <p className="text-gray-500 text-sm">Upload documents to visualize embeddings</p>
            {error && (
              <p className="text-red-400 text-xs mt-2">Error: {error}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto neuro-card-inset rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div>
            <p className="text-gray-400 text-lg font-medium">Loading Embeddings</p>
            <p className="text-gray-500 text-sm">Fetching document data from database...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header with Prominent 2D/3D Toggle */}
      <div className="flex flex-col gap-4 mb-6 flex-shrink-0">
        {/* Main Title and View Toggle */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-200">
              {is3D ? '3D Embedding Space' : '2D Embedding Projection'}
            </h2>
            <p className="text-sm text-gray-400">
              {is3D ? 'Interactive 3D visualization of document embeddings' : 'Flat projection of high-dimensional vectors'}
            </p>
          </div>
          <div className="flex-shrink-0">
            <ViewModeToggle is3D={is3D} onToggle={() => setIs3D(!is3D)} />
          </div>
        </div>

        {/* Document Overview and Statistics */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="text-sm text-gray-300 mb-2">Document Overview</div>
            <div className="neuro-card-inset p-3 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-400">Total Documents:</span>
                <span className="text-xs text-blue-400 font-medium">{documentOptions.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Total Chunks:</span>
                <span className="text-xs text-blue-400 font-medium">
                  {isUsingDummyData ? 30 : (fetchedData?.documents?.reduce((total, doc) => total + doc.chunks.length, 0) || 0)}
                </span>
              </div>
              {isUsingDummyData && (
                <p className="text-xs text-yellow-400 mt-2">
                  Using demo data • Upload documents for real embeddings
                </p>
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="text-sm text-gray-300 mb-2">Vector Statistics</div>
            <div className="neuro-card-inset p-3 rounded-xl">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">Dimensions:</span>
                <span className="text-xs text-blue-400 font-medium">{vectorDimensions}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-400">Reduction:</span>
                <span className="text-xs text-blue-400 font-medium">
                  {is3D ? 'UMAP to 3D' : 'Mock 2D'}
                </span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-gray-400">Source:</span>
                <span className="text-xs text-blue-400 font-medium">
                  {isUsingDummyData ? 'Demo' : 'Real'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Visualization Panel */}
        <div className="lg:col-span-2 min-h-0">
          <div className="neuro-card-inset p-6 h-full rounded-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>All Documents</span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {is3D ? `${plotData3D.reduce((total, trace) => total + trace.x.length, 0)} chunks` : `${projectedData.length} chunks`}
              </div>
            </div>
            
            {is3D ? (
              <EmbeddingVisualization3D
                plotData3D={plotData3D}
                onPointClick={handlePointClick}
              />
            ) : (
              <EmbeddingVisualization2D
                projectedData={projectedData}
                selectedChunk={selectedChunk}
                hoveredPoint={hoveredPoint}
                onPointClick={handlePointClick}
                onPointHover={handlePointHover}
                onPointLeave={() => setHoveredPoint(null)}
                isTransitioning={isTransitioning}
              />
            )}
            
            {/* Instructions */}
            <div className="text-center mt-4 flex-shrink-0">
              <p className="text-xs text-gray-500">
                💡 {is3D ? 'Hover over points to see snippets • Click to view details • Use mouse to zoom/pan' : 'Click points to view details • Hover for quick preview'}
              </p>
              {selectedChunk && (
                <div className="mt-2 inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-blue-300">Chunk selected</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-1 min-h-0">
          <div className="neuro-card-inset p-6 h-full flex flex-col rounded-2xl overflow-hidden">
            <h3 className="text-lg font-semibold mb-4 flex-shrink-0">Chunk Details</h3>
            
            <ChunkDetailsPanel
              selectedChunk={selectedChunk}
              onClearSelection={() => setSelectedChunk(null)}
              is3D={is3D}
              vectorDimensions={vectorDimensions}
            />
          </div>
        </div>
      </div>
    </div>
  )
} 