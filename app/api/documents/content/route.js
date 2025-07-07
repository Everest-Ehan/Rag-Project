import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const fileName = searchParams.get('fileName')
    const useSupabase = searchParams.get('useSupabase') === 'true'

    if (!clientId || !fileName) {
      return NextResponse.json({ error: 'Client ID and file name are required' }, { status: 400 })
    }

    let content = ''

    if (useSupabase) {
      // Get document from Supabase database first to get the file path
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )

      // Get document metadata
      const { data: document, error: dbError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', clientId)
        .eq('filename', fileName)
        .single()

      console.log('Document lookup result:', { document, dbError, clientId, fileName })

      if (dbError || !document) {
        console.error('Document not found in database:', { dbError, clientId, fileName })
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }

      // Download file from Supabase storage
      console.log('Attempting to download file from path:', document.file_path)
      
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('documents')
        .download(document.file_path)

      console.log('Download result:', { hasData: !!fileData, downloadError })

      if (downloadError) {
        console.error('Error downloading file:', downloadError)
        return NextResponse.json({ error: 'Failed to download file' }, { status: 500 })
      }

      // Convert to text
      content = await fileData.text()
      console.log('Content length:', content.length)

    } else {
      // Get document from local file system
      try {
        const filePath = join(process.cwd(), 'client_data', clientId, 'docs', fileName)
        content = await readFile(filePath, 'utf-8')
      } catch (error) {
        console.error('Error reading local file:', error)
        return NextResponse.json({ error: 'Document not found' }, { status: 404 })
      }
    }

    return NextResponse.json({
      content,
      fileName,
      clientId,
      source: useSupabase ? 'supabase' : 'local'
    })

  } catch (error) {
    console.error('Document content API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 