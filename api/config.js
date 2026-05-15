export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  let validUrl = false;

  try {
    validUrl = new URL(supabaseUrl).protocol === 'https:';
  } catch (err) {
    validUrl = false;
  }

  if (!validUrl || !supabaseAnonKey) {
    res.status(200).json({
      configured: false,
      supabaseUrl: '',
      supabaseAnonKey: ''
    });
    return;
  }

  res.status(200).json({
    configured: true,
    supabaseUrl,
    supabaseAnonKey
  });
}
