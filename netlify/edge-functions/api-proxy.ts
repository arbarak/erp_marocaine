/**
 * Netlify Edge Function for API Proxying
 * 
 * This edge function can be used to proxy API requests
 * and add additional headers or authentication if needed.
 */

import type { Context } from "@netlify/edge-functions"

export default async (request: Request, context: Context) => {
  const url = new URL(request.url)
  
  // Only handle API routes
  if (!url.pathname.startsWith('/api/')) {
    return
  }

  // Get the backend API URL from environment variables
  const backendUrl = Deno.env.get('VITE_API_URL') || 'http://localhost:8000'
  
  // Construct the target URL
  const targetUrl = new URL(url.pathname + url.search, backendUrl)
  
  // Forward the request to the backend
  const response = await fetch(targetUrl.toString(), {
    method: request.method,
    headers: {
      ...Object.fromEntries(request.headers.entries()),
      // Add or modify headers as needed
      'X-Forwarded-For': context.ip,
      'X-Forwarded-Host': url.hostname,
    },
    body: request.method !== 'GET' && request.method !== 'HEAD' 
      ? await request.arrayBuffer() 
      : undefined,
  })

  // Create a new response with CORS headers
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...Object.fromEntries(response.headers.entries()),
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })

  return newResponse
}

export const config = {
  path: "/api/*",
}
