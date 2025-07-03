import { OpenAIEmbeddings } from '@langchain/openai'
import { Chroma } from '@langchain/community/vectorstores/chroma'
import { ChromaClient } from 'chromadb'
import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(request) {
  try {
    const { messages, clientId } = await request.json()

    if (!clientId) {
      return new Response('Client ID is required', { status: 400 })
    }

    if (!messages || messages.length === 0) {
      return new Response('Messages are required', { status: 400 })
    }

    // Get the latest user message
    const userMessage = messages[messages.length - 1]
    if (userMessage.role !== 'user') {
      return new Response('Last message must be from user', { status: 400 })
    }

    const query = userMessage.content

    console.log(`Processing query for client ${clientId}: ${query}`)

    // Validate client ID
    if (!clientId || clientId.trim() === '') {
      return new Response('Client ID is required and cannot be empty', { status: 400 })
    }

    const validClientId = clientId.trim()

    // Initialize embeddings
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      return new Response('OpenAI API key not configured', { status: 500 })
    }

    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    })

    // Connect to Chroma vectorstore
    const collectionName = `client_${validClientId.replace(/[^a-zA-Z0-9]/g, '_')}`

    let vectorStore
    try {
      // Initialize ChromaDB client first
      const chromaClient = new ChromaClient({
        path: 'http://localhost:8000',
      })

      // Check if collection exists
      let collections
      try {
        collections = await chromaClient.listCollections()
        const collectionExists = collections.some(col => col.name === collectionName)
        
        if (!collectionExists) {
          return new Response(
            `No documents found for client '${validClientId}'. Please upload documents first.`,
            { status: 404 }
          )
        }
      } catch (listError) {
        console.error('Error listing collections:', listError)
        return new Response(
          'Failed to connect to ChromaDB. Make sure ChromaDB is running on localhost:8000',
          { status: 500 }
        )
      }

      // Connect to existing vectorstore
      vectorStore = new Chroma(embeddings, {
        collectionName: collectionName,
        url: 'http://localhost:8000',
      })
    } catch (error) {
      console.error('Error connecting to vectorstore:', error)
      return new Response(
        'Failed to connect to vectorstore. Make sure ChromaDB is running and you have uploaded documents.',
        { status: 500 }
      )
    }

    // Perform similarity search
    let relevantDocs
    try {
      console.log(`Searching for relevant documents in collection: ${collectionName}`)
      console.log(`Query: "${query}"`)
      
      // Try similarity search with basic parameters
      relevantDocs = await vectorStore.similaritySearch(query, 4)
      console.log(`Found ${relevantDocs.length} relevant documents`)
      
      if (relevantDocs.length === 0) {
        console.log('No relevant documents found for this query')
        // Continue anyway - let the AI respond that no relevant info was found
        relevantDocs = []
      }
    } catch (error) {
      console.error('Error performing similarity search:', error)
      console.error('Error details:', error.message)
      
      // Try to provide more specific error information
      if (error.message.includes('Invalid where clause')) {
        return new Response(
          'ChromaDB query error. This might be due to collection metadata issues. Try re-uploading your documents.',
          { status: 500 }
        )
      }
      
      return new Response(
        'Failed to search documents. Please make sure you have uploaded documents for this client and ChromaDB is running properly.',
        { status: 500 }
      )
    }

    // Build context from retrieved documents
    const context = relevantDocs
      .map((doc, index) => {
        const filename = doc.metadata.filename || 'Unknown file'
        return `[Document ${index + 1} - ${filename}]:\n${doc.pageContent}`
      })
      .join('\n\n')

    // Build conversation history for context
    const conversationHistory = messages
      .slice(0, -1) // Exclude the latest message as we'll include it separately
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n')

    // Create the system prompt with context
    const systemPrompt = `You are a helpful AI assistant that answers questions based on the provided documents. Use the following context to answer the user's question. If the answer cannot be found in the context, say so clearly.

Context from documents:
${context}

Previous conversation:
${conversationHistory}

Instructions:
- Answer based primarily on the provided context
- Be specific and cite information from the documents when possible
- If the context doesn't contain enough information to answer the question, explain what's missing
- Keep your answers concise but comprehensive`

    // Prepare messages for OpenAI
    const openaiMessages = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: query,
      },
    ]

    console.log('Sending request to OpenAI...')

    // Create streaming response using modern Vercel AI SDK
    const result = streamText({
      model: openai('gpt-3.5-turbo'),
      messages: openaiMessages,
      temperature: 0.7,
      maxTokens: 1000,
    })

    // Return streaming response
    return result.toAIStreamResponse()
  } catch (error) {
    console.error('Query API error:', error)
    return new Response('Internal server error', { status: 500 })
  }
} 