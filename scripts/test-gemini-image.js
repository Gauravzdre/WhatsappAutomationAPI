const fs = require('fs');
const path = require('path');

// Read the debug response file to understand the structure
const debugFile = 'debug-responses/gemini-response-direct-2025-08-28T15-08-54-097Z.json';

if (fs.existsSync(debugFile)) {
  const response = JSON.parse(fs.readFileSync(debugFile, 'utf8'));
  
  console.log('=== ANALYZING GEMINI RESPONSE STRUCTURE ===');
  console.log('Response keys:', Object.keys(response));
  
  const message = response.choices?.[0]?.message;
  if (message) {
    console.log('\nMessage keys:', Object.keys(message));
    console.log('Message content type:', typeof message.content);
    
    if (Array.isArray(message.content)) {
      console.log('Message content array length:', message.content.length);
      message.content.forEach((item, index) => {
        console.log(`Content item ${index}:`, item);
      });
    }
    
    if (message.images) {
      console.log('\nImages array length:', message.images.length);
      message.images.forEach((image, index) => {
        console.log(`Image ${index}:`, image);
        if (image.type === 'image_url' && image.image_url) {
          console.log(`Image ${index} URL:`, image.image_url);
          if (typeof image.image_url === 'string') {
            console.log(`Image ${index} is base64 string, length:`, image.image_url.length);
            console.log(`Image ${index} starts with:`, image.image_url.substring(0, 50));
          }
        }
      });
    }
  }
  
  console.log('\n=== EXTRACTION TEST ===');
  
  // Test the extraction logic
  let imageUrl = null;
  
  // Check for images array in the message (Gemini 2.5 Flash Image Preview format)
  if (message && message.images && Array.isArray(message.images)) {
    console.log('Found images array in message, checking for base64 data...');
    for (const imageItem of message.images) {
      if (imageItem.type === 'image_url' && imageItem.image_url) {
        console.log('Found image_url in images array');
        // Handle both URL strings and objects with url property
        if (typeof imageItem.image_url === 'string') {
          imageUrl = imageItem.image_url;
          console.log('Extracted base64 image URL');
        } else if (imageItem.image_url.url) {
          imageUrl = imageItem.image_url.url;
          console.log('Extracted image URL from object');
        }
        break;
      }
    }
  }
  
  if (imageUrl) {
    console.log('SUCCESS: Image URL extracted successfully');
    console.log('URL type:', typeof imageUrl);
    console.log('URL starts with:', imageUrl.substring(0, 50));
    
    // Test if it's a valid data URL
    if (imageUrl.startsWith('data:image/')) {
      console.log('VALID: This is a proper data URL');
      
      // Extract the base64 part
      const base64Match = imageUrl.match(/data:image\/([^;]+);base64,([^"\s]+)/i);
      if (base64Match) {
        const imageFormat = base64Match[1];
        const base64Data = base64Match[2];
        console.log('Image format:', imageFormat);
        console.log('Base64 data length:', base64Data.length);
        console.log('Base64 data starts with:', base64Data.substring(0, 50));
        
        // Test if we can decode it
        try {
          const buffer = Buffer.from(base64Data, 'base64');
          console.log('SUCCESS: Base64 data can be decoded to buffer');
          console.log('Buffer length:', buffer.length);
          
          // Save a test image
          const testImagePath = path.join(__dirname, 'test-gemini-image.png');
          fs.writeFileSync(testImagePath, buffer);
          console.log('SUCCESS: Test image saved to:', testImagePath);
          
        } catch (error) {
          console.error('ERROR: Failed to decode base64 data:', error.message);
        }
      }
    } else {
      console.log('WARNING: Not a data URL, might be a regular URL');
    }
  } else {
    console.log('ERROR: No image URL extracted');
  }
  
} else {
  console.log('Debug file not found:', debugFile);
}
