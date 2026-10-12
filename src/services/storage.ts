/**
 * IndexedDB Media & Metadata Storage Service for PaPip
 * Enables storing real large video files (Blob/File) locally without localStorage limits,
 * generating ObjectURLs for immediate native HTML5 video playback.
 */

const DB_NAME = 'papip_media_store_v1';
const DB_VERSION = 1;
const BLOB_STORE = 'video_blobs';
const THUMB_STORE = 'thumbnail_blobs';

class LocalMediaDB {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB not supported in this environment'));
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(BLOB_STORE)) {
          db.createObjectStore(BLOB_STORE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(THUMB_STORE)) {
          db.createObjectStore(THUMB_STORE, { keyPath: 'id' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  /**
   * Save a real video file (Blob) to IndexedDB
   */
  async saveVideoBlob(id: string, file: Blob, mimeType: string): Promise<string> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([BLOB_STORE], 'readwrite');
      const store = tx.objectStore(BLOB_STORE);
      const req = store.put({ id, data: file, mimeType, createdAt: Date.now() });

      req.onsuccess = () => resolve(id);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Retrieve video blob and create an active ObjectURL for the <video> element
   */
  async getVideoBlobUrl(id: string): Promise<string | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([BLOB_STORE], 'readonly');
      const store = tx.objectStore(BLOB_STORE);
      const req = store.get(id);

      req.onsuccess = () => {
        if (req.result && req.result.data) {
          const blob = req.result.data as Blob;
          const url = URL.createObjectURL(blob);
          resolve(url);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Delete video blob from IndexedDB
   */
  async deleteVideoBlob(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([BLOB_STORE], 'readwrite');
      const store = tx.objectStore(BLOB_STORE);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Save thumbnail image data/blob
   */
  async saveThumbnail(id: string, dataUrl: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([THUMB_STORE], 'readwrite');
      const store = tx.objectStore(THUMB_STORE);
      const req = store.put({ id, dataUrl, createdAt: Date.now() });

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Calculate approximate storage used by media blobs (in MB)
   */
  async getStorageUsageMB(): Promise<number> {
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        if (estimate.usage) {
          return +(estimate.usage / (1024 * 1024)).toFixed(2);
        }
      }
    } catch {
      // Fallback
    }
    return 0;
  }
}

export const mediaStorage = new LocalMediaDB();

/**
 * Utility to extract a frame from a video file as thumbnail
 */
export async function captureVideoFrame(
  file: File | Blob,
  seekTimeSeconds: number = 1.0
): Promise<{ dataUrl: string; duration: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const url = URL.createObjectURL(file);
    video.src = url;

    let duration = 0;

    video.onloadedmetadata = () => {
      duration = video.duration || 0;
      // Seek to valid position (min between seekTimeSeconds and duration / 2)
      const seek = Math.min(seekTimeSeconds, Math.max(0.1, duration / 2));
      video.currentTime = seek;
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          return reject(new Error('Could not create canvas context'));
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        URL.revokeObjectURL(url);
        resolve({ dataUrl, duration: Math.round(duration) });
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video file for thumbnail generation'));
    };
  });
}
