import admin from 'firebase-admin';
import './src/firebase/index.js';

async function listBuckets() {
  try {
    const defaultBucket = admin.storage().bucket();
    const [buckets] = await defaultBucket.storage.getBuckets();
    console.log('--- Available Buckets in this Firebase Project ---');
    buckets.forEach(b => console.log(b.name));
    console.log('------------------------------------------------');
    process.exit(0);
  } catch (err) {
    console.error('Failed to list buckets:', err.message || err);
    process.exit(1);
  }
}

listBuckets();
