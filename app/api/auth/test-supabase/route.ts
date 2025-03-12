// Create a simple test file to check connection
// pages/api/test-supabase.ts or app/api/test-supabase/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('leads').select('count');
    
    if (error) throw error;
    
    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connection successful',
      data
    });
  } catch (error) {
    console.error('Supabase test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Supabase connection failed',
      details: error
    }, { status: 500 });
  }
}