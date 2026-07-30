/**
 * One-time script: creates the three Supabase Storage buckets.
 * Run with: node src/supabase/setup-storage.js
 */
import { supabase } from './index.js';

const buckets = [
  { name: 'resumes',          public: false },
  { name: 'profile-pictures', public: true  },
  { name: 'company-logos',    public: true  },
];

for (const { name, public: isPublic } of buckets) {
  const { data, error } = await supabase.storage.createBucket(name, {
    public: isPublic,
    fileSizeLimit: 5 * 1024 * 1024, // 5 MB max
    allowedMimeTypes: name === 'resumes'
      ? ['application/pdf']
      : ['image/png', 'image/jpeg', 'image/webp'],
  });

  if (error && error.message !== 'The resource already exists') {
    console.error(`❌ Failed to create bucket "${name}":`, error.message);
  } else {
    console.log(`✅ Bucket "${name}" ready (public=${isPublic})`);
  }
}
