//supabase와 통신하는 클라이언트 역할 파일

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log("URL 테스트:", supabaseUrl);
console.log("KEY 테스트:", supabaseAnonKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);