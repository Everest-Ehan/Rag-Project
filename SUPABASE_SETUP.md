# Supabase Setup Guide

This guide will help you set up Supabase for authentication and storage in your RAG application.

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - **Name**: Your project name
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
5. Wait for project creation (usually 2-3 minutes)

## 2. Get Your Project Keys

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **Anon Public Key** (starts with `eyJ`)
   - **Service Role Key** (starts with `eyJ`) - Keep this secret!

## 3. Configure Environment Variables

1. Copy `env.example` to `.env.local`:
   ```bash
   cp env.example .env.local
   ```

2. Fill in your Supabase credentials in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

## 4. Set Up Authentication

### Enable Email Authentication
1. Go to **Authentication** → **Settings** in your Supabase dashboard
2. Under **Auth Providers**, ensure **Email** is enabled
3. Configure your **Site URL** (e.g., `http://localhost:3000` for development)
4. Add your production URL to **Redirect URLs** when deploying

### Optional: Enable Social Login
1. In **Auth Providers**, enable providers like Google, GitHub, etc.
2. Follow the provider-specific setup instructions
3. Add the provider credentials

## 5. Set Up Storage

### Create Storage Buckets
1. Go to **Storage** in your Supabase dashboard
2. Create the following buckets:
   - `documents` - for uploaded documents
   - `avatars` - for user profile pictures
   - `uploads` - for temporary files

### Configure Storage Policies
For each bucket, set up Row Level Security (RLS) policies:

#### Documents Bucket Policy
```sql
-- Allow authenticated users to upload their own documents
CREATE POLICY "Users can upload their own documents" ON storage.objects
FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to view their own documents
CREATE POLICY "Users can view their own documents" ON storage.objects
FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own documents
CREATE POLICY "Users can delete their own documents" ON storage.objects
FOR DELETE USING (auth.uid()::text = (storage.foldername(name))[1]);
```

#### Avatars Bucket Policy
```sql
-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);

-- Allow everyone to view avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (auth.uid()::text = (storage.foldername(name))[1]);
```

## 6. Database Setup (Optional)

If you need custom tables for your RAG application:

### Create Documents Table
```sql
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policy for documents
CREATE POLICY "Users can only see their own documents" ON documents
FOR ALL USING (auth.uid() = user_id);
```

### Create Chunks Table (for embeddings)
```sql
CREATE TABLE chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536), -- Adjust dimension based on your embedding model
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;

-- Create policy for chunks
CREATE POLICY "Users can only see chunks from their documents" ON chunks
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM documents 
    WHERE documents.id = chunks.document_id 
    AND documents.user_id = auth.uid()
  )
);
```

## 7. Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try the authentication flow:
   - Sign up with a new account
   - Check your email for confirmation
   - Sign in with your credentials

3. Test file upload:
   - Upload a document
   - Check the Supabase storage dashboard

## 8. Production Deployment

1. Update your **Site URL** and **Redirect URLs** in Supabase Auth settings
2. Set up proper CORS policies if needed
3. Configure your production environment variables
4. Test all functionality in production

## Security Best Practices

1. **Never expose your service role key** in client-side code
2. Always use **Row Level Security (RLS)** for your tables
3. Set up proper **storage policies** for file access
4. Use **signed URLs** for private file access
5. Implement **rate limiting** for auth endpoints
6. Regular **security audits** of your policies

## Common Issues

### Authentication Issues
- Check your Site URL configuration
- Verify environment variables are correct
- Ensure email confirmation is handled properly

### Storage Issues
- Verify bucket policies are set up correctly
- Check file size limits (default 50MB)
- Ensure proper CORS configuration

### Database Issues
- Enable RLS on all tables
- Test policies thoroughly
- Use proper UUID references

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord Community](https://discord.supabase.com/)
- [GitHub Issues](https://github.com/supabase/supabase/issues) 