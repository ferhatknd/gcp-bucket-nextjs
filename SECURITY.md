# Security Guide

## Authentication System

This application uses a simple but effective API key-based authentication system to protect against unauthorized access when deployed publicly.

### How Authentication Works

1. **Login Required**: Users must enter the correct API key to access the file browser
2. **Protected Routes**: Upload, delete, and rename operations require authentication
3. **Public Routes**: File browsing, search, and downloads are public (read-only)

### API Key Configuration

#### Environment Variables
```bash
# Both variables must have the same value
ADMIN_API_KEY=your-secure-api-key-here
NEXT_PUBLIC_ADMIN_API_KEY=your-secure-api-key-here
```

#### Generating a Secure API Key
```bash
# Generate a random 32-character key
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Or use openssl
openssl rand -hex 16
```

### Protected vs Public Operations

#### 🔒 Protected (Requires Authentication)
- File upload
- File/folder deletion  
- File/folder renaming
- Bulk indexing operations

#### 🌐 Public (No Authentication Required)
- Directory browsing
- File search
- File downloads
- Cache statistics

### Cloud Run Security Considerations

When deploying to Cloud Run:

1. **Set Environment Variables**:
   ```bash
   gcloud run services update gcp-bucket-nextjs \
     --set-env-vars ADMIN_API_KEY=your-secure-key \
     --set-env-vars NEXT_PUBLIC_ADMIN_API_KEY=your-secure-key
   ```

2. **Enable HTTPS**: Cloud Run provides HTTPS by default
3. **Restrict Access**: Consider using Cloud Run IAM if needed
4. **Monitor Logs**: Watch for suspicious access attempts

### Security Best Practices

- ✅ Use a strong, randomly generated API key (32+ characters)
- ✅ Never commit API keys to version control
- ✅ Rotate API keys periodically
- ✅ Monitor access logs for suspicious activity
- ✅ Use HTTPS in production (Cloud Run default)
- ✅ Consider IP allowlisting for additional security

### Troubleshooting

#### "Unauthorized" Error
- Check that both `ADMIN_API_KEY` and `NEXT_PUBLIC_ADMIN_API_KEY` have the same value
- Verify the key is correctly set in Cloud Run environment variables
- Ensure the key doesn't contain special characters that might be URL-encoded

#### Login Not Working
- Check browser console for errors
- Verify environment variables are properly loaded
- Restart the application after changing environment variables

### Security Limitations

This is a simple authentication system suitable for:
- Personal file management
- Small team access
- Internal tools

**Not suitable for**:
- Multi-user systems with different permissions
- Public-facing applications with user registration
- Applications requiring audit trails

For more advanced security needs, consider implementing OAuth, JWT tokens, or a proper user management system.