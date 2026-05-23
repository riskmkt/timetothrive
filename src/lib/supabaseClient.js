import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://meomaidcjlinrtnvqtzz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lb21haWRjamxpbnJ0bnZxdHp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMzI2NzMsImV4cCI6MjA5NDYwODY3M30.ybKqcNB-lThF70epz63YrzZqWKzAKYjO8xXWHY3D24s';

export const supabase = createClient(supabaseUrl, supabaseKey);