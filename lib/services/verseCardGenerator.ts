'use client';

interface CardTheme {
  id: string;
  name: string;
  backgroundType: 'gradient' | 'solid' | 'image';
  backgroundValue: string;
  fontFamily: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
}

interface CardOptions {
  verse: {
    text: string;
    reference: string; // e.g., "John 3:16"
    book: string;
    chapter: number;
    verseNumber: number;
  };
  theme: CardTheme;
  format: 'square' | 'story' | 'landscape' | 'twitter';
  includeWatermark: boolean;
  personalMessage?: string;
}

interface CardSize {
  width: number;
  height: number;
  name: string;
}

export class VerseCardGenerator {
  private strategy: 'canvas' | 'svg' | 'server';
  private cache = new Map<string, Blob>();
  private readonly MAX_CACHE_SIZE = 20;
  
  // Card formats optimized for each platform
  private readonly FORMATS: Record<string, CardSize> = {
    square: { width: 1080, height: 1080, name: 'Instagram Post' },
    story: { width: 1080, height: 1920, name: 'Instagram Story' },
    landscape: { width: 1200, height: 630, name: 'Twitter/Facebook' },
    twitter: { width: 1200, height: 675, name: 'Twitter Optimized' }
  };
  
  // Beautiful themes with proper gradient definitions
  static readonly THEMES: Record<string, CardTheme> = {
    ocean: {
      id: 'ocean',
      name: 'Ocean Depths',
      backgroundType: 'gradient',
      backgroundValue: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Playfair Display, serif',
      primaryColor: '#667eea',
      secondaryColor: '#764ba2',
      textColor: '#ffffff'
    },
    sunrise: {
      id: 'sunrise',
      name: 'Dawn Light',
      backgroundType: 'gradient',
      backgroundValue: 'linear-gradient(to right, #f093fb 0%, #f5576c 100%)',
      fontFamily: 'Inter, sans-serif',
      primaryColor: '#f093fb',
      secondaryColor: '#f5576c',
      textColor: '#ffffff'
    },
    forest: {
      id: 'forest',
      name: 'Forest Calm',
      backgroundType: 'gradient',
      backgroundValue: 'linear-gradient(to top, #0ba360 0%, #3cba92 100%)',
      fontFamily: 'Crimson Pro, serif',
      primaryColor: '#0ba360',
      secondaryColor: '#3cba92',
      textColor: '#ffffff'
    },
    minimal: {
      id: 'minimal',
      name: 'Clean & Simple',
      backgroundType: 'solid',
      backgroundValue: '#ffffff',
      fontFamily: 'Helvetica Neue, sans-serif',
      primaryColor: '#000000',
      secondaryColor: '#666666',
      textColor: '#000000'
    },
    midnight: {
      id: 'midnight',
      name: 'Midnight Sky',
      backgroundType: 'gradient',
      backgroundValue: 'linear-gradient(to bottom, #2c3e50 0%, #3498db 100%)',
      fontFamily: 'Merriweather, serif',
      primaryColor: '#2c3e50',
      secondaryColor: '#3498db',
      textColor: '#ffffff'
    },
    golden: {
      id: 'golden',
      name: 'Golden Hour',
      backgroundType: 'gradient',
      backgroundValue: 'linear-gradient(45deg, #f7971e 0%, #ffd200 100%)',
      fontFamily: 'Georgia, serif',
      primaryColor: '#f7971e',
      secondaryColor: '#ffd200',
      textColor: '#ffffff'
    }
  };
  
  constructor() {
    this.strategy = this.detectBestStrategy();
    this.preloadFonts();
  }
  
  private detectBestStrategy(): 'canvas' | 'svg' | 'server' {
    // Check Canvas support with all required features
    if (typeof window !== 'undefined' && 
        'HTMLCanvasElement' in window &&
        typeof HTMLCanvasElement.prototype.getContext === 'function' &&
        typeof HTMLCanvasElement.prototype.toBlob === 'function') {
      return 'canvas';
    }
    
    // Check SVG support
    if (typeof window !== 'undefined' && 
        'SVGElement' in window) {
      return 'svg';
    }
    
    // Fallback to server-side
    return 'server';
  }
  
  private async preloadFonts() {
    if (typeof document === 'undefined') return;
    
    const fonts = [
      'Playfair Display',
      'Inter',
      'Crimson Pro',
      'Merriweather',
      'Georgia'
    ];
    
    try {
      await Promise.all(
        fonts.map(font => document.fonts.load(`16px "${font}"`))
      );
    } catch (error) {
      console.warn('Font preloading failed:', error);
    }
  }
  
