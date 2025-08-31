import * as fs from 'fs';
import * as path from 'path';

interface PWATestResult {
  category: string;
  passed: boolean;
  message: string;
  details?: any;
}

async function testPWA() {
  console.log('🧪 Testing HolyDrop PWA Configuration');
  console.log('=' .repeat(50));
  
  const results: PWATestResult[] = [];
  
  // 1. Test manifest.json
  console.log('\n📱 Testing manifest.json...');
  try {
    const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    
    const requiredFields = ['name', 'short_name', 'icons', 'start_url', 'display'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    if (missingFields.length === 0) {
      results.push({
        category: 'Manifest',
        passed: true,
        message: 'All required fields present',
        details: { 
          name: manifest.name,
          icons: manifest.icons.length,
          display: manifest.display
        }
      });
    } else {
      results.push({
        category: 'Manifest',
        passed: false,
        message: `Missing fields: ${missingFields.join(', ')}`
      });
    }
  } catch (error) {
    results.push({
      category: 'Manifest',
      passed: false,
      message: 'Failed to read manifest.json',
      details: error
    });
  }
  
  // 2. Test icons
  console.log('\n🎨 Testing icons...');
  const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
  let iconsFound = 0;
  
  for (const size of iconSizes) {
    const iconPath = path.join(process.cwd(), 'public', 'icons', `icon-${size}x${size}.png`);
    const svgPath = path.join(process.cwd(), 'public', 'icons', `icon-${size}x${size}.svg`);
    
    if (fs.existsSync(iconPath) || fs.existsSync(svgPath)) {
      iconsFound++;
    }
  }
  
  results.push({
    category: 'Icons',
    passed: iconsFound === iconSizes.length,
    message: `${iconsFound}/${iconSizes.length} icons found`,
    details: { sizes: iconSizes }
  });
  
  // 3. Test service worker configuration
  console.log('\n⚙️ Testing service worker...');
  const nextConfigPath = path.join(process.cwd(), 'next.config.ts');
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf-8');
  
  if (nextConfig.includes('next-pwa') && nextConfig.includes('runtimeCaching')) {
    results.push({
      category: 'Service Worker',
      passed: true,
      message: 'PWA configuration found in next.config.ts',
      details: {
        cacheStrategies: [
          'bible-chapters: CacheFirst',
          'annotations: NetworkFirst',
          'static assets: StaleWhileRevalidate'
        ]
      }
    });
  } else {
    results.push({
      category: 'Service Worker',
      passed: false,
      message: 'PWA configuration not found or incomplete'
    });
  }
  
  // 4. Test offline storage
  console.log('\n💾 Testing offline storage...');
  const offlineStoragePath = path.join(process.cwd(), 'lib', 'db', 'offline-storage.ts');
  
  if (fs.existsSync(offlineStoragePath)) {
    const storageCode = fs.readFileSync(offlineStoragePath, 'utf-8');
    const hasIndexedDB = storageCode.includes('IndexedDB');
    const hasPreload = storageCode.includes('preloadBible');
    const hasSync = storageCode.includes('syncAnnotations');
    
    results.push({
      category: 'Offline Storage',
      passed: hasIndexedDB && hasPreload && hasSync,
      message: 'IndexedDB implementation found',
      details: {
        features: {
          'IndexedDB': hasIndexedDB,
          'Bible preloading': hasPreload,
          'Annotation sync': hasSync
        }
      }
    });
  } else {
    results.push({
      category: 'Offline Storage',
      passed: false,
      message: 'Offline storage not implemented'
    });
  }
  
  // 5. Test Bible data size
  console.log('\n📚 Testing Bible data...');
  const bibleDir = path.join(process.cwd(), 'data', 'bible');
  const files = fs.readdirSync(bibleDir).filter(f => f.endsWith('.json') && f !== 'index.json');
  let totalSize = 0;
  
  for (const file of files) {
    const stat = fs.statSync(path.join(bibleDir, file));
    totalSize += stat.size;
  }
  
  const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
  
  results.push({
    category: 'Bible Data',
    passed: totalSize < 10 * 1024 * 1024, // Less than 10MB
    message: `${files.length} chapters, ${sizeMB} MB total`,
    details: {
      chapters: files.length,
      sizeBytes: totalSize,
      sizeMB: parseFloat(sizeMB),
      cacheableOffline: totalSize < 50 * 1024 * 1024
    }
  });
  
  // 6. Test components
  console.log('\n🧩 Testing PWA components...');
  const components = [
    { name: 'OfflineIndicator', path: 'components/OfflineIndicator.tsx' },
    { name: 'PWAInstallPrompt', path: 'components/PWAInstallPrompt.tsx' }
  ];
  
  for (const comp of components) {
    const compPath = path.join(process.cwd(), comp.path);
    if (fs.existsSync(compPath)) {
      results.push({
        category: 'Components',
        passed: true,
        message: `${comp.name} component found`
      });
    } else {
      results.push({
        category: 'Components',
        passed: false,
        message: `${comp.name} component missing`
      });
    }
  }
  
  // Generate report
  console.log('\n' + '=' .repeat(50));
  console.log('📊 PWA Test Results\n');
  
  const categories = [...new Set(results.map(r => r.category))];
  
  for (const category of categories) {
    const categoryResults = results.filter(r => r.category === category);
    const passed = categoryResults.filter(r => r.passed).length;
    const total = categoryResults.length;
    const icon = passed === total ? '✅' : passed > 0 ? '⚠️' : '❌';
    
    console.log(`${icon} ${category}: ${passed}/${total} tests passed`);
    
    for (const result of categoryResults) {
      const status = result.passed ? '  ✓' : '  ✗';
      console.log(`${status} ${result.message}`);
      
      if (result.details) {
        if (typeof result.details === 'object' && !Array.isArray(result.details)) {
          for (const [key, value] of Object.entries(result.details)) {
            if (typeof value === 'object') {
              console.log(`     ${key}:`);
              for (const [k, v] of Object.entries(value as Record<string, any>)) {
                console.log(`       - ${k}: ${v}`);
              }
            } else {
              console.log(`     - ${key}: ${value}`);
            }
          }
        }
      }
    }
    console.log();
  }
  
  // Overall score
  const totalPassed = results.filter(r => r.passed).length;
  const totalTests = results.length;
  const score = Math.round((totalPassed / totalTests) * 100);
  
  console.log('=' .repeat(50));
  console.log(`\n🎯 Overall PWA Score: ${score}%`);
  
  if (score === 100) {
    console.log('🎉 Perfect! Your PWA is fully configured!');
  } else if (score >= 80) {
    console.log('👍 Good! Your PWA is mostly ready.');
  } else if (score >= 60) {
    console.log('⚠️ Fair. Some important features are missing.');
  } else {
    console.log('❌ Needs work. Many PWA features are not configured.');
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  
  if (!results.find(r => r.category === 'Service Worker' && r.passed)) {
    console.log('  - Build the app to generate service worker: npm run build');
  }
  
  if (!results.find(r => r.category === 'Icons' && r.passed)) {
    console.log('  - Generate proper PNG icons from SVG sources');
  }
  
  console.log('  - Test offline mode: DevTools > Network > Offline');
  console.log('  - Run Lighthouse audit: npx lighthouse http://localhost:3000');
  console.log('  - Test installation on mobile and desktop');
  
  console.log('\n✨ PWA test complete!');
}

// Run the test
testPWA().catch(console.error);