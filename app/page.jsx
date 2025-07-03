'use client'

import { useState } from 'react'
import { useChat } from 'ai/react'
import FileUpload from './components/FileUpload'
import Sidebar from './components/Sidebar'
import Documents from './components/Documents'
import Settings from './components/Settings'
import Analytics from './components/Analytics'
import EmbeddingVisualizer from './components/EmbeddingVisualizer'
import dotenv from 'dotenv'

export default function Home() {
  const [clientId, setClientId] = useState('')
  const [isClientIdSubmitted, setIsClientIdSubmitted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('dashboard')
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/query',
    body: {
      clientId: clientId,
    },
  })
  dotenv.config()
  console.log("process.env.OPENAI_API_KEY", process.env.OPENAI_API_KEY)
  console.log("process.env.NEXT_PUBLIC_OPENAI_API_KEY", process.env.NEXT_PUBLIC_OPENAI_API_KEY)



  if (!isClientIdSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="neuro-card p-8 space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto neuro-card-inset rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold gradient-text">
                RAG Chat AI
              </h1>
              <p className="text-gray-400 text-sm">
                Intelligent document conversations powered by AI
              </p>
            </div>
            
            <form className="space-y-6" onSubmit={(e) => {
              e.preventDefault()
              if (clientId.trim()) {
                // Form is valid, proceed to main interface
                setIsClientIdSubmitted(true)
              } else {
                alert('Please enter a client ID')
              }
            }}>
              <div>
                <label htmlFor="clientId" className="block text-sm font-medium mb-3 text-gray-300">
                  Client ID
                </label>
                <input
                  id="clientId"
                  name="clientId"
                  type="text"
                  required
                  className="neuro-input"
                  placeholder="Enter your unique identifier"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                />
              </div>
              
              <button
                type="submit"
                className="neuro-btn neuro-btn-primary w-full"
              >
                Enter Chat
              </button>
            </form>
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Upload documents • Ask questions • Get AI answers
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        clientId={clientId}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        onClientChange={() => {
          setClientId('')
          setIsClientIdSubmitted(false)
        }}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="neuro-card-inset p-4 m-4 mb-0 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="neuro-btn p-2 lg:hidden"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold">
                  {activeSection === 'dashboard' && 'AI Assistant'}
                  {activeSection === 'documents' && 'Document Manager'}
                  {activeSection === 'embedding-visualizer' && 'Embedding Visualizer'}
                  {activeSection === 'analytics' && 'Analytics Dashboard'}
                  {activeSection === 'settings' && 'Settings'}
                </h1>
                <p className="text-sm text-gray-400">Client: <span className="text-blue-400">{clientId}</span></p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Connected</span>
              </div>
              <button
                onClick={() => {
                  setClientId('')
                  setIsClientIdSubmitted(false)
                }}
                className="neuro-btn px-4 py-2 text-sm"
              >
                Change Client
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 p-4">
          {activeSection === 'dashboard' && (
            <div className="flex flex-col lg:flex-row gap-4 h-full">
              {/* Upload Section */}
              <div className="lg:w-1/3">
                <div className="neuro-card p-6 h-full">
                  <FileUpload clientId={clientId} />
                </div>
              </div>

              {/* Chat Section */}
              <div className="lg:w-2/3 flex flex-col">
                <div className="neuro-card flex-1 flex flex-col">
                  {/* Chat Messages */}
                  <div className="flex-1 p-6 overflow-hidden">
                    <div className="h-full overflow-y-auto space-y-4 pr-2">
                      {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center space-y-4">
                            <div className="w-20 h-20 mx-auto neuro-card-inset rounded-2xl flex items-center justify-center">
                              <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-gray-400 text-lg font-medium">Ready to chat!</p>
                              <p className="text-gray-500 text-sm">Upload documents and start asking questions</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`rounded-2xl px-4 py-3 ${
                                message.role === 'user'
                                  ? 'message-user'
                                  : 'message-assistant'
                              }`}
                            >
                              {message.content}
                            </div>
                          </div>
                        ))
                      )}
                      
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="message-assistant">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-75"></div>
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chat Input */}
                  <div className="p-6 border-t border-gray-700">
                    <form onSubmit={handleSubmit} className="flex space-x-3">
                      <input
                        className="neuro-input flex-1"
                        value={input}
                        placeholder="Ask me anything about your documents..."
                        onChange={handleInputChange}
                        disabled={isLoading}
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="neuro-btn neuro-btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'documents' && (
            <div className="neuro-card p-6 h-full">
              <Documents clientId={clientId} />
            </div>
          )}

          {activeSection === 'embedding-visualizer' && (
            <div className="neuro-card p-6 h-full">
              <EmbeddingVisualizer 
                clientId={clientId} 
                embeddingData={null}
              />
            </div>
          )}

          {activeSection === 'analytics' && (
            <div className="neuro-card p-6 h-full">
              <Analytics clientId={clientId} />
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="neuro-card p-6 h-full">
              <Settings clientId={clientId} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 