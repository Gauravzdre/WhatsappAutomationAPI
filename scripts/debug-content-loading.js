const fs = require('fs');
const path = require('path');

// Simulate the data transformation that happens in the API
function simulateContentTransformation(contentFromDB) {
  console.log('=== SIMULATING CONTENT TRANSFORMATION ===');
  console.log('Raw content from DB:', JSON.stringify(contentFromDB, null, 2));
  
  const transformedContent = contentFromDB.map(item => ({
    id: item.id,
    content_type: item.content_type,
    title: item.brief, // Use brief as title
    text_content: item.generated_content,
    image_url: item.metadata?.image_url || null, // Extract image_url from metadata
    image_data: item.metadata?.image_data || null, // Extract image_data from metadata
    platform: item.platform,
    metadata: item.metadata,
    created_at: item.created_at,
    updated_at: item.updated_at,
    brand_name: item.brands?.name,
    status: item.status,
    quality_score: item.quality_score
  }));
  
  console.log('Transformed content:', JSON.stringify(transformedContent, null, 2));
  
  // Simulate the frontend transformation
  const formattedContent = transformedContent.map((item) => ({
    text: item.text_content || item.title || 'Content',
    image: item.image_url,
    platform: item.platform || 'general',
    timestamp: new Date(item.created_at).getTime(),
    id: item.id,
    title: item.title
  }));
  
  console.log('Frontend formatted content:', JSON.stringify(formattedContent, null, 2));
  
  return formattedContent;
}

// Test with sample data that might be in the database
const sampleDBContent = [
  {
    id: 'test-id-1',
    content_type: 'image',
    brief: 'AI Generated: Test Image',
    generated_content: 'A beautiful landscape with mountains',
    platform: 'general',
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
    updated_at: '2024-01-01T00:00:00Z',
    status: 'completed',
    quality_score: null
  }
];

console.log('=== TESTING CONTENT LOADING ===');
const result = simulateContentTransformation(sampleDBContent);

console.log('\n=== FINAL RESULT ===');
console.log('Content with images:', result.filter(c => c.image).length);
console.log('Content without images:', result.filter(c => !c.image).length);
console.log('Total content:', result.length);

if (result.length > 0) {
  const firstContent = result[0];
  console.log('\nFirst content item:');
  console.log('- Has image:', !!firstContent.image);
  console.log('- Image type:', typeof firstContent.image);
  if (firstContent.image) {
    console.log('- Image starts with:', firstContent.image.substring(0, 50));
    console.log('- Image length:', firstContent.image.length);
  }
}
