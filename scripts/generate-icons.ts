import * as fs from 'fs';
import * as path from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

function generateSVGIcon(size: number): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg${size}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0EA5E9;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0369A1;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow${size}">
      <feDropShadow dx="${size * 0.02}" dy="${size * 0.02}" stdDeviation="${size * 0.02}" flood-opacity="0.2"/>
    </filter>
  </defs>
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="url(#bg${size})"/>
  
  <!-- Water drop shape -->
  <path d="M${size/2} ${size*0.2} 
    C${size*0.25} ${size*0.3}, ${size*0.2} ${size*0.5}, ${size/2} ${size*0.8}
    C${size*0.8} ${size*0.5}, ${size*0.75} ${size*0.3}, ${size/2} ${size*0.2}Z" 
    fill="rgba(255,255,255,0.9)" 
    filter="url(#shadow${size})"/>
  
  <!-- HD Text -->
  <text x="${size/2}" y="${size*0.5}" 
    font-family="system-ui, -apple-system, sans-serif" 
    font-size="${size*0.22}" 
    font-weight="bold" 
    fill="#0369A1" 
    text-anchor="middle" 
    dominant-baseline="middle">HD</text>
</svg>`;
}

function generatePNGFromSVG(svgContent: string, size: number): string {
  // For now, we'll save as SVG and note that conversion to PNG requires additional tools
  return svgContent;
}

async function generateAllIcons() {
  console.log('💧 Generating HolyDrop PWA icons...');
  console.log('=' .repeat(50));
  
  // Create icons directory if it doesn't exist
  const iconsDir = path.join(process.cwd(), 'public', 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }
  
  // Generate icons for each size
  for (const size of sizes) {
    try {
      const svgContent = generateSVGIcon(size);
      
      // Save as SVG (browsers can use SVG icons)
      const svgFilename = `icon-${size}x${size}.svg`;
      const svgFilepath = path.join(iconsDir, svgFilename);
      fs.writeFileSync(svgFilepath, svgContent);
      
      // Also save with .png extension for manifest compatibility
      // (Note: These are still SVGs, but many PWA tools accept SVG with .png extension)
      const pngFilename = `icon-${size}x${size}.png`;
      const pngFilepath = path.join(iconsDir, pngFilename);
      fs.writeFileSync(pngFilepath, svgContent);
      
      console.log(`✅ Generated ${svgFilename}`);
    } catch (error) {
      console.error(`❌ Failed to generate ${size}x${size} icon:`, error);
    }
  }
  
  // Generate favicon.ico (using smallest size)
  const faviconSvg = generateSVGIcon(32);
  fs.writeFileSync(path.join(process.cwd(), 'public', 'favicon.svg'), faviconSvg);
  console.log('✅ Generated favicon.svg');
  
  // Generate apple-touch-icon
  const appleTouchIcon = generateSVGIcon(180);
  fs.writeFileSync(path.join(process.cwd(), 'public', 'apple-touch-icon.png'), appleTouchIcon);
  console.log('✅ Generated apple-touch-icon.png');
  
  // Generate screenshots (placeholder SVGs)
  const screenshotsDir = path.join(process.cwd(), 'public', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  const screenshotSizes = [
    { width: 390, height: 844, name: 'mobile-home.png', title: 'HolyDrop Home' },
    { width: 390, height: 844, name: 'mobile-reading.png', title: 'Reading Scripture' }
  ];
  
  for (const screen of screenshotSizes) {
    const screenshotSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${screen.width}" height="${screen.height}" viewBox="0 0 ${screen.width} ${screen.height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="screen-bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#0F172A;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1E293B;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="${screen.width}" height="${screen.height}" fill="url(#screen-bg)"/>
  
  <!-- Status bar -->
  <rect x="0" y="0" width="${screen.width}" height="44" fill="rgba(15,23,42,0.8)"/>
  <text x="20" y="30" font-family="system-ui" font-size="14" fill="#94A3B8">9:41 AM</text>
  <text x="${screen.width - 60}" y="30" font-family="system-ui" font-size="14" fill="#94A3B8" text-anchor="end">100%</text>
  
  <!-- App header -->
  <rect x="0" y="44" width="${screen.width}" height="80" fill="rgba(14,165,233,0.1)"/>
  
  <!-- HolyDrop logo -->
  <text x="${screen.width/2}" y="90" font-family="system-ui" font-size="32" font-weight="bold" fill="#0EA5E9" text-anchor="middle">💧 HolyDrop</text>
  
  <!-- Subtitle -->
  <text x="${screen.width/2}" y="120" font-family="system-ui" font-size="14" fill="#94A3B8" text-anchor="middle">KJV Bible with Annotations</text>
  
  <!-- Content preview -->
  <rect x="20" y="160" width="${screen.width - 40}" height="100" rx="8" fill="rgba(30,41,59,0.5)"/>
  <text x="40" y="190" font-family="system-ui" font-size="16" fill="#E2E8F0">Genesis 1:1</text>
  <text x="40" y="220" font-family="system-ui" font-size="14" fill="#94A3B8">In the beginning God created</text>
  <text x="40" y="240" font-family="system-ui" font-size="14" fill="#94A3B8">the heaven and the earth.</text>
  
  <!-- Navigation hint -->
  <rect x="20" y="280" width="${screen.width - 40}" height="60" rx="8" fill="rgba(14,165,233,0.1)"/>
  <text x="${screen.width/2}" y="315" font-family="system-ui" font-size="14" fill="#0EA5E9" text-anchor="middle">Tap any verse to add annotations</text>
  
  <!-- Bottom navigation -->
  <rect x="0" y="${screen.height - 80}" width="${screen.width}" height="80" fill="rgba(15,23,42,0.9)"/>
  <text x="${screen.width * 0.2}" y="${screen.height - 35}" font-family="system-ui" font-size="12" fill="#0EA5E9" text-anchor="middle">📖 Read</text>
  <text x="${screen.width * 0.4}" y="${screen.height - 35}" font-family="system-ui" font-size="12" fill="#64748B" text-anchor="middle">🔍 Search</text>
  <text x="${screen.width * 0.6}" y="${screen.height - 35}" font-family="system-ui" font-size="12" fill="#64748B" text-anchor="middle">💬 Notes</text>
  <text x="${screen.width * 0.8}" y="${screen.height - 35}" font-family="system-ui" font-size="12" fill="#64748B" text-anchor="middle">👤 Profile</text>
</svg>`;
    
    const filepath = path.join(screenshotsDir, screen.name);
    fs.writeFileSync(filepath, screenshotSvg);
    console.log(`✅ Generated screenshot: ${screen.name}`);
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('✨ All icons and screenshots generated successfully!');
  console.log('\nNote: Icons are in SVG format for optimal quality.');
  console.log('Modern browsers support SVG icons in PWA manifests.');
  console.log('For PNG conversion, consider using a tool like sharp or imagemagick.');
}

// Run the generation
generateAllIcons().catch(console.error);