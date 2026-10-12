# PaPip Video Storage Architecture & Provider Guide

PaPip is designed with a modern decoupled media architecture: **video files (large binary assets) are never stored in database documents (like Firestore, which has a 1MB per document ceiling)**. Instead, video binaries live in object/media storage, while Firestore or IndexedDB holds metadata, durations, views, and streaming URLs.

---

## 1. How PaPip Handles Video Storage

### Local & Offline High-Capacity Mode (Default Active Engine)
- **Engine**: Browser Native **IndexedDB** (`papip_media_store_v1`).
- **Capacity**: Browser quota usually grants 50% of available disk space (often 20 GB to 100+ GB per origin).
- **Blob Handling**: Uploaded video files (`.mp4`, `.webm`, `.mov`) are committed as native binary Blobs.
- **Playback**: Instant streaming via memory-efficient `URL.createObjectURL(blob)`.
- **Thumbnail Capture**: Extracted client-side at timestamp `1.0s` using HTML5 Canvas hardware decoding.

---

## 2. Recommended Production Cloud Media Providers

When deploying PaPip to production with distributed global playback, integrate one of the following storage backends:

### A. Firebase Cloud Storage (Google Cloud Storage)
- **Best for**: Direct pairing with Firebase Auth and Firestore.
- **Free Tier (Spark Plan)**:
  - **Storage**: 5 GB total.
  - **Download Bandwidth**: 1 GB / day.
  - **Upload operations**: 20,000 / day.
- **Pay-as-you-go (Blaze Plan)**:
  - Storage: ~$0.026 / GB / month.
  - Bandwidth Out: ~$0.12 / GB.
- **Setup in PaPip**:
  ```ts
  import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
  const storage = getStorage();
  const fileRef = ref(storage, `videos/${userId}/${file.name}`);
  const task = uploadBytesResumable(fileRef, file);
  ```

### B. Cloudinary / Mux (Video Streaming & Adaptive Bitrate)
- **Best for**: Automatic HLS chunking, transcode to 1080p/720p/480p, instant thumbnail sprites.
- **Free Tier**:
  - Cloudinary: 25 Monthly Credits (~25 GB managed bandwidth/storage).
  - Mux: Free developer trial with watermark credits, then $0.005/min encoded.
- **Pricing**:
  - $0.0013 per minute of video streamed.

### C. Cloudflare Stream / R2 Object Storage
- **Best for**: Lowest bandwidth egress fees ($0 egress fee on Cloudflare R2).
- **Free Tier**:
  - 10 GB storage per month free.
  - $0 / GB bandwidth egress.
- **Pricing**:
  - R2 Storage: $0.015 / GB / month.
  - Cloudflare Stream (ready-to-play encoding): $5 / 1,000 minutes stored + $1 / 1,000 minutes viewed.

---

## 3. Environment Variables

Create `.env` based on `.env.example`:
```env
# Optional Gemini AI API Key
GEMINI_API_KEY="your_gemini_api_key"

# App public URL
APP_URL="http://localhost:3000"

# Optional Live Firebase Production Setup (also configurable via Settings UI)
VITE_FIREBASE_API_KEY=""
VITE_FIREBASE_AUTH_DOMAIN=""
VITE_FIREBASE_PROJECT_ID=""
VITE_FIREBASE_STORAGE_BUCKET=""
VITE_FIREBASE_MESSAGING_SENDER_ID=""
VITE_FIREBASE_APP_ID=""
```
