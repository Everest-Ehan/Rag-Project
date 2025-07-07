import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const useSupabase = searchParams.get('useSupabase') === 'true'

    if (!clientId) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 })
    }

    const documents = []

    if (useSupabase) {
      // Get documents from Supabase database
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )

      const { data: dbDocuments, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', clientId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching documents from database:', error)
        return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
      }

      // Convert database records to document format
      documents.push(...dbDocuments.map(doc => ({
        id: doc.id,
        name: doc.filename,
        size: doc.file_size,
        type: doc.file_type,
        uploadDate: doc.upload_date || doc.created_at,
        path: doc.file_path,
        preview: doc.content,
        source: 'supabase'
      })))

    } else {
      // Get documents from local file system (for guest users)
      try {
        const clientDataDir = join(process.cwd(), 'client_data', clientId, 'docs')
        const files = await readdir(clientDataDir)
        
        for (const file of files) {
          if (file.endsWith('.txt') || file.endsWith('.md')) {
            const filePath = join(clientDataDir, file)
            const stats = await readFile(filePath, 'utf-8')
            
            documents.push({
              name: file,
              size: stats.length,
              type: file.split('.').pop(),
              uploadDate: new Date().toISOString(),
              path: filePath,
              preview: stats.substring(0, 200),
              source: 'local'
            })
          }
        }
      } catch (error) {
        // Directory might not exist for new users
        console.log('No local documents found for client:', clientId)
      }
    }

    return NextResponse.json({
      documents,
      count: documents.length,
      clientId
    })

  } catch (error) {
    console.error('Documents API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
} 