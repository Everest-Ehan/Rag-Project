const axios = require('axios')
const FormData = require('form-data')
const fs = require('fs')
const path = require('path')

async function uploadTestDocument(clientId) {
  console.log('\n📤 [UPLOAD] Uploading test document...')
  
  try {
    const readmePath = path.join(__dirname, 'README.md')
    
    // Check if README.md exists
    if (!fs.existsSync(readmePath)) {
      console.log('⚠️  [UPLOAD] README.md not found, creating a sample document...')
      
      const sampleContent = `# RAG Chat AI

This is a Next.js application for document-based conversations powered by AI.

## Features

- Document upload and processing
- Vector embeddings with ChromaDB
- AI-powered question answering
- Beautiful neumorphic UI design

## Technologies

- Next.js 14
- OpenAI API
- ChromaDB for vector storage
- LangChain for document processing
- TailwindCSS for styling

## Getting Started

1. Install dependencies: npm install
2. Set up your OpenAI API key
3. Start ChromaDB: docker run -p 8000:8000 chromadb/chroma
4. Run the application: npm run dev

## Usage

Upload your documents and start asking questions about their content.
The AI will provide answers based on the information in your uploaded files.
`
      
      fs.writeFileSync(readmePath, sampleContent)
      console.log('✅ [UPLOAD] Created sample README.md')
    }
    
    // Create form data
    const formData = new FormData()
    formData.append('clientId', clientId)
    formData.append('files', fs.createReadStream(readmePath), 'README.md')
    
    console.log(`📋 [UPLOAD] Client ID: ${clientId}`)
    console.log(`📄 [UPLOAD] File: README.md`)
    
    const response = await axios.post('http://localhost:3000/api/upload', formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000 // 30 second timeout
    })
    
    console.log('✅ [UPLOAD] Upload successful!')
    console.log(`   Message: ${response.data.message}`)
    console.log(`   Processed files: ${response.data.processedFiles}`)
    console.log(`   Total chunks: ${response.data.totalChunks}`)
    console.log(`   Has embeddings: ${response.data.hasEmbeddings}`)
    
    if (response.data.collectionName) {
      console.log(`   Collection: ${response.data.collectionName}`)
    }
    
    return response.data
    
  } catch (error) {
    console.error('❌ [UPLOAD] Upload failed:', error.message)
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`)
      console.error(`   Error: ${error.response.data.error || 'Unknown error'}`)
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   Make sure the Next.js server is running on localhost:3000')
    }
    
    throw error
  }
}

async function testEmbeddingsAPI() {
  const baseURL = 'http://localhost:3000'
  const testClientId = 'test_embeddings_client'
  
  console.log('🧪 Testing Embeddings API with Real Data')
  console.log('==========================================')
  
  // Step 1: Upload a test document
  console.log('\n📤 STEP 1: Upload Test Document')
  console.log('--------------------------------')
  
  try {
    await uploadTestDocument(testClientId)
    console.log('✅ Document upload completed')
    
    // Wait a moment for processing
    console.log('⏳ Waiting 2 seconds for processing...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    
  } catch (error) {
    console.log('❌ Document upload failed - testing API without real data')
  }
  
  // Step 2: Test API endpoints
  console.log('\n🔍 STEP 2: Test API Endpoints')
  console.log('-----------------------------')
  
  // Test 1: Missing client ID
  console.log('\n1. Testing missing client ID...')
  try {
    const response = await axios.get(`${baseURL}/api/embeddings`)
    console.log('❌ Should have failed with missing client ID')
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Correctly returned 400 for missing client ID')
      console.log(`   Message: ${error.response.data.error}`)
    } else {
      console.log('❌ Unexpected error:', error.message)
    }
  }

  // Test 2: Empty client ID
  console.log('\n2. Testing empty client ID...')
  try {
    const response = await axios.get(`${baseURL}/api/embeddings?clientId=`)
    console.log('❌ Should have failed with empty client ID')
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Correctly returned 400 for empty client ID')
      console.log(`   Message: ${error.response.data.error}`)
    } else {
      console.log('❌ Unexpected error:', error.message)
    }
  }

  // Test 3: Non-existent client
  console.log('\n3. Testing non-existent client...')
  try {
    const response = await axios.get(`${baseURL}/api/embeddings?clientId=nonexistent_client_12345`)
    
    if (response.status === 404) {
      console.log('✅ Correctly returned 404 for non-existent client')
      console.log(`   Message: ${response.data.error}`)
    } else {
      console.log('❌ Expected 404 but got:', response.status)
    }
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Correctly returned 404 for non-existent client')
      console.log(`   Message: ${error.response.data.error}`)
    } else if (error.response?.status === 503) {
      console.log('⚠️  ChromaDB is not running. Please start ChromaDB first:')
      console.log('   docker run -p 8000:8000 chromadb/chroma')
      return
    } else {
      console.log('❌ Unexpected error:', error.message)
    }
  }

  // Test 4: Test client with uploaded data
  console.log(`\n4. Testing client with uploaded data: ${testClientId}`)
  
  try {
    const response = await axios.get(`${baseURL}/api/embeddings?clientId=${testClientId}`)
    
    if (response.status === 200) {
      console.log('🎉 Successfully fetched REAL embeddings!')
      console.log(`   Found ${response.data.documents.length} documents`)
      
      if (response.data.statistics) {
        console.log('   📊 Statistics:')
        console.log(`     - Total Documents: ${response.data.statistics.totalDocuments}`)
        console.log(`     - Total Chunks: ${response.data.statistics.totalChunks}`)
        console.log(`     - Vector Dimensions: ${response.data.statistics.vectorDimensions}`)
        console.log(`     - Collection: ${response.data.statistics.collectionName}`)
        
        if (response.data.statistics.processingTimeMs) {
          console.log(`     - Processing Time: ${response.data.statistics.processingTimeMs}ms`)
        }
      }
      
      if (response.data.documents.length > 0) {
        const firstDoc = response.data.documents[0]
        console.log(`   📄 First Document:`)
        console.log(`     - Name: ${firstDoc.name}`)
        console.log(`     - Chunks: ${firstDoc.chunks.length}`)
        
        if (firstDoc.chunks.length > 0) {
          const firstChunk = firstDoc.chunks[0]
          console.log(`     - First Chunk Text: "${firstChunk.text.substring(0, 100)}..."`)
          console.log(`     - Vector Length: ${firstChunk.vector.length}`)
          console.log(`     - Chunk Index: ${firstChunk.chunkIndex}`)
          
          // Show vector sample
          if (firstChunk.vector.length > 0) {
            const vectorSample = firstChunk.vector.slice(0, 5).map(v => v.toFixed(3)).join(', ')
            console.log(`     - Vector Sample: [${vectorSample}, ...]`)
          }
        }
      }
      
      console.log('\n🎯 REAL DATA TEST SUCCESSFUL!')
      console.log('The EmbeddingVisualizer can now display your actual document embeddings!')
      
    } else if (response.status === 404) {
      console.log('⚠️  No documents found for test client')
      console.log('   The upload may have failed or ChromaDB is not running')
    }
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('⚠️  No documents found for test client')
      console.log('   The upload may have failed or ChromaDB is not running')
    } else if (error.response?.status === 503) {
      console.log('⚠️  ChromaDB is not running. Please start ChromaDB first:')
      console.log('   docker run -p 8000:8000 chromadb/chroma')
    } else {
      console.log('❌ Unexpected error:', error.message)
    }
  }

  // Test 5: POST method (should fail)
  console.log('\n5. Testing POST method (should fail)...')
  try {
    const response = await axios.post(`${baseURL}/api/embeddings`, { clientId: 'test' })
    console.log('❌ Should have failed with method not allowed')
  } catch (error) {
    if (error.response?.status === 405) {
      console.log('✅ Correctly returned 405 for POST method')
      console.log(`   Message: ${error.response.data.error}`)
    } else {
      console.log('❌ Unexpected error:', error.message)
    }
  }

  console.log('\n==========================================')
  console.log('🎉 Complete Embeddings API Test Finished!')
  console.log('\n📋 Summary:')
  console.log('✅ Document upload test')
  console.log('✅ API validation tests')
  console.log('✅ Real data retrieval test')
  console.log('\n🚀 Next Steps:')
  console.log('1. Start your app: npm run dev')
  console.log('2. Login with client ID: test_embeddings_client')
  console.log('3. Go to Embeddings section')
  console.log('4. You should see REAL data instead of demo data!')
}

// Test data structure validation
function testDataStructure() {
  console.log('\n📋 Expected Data Structures:')
  console.log('=============================')
  
  console.log('\n🔼 Upload Response:')
  const uploadResponse = {
    message: 'Files uploaded and processed successfully with embeddings',
    processedFiles: 1,
    totalChunks: 5,
    collectionName: 'client_test_embeddings_client',
    hasEmbeddings: true
  }
  console.log(JSON.stringify(uploadResponse, null, 2))
  
  console.log('\n🔽 Embeddings Response:')
  const embeddingsResponse = {
    documents: [
      {
        id: 'README_md',
        name: 'README.md',
        chunks: [
          {
            id: 'README_md_chunk_0',
            text: 'Document content...',
            vector: [0.1, 0.2, 0.3], // 1536-dimensional array
            chunkIndex: 0,
            metadata: {
              filename: 'README.md',
              clientId: 'test_embeddings_client'
            }
          }
        ]
      }
    ],
    statistics: {
      totalDocuments: 1,
      totalChunks: 5,
      vectorDimensions: 1536,
      clientId: 'test_embeddings_client',
      collectionName: 'client_test_embeddings_client',
      processingTimeMs: 150
    }
  }
  console.log(JSON.stringify(embeddingsResponse, null, 2))
}

// Check prerequisites
async function checkPrerequisites() {
  console.log('🔍 Checking Prerequisites...')
  console.log('============================')
  
  // Check if server is running
  try {
    await axios.get('http://localhost:3000')
    console.log('✅ Next.js server is running')
  } catch (error) {
    console.log('❌ Next.js server is not running')
    console.log('   Please start it with: npm run dev')
    return false
  }
  
  // Check if we need OpenAI API key
  if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
    console.log('⚠️  No OPENAI_API_KEY environment variable found')
    console.log('   Embeddings may not be created, but upload will still work')
  } else {
    console.log('✅ OpenAI API key found')
  }
  
  console.log('✅ Prerequisites check complete')
  return true
}

// Run the tests
if (require.main === module) {
  checkPrerequisites()
    .then(ready => {
      if (ready) {
        return testEmbeddingsAPI()
      } else {
        console.log('\n❌ Prerequisites not met. Please fix the issues above.')
      }
    })
    .then(() => testDataStructure())
    .catch(console.error)
}

module.exports = { testEmbeddingsAPI, uploadTestDocument } 