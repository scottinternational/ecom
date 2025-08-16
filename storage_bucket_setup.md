# Supabase Storage Bucket Setup Guide

## Creating the Storage Bucket

### Step 1: Access Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar

### Step 2: Create New Bucket
1. Click **"New bucket"** button
2. Configure the bucket with these settings:
   - **Name**: `product_suggestions`
   - **Public bucket**: ✅ **Enable** (for public access to images)
   - **File size limit**: `10MB`
   - **Allowed MIME types**: `image/*`

### Step 3: Configure Storage Policies

After creating the bucket, set up these policies in the **Policies** tab:

#### Policy 1: Upload Images
- **Name**: `Authenticated users can upload product suggestion images`
- **Operation**: `INSERT`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
(bucket_id = 'product_suggestions')
```

#### Policy 2: View Images
- **Name**: `Public access to product suggestion images`
- **Operation**: `SELECT`
- **Target roles**: `anon, authenticated`
- **Policy definition**:
```sql
(bucket_id = 'product_suggestions')
```

#### Policy 3: Delete Images
- **Name**: `Users can delete product suggestion images`
- **Operation**: `DELETE`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
(bucket_id = 'product_suggestions')
```

## Testing the Setup

### Test Image Upload
1. Go to your application's R&D page
2. Create a new product suggestion
3. Upload an image
4. Check if the image appears in the Supabase Storage bucket

### Verify Public Access
1. After uploading, copy the image URL from the database
2. Open the URL in a new browser tab
3. The image should load without authentication

## Troubleshooting

### Common Issues

1. **"Bucket not found" error**
   - Ensure the bucket name is exactly `product_suggestions`
   - Check that the bucket was created successfully

2. **"Permission denied" error**
   - Verify that the storage policies are configured correctly
   - Ensure the user is authenticated

3. **Images not loading**
   - Check that the bucket is set to public
   - Verify the image URLs are correct in the database

4. **File size too large**
   - Ensure uploaded files are under 10MB
   - Check the bucket's file size limit setting

## File Structure in Storage

Images will be stored with this structure:
```
product_suggestions/
├── product-suggestions/
│   ├── 1703123456789_0_image1.jpg
│   ├── 1703123456789_1_image2.png
│   └── 1703123456790_0_image3.jpg
```

## Security Considerations

- The bucket is public, so anyone with the URL can access images
- Consider implementing additional security if needed
- Images are automatically organized by timestamp and index
- File names include timestamps to prevent conflicts
