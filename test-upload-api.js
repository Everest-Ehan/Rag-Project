const fs = require('fs');
const path = require('path');

async function testUploadAPI() {
  console.log('🔍 Testing upload API...');
  
  // Create a test file
  const testContent = 'This is a test document for the RAG system. It contains some sample text to verify the upload functionality.';
  const testFilePath = path.join(__dirname, 'test-document.txt');
  
  try {
    // Write test file
    fs.writeFileSync(testFilePath, testContent);
    console.log('✅ Created test file:', testFilePath);
    
    // Create form data
    const FormData = require('form-data');
    const form = new FormData();
    
    form.append('clientId', 'test-client-123');
    form.append('files', fs.createReadStream(testFilePath));
    
    console.log('📤 Sending request to upload API...');
    
    // Make request to upload API
    const response = await fetch('http://localhost:3001/api/upload', {
      method: 'POST',
      body: form,
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Upload API test successful!');
      console.log('Response:', result);
    } else {
      console.log('❌ Upload API test failed');
      console.log('Status:', response.status);
      console.log('Response:', result);
    }
    
  } catch (error) {
    console.error('❌ Error testing upload API:', error.message);
  } finally {
    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
      console.log('🧹 Cleaned up test file');
    }
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('⚠️  Fetch not available. Install node-fetch or use Node.js 18+');
  console.log('npm install node-fetch');
  process.exit(1);
}

testUploadAPI(); 