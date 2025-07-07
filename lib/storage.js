import { supabase } from './supabase'

// Storage bucket names
export const STORAGE_BUCKETS = {
  DOCUMENTS: 'documents',
  AVATARS: 'avatars',
  UPLOADS: 'uploads'
}

// Upload file to storage
export const uploadFile = async (bucket, file, path, options = {}) => {
  try {
    console.log('Storage upload attempt:', {
      bucket,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      contentType: file.type,
      path,
      options
    })
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: options.upsert || false,
        contentType: file.type,
        ...options
      })

    console.log('Storage upload result:', { data, error })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Upload error:', error)
    return { data: null, error }
  }
}

// Download file from storage
export const downloadFile = async (bucket, path) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(path)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Download error:', error)
    return { data: null, error }
  }
}

// Get public URL for file
export const getPublicUrl = (bucket, path) => {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  
  return data.publicUrl
}

// Delete file from storage
export const deleteFile = async (bucket, paths) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove(Array.isArray(paths) ? paths : [paths])

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Delete error:', error)
    return { data: null, error }
  }
}

// List files in storage
export const listFiles = async (bucket, folder = '', options = {}) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(folder, {
        limit: options.limit || 100,
        offset: options.offset || 0,
        sortBy: options.sortBy || { column: 'name', order: 'asc' }
      })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('List files error:', error)
    return { data: null, error }
  }
}

// Create signed URL for private files
export const createSignedUrl = async (bucket, path, expiresIn = 3600) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn)

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Signed URL error:', error)
    return { data: null, error }
  }
}

// Helper function to generate unique file names
export const generateFileName = (originalName, userId) => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const extension = originalName.split('.').pop()
  return `${userId}/${timestamp}_${randomString}.${extension}`
} 