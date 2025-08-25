# Airtable Image Integration Setup Guide

This guide will help you set up and troubleshoot the Airtable image integration for your product management system.

## 🚀 Quick Setup

### 1. Get Your Airtable API Key

1. Go to [Airtable.com](https://airtable.com) and sign in
2. Navigate to your account settings: https://airtable.com/account
3. Scroll down to "API" section
4. Click "Generate API key"
5. Copy the generated key (starts with `key...`)

### 2. Find Your Base ID

1. Open your Airtable base in the browser
2. Look at the URL: `https://airtable.com/appXXXXXXXXXXXXXX/...`
3. The Base ID is the part after `/app/` and before the next `/`
4. Example: `https://airtable.com/appABC123DEF456/...` → Base ID is `ABC123DEF456`

### 3. Configure in the App

1. Go to the **Airtable Image Manager** in your app
2. Fill in the configuration:
   - **API Key**: Your Airtable API key
   - **Base ID**: Your Airtable base ID
   - **Products Table**: The name of your table containing SKU data (e.g., `sku`)
   - **Image Field**: The field name containing images (e.g., `image1`)
   - **SKU Field**: The field name containing SKU codes (e.g., `sku`)
   - **Name Field**: The field name containing product names (optional)

### 4. Test Connection

1. Click **"Test Connection"** to verify your setup
2. If successful, click **"Initialize & Load Images"**
3. Use **"Full Diagnostic"** for detailed analysis

## 🔧 Troubleshooting

### Common Issues

#### 403 Error - Access Denied
**Problem**: You're getting 403 errors when trying to access images.

**Solutions**:
1. **Check API Key Permissions**:
   - Go to your Airtable account settings
   - Ensure your API key has read access to the base
   - Try regenerating the API key

2. **Verify Base ID**:
   - Double-check the Base ID in the URL
   - Make sure you're using the correct base

3. **Check Table Name**:
   - Table names are case-sensitive
   - Verify the exact table name in Airtable

#### 410 Error - Resource Gone
**Problem**: Image URLs are returning 410 errors.

**Solutions**:
1. **Image URLs Expired**: Airtable image URLs can expire
   - Re-upload images in Airtable
   - Or refresh the image URLs in your base

2. **Invalid Image URLs**: 
   - Check if images are properly attached in Airtable
   - Ensure the image field contains valid attachments

#### No Images Found
**Problem**: Connection works but no images are loading.

**Solutions**:
1. **Check Field Names**:
   - Verify the Image Field name matches exactly
   - Check the SKU Field name
   - Ensure SKUs in Airtable match your database SKUs

2. **Check Data Structure**:
   - Ensure images are attached to the correct field
   - Verify SKUs are in the correct format
   - Check that records have the required fields

### Using the Diagnostic Tool

The **Full Diagnostic** button provides detailed information about:

1. **Connection Status**: Whether your API key and base are accessible
2. **Table Structure**: Available fields and sample records
3. **Image Analysis**: How many images are valid vs invalid
4. **Sample Data**: Examples of what's being found

### Debug Report Interpretation

The debug report will show:

```
📋 Airtable Diagnostic Report
==================================================

🔗 Connection Status:
Status: ✅ Success
Message: Connection successful
Details: {"recordCount": 150, "tableName": "sku", "baseId": "appABC123"}

📊 Table Information:
Record Count: 150
Fields: sku, Name, image1, brand, category

🖼️ Image Analysis:
Total Products: 150
Products with Images: 120
Total Images: 120
Valid Images: 95
Invalid Images: 25

📸 Sample Images:
1. SKU: SCRN-3-MA-NM-RBM-M
   Name: Screen Product
   Images: 1
   ✅ https://v5.airtableusercontent.com/...

💡 Recommendations:
✅ Connection is working properly
⚠️ Some image URLs appear to be invalid or expired
⚠️ Consider refreshing image URLs in Airtable
```

## 📋 Best Practices

### Airtable Setup
1. **Consistent Field Names**: Use consistent field names across your base
2. **SKU Format**: Ensure SKUs match exactly between Airtable and your database
3. **Image Quality**: Use appropriate image sizes (recommended: 800x800px max)
4. **Regular Updates**: Refresh image URLs periodically to avoid expiration

### Performance Tips
1. **Batch Loading**: The system loads images in batches for better performance
2. **Caching**: Images are cached locally to reduce API calls
3. **Validation**: Invalid image URLs are automatically filtered out
4. **Retry Logic**: Failed requests are retried automatically

## 🔄 API Limits

Airtable has rate limits:
- **5 requests per second** per base
- **100,000 requests per month** on free plans
- **1,000,000 requests per month** on paid plans

The system includes built-in rate limiting and retry logic to handle these limits gracefully.

## 🆘 Getting Help

If you're still having issues:

1. **Run the Full Diagnostic** and check the report
2. **Check the browser console** for detailed error messages
3. **Verify your Airtable setup** using the test tools
4. **Contact support** with the diagnostic report

## 📝 Example Airtable Structure

Your Airtable table should look like this:

| sku | Name | image1 | brand | category |
|-----|------|--------|-------|----------|
| SCRN-3-MA-NM-RBM-M | Screen Product | [Image Attachment] | Brand A | Screens |
| THW-N-FS-BL-XL | T-Shirt | [Image Attachment] | Brand B | Clothing |

**Key Points**:
- `sku` field contains the product SKU codes
- `image1` field contains image attachments
- `Name` field contains product names (optional)
- Images should be attached using Airtable's attachment field type
