interface CachedFont {
  url: string;
  fontName: string;
  data: string; // base64 encoded font
  timestamp: number;
}

const FONT_CACHE_DB = 'MuajjinFontCache';
const FONT_STORE = 'fonts';

/**
 * Service for downloading, caching, and loading custom fonts for translations
 */
export class FontService {
  private db: IDBDatabase | null = null;

  /**
   * Initialize IndexedDB for font caching
   */
  private async initDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(FONT_CACHE_DB, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(FONT_STORE)) {
          db.createObjectStore(FONT_STORE, { keyPath: 'url' });
        }
      };
    });
  }

  /**
   * Generate a safe font name from URL
   */
  private getFontNameFromUrl(url: string, translationId: string): string {
    // Create a unique font name based on translation ID
    return `TranslationFont-${translationId}`;
  }

  /**
   * Check if font is already cached
   */
  async isFontCached(url: string): Promise<boolean> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(FONT_STORE, 'readonly');
        const store = transaction.objectStore(FONT_STORE);
        const request = store.get(url);

        request.onsuccess = () => resolve(!!request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error checking font cache:', error);
      return false;
    }
  }

  /**
   * Download and cache font from URL
   */
  async downloadFont(url: string, translationId: string): Promise<string> {
    try {
      // Check if already cached
      const cached = await this.getCachedFont(url);
      if (cached) {
        console.log('Font already cached:', url);
        return this.getFontNameFromUrl(url, translationId);
      }

      console.log('Downloading font:', url);

      // Download font
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to download font: ${response.statusText}`);
      }

      const blob = await response.blob();

      // Convert to base64
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const base64 = reader.result as string;

            // Cache the font
            await this.cacheFont(url, {
              url,
              fontName: this.getFontNameFromUrl(url, translationId),
              data: base64,
              timestamp: Date.now()
            });

            resolve(this.getFontNameFromUrl(url, translationId));
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error downloading font:', error);
      throw error;
    }
  }

  /**
   * Get cached font data
   */
  private async getCachedFont(url: string): Promise<CachedFont | null> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(FONT_STORE, 'readonly');
        const store = transaction.objectStore(FONT_STORE);
        const request = store.get(url);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error getting cached font:', error);
      return null;
    }
  }

  /**
   * Cache font data in IndexedDB
   */
  private async cacheFont(font: CachedFont): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(FONT_STORE, 'readwrite');
        const store = transaction.objectStore(FONT_STORE);
        const request = store.put(font);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error caching font:', error);
      throw error;
    }
  }

  /**
   * Load and apply font to document
   */
  async loadFont(fontUrl: string, translationId: string): Promise<string> {
    try {
      const fontName = this.getFontNameFromUrl(fontUrl, translationId);

      // Check if font-face is already defined
      const existingFont = document.querySelector(`style[data-font="${fontName}"]`);
      if (existingFont) {
        console.log('Font already loaded:', fontName);
        return fontName;
      }

      // Download/cached font
      await this.downloadFont(fontUrl, translationId);

      // Get cached font data
      const cached = await this.getCachedFont(fontUrl);
      if (!cached) {
        throw new Error('Font not found in cache after download');
      }

      // Create FontFace
      const fontFace = new FontFace(fontName, `url(${cached.data})`);
      await fontFace.load();

      // Add to document
      document.fonts.add(fontFace);

      // Create style tag for reference
      const style = document.createElement('style');
      style.setAttribute('data-font', fontName);
      style.textContent = `
        [data-translation-font="${fontName}"] {
          font-family: '${fontName}', system-ui, -apple-system, sans-serif;
        }
      `;
      document.head.appendChild(style);

      console.log('Font loaded successfully:', fontName);
      return fontName;
    } catch (error) {
      console.error('Error loading font:', error);
      throw error;
    }
  }

  /**
   * Apply font to document root
   */
  applyFont(fontName: string): void {
    document.documentElement.setAttribute('data-translation-font', fontName);
  }

  /**
   * Remove custom font and revert to default
   */
  removeFont(fontName: string): void {
    document.documentElement.removeAttribute('data-translation-font');

    // Remove style tag
    const style = document.querySelector(`style[data-font="${fontName}"]`);
    if (style) {
      style.remove();
    }
  }

  /**
   * Clear font cache for a specific URL or all fonts
   */
  async clearFontCache(url?: string): Promise<void> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(FONT_STORE, 'readwrite');
        const store = transaction.objectStore(FONT_STORE);

        if (url) {
          const request = store.delete(url);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        } else {
          const request = store.clear();
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        }
      });
    } catch (error) {
      console.error('Error clearing font cache:', error);
      throw error;
    }
  }

  /**
   * Get cache size in bytes
   */
  async getCacheSize(): Promise<number> {
    try {
      const db = await this.initDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(FONT_STORE, 'readonly');
        const store = transaction.objectStore(FONT_STORE);
        const request = store.getAllKeys();

        request.onsuccess = async () => {
          let size = 0;
          const keys = request.result;
          for (const key of keys) {
            const getReq = store.get(key);
            await new Promise((res) => {
              getReq.onsuccess = () => {
                const font = getReq.result;
                if (font) {
                  size += font.data.length;
                }
                res(null);
              };
            });
          }
          resolve(size);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('Error calculating cache size:', error);
      return 0;
    }
  }

  /**
   * Format bytes to human readable size
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}

// Export singleton instance
export const fontService = new FontService();
