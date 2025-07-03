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
    
    // Initialize analytics data
    let analytics = {
      documentsUploaded: 0,
      totalChunks: 0,
      totalFileSize: 0,
      fileTypes: {},
      uploadHistory: [],
      recentActivity: []
    }

    // Check if client directory exists
    if (fs.existsSync(clientDir)) {
      const files = fs.readdirSync(clientDir)
      
      for (const file of files) {
        const filePath = path.join(clientDir, file)
        const stats = fs.statSync(filePath)
        
        if (stats.isFile()) {
          const fileExtension = path.extname(file).toLowerCase()
          
          // Only count .txt and .md files
          if (fileExtension === '.txt' || fileExtension === '.md') {
            analytics.documentsUploaded++
            analytics.totalFileSize += stats.size
            
            // Count file types
            const type = fileExtension === '.txt' ? 'text' : 'markdown'
            analytics.fileTypes[type] = (analytics.fileTypes[type] || 0) + 1
            
            // Add to upload history
            analytics.uploadHistory.push({
              fileName: file,
              uploadDate: stats.mtime,
              fileSize: stats.size,
              fileType: type
            })
            
            // Estimate chunks (roughly 1 chunk per 500 characters)
            const content = fs.readFileSync(filePath, 'utf8')
            const estimatedChunks = Math.max(1, Math.ceil(content.length / 500))
            analytics.totalChunks += estimatedChunks
          }
        }
      }
      
      // Sort upload history by date (newest first)
      analytics.uploadHistory.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
      
      // Get recent activity (last 10 uploads)
      analytics.recentActivity = analytics.uploadHistory.slice(0, 10).map(item => ({
        ...item,
        uploadDateFormatted: item.uploadDate.toLocaleDateString(),
        fileSizeFormatted: formatFileSize(item.fileSize)
      }))
    }

    // Calculate additional metrics
    const totalFileSizeFormatted = formatFileSize(analytics.totalFileSize)
    const averageFileSize = analytics.documentsUploaded > 0 ? analytics.totalFileSize / analytics.documentsUploaded : 0
    const averageFileSizeFormatted = formatFileSize(averageFileSize)
    
    // Get most common file type
    const mostCommonType = Object.keys(analytics.fileTypes).reduce((a, b) => 
      analytics.fileTypes[a] > analytics.fileTypes[b] ? a : b, 'text'
    )

    return NextResponse.json({
      success: true,
      analytics: {
        ...analytics,
        totalFileSizeFormatted,
        averageFileSizeFormatted,
        mostCommonType,
        // Add summary stats for easy consumption
        summary: {
          documentsUploaded: analytics.documentsUploaded,
          totalChunks: analytics.totalChunks,
          totalFileSize: analytics.totalFileSize,
          totalFileSizeFormatted,
          averageFileSizeFormatted,
          mostCommonType
        }
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
} 