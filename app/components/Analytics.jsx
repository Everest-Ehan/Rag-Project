"use client"

import { useState, useEffect } from 'react'

export default function Analytics({ clientId }) {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    if (clientId) {
      loadAnalytics()
    }
  }, [clientId, refreshTrigger])

  const loadAnalytics = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/analytics?clientId=${clientId}`)
      const data = await response.json()
      
      if (response.ok) {
        setAnalytics(data.analytics)
      } else {
        setError(data.error || 'Failed to load analytics')
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
      setError('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const getFileTypeIcon = (type) => {
    if (type === 'markdown') {
      return (
        <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    }
    return (
      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-200">Analytics</h2>
          <p className="text-sm text-gray-400">Usage statistics and insights for your client</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="neuro-card p-6 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 neuro-card-inset rounded-xl bg-gray-700"></div>
                <div className="space-y-2">
                  <div className="h-6 bg-gray-700 rounded w-16"></div>
                  <div className="h-4 bg-gray-700 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-200">Analytics</h2>
          <p className="text-sm text-gray-400">Usage statistics and insights for your client</p>
        </div>
        <div className="neuro-card p-8 flex flex-col items-center justify-center">
          <svg className="w-16 h-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-red-400 text-lg font-medium">Error loading analytics</div>
          <p className="text-gray-500 text-sm mt-2">{error}</p>
          <button 
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className="neuro-btn mt-4"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const stats = [
    { 
      label: 'Documents Uploaded', 
      value: analytics?.documentsUploaded || 0, 
      icon: (
        <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ) 
    },
    { 
      label: 'Chunks Created', 
      value: analytics?.totalChunks || 0, 
      icon: (
      <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
      ) 
    },
    { 
      label: 'Total File Size', 
      value: analytics?.totalFileSizeFormatted || '0 Bytes', 
      icon: (
      <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      </svg>
      ) 
    },
    { 
      label: 'Avg File Size', 
      value: analytics?.averageFileSizeFormatted || '0 Bytes', 
      icon: (
      <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      ) 
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-semibold text-gray-200">Analytics</h2>
        <p className="text-sm text-gray-400">Usage statistics and insights for your client</p>
      </div>
        <button 
          onClick={() => setRefreshTrigger(prev => prev + 1)}
          className="neuro-btn p-2"
          title="Refresh analytics"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="neuro-card p-6 flex items-center space-x-4">
            <div className="w-12 h-12 neuro-card-inset rounded-xl flex items-center justify-center">
              {stat.icon}
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-200">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* File Type Distribution */}
      {analytics?.fileTypes && Object.keys(analytics.fileTypes).length > 0 && (
        <div className="neuro-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-200">File Type Distribution</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>By document type</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(analytics.fileTypes).map(([type, count]) => (
              <div key={type} className="neuro-card p-4 hover:neuro-card-inset transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 neuro-card-inset rounded-xl flex items-center justify-center">
                      {getFileTypeIcon(type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-300 capitalize">{type}</p>
                      <p className="text-xs text-gray-500">{count} {count === 1 ? 'file' : 'files'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-400">{count}</div>
                    <div className="text-xs text-gray-500">
                      {Math.round((count / analytics.documentsUploaded) * 100)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {analytics?.recentActivity && analytics.recentActivity.length > 0 && (
        <div className="neuro-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-200">Recent Uploads</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Last 10 uploads</span>
            </div>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="neuro-card p-4 hover:neuro-card-inset transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 neuro-card-inset rounded-xl flex items-center justify-center">
                      {getFileTypeIcon(activity.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-300 truncate">{activity.fileName}</p>
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span>{activity.uploadDateFormatted}</span>
                        <span>•</span>
                        <span>{activity.fileSizeFormatted}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="text-xs text-green-400 font-medium">Uploaded</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {analytics.recentActivity.length === 10 && (
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">Showing most recent uploads</p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {(!analytics || analytics.documentsUploaded === 0) && (
        <div className="neuro-card p-8 flex flex-col items-center justify-center">
        <svg className="w-16 h-16 text-blue-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
          <div className="text-gray-400 text-lg font-medium">No data available</div>
          <p className="text-gray-500 text-sm mt-2">Upload documents to see analytics</p>
      </div>
      )}
    </div>
  )
} 