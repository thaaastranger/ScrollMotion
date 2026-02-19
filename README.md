# ScrollMotion

> Turn any video or image sequence into scroll-driven experiences

Transform videos and image sequences into interactive scroll-driven playback. Export as self-contained HTML with zero dependencies—deploy anywhere.

🔗 **Live Demo:** [scrollmotion-nine.vercel.app](https://scrollmotion-nine.vercel.app)

---

## Features

- 🎬 **Video & Image Sequences** - Support for MP4, MOV, WebM, plus multi-image uploads and ZIP files
- ⚡ **Client-Side Processing** - Instant exports with no server uploads required
- 📦 **Self-Contained HTML** - Frames embedded as base64, zero dependencies
- 🎨 **Full Quality Control** - Adjust frames, resolution (up to 4K), aspect ratio, format (JPEG/WebP), compression
- 📱 **Mobile Optimized** - Smooth scrolling on any device
- 🚀 **Deploy Anywhere** - Works on Vercel, Netlify, GitHub Pages, S3, or locally

---

## Quick Start

### 1. Clone & Run Locally

```bash
git clone https://github.com/thaaastranger/ScrollMotion.git
cd ScrollMotion
open index.html
```

No build step required—just open `index.html` in your browser.

### 2. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/thaaastranger/ScrollMotion)

---

## Pricing Tiers

### Free
- 3 exports/month
- Up to 50 frames
- 720p max resolution
- JPEG only
- 50MB file limit
- Watermark

### Pro ($15/month)
- Unlimited exports
- Up to 300 frames
- 4K resolution
- JPEG + WebP
- 500MB file limit
- No watermark

### Business ($79/month)
- Everything in Pro
- Unlimited frames
- 8K resolution
- All formats
- 5GB file limit
- API access (coming soon)

---

## How It Works

1. **Upload** a video (MP4/MOV/WebM) or image sequence (multi-file or ZIP)
2. **Configure** frames, scroll speed, resolution, aspect ratio, quality
3. **Export** as self-contained HTML with embedded base64 frames
4. **Deploy** anywhere—no backend required

---

## Tech Stack

- **Frontend:** Vanilla JavaScript, HTML5 Canvas API
- **Libraries:** JSZip (for ZIP extraction)
- **Hosting:** Vercel
- **Payments:** Stripe (ready to integrate)
- **Auth:** Supabase Auth (ready to integrate)

---

## Project Structure

```
scrollmotion/
├── index.html          # Main app (upload & editor)
├── landing.html        # Marketing landing page
├── pricing.html        # Pricing page
├── app.js             # Core application logic + tier limits
├── styles.css         # All styles
└── README.md          # This file
```

---

## Development Roadmap

### ✅ Phase 1: MVP (Complete)
- Video frame extraction
- Basic export to HTML
- Image sequence support
- Compression controls (quality, format, resolution)

### ✅ Phase 2: Product Infrastructure (Complete)
- Landing page
- Pricing page
- Tier-based feature gating
- Upgrade modals

### 🚧 Phase 3: Monetization (In Progress)
- [ ] Supabase Auth integration
- [ ] Stripe payment integration
- [ ] User dashboard
- [ ] Usage analytics

### 📋 Phase 4: Advanced Features (Planned)
- [ ] Timeline editor (trim, speed curves)
- [ ] Templates library
- [ ] Team collaboration
- [ ] API access
- [ ] AVIF format support
- [ ] Shareable CDN hosting

---

## Contributing

This is currently a solo project, but contributions are welcome! If you'd like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - feel free to use this for personal or commercial projects.

---

## Support

- **Email:** [email protected] (coming soon)
- **Twitter:** [@scrollmotion](https://twitter.com/scrollmotion) (coming soon)
- **GitHub Issues:** [Report a bug](https://github.com/thaaastranger/ScrollMotion/issues)

---

**Built with ❤️ for creators**

Transform your videos into scroll magic → [Get Started](https://scrollmotion-nine.vercel.app)
