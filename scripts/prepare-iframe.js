import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Prepare iframe-ready distribution
function prepareIframe() {
  const distDir = path.join(__dirname, '..', 'dist');
  const iframeHtml = path.join(__dirname, '..', 'widget-iframe.html');
  const targetHtml = path.join(distDir, 'iframe.html');
  
  try {
    // Copy iframe HTML to dist folder
    fs.copyFileSync(iframeHtml, targetHtml);
    
    // Read the HTML content
    let htmlContent = fs.readFileSync(targetHtml, 'utf8');
    
    // Update asset paths to match actual build output
    const assetsDir = path.join(distDir, 'assets');
    const cssFiles = fs.existsSync(assetsDir) 
      ? fs.readdirSync(assetsDir).filter(f => f.endsWith('.css'))
      : [];
    
    if (cssFiles.length > 0) {
      htmlContent = htmlContent.replace('./assets/my-widget.css', `./assets/${cssFiles[0]}`);
    }
    
    // Write updated HTML
    fs.writeFileSync(targetHtml, htmlContent);
    
    console.log('✅ iframe-ready widget prepared in dist/iframe.html');
    console.log('📦 Files needed for S3:');
    console.log('   - dist/iframe.html');
    console.log('   - dist/my-widget.iife.js');
    console.log(`   - dist/assets/${cssFiles[0] || 'my-widget.css'}`);
    
  } catch (error) {
    console.error('❌ Failed to prepare iframe:', error.message);
    process.exit(1);
  }
}

prepareIframe();