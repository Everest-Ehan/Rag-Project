import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const fileName = searchParams.get('fileName')

    if (!clientId || !fileName) {
      return NextResponse.json({ error: 'Client ID and file name are required' }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), 'client_data', clientId, 'docs', fileName)
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Read file content
    const content = fs.readFileSync(filePath, 'utf8')
    
    return NextResponse.json({ 
      success: true, 
      content,
      fileName,
      fileSize: fs.statSync(filePath).size
    })
  } catch (error) {
    console.error('Error reading document content:', error)
    return NextResponse.json({ error: 'Failed to read document content' }, { status: 500 })
  }
} 