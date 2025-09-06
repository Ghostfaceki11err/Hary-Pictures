#!/usr/bin/env node

/**
 * Script to update domain references in SEO files for Hary Pictures
 * Usage: node update-domain.js https://yourdomain.com
 */

const fs = require('fs');
const path = require('path');

// Get domain from command line arguments
const newDomain = process.argv[2];

if (!newDomain) {
  console.error('❌ Please provide a domain as an argument');
  console.log('Usage: node update-domain.js https://yourdomain.com');
  process.exit(1);
}

// Validate domain format
if (!newDomain.startsWith('https://') && !newDomain.startsWith('http://')) {
  console.error('❌ Domain must start with https:// or http://');
  process.exit(1);
}

console.log(`🔄 Updating domain references to: ${newDomain}`);

// Files to update
const filesToUpdate = [
  'public/robots.txt',
  'public/sitemap.xml',
  'index.html'
];

// Update each file
filesToUpdate.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // Replace domain references
      const oldDomainPattern = /https:\/\/yourdomain\.com/g;
      const updatedContent = content.replace(oldDomainPattern, newDomain);
      
      if (content !== updatedContent) {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`✅ Updated: ${filePath}`);
      } else {
        console.log(`ℹ️  No changes needed: ${filePath}`);
      }
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
});

console.log('\n🎉 Domain update complete for Hary Pictures!');
console.log('\nNext steps:');
console.log('1. Commit your changes to git');
console.log('2. Deploy to Netlify');
console.log('3. Submit sitemap to Google Search Console');
console.log(`4. Verify your site at: ${newDomain}`);
console.log(`5. Test Google verification at: ${newDomain}/google27aa09e668bdc9f3.html`);
