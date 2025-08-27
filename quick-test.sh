#!/bin/bash

# Quick test script for content generation APIs
# Replace YOUR_NETLIFY_URL with your actual Netlify URL

NETLIFY_URL="https://your-app-name.netlify.app"
LOCAL_URL="http://localhost:3000"

echo "🚀 Content Generation API Quick Test"
echo "===================================="
 


 
# Function to test an endpoint
test_endpoint() {
    local url=$1
    local endpoint=$2
    local method=${3:-GET}
    local data=${4:-""}
    local name=$5
    
    echo ""
    echo "🔍 Testing $name - $endpoint"
    echo "URL: $url$endpoint"
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$url$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" "$url$endpoint")
    fi
    
    # Extract status code (last line)
    status_code=$(echo "$response" | tail -n1)
    # Extract response body (all lines except last)
    body=$(echo "$response" | head -n -1)
    
    if [ "$status_code" -eq 200 ]; then
        echo "✅ PASSED (Status: $status_code)"
        echo "Response: $body" | head -c 200
        if [ ${#body} -gt 200 ]; then
            echo "..."
        fi
    else
        echo "❌ FAILED (Status: $status_code)"
        echo "Error: $body"
    fi
}

# Test data for content generation
CONTENT_DATA='{
    "productName": "Test Product",
    "productDescription": "A test product for API verification",
    "platform": "Instagram",
    "targetAudience": "Developers",
    "keyBenefits": "Easy testing",
    "callToAction": "Try it now!",
    "tone": "Professional",
    "contentType": "post",
    "includeHashtags": true,
    "includeEmojis": false
}'

IMAGE_DATA='{
    "prompt": "A professional logo design for a tech company",
    "style": "minimalist",
    "aspectRatio": "1:1",
    "colorScheme": "blue",
    "productName": "Test Product"
}'

echo ""
echo "📍 Testing LOCAL Environment"
echo "============================"

test_endpoint "$LOCAL_URL" "/api/health" "GET" "" "Health Check"
test_endpoint "$LOCAL_URL" "/api/ai/status" "GET" "" "AI Status"
test_endpoint "$LOCAL_URL" "/api/generate-post-text" "POST" "$CONTENT_DATA" "Content Generation"
test_endpoint "$LOCAL_URL" "/api/generate-image" "POST" "$IMAGE_DATA" "Image Generation"

echo ""
echo "📍 Testing NETLIFY Environment"
echo "=============================="

test_endpoint "$NETLIFY_URL" "/api/health" "GET" "" "Health Check"
test_endpoint "$NETLIFY_URL" "/api/ai/status" "GET" "" "AI Status"
test_endpoint "$NETLIFY_URL" "/api/generate-post-text" "POST" "$CONTENT_DATA" "Content Generation"
test_endpoint "$NETLIFY_URL" "/api/generate-image" "POST" "$IMAGE_DATA" "Image Generation"

echo ""
echo "✅ Test completed!"
echo ""
echo "📋 Troubleshooting Tips:"
echo "1. If local works but Netlify fails: Check environment variables in Netlify dashboard"
echo "2. If both fail: Check your OpenAI API key and Supabase configuration"
echo "3. If you get 404 errors: Make sure the API routes are properly deployed"
echo "4. If you get 500 errors: Check Netlify function logs for detailed error messages"
