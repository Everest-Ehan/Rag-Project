"use client"

import { useState, useEffect } from 'react'

export default function Documents({ clientId }) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDocument, setSelectedDocument] = useState(null)

  useEffect(() => {
    if (clientId) {
      loadDocuments()
    }
  }, [clientId])

  const loadDocuments = async () => {
    setLoading(true)
    // Mock data for now
    const mockDocuments = [
      { id: 1, name: 'maintenance.txt', size: '2.4 KB', uploadDate: '2024-07-02', type: 'txt', chunks: 16, hasEmbeddings: true },
      { id: 2, name: 'user_guide.md', size: '1.8 KB', uploadDate: '2024-07-01', type: 'md', chunks: 12, hasEmbeddings: false }
    ]
    setTimeout(() => {
      setDocuments(mockDocuments)
      setLoading(false)
    }, 800)
  }

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getFileIcon = (type) => {
    if (type === 'md') {
      return (
        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    }
    return (
      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-200">Documents</h2>
          <p className="text-sm text-gray-400">Manage your uploaded documents</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="neuro-card-inset px-4 py-2 rounded-xl">
            <span className="text-sm text-gray-300">{documents.length} documents</span>
          </div>
        </div>
      </div>
      <div className="relative">
        <input
          type="text"
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="neuro-input pl-10"
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="neuro-card p-4 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 neuro-card-inset rounded-xl bg-gray-700"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto neuro-card-inset rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-400 text-lg font-medium">No documents found</p>
          <p className="text-gray-500 text-sm">Upload some documents to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="neuro-card p-4 hover:neuro-card-inset transition-all duration-200 cursor-pointer"
              onClick={() => setSelectedDocument(doc)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 neuro-card-inset rounded-xl flex items-center justify-center">
                    {getFileIcon(doc.type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-200">{doc.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>{doc.uploadDate}</span>
                      <span>•</span>
                      <span>{doc.chunks} chunks</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {doc.hasEmbeddings ? (
                    <div className="flex items-center space-x-1 text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-xs">AI Ready</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-yellow-400">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-xs">No Embeddings</span>
                    </div>
                  )}
                  <button className="neuro-btn p-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="neuro-card p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-200">Document Details</h3>
              <button
                onClick={() => setSelectedDocument(null)}
                className="neuro-btn p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 neuro-card-inset rounded-xl flex items-center justify-center">
                  {getFileIcon(selectedDocument.type)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-200">{selectedDocument.name}</h4>
                  <p className="text-sm text-gray-500">{selectedDocument.size}</p>
                </div>
              </div>
              <div className="neuro-card-inset p-4 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Upload Date:</span>
                  <span className="text-sm text-gray-200">{selectedDocument.uploadDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Chunks:</span>
                  <span className="text-sm text-gray-200">{selectedDocument.chunks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">AI Status:</span>
                  <span className={`text-sm ${selectedDocument.hasEmbeddings ? 'text-green-400' : 'text-yellow-400'}`}>
                    {selectedDocument.hasEmbeddings ? 'Ready' : 'Needs Processing'}
                  </span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button className="neuro-btn flex-1">View Content</button>
                <button className="neuro-btn flex-1">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 