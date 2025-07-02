import { NextResponse } from 'next/server'
import { writeFile, mkdir, readFile } from 'fs/promises'
import { join } from 'path'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { OpenAIEmbeddings } from '@langchain/openai'
import { Chroma } from '@langchain/community/vectorstores/chroma'
import { Document } from 'langchain/document'
import { ChromaClient } from 'chromadb'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const clientId = formData.get('clientId')
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

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Validate file types
    const allowedTypes = ['.txt', '.md']
    for (const file of files) {
      const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
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

    console.log(`Processing ${files.length} files for client ${validClientId}`)

    // Save uploaded files
    const documents = []
    let processedFiles = 0

    for (const file of files) {
      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Save file to disk
        const filePath = join(docsDir, file.name)
        await writeFile(filePath, buffer)
        
        // Read and process file content
        const fileContent = await readFile(filePath, 'utf-8')
        
        // Create document with metadata
        const doc = new Document({
          pageContent: fileContent,
          metadata: {
            filename: file.name,
            clientId: validClientId,
            uploadDate: new Date().toISOString(),
            fileSize: file.size,
          },
        })
        
        documents.push(doc)
        processedFiles++
        
        console.log(`Processed file: ${file.name}`)
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error)
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

    // Initialize OpenAI embeddings
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    })

    // Initialize Chroma client and create/update collection
    const chromaClient = new ChromaClient({
      path: `http://localhost:8000`,
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

      // Create new collection and add documents
      console.log('Creating Chroma vectorstore...')
      const vectorStore = await Chroma.fromDocuments(splitDocs, embeddings, {
        collectionName: collectionName,
        url: 'http://localhost:8000',
      })

      console.log(`Successfully created vectorstore with ${splitDocs.length} documents`)

      return NextResponse.json({
        message: 'Files uploaded and processed successfully',
        processedFiles: processedFiles,
        totalChunks: splitDocs.length,
        collectionName: collectionName,
      })
    } catch (error) {
      console.error('Error creating vectorstore:', error)
      return NextResponse.json(
        { error: 'Failed to create vectorstore. Make sure ChromaDB is running on localhost:8000' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 