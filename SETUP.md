# 🚀 Quick Setup Guide

## Step 1: Install ChromaDB

### For Windows:
```bash
# Double-click or run:
install-chroma.bat
```

### For Mac/Linux:
```bash
# Run in terminal:
chmod +x install-chroma.sh
./install-chroma.sh
```

### Manual Installation:
```bash
pip install chromadb
```

## Step 2: Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_actual_openai_api_key_here
   CHROMA_URL=http://localhost:8000
   ```

## Step 3: Start ChromaDB Server

### For Windows:
```bash
# Double-click or run:
start-chroma.bat
```

### For Mac/Linux:
```bash
./start-chroma.sh
```

### Manual Start:
```bash
chroma run --host localhost --port 8000
```

**Keep this terminal open!** ChromaDB needs to stay running.

## Step 4: Start Next.js App

Open a **new terminal** and run:
```bash
npm run dev
```

## Step 5: Test the Application

1. Go to: `http://localhost:3000`
2. Enter a client ID (e.g., "test-user")
3. Upload some `.txt` or `.md` files
4. Start chatting about your documents!

---

## ✅ Quick Checklist

- [ ] ChromaDB installed (`pip install chromadb`)
- [ ] ChromaDB server running on port 8000
- [ ] `.env.local` file created with OpenAI API key
- [ ] Next.js app running (`npm run dev`)
- [ ] Application accessible at `http://localhost:3000`

## 🔧 Troubleshooting

- **ChromaDB connection errors**: Make sure ChromaDB is running on port 8000
- **OpenAI API errors**: Check your API key in `.env.local`
- **File upload issues**: Only `.txt` and `.md` files are supported
- **Python not found**: Install Python 3.8+ from python.org

## 📁 What Gets Created

When you upload files, the app creates:
```
client_data/
└── <client_id>/
    ├── docs/           # Your original uploaded files (.txt, .md)
    └── chroma_db/      # Vector store directory (ChromaDB collections)
```

### 🔍 Managing Client Data

**View client data structure:**
```bash
node show-client-data.js              # Show all clients
node show-client-data.js my-client    # Show specific client
```

**Clean up client data:**
```bash
node clean-client-data.js             # Interactive cleanup
node clean-client-data.js my-client   # Delete specific client
```

**Example output:**
```
📁 Client Data Structure
========================
📂 client_data/ (2 clients)
├── 👤 test-user/
│   ├── 📄 docs/ (3 files)
│   │   ├── document1.txt (2.1 KB)
│   │   ├── notes.md (1.5 KB)
│   │   └── readme.txt (0.8 KB)
│   └── 🔍 chroma_db/ (vector store)
│
├── 👤 another-client/
│   ├── 📄 docs/ (1 files)
│   │   └── data.txt (5.2 KB)
│   └── 🔍 chroma_db/ (vector store)
``` 