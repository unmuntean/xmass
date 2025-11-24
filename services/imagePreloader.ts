import { Product } from '../types';

class ImagePreloader {
  private loadedImages: Set<string> = new Set();
  private loadingPromises: Map<string, Promise<void>> = new Map();

  preloadImage(url: string): Promise<void> {
    // Skip if already loaded
    if (this.loadedImages.has(url)) {
      return Promise.resolve();
    }

    // Return existing promise if already loading
    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    // Create new loading promise
    const promise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.loadedImages.add(url);
        this.loadingPromises.delete(url);
        resolve();
      };
      
      img.onerror = () => {
        console.warn(`Failed to preload image: ${url}`);
        this.loadingPromises.delete(url);
        reject();
      };

      // Handle CORS for external images
      if (url.includes('cupio.ro') || url.includes('cdn.')) {
        img.crossOrigin = 'anonymous';
      }
      
      img.src = url;
    });

    this.loadingPromises.set(url, promise);
    return promise;
  }

  async preloadProducts(products: Product[]): Promise<void> {
    const imageUrls = products
      .map(p => p.imageUrl)
      .filter(url => url && url.trim() !== '');

    // Load all images in parallel
    await Promise.allSettled(imageUrls.map(url => this.preloadImage(url)));
  }

  isImageLoaded(url: string): boolean {
    return this.loadedImages.has(url);
  }

  clear(): void {
    this.loadedImages.clear();
    this.loadingPromises.clear();
  }
}

export const imagePreloader = new ImagePreloader();

