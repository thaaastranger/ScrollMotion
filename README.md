# ScrollMotion

Turn any video into Apple-style scroll-driven playback.

## How it works

1. **Open `index.html`** in your browser (just double-click or drag to browser)
2. **Upload a video** — drag & drop or click to browse (MP4, MOV, WebM)
3. **Scroll to play** — the video scrubs forward/backward as you scroll
4. **Adjust settings** — control frame count (20–300) and scroll speed (15–100px per frame)
5. **Export** — downloads a self-contained HTML file with all frames baked in as base64

## Output

The exported file is a single HTML file with zero dependencies. All video frames are embedded as base64 JPEG images. Just open it in any browser or deploy it anywhere.

## Settings

| Setting | Range | Default | Description |
|---------|-------|---------|-------------|
| Frames | 20–300 | 80 | Number of frames extracted for export |
| Scroll Speed | 15–100px | 40px | Pixels of scroll per frame |

## Notes

- Preview uses native video scrubbing (instant, no processing)
- Frames are only extracted when you export
- Larger frame counts = smoother playback but bigger file size
- 60–120 frames is the sweet spot for most videos
- Works best with MP4 (H.264) files

## Deployment

This is a single HTML file with no build step. To deploy:

```
scrollmotion/
└── index.html    ← just serve this
```

Upload to any static host (Netlify, Vercel, GitHub Pages, S3, etc.) or open locally.
