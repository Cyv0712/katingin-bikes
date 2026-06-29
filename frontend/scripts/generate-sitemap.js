import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { showcaseBikes } from '../src/data/showcase.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Clean up trailing slash on API base URL
const API_BASE_URL = (process.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
const SITE_BASE_URL = 'https://www.katinginbikes.com';

async function generateSitemap() {
  console.log('Generating dynamic XML sitemap...');
  let bikes = [];
  
  try {
    const res = await fetch(`${API_BASE_URL}/api/bikes`);
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      // Filter for available units only
      bikes = data.filter(b => b.status === 'Available' || !b.status);
      console.log(`Fetched ${bikes.length} active listings from API.`);
    } else {
      console.warn('API returned non-array structure:', data);
    }
  } catch (error) {
    console.error('Warning: Failed to fetch inventory from API during sitemap generation:', error.message);
    console.log('Continuing sitemap build with fallback static routes.');
  }

  const currentDate = new Date().toISOString().split('T')[0];

  // Core Static URLs
  const urls = [
    { loc: `${SITE_BASE_URL}/`, changefreq: 'daily', priority: '1.0' },
    { loc: `${SITE_BASE_URL}/inventory`, changefreq: 'daily', priority: '0.9' },
    { loc: `${SITE_BASE_URL}/financing`, changefreq: 'monthly', priority: '0.7' },
    { loc: `${SITE_BASE_URL}/about`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${SITE_BASE_URL}/contact`, changefreq: 'monthly', priority: '0.5' },
    { loc: `${SITE_BASE_URL}/privacy-policy`, changefreq: 'monthly', priority: '0.3' }
  ];

  // Add Showcase models
  if (Array.isArray(showcaseBikes)) {
    showcaseBikes.forEach(bike => {
      urls.push({
        loc: `${SITE_BASE_URL}/showcase/${bike.slug}`,
        changefreq: 'weekly',
        priority: '0.8'
      });
    });
  }

  // Add active listings dynamic URLs
  bikes.forEach(bike => {
    urls.push({
      loc: `${SITE_BASE_URL}/bike/${bike._id}`,
      changefreq: 'weekly',
      priority: '0.8'
    });
  });

  // Construct XML content
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

  // Write file to public/sitemap.xml
  const outputPath = path.resolve(__dirname, '../public/sitemap.xml');
  
  // Ensure the public directory exists
  const publicDir = path.dirname(outputPath);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(outputPath, xml, 'utf8');
  console.log(`Sitemap written successfully to ${outputPath}`);
}

generateSitemap();
