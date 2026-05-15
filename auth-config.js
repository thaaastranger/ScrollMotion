// Local fallback only. Production reads these public values from /api/config,
// backed by Vercel Environment Variables.
// Never put Supabase service-role keys in client-side files.
window.SCROLLMOTION_SUPABASE = {
  url: '',
  anonKey: ''
};
