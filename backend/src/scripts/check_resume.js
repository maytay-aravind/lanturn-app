// Debug script: check student resume data
import { supabase } from '#supabase';

const { data, error } = await supabase
  .from('students')
  .select('uid, resume_url, resume_text, resume_keywords')
  .limit(5);

if (error) {
  console.error('Error:', error);
} else if (!data || data.length === 0) {
  console.log('No students found');
} else {
  for (const row of data) {
    console.log('---');
    console.log('uid:', row.uid);
    console.log('resume_url:', JSON.stringify(row.resume_url));
    console.log('resume_text length:', (row.resume_text || '').length);
    console.log('resume_keywords count:', (row.resume_keywords || []).length);
  }
}

process.exit(0);
