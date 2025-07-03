'use client'

import { useState, useEffect } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

// Utility function to format real embedding data
// Use this when you have actual document embeddings from your RAG system
export const formatEmbeddingData = (documents) => {
  return {
    documents: documents.map(doc => ({
      id: doc.id || doc.filename || `doc-${Date.now()}`,
      name: doc.name || doc.filename || 'Untitled Document',
      chunks: doc.chunks.map((chunk, index) => ({
        id: chunk.id || `${doc.id}-chunk-${index}`,
        text: chunk.text || chunk.content || '',
        vector: chunk.vector || chunk.embedding || [],
        chunkIndex: index
      }))
    }))
  }
}

// Generate dummy embedding data (fallback when no real data is provided)
const generateDummyEmbeddings = (documentId) => {
  const documents = {
    'technical-doc': {
      name: 'Technical Documentation',
      chunks: [
        { id: 'chunk-1', text: 'Machine learning algorithms are computational methods that enable computers to learn patterns from data without being explicitly programmed for each specific task.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 0 },
        { id: 'chunk-2', text: 'Neural networks consist of interconnected nodes (neurons) that process information through weighted connections, mimicking the structure of biological neural networks.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 1 },
        { id: 'chunk-3', text: 'Deep learning is a subset of machine learning that uses neural networks with multiple layers to learn complex patterns in large datasets.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 2 },
        { id: 'chunk-4', text: 'Supervised learning algorithms learn from labeled training data to make predictions on new, unseen data points.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 3 },
        { id: 'chunk-5', text: 'Unsupervised learning discovers hidden patterns in data without using labeled examples or target variables.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 4 },
        { id: 'chunk-6', text: 'Reinforcement learning trains agents to make decisions by learning from rewards and punishments in an environment.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 5 },
        { id: 'chunk-7', text: 'Feature engineering involves selecting and transforming variables to improve model performance and interpretability.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 6 },
        { id: 'chunk-8', text: 'Cross-validation is a statistical technique used to assess how well a model generalizes to independent datasets.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 7 },
        { id: 'chunk-9', text: 'Overfitting occurs when a model learns the training data too well, failing to generalize to new examples.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 8 },
        { id: 'chunk-10', text: 'Regularization techniques prevent overfitting by adding penalties to complex models during training.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 9 },
      ]
    },
    'business-report': {
      name: 'Business Analysis Report',
      chunks: [
        { id: 'chunk-11', text: 'Market research indicates a growing demand for sustainable products across all demographic segments.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 0 },
        { id: 'chunk-12', text: 'Customer acquisition costs have increased by 15% year-over-year, requiring optimization of marketing strategies.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 1 },
        { id: 'chunk-13', text: 'Revenue growth in the enterprise segment outpaced consumer markets by 23% in the last quarter.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 2 },
        { id: 'chunk-14', text: 'Digital transformation initiatives have improved operational efficiency by 18% across all departments.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 3 },
        { id: 'chunk-15', text: 'Supply chain disruptions affected 12% of product deliveries, prompting diversification strategies.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 4 },
        { id: 'chunk-16', text: 'Employee satisfaction scores increased following the implementation of flexible work arrangements.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 5 },
        { id: 'chunk-17', text: 'Competitive analysis reveals opportunities for market expansion in emerging economies.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 6 },
        { id: 'chunk-18', text: 'Brand awareness campaigns resulted in a 28% increase in website traffic and engagement.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 7 },
        { id: 'chunk-19', text: 'Cost reduction initiatives saved $2.3M annually while maintaining service quality standards.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 8 },
        { id: 'chunk-20', text: 'Customer retention rates improved by 22% following the launch of the loyalty program.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 9 },
      ]
    },
    'research-paper': {
      name: 'Scientific Research Paper',
      chunks: [
        { id: 'chunk-21', text: 'Climate change has accelerated the melting of polar ice caps, contributing to rising sea levels globally.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 0 },
        { id: 'chunk-22', text: 'Renewable energy sources now account for 29% of global electricity generation, up from 18% in 2010.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 1 },
        { id: 'chunk-23', text: 'Biodiversity loss threatens ecosystem stability, with species extinction rates 1000x higher than natural levels.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 2 },
        { id: 'chunk-24', text: 'Carbon capture technologies show promise for reducing atmospheric CO2 concentrations.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 3 },
        { id: 'chunk-25', text: 'Ocean acidification affects marine ecosystems, particularly coral reefs and shellfish populations.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 4 },
        { id: 'chunk-26', text: 'Sustainable agriculture practices can reduce greenhouse gas emissions while maintaining crop yields.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 5 },
        { id: 'chunk-27', text: 'Urban heat islands contribute to increased energy consumption and public health challenges.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 6 },
        { id: 'chunk-28', text: 'Deforestation rates in tropical regions have slowed but remain a significant environmental concern.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 7 },
        { id: 'chunk-29', text: 'Green infrastructure solutions can mitigate urban flooding and improve air quality.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 8 },
        { id: 'chunk-30', text: 'International cooperation is essential for effective climate change mitigation strategies.', vector: Array.from({length: 128}, () => Math.random() * 2 - 1), chunkIndex: 9 },
      ]
    }
  }
  
  return documents[documentId] || documents['technical-doc']
}

// Custom tooltip component
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

// Props interface for dynamic data
// embeddingData: {
//   documents: [
//     {
//       id: string,
//       name: string,
//       chunks: [
//         {
//           id: string,
//           text: string,
//           vector: number[],
//           chunkIndex: number
//         }
//       ]
//     }
//   ]
// }

export default function EmbeddingVisualizer({ clientId, embeddingData = null }) {
  const [selectedDocument, setSelectedDocument] = useState('')
  const [embeddings, setEmbeddings] = useState([])
  const [projectedData, setProjectedData] = useState([])
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [documentOptions, setDocumentOptions] = useState([])
  const [vectorDimensions, setVectorDimensions] = useState(128)
  const [isUsingDummyData, setIsUsingDummyData] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fetchedData, setFetchedData] = useState(null)

  // Fetch embeddings from API
  const fetchEmbeddings = async (clientId) => {
    if (!clientId) return null
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/embeddings?clientId=${encodeURIComponent(clientId)}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          // No documents found - this is okay, we'll use dummy data
          return null
        }
        throw new Error(`API Error: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Fetched embeddings from API:', data)
      
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
      
      // If no embeddingData prop is provided, try to fetch from API
      if (!realData && clientId) {
        realData = await fetchEmbeddings(clientId)
        setFetchedData(realData) // Store fetched data
      }
      
      if (realData && realData.documents && realData.documents.length > 0) {
        // Use provided or fetched dynamic data
        setIsUsingDummyData(false)
        const options = realData.documents.map(doc => ({
          id: doc.id,
          name: doc.name
        }))
        setDocumentOptions(options)
        setSelectedDocument(options[0].id)
        
        // Set vector dimensions from statistics or first chunk
        if (realData.statistics?.vectorDimensions) {
          setVectorDimensions(realData.statistics.vectorDimensions)
        } else if (realData.documents[0].chunks[0]?.vector) {
          setVectorDimensions(realData.documents[0].chunks[0].vector.length)
        }
      } else {
        // Use dummy data
        setIsUsingDummyData(true)
        const dummyOptions = [
          { id: 'technical-doc', name: 'Technical Documentation' },
          { id: 'business-report', name: 'Business Analysis Report' },
          { id: 'research-paper', name: 'Scientific Research Paper' }
        ]
        setDocumentOptions(dummyOptions)
        setSelectedDocument('technical-doc')
        setVectorDimensions(128)
      }
    }
    
    processEmbeddingData()
  }, [embeddingData, clientId])

  // Generate 2D projection from embeddings
  const projectEmbeddings = (chunks, documentName) => {
    const mockProjection = chunks.map((chunk, index) => {
      // Create clusters based on document for better visualization
      const baseX = selectedDocument === (documentOptions[0]?.id || 'technical-doc') ? 0 : 
                   selectedDocument === (documentOptions[1]?.id || 'business-report') ? 30 : 60
      const baseY = selectedDocument === (documentOptions[0]?.id || 'technical-doc') ? 0 : 
                   selectedDocument === (documentOptions[1]?.id || 'business-report') ? 20 : 40
      
      return {
        ...chunk,
        documentName: documentName,
        x: baseX + (Math.random() - 0.5) * 40 + index * 3,
        y: baseY + (Math.random() - 0.5) * 40 + Math.sin(index) * 10,
        size: 6 + Math.random() * 3
      }
    })
    
    return mockProjection
  }

  useEffect(() => {
    if (!selectedDocument) return

    let data, documentName
    
    if (isUsingDummyData) {
      // Use dummy data
      data = generateDummyEmbeddings(selectedDocument)
      documentName = data.name
      setEmbeddings(data.chunks)
    } else {
      // Use dynamic data (either from props or fetched from API)
      const sourceData = embeddingData || fetchedData
      
      if (sourceData) {
        const selectedDoc = sourceData.documents.find(doc => doc.id === selectedDocument)
        if (selectedDoc) {
          documentName = selectedDoc.name
          setEmbeddings(selectedDoc.chunks)
          data = { chunks: selectedDoc.chunks }
        } else {
          return
        }
      } else {
        return
      }
    }
    
    setIsTransitioning(true)
    setTimeout(() => {
      const projected = projectEmbeddings(data.chunks, documentName)
      setProjectedData(projected)
      setIsTransitioning(false)
    }, 300)
  }, [selectedDocument, embeddingData, fetchedData, isUsingDummyData, documentOptions])

  const handlePointClick = (data) => {
    setSelectedPoint(data)
  }

  const handlePointHover = (data) => {
    setHoveredPoint(data?.id)
  }

  const getCurrentDocumentName = () => {
    if (isUsingDummyData) {
      const dummyDoc = generateDummyEmbeddings(selectedDocument)
      return dummyDoc.name
    } else {
      const selectedDoc = embeddingData?.documents?.find(doc => doc.id === selectedDocument)
      return selectedDoc?.name || 'Unknown Document'
    }
  }

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
      {/* Document Selector */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 flex-shrink-0">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-2 text-gray-300">
            Select Document
          </label>
          <select
            value={selectedDocument}
            onChange={(e) => setSelectedDocument(e.target.value)}
            className="neuro-input w-full"
          >
            {documentOptions.map(doc => (
              <option key={doc.id} value={doc.id} className="bg-gray-800">
                {doc.name}
              </option>
            ))}
          </select>
          {isUsingDummyData && (
            <p className="text-xs text-yellow-400 mt-1">
              Using demo data • Upload documents for real embeddings
            </p>
          )}
        </div>
        <div className="flex-1">
          <div className="text-sm text-gray-300 mb-2">Statistics</div>
          <div className="neuro-card-inset p-3 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Chunks:</span>
              <span className="text-xs text-blue-400 font-medium">{embeddings.length}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-400">Dimensions:</span>
              <span className="text-xs text-blue-400 font-medium">{vectorDimensions}</span>
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Scatter Plot */}
        <div className="lg:col-span-2 min-h-0">
          <div className="neuro-card-inset p-6 h-full rounded-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h3 className="text-lg font-semibold">2D Projection</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>{getCurrentDocumentName()}</span>
              </div>
            </div>
            
            <div className={`flex-1 min-h-0 transition-opacity duration-300 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
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
                    data={projectedData} 
                    onClick={handlePointClick}
                    onMouseEnter={handlePointHover}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {projectedData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          selectedPoint?.id === entry.id ? '#60a5fa' :
                          hoveredPoint === entry.id ? '#93c5fd' :
                          '#4a9eff'
                        }
                        opacity={
                          selectedPoint?.id === entry.id ? 1 :
                          hoveredPoint === entry.id ? 0.9 :
                          0.7
                        }
                        r={
                          selectedPoint?.id === entry.id ? entry.size * 1.5 :
                          hoveredPoint === entry.id ? entry.size * 1.2 :
                          entry.size
                        }
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Details Panel */}
        <div className="lg:col-span-1 min-h-0">
          <div className="neuro-card-inset p-6 h-full flex flex-col rounded-2xl overflow-hidden">
            <h3 className="text-lg font-semibold mb-4 flex-shrink-0">Chunk Details</h3>
            
            {selectedPoint ? (
              <div className="flex-1 min-h-0 overflow-y-auto">
                <div className="space-y-4">
                  <div className="neuro-card p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-blue-400 text-sm">
                        {selectedPoint.documentName}
                      </h4>
                      <span className="text-xs text-gray-400">
                        Chunk #{selectedPoint.chunkIndex}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {selectedPoint.text}
                    </p>
                  </div>
                  
                  <div className="neuro-card p-4 rounded-xl">
                    <h4 className="font-medium text-gray-300 mb-2 text-sm">Vector Info</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Position:</span>
                        <span className="text-blue-400">
                          ({selectedPoint.x.toFixed(1)}, {selectedPoint.y.toFixed(1)})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Magnitude:</span>
                        <span className="text-blue-400">
                          {Math.sqrt(selectedPoint.vector.reduce((sum, val) => sum + val * val, 0)).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Dimensions:</span>
                        <span className="text-blue-400">{selectedPoint.vector.length}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSelectedPoint(null)}
                    className="neuro-btn w-full py-2 text-sm"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 