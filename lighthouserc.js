module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3001',
        'http://localhost:3001/templates',
        'http://localhost:3001/teams',
        'http://localhost:3001/dashboard',
      ],
      startServerCommand: 'npm run dev',
      startServerReadyPattern: 'Ready on',
      startServerReadyTimeout: 30000,
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
        preset: 'desktop',
        onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
        skipAudits: [
          'canonical', // Not applicable for development
          'robots-txt', // Not applicable for development
        ],
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        
        // Performance metrics
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        
        // Accessibility
        'color-contrast': 'error',
        'heading-order': 'error',
        'html-has-lang': 'error',
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        
        // Best practices
        'uses-https': 'off', // Disabled for local development
        'is-on-https': 'off', // Disabled for local development
        'uses-http2': 'off', // Disabled for local development
        'no-vulnerable-libraries': 'error',
        'csp-xss': 'warn',
        
        // SEO
        'meta-description': 'warn',
        'document-title': 'error',
        'html-lang-valid': 'error',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
    server: {
      port: 9001,
      storage: './lighthouse-reports',
    },
  },
} 