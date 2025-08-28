const fs = require('fs');
const path = require('path');

// Simulate the complete flow from image generation to loading

// 1. Simulate what gets saved to the database
const mockSavedContent = {
  id: 'test-content-id',
  user_id: 'test-user-id',
  brand_id: null, // Can be null now
  content_type: 'image',
  platform: 'general',
  brief: 'AI Generated: Test Image',
  generated_content: 'A beautiful landscape with mountains',
  status: 'completed',
  metadata: {
    originalPrompt: 'Create a beautiful landscape',
    enhancedPrompt: 'Create a beautiful landscape, high quality, well-composed, professional',
    style: 'realistic',
    aspectRatio: '16:9',
    colorScheme: 'natural',
    brandElements: null,
    productName: null,
    additionalDetails: null,
    brandContextUsed: false,
    brandInfo: null,
    generationParams: {
      model: 'google/gemini-2.5-flash-image-preview:free',
      size: '1792x1024',
      quality: 'standard',
      style: 'natural'
    },
    image_url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    created_via: 'image_generator'
  },
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z'
};

console.log('=== TESTING COMPLETE IMAGE FLOW ===');

// 2. Simulate API transformation (what happens in /api/brand-content/route.ts)
console.log('\n1. API Transformation:');
const apiTransformedContent = {
  id: mockSavedContent.id,
  content_type: mockSavedContent.content_type,
  title: mockSavedContent.brief,
  text_content: mockSavedContent.generated_content,
  image_url: mockSavedContent.metadata?.image_url || null,
  image_data: mockSavedContent.metadata?.image_data || null,
  platform: mockSavedContent.platform,
  metadata: mockSavedContent.metadata,
  created_at: mockSavedContent.created_at,
  updated_at: mockSavedContent.updated_at,
  brand_name: null,
  status: mockSavedContent.status,
  quality_score: null
};

console.log('API transformed content:', JSON.stringify(apiTransformedContent, null, 2));
console.log('Image URL extracted:', apiTransformedContent.image_url);

// 3. Simulate frontend transformation (what happens in brand-content/page.tsx)
console.log('\n2. Frontend Transformation:');
const frontendFormattedContent = {
  text: apiTransformedContent.text_content || apiTransformedContent.title || 'Content',
  image: apiTransformedContent.image_url,
  platform: apiTransformedContent.platform || 'general',
  timestamp: new Date(apiTransformedContent.created_at).getTime(),
  id: apiTransformedContent.id,
  title: apiTransformedContent.title
};

console.log('Frontend formatted content:', JSON.stringify(frontendFormattedContent, null, 2));
console.log('Final image URL:', frontendFormattedContent.image);

// 4. Test the image display logic
console.log('\n3. Image Display Test:');
if (frontendFormattedContent.image) {
  console.log('✅ Image will be displayed');
  console.log('Image type:', typeof frontendFormattedContent.image);
  console.log('Image starts with:', frontendFormattedContent.image.substring(0, 50));
  console.log('Image length:', frontendFormattedContent.image.length);
  
  // Test if it's a valid data URL
  if (frontendFormattedContent.image.startsWith('data:image/')) {
    console.log('✅ Valid data URL format');
    
    // Extract base64 data
    const base64Match = frontendFormattedContent.image.match(/data:image\/([^;]+);base64,([^"\s]+)/i);
    if (base64Match) {
      const imageFormat = base64Match[1];
      const base64Data = base64Match[2];
      console.log('✅ Base64 data extracted successfully');
      console.log('Image format:', imageFormat);
      console.log('Base64 data length:', base64Data.length);
      
      // Test if we can decode it
      try {
        const buffer = Buffer.from(base64Data, 'base64');
        console.log('✅ Base64 data can be decoded to buffer');
        console.log('Buffer length:', buffer.length);
        
        // Save a test image
        const testImagePath = path.join(__dirname, 'test-flow-image.png');
        fs.writeFileSync(testImagePath, buffer);
        console.log('✅ Test image saved to:', testImagePath);
        
      } catch (error) {
        console.error('❌ Failed to decode base64 data:', error.message);
      }
    } else {
      console.error('❌ Failed to extract base64 data from data URL');
    }
  } else {
    console.log('⚠️ Not a data URL, might be a regular URL');
  }
} else {
  console.log('❌ No image URL found - this is the problem!');
}

console.log('\n=== FLOW TEST COMPLETE ===');
