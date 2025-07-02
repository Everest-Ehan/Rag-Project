const { ChromaClient } = require('chromadb');

async function testChromaConnection() {
  console.log('🔍 Testing ChromaDB connection...');
  
  try {
    // Initialize ChromaDB client
    const client = new ChromaClient({
      path: 'http://localhost:8000',
    });
    
    console.log('✅ Connected to ChromaDB at http://localhost:8000');
    
    // List collections
    console.log('\n📋 Listing collections...');
    const collections = await client.listCollections();
    
    if (collections.length === 0) {
      console.log('ℹ️  No collections found. This is normal if you haven\'t uploaded any documents yet.');
    } else {
      console.log(`📚 Found ${collections.length} collection(s):`);
      collections.forEach((col, index) => {
        console.log(`  ${index + 1}. ${col.name} (${col.metadata?.description || 'No description'})`);
      });
    }
    
    // Test creating a simple collection
    console.log('\n🧪 Testing collection creation...');
    const testCollectionName = 'test_connection_' + Date.now();
    
    try {
      const testCollection = await client.createCollection({
        name: testCollectionName,
        metadata: { description: 'Test collection for connectivity' }
      });
      console.log(`✅ Successfully created test collection: ${testCollectionName}`);
      
      // Clean up - delete the test collection
      await client.deleteCollection({ name: testCollectionName });
      console.log(`🧹 Cleaned up test collection: ${testCollectionName}`);
      
    } catch (createError) {
      console.log('⚠️  Could not create test collection (this might be normal):', createError.message);
    }
    
    console.log('\n🎉 ChromaDB connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Failed to connect to ChromaDB:', error.message);
    console.error('Full error:', error);
    
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure ChromaDB is running: chroma run --host localhost --port 8000');
    console.log('2. Check if port 8000 is available: netstat -an | findstr :8000');
    console.log('3. Try restarting ChromaDB');
    console.log('4. Check Windows Firewall settings');
  }
}

// Run the test
testChromaConnection(); 