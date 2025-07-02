# Next.js RAG Chat Application

A full-stack RAG (Retrieval Augmented Generation) application built with Next.js, LangChain, ChromaDB, and OpenAI.

## Features

- **File Upload & Processing**: Upload `.txt` and `.md` files that are automatically chunked and embedded
- **Per-Client Data Isolation**: Each client's documents and vector stores are kept separate
- **Streaming Chat Interface**: Real-time chat responses using Vercel AI SDK
- **Vector Search**: Similarity search using ChromaDB for relevant context retrieval
- **RAG Implementation**: Combines retrieved context with OpenAI for accurate responses

## Prerequisites

1. **Node.js** (v18 or higher)
2. **ChromaDB** running locally
3. **OpenAI API Key**

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up ChromaDB

Install and run ChromaDB locally:

```bash
# Install ChromaDB
pip install chromadb

# Start ChromaDB server
chroma run --host localhost --port 8000
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# OpenAI API Key - Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# ChromaDB Configuration
CHROMA_URL=http://localhost:8000
```

### 4. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Usage

1. **Enter Client ID**: Start by entering a unique client ID
2. **Upload Documents**: Upload `.txt` or `.md` files using the file upload interface
3. **Chat**: Ask questions about your uploaded documents
4. **Multi-Client Support**: Switch between different client IDs to manage separate document collections

## API Routes

### `/api/upload`
- **Method**: POST
- **Purpose**: Upload and process documents
- **Parameters**:
  - `clientId`: Unique identifier for the client
  - `files`: Array of `.txt` or `.md` files
- **Process**:
  1. Saves files to `/client_data/<client_id>/docs/`
  2. Chunks documents using LangChain
  3. Creates embeddings using OpenAI
  4. Stores in ChromaDB collection

### `/api/query`
- **Method**: POST
- **Purpose**: Process chat queries with RAG
- **Parameters**:
  - `messages`: Chat message history
  - `clientId`: Client identifier
- **Process**:
  1. Performs similarity search on client's documents
  2. Retrieves relevant context
  3. Generates streaming response using OpenAI

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── upload/
│   │   │   └── route.ts        # File upload and processing
│   │   └── query/
│   │       └── route.ts        # RAG query handling
│   ├── components/
│   │   └── FileUpload.tsx      # File upload component
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main page with chat interface
├── client_data/                # Client data storage (auto-created)
│   └── <client_id>/
│       ├── docs/               # Original uploaded files
│       └── chroma_db/          # ChromaDB vector store
├── package.json
└── README.md
```

## Technologies Used

- **Next.js 14**: Full-stack React framework
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Vercel AI SDK**: Streaming chat interface
- **LangChain**: Document processing and text splitting
- **ChromaDB**: Vector database for embeddings
- **OpenAI**: Embeddings and chat completions

## Troubleshooting

### ChromaDB Connection Issues
- Ensure ChromaDB is running: `chroma run --host localhost --port 8000`
- Check that port 8000 is not in use by other applications

### OpenAI API Issues
- Verify your API key is valid and has sufficient credits
- Check that the key is properly set in `.env.local`

### File Upload Issues
- Ensure only `.txt` and `.md` files are uploaded
- Check file permissions in the `client_data` directory

## Development

To extend this application:

1. **Add New File Types**: Modify the file validation in `/api/upload`
2. **Customize Chunking**: Adjust the text splitter parameters
3. **Change Models**: Update the OpenAI model in `/api/query`
4. **Add Authentication**: Implement user authentication for client management
5. **Database Integration**: Replace file-based storage with a database

## License

MIT License 