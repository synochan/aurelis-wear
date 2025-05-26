export default function middleware(request) {
  const url = new URL(request.url);
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    return fetch(`https://aurelis-wear-api.onrender.com${url.pathname}${url.search}`);
  }
  
  // Let everything else pass through to static files
  return;
} 