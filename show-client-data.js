#!/usr/bin/env node
/**
 * Utility to show client data structure
 * Run: node show-client-data.js [client_id]
 */

const fs = require('fs');
const path = require('path');

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function showClientData(clientId = null) {
  const clientDataDir = path.join(process.cwd(), 'client_data');
  
  console.log('📁 Client Data Structure');
  console.log('========================');
  
  if (!fs.existsSync(clientDataDir)) {
    console.log('❌ No client_data directory found');
    console.log('💡 Upload some files first to create the structure');
    return;
  }

  const clients = fs.readdirSync(clientDataDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  if (clients.length === 0) {
    console.log('📂 client_data/ (empty)');
    console.log('💡 No clients found. Upload files to create client folders.');
    return;
  }

  console.log(`📂 client_data/ (${clients.length} clients)`);

  clients.forEach(client => {
    if (clientId && client !== clientId) return;
    
    console.log(`├── 👤 ${client}/`);
    
    const clientDir = path.join(clientDataDir, client);
    const docsDir = path.join(clientDir, 'docs');
    const chromaDir = path.join(clientDir, 'chroma_db');
    
    // Show docs
    if (fs.existsSync(docsDir)) {
      const files = fs.readdirSync(docsDir);
      console.log(`│   ├── 📄 docs/ (${files.length} files)`);
      
      files.forEach((file, index) => {
        const filePath = path.join(docsDir, file);
        const stats = fs.statSync(filePath);
        const isLast = index === files.length - 1;
        const prefix = isLast ? '│   │   └──' : '│   │   ├──';
        console.log(`${prefix} ${file} (${formatFileSize(stats.size)})`);
      });
    } else {
      console.log('│   ├── 📄 docs/ (not created)');
    }
    
    // Show chroma_db
    if (fs.existsSync(chromaDir)) {
      console.log('│   └── 🔍 chroma_db/ (vector store)');
    } else {
      console.log('│   └── 🔍 chroma_db/ (not created)');
    }
    
    console.log('│');
  });
  
  console.log('\n📊 Summary:');
  console.log(`   Clients: ${clients.length}`);
  
  let totalFiles = 0;
  let totalSize = 0;
  
  clients.forEach(client => {
    const docsDir = path.join(clientDataDir, client, 'docs');
    if (fs.existsSync(docsDir)) {
      const files = fs.readdirSync(docsDir);
      totalFiles += files.length;
      
      files.forEach(file => {
        const stats = fs.statSync(path.join(docsDir, file));
        totalSize += stats.size;
      });
    }
  });
  
  console.log(`   Total files: ${totalFiles}`);
  console.log(`   Total size: ${formatFileSize(totalSize)}`);
}

// CLI usage
const clientId = process.argv[2];
if (clientId) {
  console.log(`🔍 Showing data for client: ${clientId}\n`);
}

showClientData(clientId); 