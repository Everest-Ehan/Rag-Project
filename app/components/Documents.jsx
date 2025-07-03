"use client"

import { useState, useEffect } from 'react'

export default function Documents({ clientId }) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [showContentModal, setShowContentModal] = useState(false)
  const [documentContent, setDocumentContent] = useState('')
  const [contentLoading, setContentLoading] = useState(false)
  const [deletingDocument, setDeletingDocument] = useState(null)

  useEffect(() => {
    if (clientId) {
      loadDocuments()
    }
  }, [clientId, refreshTrigger])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showContentModal) {
      document.body.classList.add('no-scroll')
    } else {
      document.body.classList.remove('no-scroll')
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('no-scroll')
    }
  }, [showContentModal])

  const loadDocuments = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/documents?clientId=${clientId}`)
      const data = await response.json()
      
      if (response.ok) {
        setDocuments(data.documents || [])
      } else {
        console.error('Failed to fetch documents:', data.error)
        setDocuments([])
      }
    } catch (error) {
      console.error('Error loading documents:', error)
      setDocuments([])
    } finally {
      setLoading(false)
    }
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

  const handleViewContent = async (doc) => {
    setContentLoading(true)
    setShowContentModal(true)
    setSelectedDocument(doc)
    
    try {
      const response = await fetch(`/api/documents/content?clientId=${clientId}&fileName=${doc.name}`)
      const data = await response.json()
      
      if (response.ok) {
        setDocumentContent(data.content)
      } else {
        setDocumentContent('Error loading document content')
      }
    } catch (error) {
      console.error('Error loading document content:', error)
      setDocumentContent('Error loading document content')
    } finally {
      setContentLoading(false)
    }
  }

  const handleDeleteDocument = async (doc) => {
    if (!confirm(`Are you sure you want to delete "${doc.name}"?`)) {
      return
    }
    
    setDeletingDocument(doc.id)
    
    try {
      const response = await fetch(`/api/documents/delete?clientId=${clientId}&fileName=${doc.name}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      
      if (response.ok) {
        // Remove document from list
        setDocuments(prev => prev.filter(d => d.id !== doc.id))
        setSelectedDocument(null)
        setShowContentModal(false)
      } else {
        alert(`Error deleting document: ${data.error}`)
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('Error deleting document')
    } finally {
      setDeletingDocument(null)
    }
  }

  const handleMoreOptions = (e, doc) => {
    e.stopPropagation() // Prevent opening the details modal
    setSelectedDocument(doc)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-200">Documents</h2>
          <p className="text-sm text-gray-400">Manage your uploaded documents</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className="neuro-btn p-2"
            title="Refresh documents"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
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
                      <span>{doc.sizeFormatted}</span>
                      <span>•</span>
                      <span>{doc.uploadedAtFormatted}</span>
                      <span>•</span>
                      <span>{doc.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-blue-400">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-xs">Uploaded</span>
                  </div>
                  <button 
                    className="neuro-btn p-2"
                    onClick={(e) => handleMoreOptions(e, doc)}
                    title="More options"
                  >
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
                  <p className="text-sm text-gray-500">{selectedDocument.sizeFormatted}</p>
                </div>
              </div>
              <div className="neuro-card-inset p-4 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Upload Date:</span>
                  <span className="text-sm text-gray-200">{selectedDocument.uploadedAtFormatted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">File Type:</span>
                  <span className="text-sm text-gray-200">{selectedDocument.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Status:</span>
                  <span className="text-sm text-blue-400">Uploaded</span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button 
                  className="neuro-btn flex-1"
                  onClick={() => handleViewContent(selectedDocument)}
                >
                  View Content
                </button>
                <button 
                  className="neuro-btn flex-1"
                  onClick={() => handleDeleteDocument(selectedDocument)}
                  disabled={deletingDocument === selectedDocument.id}
                >
                  {deletingDocument === selectedDocument.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Content Modal */}
      {showContentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-hidden">
          <div className="neuro-card p-6 max-w-4xl w-full mx-4 h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-200">Document Content: {selectedDocument.name}</h3>
              <button
                onClick={() => {
                  setShowContentModal(false)
                  setDocumentContent('')
                }}
                className="neuro-btn p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 min-h-0">
              {contentLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <svg className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <p className="text-gray-400">Loading content...</p>
                  </div>
                </div>
              ) : (
                <div className="neuro-card-inset p-4 rounded-xl h-full overflow-y-auto">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                    {documentContent}
                  </pre>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700 flex-shrink-0">
              <div className="text-sm text-gray-400">
                Size: {selectedDocument.sizeFormatted} • Type: {selectedDocument.type}
              </div>
              <button
                onClick={() => {
                  setShowContentModal(false)
                  setDocumentContent('')
                }}
                className="neuro-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 