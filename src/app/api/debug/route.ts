import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  
  return NextResponse.json({
    success: true,
    debug: {
      method: request.method,
      url: request.url,
      pathname: url.pathname,
      searchParams: Object.fromEntries(url.searchParams),
      headers: Object.fromEntries(request.headers.entries()),
      timestamp: new Date().toISOString()
    }
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const url = new URL(request.url)
    
    return NextResponse.json({
      success: true,
      debug: {
        method: request.method,
        url: request.url,
        pathname: url.pathname,
        body,
        headers: Object.fromEntries(request.headers.entries()),
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Invalid JSON body',
      debug: {
        method: request.method,
        url: request.url,
        timestamp: new Date().toISOString()
      }
    })
  }
} 