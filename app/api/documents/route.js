import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 })
    }

    const clientDir = path.join(process.cwd(), 'client_data', clientId, 'docs')
    
    // Check if client directory exists
    if (!fs.existsSync(clientDir)) {
      return NextResponse.json({ documents: [] })
    }

    // Read all files in the client directory
    const files = fs.readdirSync(clientDir)
    const documents = []

    for (const file of files) {
      const filePath = path.join(clientDir, file)
      const stats = fs.statSync(filePath)
      
      // Only include files (not directories)
      if (stats.isFile()) {
        const fileExtension = path.extname(file).toLowerCase()
        
        // Only include .txt and .md files
        if (fileExtension === '.txt' || fileExtension === '.md') {
          documents.push({
            id: file,
            name: file,
            size: stats.size,
            sizeFormatted: formatFileSize(stats.size),
            type: fileExtension === '.txt' ? 'text' : 'markdown',
            uploadedAt: stats.mtime,
            uploadedAtFormatted: stats.mtime.toLocaleDateString()
          })
        }
      }
    }

    // Sort documents by upload date (newest first)
    documents.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
} 