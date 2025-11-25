import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const { data: { user } } = await supabase.auth.getUser();
    const isAdmin = user?.email === 'cljackson79@gmail.com';
    
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin only' },
        { status: 403 }
      );
    }

    const results: any = {
      timestamp: new Date().toISOString(),
      checks: [],
    };

    // 1. Check if septic_tanks table exists and count records
    try {
      const { count, error } = await supabase
        .from('septic_tanks')
        .select('*', { count: 'exact', head: true });
      
      results.checks.push({
        name: 'septic_tanks_table',
        status: error ? 'FAIL' : 'PASS',
        message: error ? error.message : `Table exists with ${count || 0} records`,
        count: count || 0,
      });
    } catch (err: any) {
      results.checks.push({
        name: 'septic_tanks_table',
        status: 'ERROR',
        message: err.message,
      });
    }

    // 2. Check Florida records
    try {
      const { count, error } = await supabase
        .from('septic_tanks')
        .select('*', { count: 'exact', head: true })
        .eq('state', 'FL');
      
      results.checks.push({
        name: 'florida_records',
        status: error ? 'FAIL' : ((count ?? 0) > 0 ? 'PASS' : 'WARN'),
        message: error ? error.message : `${count ?? 0} Florida records`,
        count: count ?? 0,
      });
    } catch (err: any) {
      results.checks.push({
        name: 'florida_records',
        status: 'ERROR',
        message: err.message,
      });
    }

    // 3. Sample records
    try {
      const { data, error } = await supabase
        .from('septic_tanks')
        .select('id, county, state, address')
        .limit(3);
      
      results.checks.push({
        name: 'sample_records',
        status: error ? 'FAIL' : (data && data.length > 0 ? 'PASS' : 'WARN'),
        message: error ? error.message : `${data?.length ?? 0} sample records retrieved`,
        samples: data ?? [],
      });
    } catch (err: any) {
      results.checks.push({
        name: 'sample_records',
        status: 'ERROR',
        message: err.message,
      });
    }

    // 4. Test find_nearest_septic_tank function
    try {
      // Miami test coordinates (25.8478, -80.2197)
      const { data, error } = await supabase.rpc('find_nearest_septic_tank', {
        search_lat: 25.8478,
        search_lng: -80.2197,
        search_radius_meters: 200,
      });
      
      results.checks.push({
        name: 'find_nearest_function',
        status: error ? 'FAIL' : 'PASS',
        message: error ? error.message : `Function works, found ${data?.length ?? 0} tanks`,
        result: data ?? null,
      });
    } catch (err: any) {
      results.checks.push({
        name: 'find_nearest_function',
        status: 'ERROR',
        message: err.message,
      });
    }

    // 5. Check septic_sources table
    try {
      const { count, error } = await supabase
        .from('septic_sources')
        .select('*', { count: 'exact', head: true });
      
      results.checks.push({
        name: 'septic_sources_table',
        status: error ? 'FAIL' : 'PASS',
        message: error ? error.message : `${count ?? 0} source records`,
        count: count ?? 0,
      });
    } catch (err: any) {
      results.checks.push({
        name: 'septic_sources_table',
        status: 'ERROR',
        message: err.message,
      });
    }

    // 6. Test Orlando address geocoding
    try {
      const orlandoLat = 28.5383;
      const orlandoLng = -81.3792;
      
      const { data, error } = await supabase.rpc('find_nearest_septic_tank', {
        search_lat: orlandoLat,
        search_lng: orlandoLng,
        search_radius_meters: 200,
      });
      
      results.checks.push({
        name: 'orlando_test',
        status: error ? 'FAIL' : (data && data.length > 0 ? 'PASS' : 'WARN'),
        message: error ? error.message : `Found ${data?.length ?? 0} tanks near Orlando`,
        result: data ?? null,
      });
    } catch (err: any) {
      results.checks.push({
        name: 'orlando_test',
        status: 'ERROR',
        message: err.message,
      });
    }

    // Summary
    const passCount = results.checks.filter((c: any) => c.status === 'PASS').length;
    const failCount = results.checks.filter((c: any) => c.status === 'FAIL').length;
    const errorCount = results.checks.filter((c: any) => c.status === 'ERROR').length;

    results.summary = {
      total: results.checks.length,
      pass: passCount,
      fail: failCount,
      error: errorCount,
      overall: failCount === 0 && errorCount === 0 ? 'HEALTHY' : 'ISSUES_FOUND',
    };

    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    console.error('Diagnostic error:', error);
    return NextResponse.json(
      { error: error.message || 'Diagnostic failed' },
      { status: 500 }
    );
  }
}
