'use client'

import { useState } from 'react'

export default function FileUpload({ clientId }) {
  const [files, setFiles] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const handleFileChange = (e) => {
    setFiles(e.target.files)
    setUploadStatus('')
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFiles = e.dataTransfer.files
    setFiles(droppedFiles)
    setUploadStatus('')
  }

  const handleUpload = async () => {
    if (!files || files.length === 0) {
      setUploadStatus('Please select files to upload')
      return
    }

    setUploading(true)
    setUploadStatus('Uploading and processing files...')

    try {
      const formData = new FormData()
      formData.append('clientId', clientId)
      
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i])
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setUploadStatus(`Successfully processed ${result.processedFiles} files!`)
        setFiles(null)
        // Reset the file input
        const fileInput = document.getElementById('fileInput')
        if (fileInput) fileInput.value = ''
      } else {
        setUploadStatus(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const getStatusColor = () => {
    if (uploadStatus.includes('Error') || uploadStatus.includes('failed')) {
      return 'border-red-500 bg-red-500 bg-opacity-10 text-red-400'
    } else if (uploadStatus.includes('Successfully')) {
      return 'border-green-500 bg-green-500 bg-opacity-10 text-green-400'
    } else {
      return 'border-blue-500 bg-blue-500 bg-opacity-10 text-blue-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto neuro-card-inset rounded-xl flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-gray-200">
          Upload Documents
        </h2>
        <p className="text-sm text-gray-400">
          Upload .txt or .md files to build your knowledge base
        </p>
      </div>
      
      {/* Upload Area */}
      <div 
        className={`upload-area ${dragOver ? 'dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto neuro-card-inset rounded-2xl flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="fileInput" className="cursor-pointer">
              <span className="block text-sm font-medium text-gray-300 hover:text-blue-400 transition-colors">
                Click to select files or drag and drop
              </span>
              <span className="block text-xs text-gray-500 mt-1">
                Supports TXT and MD files
              </span>
            </label>
            <input
              id="fileInput"
              type="file"
              multiple
              accept=".txt,.md"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
      </div>
      
      {/* Selected Files */}
      {files && files.length > 0 && (
        <div className="neuro-card-inset p-4 rounded-xl">
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
            <svg className="w-4 h-4 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Selected Files ({files.length})
          </h3>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {Array.from(files).map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 neuro-card rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 neuro-card-inset rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-300 truncate max-w-40">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={!files || files.length === 0 || uploading}
        className="neuro-btn neuro-btn-primary w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Processing...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Upload & Process</span>
          </div>
        )}
      </button>
      
      {/* Status Message */}
      {uploadStatus && (
        <div className={`neuro-card-inset p-4 rounded-xl border ${getStatusColor()}`}>
          <div className="flex items-center space-x-2">
            {uploadStatus.includes('Successfully') ? (
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : uploadStatus.includes('Error') || uploadStatus.includes('failed') ? (
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-blue-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            <span className="text-sm font-medium">{uploadStatus}</span>
          </div>
        </div>
      )}
    </div>
  )
} 