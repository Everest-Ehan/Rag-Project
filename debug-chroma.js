import { ChromaClient } from 'chromadb'

async function debugChroma() {
  const chromaClient = new ChromaClient({
    path: 'http://localhost:8000',
    apiVersion: 'v2'
  })

  try {
    // List all collections
    const collections = await chromaClient.listCollections()
    console.log('All collections:', collections)

    // Check the specific collection
    const collectionName = 'client_f6e2afad_5d02_4338_b0d9_ab34199bab58'
    
    if (collections.includes(collectionName)) {
      console.log(`Collection ${collectionName} exists`)
      
      // Get collection
      const collection = await chromaClient.getCollection({ name: collectionName })
      console.log('Collection object:', collection)
      
      // Get count
      const count = await collection.count()
      console.log('Document count:', count)
      
      // Get some documents
      const results = await collection.get()
      console.log('Documents in collection:', results)
      
    } else {
      console.log(`Collection ${collectionName} does not exist`)
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

debugChroma() 