import { bucket } from './src/firebase/index.js';

async function setCors() {
  try {
    console.log(`Setting CORS for bucket: ${bucket.name}`);
    await bucket.setCorsConfiguration([
      {
        origin: ['*'], // Or limit to your frontend domain in production
        method: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
        responseHeader: ['Content-Type', 'Authorization', 'Content-Length', 'User-Agent', 'x-goog-resumable'],
        maxAgeSeconds: 3600,
      },
    ]);
    console.log('CORS configuration successfully updated!');
    process.exit(0);
  } catch (err) {
    console.error('Failed to set CORS:', err);
    process.exit(1);
  }
}

setCors();
