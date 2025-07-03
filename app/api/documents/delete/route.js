import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function DELETE(request) {
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

    // Delete the file
    fs.unlinkSync(filePath)
    
    return NextResponse.json({ success: true, message: 'Document deleted successfully' })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
} 