  async generateCard(options: CardOptions): Promise<Blob | null> {
    const startTime = performance.now();
    
    // Check cache first
    const cacheKey = this.getCacheKey(options);
    if (this.cache.has(cacheKey)) {
      console.log(`Cache hit for ${cacheKey} (${performance.now() - startTime}ms)`);
      return this.cache.get(cacheKey)!;
    }
    
    try {
      let blob: Blob | null = null;
      
      switch(this.strategy) {
        case 'canvas':
          blob = await this.generateCanvasCard(options);
          break;
        case 'svg':
          blob = await this.generateSVGCard(options);
          break;
        case 'server':
          blob = await this.generateServerCard(options);
          break;
      }
      
      // Cache if successful and under size limit
      if (blob && blob.size < 5000000 && this.cache.size < this.MAX_CACHE_SIZE) {
        if (this.cache.size >= this.MAX_CACHE_SIZE) {
          // Remove oldest entry
          const firstKey = this.cache.keys().next().value;
          if (firstKey !== undefined) {
            this.cache.delete(firstKey);
          }
        }
        this.cache.set(cacheKey, blob);
      }
      
      const endTime = performance.now();
      console.log(`Card generated via ${this.strategy} in ${endTime - startTime}ms (${blob?.size || 0} bytes)`);
      
      return blob;
    } catch (error) {
      console.error('Card generation failed:', error);
      
      // Try fallback strategies
      if (this.strategy === 'canvas') {
        console.log('Canvas failed, trying SVG fallback');
        this.strategy = 'svg';
        return this.generateCard(options);
      } else if (this.strategy === 'svg') {
        console.log('SVG failed, trying server fallback');
        this.strategy = 'server';
        return this.generateCard(options);
      }
      
      return null;
    }
  }
  
  private async generateCanvasCard(options: CardOptions): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');
    
    // Get size and setup high DPI
    const size = this.FORMATS[options.format];
    const dpr = typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1;
    
    canvas.width = size.width * dpr;
    canvas.height = size.height * dpr;
    canvas.style.width = `${size.width}px`;
    canvas.style.height = `${size.height}px`;
    ctx.scale(dpr, dpr);
    
    // Enable font smoothing (non-standard property, may not exist)
    (ctx as any).textRenderingOptimization = 'optimizeQuality';
    
    // Draw background
    if (options.theme.backgroundType === 'gradient') {
      const gradient = this.createCanvasGradient(ctx, options.theme, size);
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = options.theme.backgroundValue;
    }
    ctx.fillRect(0, 0, size.width, size.height);
    
    // Configure text rendering
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = options.theme.textColor;
    
    // Calculate font size based on text length and format
    const fontSize = this.calculateOptimalFontSize(
      options.verse.text,
      size,
      options.format
    );
    
    ctx.font = `${fontSize}px "${options.theme.fontFamily}"`;
    
    // Draw verse text with word wrapping
    const lines = this.wrapText(ctx, options.verse.text, size.width * 0.8);
    const lineHeight = fontSize * 1.4;
    const textBlockHeight = lines.length * lineHeight;
    const startY = (size.height - textBlockHeight) / 2;
    
    // Add text shadow for better readability
    if (options.theme.textColor === '#ffffff') {
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }
    
    lines.forEach((line, index) => {
      ctx.fillText(
        line,
        size.width / 2,
        startY + (index * lineHeight) + (lineHeight / 2)
      );
    });
    
    // Reset shadow for reference
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw reference
    ctx.font = `${fontSize * 0.6}px "${options.theme.fontFamily}"`;
    ctx.fillStyle = options.theme.textColor;
    ctx.globalAlpha = 0.8;
    ctx.fillText(
      options.verse.reference,
      size.width / 2,
      size.height - (size.height * 0.1)
    );
    
    // Add personal message if provided
    if (options.personalMessage) {
      ctx.font = `${fontSize * 0.5}px "Inter, sans-serif"`;
      ctx.globalAlpha = 0.7;
      ctx.fillText(
        options.personalMessage,
        size.width / 2,
        size.height - (size.height * 0.15)
      );
    }
    
    // Add watermark if requested
    if (options.includeWatermark) {
      ctx.globalAlpha = 0.4;
      ctx.font = `${fontSize * 0.4}px "Inter, sans-serif"`;
      ctx.fillText('HolyDrop', size.width / 2, size.height - 30);
    }
    
