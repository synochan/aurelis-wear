// This file helps Vercel understand the project structure
// It ensures proper routing for SPA applications
module.exports = {
  rewrites: () => [
    { source: '/(.*)', destination: '/' }
  ]
}; 