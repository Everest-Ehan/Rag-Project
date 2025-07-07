import { NextResponse } from 'next/server'
import { writeFile, mkdir, readFile } from 'fs/promises'
import { join } from 'path'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { OpenAIEmbeddings } from '@langchain/openai'
import { Chroma } from '@langchain/community/vectorstores/chroma'
import { Document } from 'langchain/document'
import { ChromaClient } from 'chromadb'
import { createClient } from '@supabase/supabase-js'

export async function POST(request) {
  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    
    // Log the content type for debugging
    const contentType = request.headers.get('content-type')
    console.log('Received request with Content-Type:', contentType)
    
    // Validate content type
    if (!contentType || (!contentType.includes('multipart/form-data') && !contentType.includes('application/x-www-form-urlencoded'))) {
      console.error('Invalid Content-Type:', contentType)
      return NextResponse.json(
        { error: 'Invalid Content-Type. Expected multipart/form-data or application/x-www-form-urlencoded' },
        { status: 400 }
      )
    }
    
    const formData = await request.formData()
    const clientId = formData.get('clientId')
    const useSupabaseStorage = formData.get('useSupabaseStorage') === 'true'
    const uploadedFilesJson = formData.get('uploadedFiles')
    const files = formData.getAll('files')

    if (!clientId || clientId.trim() === '') {
      return NextResponse.json({ error: 'Client ID is required and cannot be empty' }, { status: 400 })
    }

    // Validate client ID format
    const cleanClientId = clientId.trim()
    if (cleanClientId.length < 1 || cleanClientId.length > 50) {
      return NextResponse.json({ error: 'Client ID must be between 1 and 50 characters' }, { status: 400 })
    }

    // Use the cleaned client ID
    const validClientId = cleanClientId

    // Handle different upload scenarios
    let filesToProcess = []
    
    if (useSupabaseStorage && uploadedFilesJson) {
      // Authenticated users: files are already uploaded to Supabase
      try {
        const uploadedFiles = JSON.parse(uploadedFilesJson)
        filesToProcess = uploadedFiles
        console.log(`Processing ${uploadedFiles.length} files from Supabase storage for client ${validClientId}`)
      } catch (error) {
        console.error('Error parsing uploadedFiles JSON:', error)
        return NextResponse.json({ error: 'Invalid uploaded files data' }, { status: 400 })
      }
    } else if (files && files.length > 0) {
      // Guest users: files sent directly
      filesToProcess = files
      console.log(`Processing ${files.length} files directly for client ${validClientId}`)
    } else {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Validate file types
    const allowedTypes = ['.txt', '.md']
    for (const file of filesToProcess) {
      const fileName = file.name || file.filename
      const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'))
      if (!allowedTypes.includes(extension)) {
        return NextResponse.json(
          { error: `File type ${extension} not supported. Only .txt and .md files are allowed.` },
          { status: 400 }
        )
      }
    }

    // Create client directories
    const clientDataDir = join(process.cwd(), 'client_data', validClientId)
    const docsDir = join(clientDataDir, 'docs')
    const chromaDir = join(clientDataDir, 'chroma_db')

    await mkdir(docsDir, { recursive: true })
    await mkdir(chromaDir, { recursive: true })

    console.log(`Processing ${filesToProcess.length} files for client ${validClientId}`)

    // Save uploaded files
    const documents = []
    let processedFiles = 0

    for (const file of filesToProcess) {
      try {
        let fileContent = ''
        let fileName = ''
        let fileSize = 0

        if (useSupabaseStorage) {
          // For authenticated users: file is already in Supabase, we need to download it
          fileName = file.name
          fileSize = file.size
          
          try {
            // Download file from Supabase storage
            const { data, error } = await supabase.storage
              .from('documents')
              .download(file.path)
            
            if (error) {
              console.error(`Error downloading file ${file.path}:`, error)
              throw error
            }
            
            // Convert the downloaded data to text
            fileContent = await data.text()
            
            console.log(`Downloaded and processed Supabase file: ${fileName} (${file.path})`)
          } catch (downloadError) {
            console.error(`Failed to download file ${file.path}:`, downloadError)
            throw downloadError
          }
        } else {
          // For guest users: process the file directly
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
          
          fileName = file.name
          fileSize = file.size
        
        // Save file to disk
          const filePath = join(docsDir, fileName)
        await writeFile(filePath, buffer)
        
        // Read and process file content
          fileContent = await readFile(filePath, 'utf-8')
          
          console.log(`Processed local file: ${fileName}`)
        }
        
        // Create document with metadata
        const doc = new Document({
          pageContent: fileContent,
          metadata: {
            filename: fileName,
            clientId: validClientId,
            uploadDate: new Date().toISOString(),
            fileSize: fileSize,
            storagePath: useSupabaseStorage ? file.path : null,
          },
        })

        // Save file metadata to database if using Supabase storage
        if (useSupabaseStorage) {
          try {
                         const { error: dbError } = await supabase
               .from('documents')
               .insert({
                 user_id: validClientId, // Using clientId as user_id for now
                 filename: fileName,
                 file_path: file.path,
                 file_size: fileSize,
                 file_type: fileName.split('.').pop(),
                 content: fileContent.substring(0, 1000), // Store first 1000 chars as preview
                 upload_date: new Date().toISOString(),
                 metadata: {
                   storagePath: file.path,
                   uploadDate: new Date().toISOString(),
                   processed: true
                 }
               })
            
            if (dbError) {
              console.error('Error saving to database:', dbError)
            } else {
              console.log(`Saved file metadata to database: ${fileName}`)
            }
          } catch (dbError) {
            console.error('Database error:', dbError)
          }
        }
        
        documents.push(doc)
        processedFiles++
        
      } catch (error) {
        console.error(`Error processing file ${file.name || file.filename}:`, error)
        // Continue with other files even if one fails
      }
    }

    if (documents.length === 0) {
      return NextResponse.json({ error: 'No files could be processed' }, { status: 500 })
    }

    // Split documents into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    })

    console.log('Splitting documents into chunks...')
    const splitDocs = await textSplitter.splitDocuments(documents)
    console.log(`Created ${splitDocs.length} chunks from ${documents.length} documents`)

    // Initialize OpenAI embeddings (optional for upload)
    let embeddings = null
    if (process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      try {
        embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        })
        console.log('✅ OpenAI API key found - will create embeddings')
      } catch (error) {
        console.log('⚠️  Invalid OpenAI API key - will save documents without embeddings')
        console.error('API key error:', error.message)
      }
    } else {
      console.log('⚠️  No OpenAI API key - will save documents without embeddings')
    }

    // Initialize Chroma client and create/update collection
    const chromaClient = new ChromaClient({
      path: `http://localhost:8000`,
      apiVersion: 'v2'
    })

    const collectionName = `client_${validClientId.replace(/[^a-zA-Z0-9]/g, '_')}`

    try {
      // Try to delete existing collection to start fresh
      try {
        await chromaClient.deleteCollection({ name: collectionName })
        console.log(`Deleted existing collection: ${collectionName}`)
      } catch (error) {
        // Collection might not exist, which is fine
        console.log(`Collection ${collectionName} did not exist previously`)
      }

      if (embeddings) {
        // Create new collection and add documents with embeddings
        console.log('Creating Chroma vectorstore with embeddings...')
        try {
          const vectorStore = await Chroma.fromDocuments(splitDocs, embeddings, {
            collectionName: collectionName,
            url: 'http://localhost:8000',
            apiVersion: 'v2'
          })

          console.log(`Successfully created vectorstore with ${splitDocs.length} documents`)

          return NextResponse.json({
            message: 'Files uploaded and processed successfully with embeddings',
            processedFiles: processedFiles,
            totalChunks: splitDocs.length,
            collectionName: collectionName,
            hasEmbeddings: true,
          })
        } catch (embeddingError) {
          console.error('Error creating embeddings:', embeddingError)
          console.log('Falling back to saving documents without embeddings...')
          
          // Fall back to saving without embeddings
          const documentsPath = join(process.cwd(), 'client_data', validClientId, 'processed_docs.json')
          const docsData = splitDocs.map(doc => ({
            pageContent: doc.pageContent,
            metadata: doc.metadata
          }))
          
          await writeFile(documentsPath, JSON.stringify(docsData, null, 2))
          
          return NextResponse.json({
            message: 'Files uploaded and saved successfully (embedding creation failed - check your OpenAI API key)',
            processedFiles: processedFiles,
            totalChunks: splitDocs.length,
            hasEmbeddings: false,
            warning: 'Embedding creation failed - documents saved without AI search capability',
          })
        }
      } else {
        // Just save documents without embeddings
        console.log('Saving documents without embeddings...')
        
        // Save documents to disk for later processing
        const documentsPath = join(process.cwd(), 'client_data', validClientId, 'processed_docs.json')
        const docsData = splitDocs.map(doc => ({
          pageContent: doc.pageContent,
          metadata: doc.metadata
        }))
        
        await writeFile(documentsPath, JSON.stringify(docsData, null, 2))
        
        console.log(`Saved ${splitDocs.length} documents to disk`)

        return NextResponse.json({
          message: 'Files uploaded and saved successfully (no embeddings - add OpenAI API key to enable AI features)',
          processedFiles: processedFiles,
          totalChunks: splitDocs.length,
          hasEmbeddings: false,
        })
      }
    } catch (error) {
      console.error('Error processing documents:', error)
      if (embeddings) {
        return NextResponse.json(
          { error: 'Failed to create vectorstore. Make sure ChromaDB is running on localhost:8000' },
          { status: 500 }
        )
      } else {
        return NextResponse.json(
          { error: 'Failed to save documents. Please try again.' },
          { status: 500 }
        )
      }
    }
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 