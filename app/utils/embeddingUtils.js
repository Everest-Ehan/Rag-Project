// Utility function to format real embedding data
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

// UMAP reduction function for 3D
export const reduceTo3D = async (vectors, nComponents = 3) => {
  try {
    if (typeof window === 'undefined') {
      throw new Error('UMAP requires browser environment')
    }
    
    const { UMAP } = await import('umap-js')
    const umap = new UMAP({
      nComponents: nComponents,
      nNeighbors: 15,
      minDist: 0.1,
      spread: 1.0,
      randomize: true
    })
    
    const embedding = await umap.fitAsync(vectors)
    return embedding.map(point => ({
      x: point[0],
      y: point[1],
      z: point[2]
    }))
  } catch (error) {
    console.warn('UMAP reduction failed, using mock data:', error)
    return vectors.map((vector, index) => {
      const cluster = Math.floor(index / 5) % 3
      const baseX = cluster * 10 + (vector[0] || Math.random()) * 5
      const baseY = cluster * 8 + (vector[1] || Math.random()) * 4
      const baseZ = cluster * 6 + (vector[2] || Math.random()) * 3
      
      return { 
        x: baseX + Math.random() * 2 - 1, 
        y: baseY + Math.random() * 2 - 1, 
        z: baseZ + Math.random() * 2 - 1 
      }
    })
  }
}

// Generate dummy embedding data
export const generateDummyEmbeddings = (documentId) => {
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

// Generate 2D projection from embeddings for all documents
export const projectEmbeddings = (allChunks, documentName, selectedDocument, documentOptions) => {
  // Group chunks by document
  const documentGroups = {}
  allChunks.forEach(chunk => {
    if (!documentGroups[chunk.documentName]) {
      documentGroups[chunk.documentName] = []
    }
    documentGroups[chunk.documentName].push(chunk)
  })
  
  const mockProjection = []
  const colors = ['#4a9eff', '#a855f7', '#10b981', '#f59e0b', '#ef4444']
  
  Object.entries(documentGroups).forEach(([docName, chunks], docIndex) => {
    // Create different base positions for each document
    const baseX = docIndex * 50 - 50
    const baseY = docIndex * 30 - 30
    
    chunks.forEach((chunk, chunkIndex) => {
      mockProjection.push({
        ...chunk,
        x: baseX + (Math.random() - 0.5) * 40 + chunkIndex * 2,
        y: baseY + (Math.random() - 0.5) * 40 + Math.sin(chunkIndex) * 8,
        size: 6 + Math.random() * 3,
        color: colors[docIndex % colors.length]
      })
    })
  })
  
  return mockProjection
}

// Process 3D data
export const process3DData = async (allChunks, embeddingData, fetchedData) => {
  const vectors = allChunks.map(chunk => chunk.vector)
  const reduced3D = await reduceTo3D(vectors)

  const traces = []
  const colors = ['#4a9eff', '#a855f7', '#10b981', '#f59e0b', '#ef4444']
  
  const sourceData = embeddingData || fetchedData
  const documents = sourceData?.documents || [
    { name: 'Technical Documentation', chunks: allChunks.filter(c => c.documentName === 'Technical Documentation') },
    { name: 'Business Analysis Report', chunks: allChunks.filter(c => c.documentName === 'Business Analysis Report') },
    { name: 'Scientific Research Paper', chunks: allChunks.filter(c => c.documentName === 'Scientific Research Paper') }
  ]

  documents.forEach((doc, docIndex) => {
    const docChunks = allChunks.filter(chunk => chunk.documentName === doc.name)
    const docReduced = reduced3D.filter((_, index) => 
      allChunks[index].documentName === doc.name
    )

    if (docChunks.length > 0) {
      traces.push({
        x: docReduced.map(point => point.x),
        y: docReduced.map(point => point.y),
        z: docReduced.map(point => point.z),
        mode: 'markers',
        type: 'scatter3d',
        name: doc.name,
        marker: {
          size: 8,
          color: colors[docIndex % colors.length],
          opacity: 0.8,
          line: {
            color: '#ffffff',
            width: 1
          }
        },
        text: docChunks.map(chunk => chunk.text.substring(0, 80) + (chunk.text.length > 80 ? '...' : '')),
        hovertemplate: 
          // Document name as header, chunk number below, then space, then content
          "<span style='font-size:13px; font-weight:600; color:" + colors[docIndex % colors.length] + ";'>" + doc.name + "</span><br>" +
          "<span style='font-size:11px; color:#b0b0b0;'>Chunk <b>#%{customdata.chunkIndex}</b></span><br>" +
          "<span style='display:inline-block; height:8px;'></span><br>" +
          "<span style='font-size:12px; color:#e5e5e5;'>%{text}</span>" +
          "<extra></extra>",
        customdata: docChunks.map(chunk => ({
          id: chunk.id,
          text: chunk.text,
          documentName: chunk.documentName,
          chunkIndex: chunk.chunkIndex
        }))
      })
    }
  })

  return traces
}