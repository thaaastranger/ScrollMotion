# Supabase setup

ScrollMotion uses Supabase Auth for passwordless magic-link login and Supabase Storage for profile pictures.

## 1. Create the database structure

Open Supabase SQL Editor and run `supabase/schema.sql`.

This creates:

- `public.profiles` for user profile data
- `public.exports` for future export history
- `avatars` storage bucket for profile pictures
- Row-level security policies so users can only edit their own profile data

## 2. Add the app URL

In Supabase Dashboard:

- Authentication > URL Configuration
- Site URL: your production URL, for example `https://scrollmotion-nine.vercel.app`
- Redirect URLs: add the same production URL and your local file/dev URL while testing

## 3. Configure Vercel Environment Variables

In Vercel Project Settings > Environment Variables, add:

```txt
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
```

The app reads these through `/api/config`. The anon key is intended to be public and is protected by Row Level Security policies. Do not add Supabase service-role keys to Vercel for this frontend app.

For local file-only testing, you can temporarily fill `auth-config.js` with the same public URL and anon key. Do not commit private keys.

## 4. Add the black magic-link email

In Supabase Dashboard:

- Authentication > Email Templates
- Magic Link
- Paste `supabase/magic-link-email.html`

Keep `{{ .ConfirmationURL }}` in the template. Supabase replaces it with the secure sign-in link.