    // Convert to blob with optimization
    const quality = this.getOptimalQuality(options.format);
    
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Blob creation failed'));
        },
        'image/jpeg',
        quality
      );
    });
  }
  
  private createCanvasGradient(
    ctx: CanvasRenderingContext2D,
    theme: CardTheme,
    size: CardSize
  ): CanvasGradient {
    // Parse gradient direction from CSS gradient string
    if (theme.backgroundValue.includes('135deg')) {
      const gradient = ctx.createLinearGradient(0, 0, size.width, size.height);
      gradient.addColorStop(0, theme.primaryColor);
      gradient.addColorStop(1, theme.secondaryColor);
      return gradient;
    } else if (theme.backgroundValue.includes('to right')) {
      const gradient = ctx.createLinearGradient(0, 0, size.width, 0);
      gradient.addColorStop(0, theme.primaryColor);
      gradient.addColorStop(1, theme.secondaryColor);
      return gradient;
    } else if (theme.backgroundValue.includes('to top')) {
      const gradient = ctx.createLinearGradient(0, size.height, 0, 0);
      gradient.addColorStop(0, theme.primaryColor);
      gradient.addColorStop(1, theme.secondaryColor);
      return gradient;
    } else if (theme.backgroundValue.includes('to bottom')) {
      const gradient = ctx.createLinearGradient(0, 0, 0, size.height);
      gradient.addColorStop(0, theme.primaryColor);
      gradient.addColorStop(1, theme.secondaryColor);
      return gradient;
    } else {
      // Default diagonal
      const gradient = ctx.createLinearGradient(0, 0, size.width, size.height);
      gradient.addColorStop(0, theme.primaryColor);
      gradient.addColorStop(1, theme.secondaryColor);
      return gradient;
    }
  }
  
  private calculateOptimalFontSize(
    text: string,
    _size: CardSize,
    format: string
  ): number {
    const baseSize = format === 'story' ? 52 : format === 'square' ? 44 : 38;
    const lengthFactor = Math.max(0.4, Math.min(1, 120 / text.length));
    return Math.floor(baseSize * lengthFactor);
  }
  
  private wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number
  ): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }
  
  private getOptimalQuality(format: string): number {
    // Balance quality vs file size
    switch(format) {
      case 'story': return 0.85; // Larger image, slightly lower quality
      case 'square': return 0.90;
      case 'landscape': return 0.92;
      case 'twitter': return 0.88;
      default: return 0.90;
    }
  }
  
  private getCacheKey(options: CardOptions): string {
    const message = options.personalMessage || '';
    return `${options.verse.reference}-${options.theme.id}-${options.format}-${message.length}`;
  }
  
  private async generateSVGCard(options: CardOptions): Promise<Blob> {
    const size = this.FORMATS[options.format];
    const fontSize = this.calculateOptimalFontSize(options.verse.text, size, options.format);
    
    // Simple word wrapping for SVG
    const maxCharsPerLine = Math.floor(size.width / (fontSize * 0.6));
    const words = options.verse.text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      if ((currentLine + ' ' + word).length > maxCharsPerLine && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = currentLine ? currentLine + ' ' + word : word;
      }
    }
    if (currentLine) lines.push(currentLine);
    
    const lineHeight = fontSize * 1.4;
    const startY = (size.height - (lines.length * lineHeight)) / 2;
    
    const gradientId = `gradient-${options.theme.id}`;
    const textElements = lines.map((line, index) => 
      `<text x="50%" y="${startY + (index * lineHeight) + fontSize}" text-anchor="middle" 
             fill="${options.theme.textColor}" font-family="${options.theme.fontFamily}" 
             font-size="${fontSize}" dominant-baseline="middle">${line}</text>`
    ).join('');
    
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}">
        <defs>
          ${options.theme.backgroundType === 'gradient' ? 
            `<linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${options.theme.primaryColor}" />
              <stop offset="100%" style="stop-color:${options.theme.secondaryColor}" />
            </linearGradient>` : ''
          }
        </defs>
        <rect width="100%" height="100%" 
              fill="${options.theme.backgroundType === 'gradient' ? `url(#${gradientId})` : options.theme.backgroundValue}" />
        ${textElements}
        <text x="50%" y="${size.height - (size.height * 0.1)}" text-anchor="middle" 
              fill="${options.theme.textColor}" opacity="0.8"
              font-family="${options.theme.fontFamily}" font-size="${fontSize * 0.6}">
          ${options.verse.reference}
        </text>
        ${options.personalMessage ? 
          `<text x="50%" y="${size.height - (size.height * 0.15)}" text-anchor="middle" 
                 fill="${options.theme.textColor}" opacity="0.7"
                 font-family="Inter, sans-serif" font-size="${fontSize * 0.5}">
            ${options.personalMessage}
          </text>` : ''
        }
        ${options.includeWatermark ? 
          `<text x="50%" y="${size.height - 30}" text-anchor="middle" 
                 fill="${options.theme.textColor}" opacity="0.4"
                 font-family="Inter, sans-serif" font-size="${fontSize * 0.4}">
            HolyDrop
          </text>` : ''
        }
      </svg>
    `;
    
    return new Blob([svg], { type: 'image/svg+xml' });
  }
  
  private async generateServerCard(options: CardOptions): Promise<Blob | null> {
    try {
      const response = await fetch('/api/cards/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options)
      });
      
      if (!response.ok) throw new Error('Server generation failed');
      
      return await response.blob();
    } catch (error) {
      console.error('Server card generation failed:', error);
      return null;
    }
  }
  
  // Method to get current strategy
  getCurrentStrategy(): string {
    return this.strategy;
  }
  
  // Method to clear cache when memory is low
  clearCache() {
    this.cache.clear();
  }
  
  // Get cache statistics
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_CACHE_SIZE,
      keys: Array.from(this.cache.keys()),
      totalSize: Array.from(this.cache.values()).reduce((sum, blob) => sum + blob.size, 0)
    };
  }
  
  // Get all available themes
  static getThemes(): CardTheme[] {
    return Object.values(VerseCardGenerator.THEMES);
  }
  
  // Get format information
  getFormats(): Record<string, CardSize> {
    return this.FORMATS;
  }
}

// Export types for use in components
export type { CardTheme, CardOptions, CardSize };