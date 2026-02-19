(() => {
  // State
  let fc = 80, ppf = 40, dur = 0, vw = 0, vh = 0, ready = false;
  let mode = 'video'; // 'video' or 'images'
  let imageFrames = []; // Base64 data URLs for image sequences
  let jpegQuality = 0.8, exportFormat = 'jpeg';

  // Refs
  const $ = id => document.getElementById(id);
  const U = $('U'), W = $('W'), drop = $('drop'), fi = $('fi');
  const vid = $('vid'), pvScroll = $('pvScroll'), runway = $('runway');
  const badge = $('badge'), prog = $('prog'), hint = $('hint');
  const scrub = $('scrub'), scrubF = $('scrubF'), scrubT = $('scrubT');
  const ovLoad = $('ovLoad'), ovLoadT = $('ovLoadT');
  const ovExport = $('ovExport'), ovExT = $('ovExT'), ovExBar = $('ovExBar'), ovExPct = $('ovExPct');
  const fname = $('fname');
  const rFr = $('rFr'), rSp = $('rSp'), vFr = $('vFr'), vSp = $('vSp');
  const mDur = $('mDur'), mRes = $('mRes'), mFr = $('mFr'), mSc = $('mSc');
  const bDl = $('bDl'), bCp = $('bCp');

  // New refs for image sequence support
  const uplTabs = document.querySelectorAll('.upl-tab');
  const dropLabel = $('dropLabel'), dropHint = $('dropHint');
  const fiImg = $('fiImg'), fiZip = $('fiZip');
  const rQual = $('rQual'), vQual = $('vQual'), selFormat = $('selFormat');

  // ── Mode Toggle ──
  uplTabs.forEach(tab => {
    tab.onclick = () => {
      uplTabs.forEach(t => t.classList.remove('on'));
      tab.classList.add('on');
      mode = tab.dataset.mode;

      if (mode === 'video') {
        dropLabel.textContent = 'Drop a video or click to browse';
        dropHint.textContent = 'MP4 · MOV · WebM';
      } else {
        dropLabel.textContent = 'Drop images/ZIP or click to browse';
        dropHint.textContent = 'JPG · PNG · WebP · ZIP';
      }
    };
  });

  // ── Upload ──
  drop.onclick = () => {
    if (mode === 'video') {
      fi.click();
    } else {
      // For image mode, show choice or default to multi-file
      fiImg.click();
    }
  };
  drop.ondragover = e => { e.preventDefault(); drop.classList.add('over'); };
  drop.ondragleave = () => drop.classList.remove('over');
  drop.ondrop = e => {
    e.preventDefault();
    drop.classList.remove('over');
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    if (mode === 'video') {
      if (files[0]) load(files[0]);
    } else {
      // Check if it's a ZIP file or image files
      if (files.length === 1 && files[0].name.toLowerCase().endsWith('.zip')) {
        handleZipUpload(files[0]);
      } else {
        handleImageSequence(files);
      }
    }
  };
  fi.onchange = e => { if (e.target.files[0]) load(e.target.files[0]); };
  fiImg.onchange = e => {
    if (e.target.files.length > 0) handleImageSequence(Array.from(e.target.files));
  };
  fiZip.onchange = e => {
    if (e.target.files[0]) handleZipUpload(e.target.files[0]);
  };

  function load(file) {
    ready = false;
    U.classList.add('gone');
    W.classList.add('on');
    fname.textContent = file.name;
    ovLoad.classList.add('on');
    ovLoadT.textContent = 'Loading video…';

    const url = URL.createObjectURL(file);
    vid.src = url;
    vid.load();

    let done = false;
    const onReady = () => {
      if (done) return;
      if (vid.readyState >= 2 && vid.duration && vid.duration < Infinity && vid.videoWidth > 0) {
        done = true;
        dur = vid.duration; vw = vid.videoWidth; vh = vid.videoHeight;
        ready = true;
        vid.currentTime = 0;
        ovLoad.classList.remove('on');
        badge.classList.add('on');
        scrub.classList.add('on');
        bDl.disabled = false; bCp.disabled = false;
        updateMeta(); updateRunway(); updateExSum();
      }
    };

    vid.onloadeddata = onReady;
    vid.oncanplay = onReady;
    vid.oncanplaythrough = onReady;
    const poll = setInterval(() => { onReady(); if (done) clearInterval(poll); }, 200);
    setTimeout(() => { clearInterval(poll); if (!done) ovLoadT.textContent = 'Still loading… ensure the file is a valid video.'; }, 8000);
    setTimeout(() => { clearInterval(poll); if (!done) ovLoadT.textContent = 'Could not load video. Try MP4 (H.264).'; }, 25000);
  }

  // ── Helper: Load image to get dimensions ──
  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  // ── Helper: Convert file to data URL ──
  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ── Handle Image Sequence Upload ──
  async function handleImageSequence(files) {
    ready = false;
    U.classList.add('gone');
    W.classList.add('on');

    // Filter only images, sort by filename
    const imgFiles = files.filter(f => f.type.startsWith('image/')).sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );

    if (imgFiles.length === 0) {
      alert('No valid images found');
      return;
    }

    fname.textContent = `${imgFiles.length} images`;
    ovLoad.classList.add('on');
    ovLoadT.textContent = `Loading ${imgFiles.length} images…`;

    imageFrames = [];

    // Load first image to get dimensions
    const firstImg = await loadImage(imgFiles[0]);
    vw = firstImg.width;
    vh = firstImg.height;

    // Load all images with progress tracking
    for (let i = 0; i < imgFiles.length; i++) {
      const dataUrl = await fileToDataUrl(imgFiles[i]);
      imageFrames.push(dataUrl);
      const progress = Math.round(((i + 1) / imgFiles.length) * 100);
      ovLoadT.textContent = `Loading images… ${progress}%`;
    }

    fc = imageFrames.length;
    dur = fc / 30; // Simulate 30fps duration for preview scrubbing

    ready = true;
    ovLoad.classList.remove('on');
    badge.classList.add('on');
    scrub.classList.add('on');
    bDl.disabled = false; bCp.disabled = false;

    // Update UI
    rFr.value = fc;
    rFr.max = fc; // Lock max frames to sequence length
    vFr.textContent = fc;
    updateMeta();
    updateRunway();
    updateExSum();
    renderImagePreview(0); // Show first frame
  }

  // ── Handle ZIP Upload ──
  async function handleZipUpload(zipFile) {
    ready = false;
    U.classList.add('gone');
    W.classList.add('on');
    fname.textContent = zipFile.name;
    ovLoad.classList.add('on');
    ovLoadT.textContent = 'Extracting ZIP…';

    try {
      const zip = await JSZip.loadAsync(zipFile);
      const imageFiles = [];

      // Extract image files
      for (const [filename, file] of Object.entries(zip.files)) {
        if (!file.dir && /\.(jpe?g|png|webp|gif)$/i.test(filename)) {
          const blob = await file.async('blob');
          const ext = filename.split('.').pop().toLowerCase();
          const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : ext === 'gif' ? 'image/gif' : 'image/jpeg';
          const imgFile = new File([blob], filename.split('/').pop(), { type: mimeType });
          imageFiles.push(imgFile);
        }
      }

      if (imageFiles.length === 0) {
        ovLoadT.textContent = 'No images found in ZIP';
        setTimeout(() => {
          W.classList.remove('on');
          U.classList.remove('gone');
          ovLoad.classList.remove('on');
        }, 2000);
        return;
      }

      // Sort and process like multi-file
      imageFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
      await handleImageSequence(imageFiles);

    } catch (err) {
      ovLoadT.textContent = 'Failed to extract ZIP. Ensure it contains images.';
      console.error(err);
      setTimeout(() => {
        W.classList.remove('on');
        U.classList.remove('gone');
        ovLoad.classList.remove('on');
      }, 2000);
    }
  }

  // ── Render Image Frame in Preview ──
  const previewCanvas = document.createElement('canvas');
  const previewCtx = previewCanvas.getContext('2d');
  let previewImg = null;

  function renderImagePreview(frameIdx) {
    if (!imageFrames[frameIdx]) return;

    // Replace video element with canvas for image sequences
    if (!previewImg) {
      vid.style.display = 'none';
      previewCanvas.style.maxWidth = '100%';
      previewCanvas.style.maxHeight = '100%';
      previewCanvas.style.objectFit = 'contain';
      document.querySelector('.pv-sticky').appendChild(previewCanvas);
      previewCanvas.width = vw;
      previewCanvas.height = vh;
      previewImg = new Image();
    }

    previewImg.onload = () => {
      previewCtx.clearRect(0, 0, vw, vh);
      previewCtx.drawImage(previewImg, 0, 0, vw, vh);
    };
    previewImg.src = imageFrames[frameIdx];
  }

  // ── Scroll → video.currentTime / frame index ──
  let tk = false;
  pvScroll.addEventListener('scroll', () => {
    if (!ready || tk) return;
    tk = true;
    requestAnimationFrame(() => {
      const max = pvScroll.scrollHeight - pvScroll.clientHeight;
      if (max <= 0) { tk = false; return; }
      const t = Math.min(1, Math.max(0, pvScroll.scrollTop / max));

      if (mode === 'video') {
        const target = t * dur;
        if (Math.abs(vid.currentTime - target) > 0.01) vid.currentTime = target;
      } else {
        // Image sequence: render frame directly
        const frameIdx = Math.min(imageFrames.length - 1, Math.floor(t * imageFrames.length));
        renderImagePreview(frameIdx);
      }

      const cf = Math.min(fc, Math.floor(t * fc));
      badge.textContent = cf + ' / ' + fc;
      prog.style.width = (t * 100) + '%';
      scrubF.style.width = (t * 100) + '%';
      scrubT.style.left = (t * 100) + '%';
      hint.classList.toggle('gone', t > 0.015);
      tk = false;
    });
  }, { passive: true });

  // ── Controls ──
  rFr.oninput = e => { fc = +e.target.value; vFr.textContent = fc; mFr.textContent = fc; updateRunway(); updateExSum(); };
  rSp.oninput = e => { ppf = +e.target.value; vSp.innerHTML = ppf + '<small>px</small>'; updateRunway(); updateExSum(); };
  rQual.oninput = e => {
    jpegQuality = +e.target.value / 100;
    vQual.innerHTML = e.target.value + '<small>%</small>';
  };
  selFormat.onchange = e => { exportFormat = e.target.value; };

  function updateRunway() { const h = fc * ppf; runway.style.height = h + 'px'; mSc.textContent = (h/1000).toFixed(1) + 'k px'; }
  function updateMeta() { mDur.textContent = dur.toFixed(1) + 's'; mRes.textContent = vw + '×' + vh; mFr.textContent = fc; updateRunway(); }
  function updateExSum() {
    const h = fc * ppf;
    $('exSum').innerHTML = [
      ['Frames', fc], ['Scroll height', h.toLocaleString() + ' px'], ['Speed', ppf + ' px/frame']
    ].map(([l,v]) => `<div class="ex-row"><span class="ex-rl">${l}</span><span class="ex-rv">${v}</span></div>`).join('');
  }
  updateExSum();

  // ── Sidebar tabs ──
  document.querySelectorAll('.sb-tab').forEach(tab => {
    tab.onclick = () => {
      document.querySelectorAll('.sb-tab').forEach(t => t.classList.remove('on'));
      document.querySelectorAll('.sb-pn').forEach(p => p.classList.remove('on'));
      tab.classList.add('on');
      $('pn' + (tab.dataset.t === 'set' ? 'Set' : 'Exp')).classList.add('on');
    };
  });

  // ── New ──
  $('bnew').onclick = () => {
    vid.src = ''; ready = false;
    W.classList.remove('on'); U.classList.remove('gone');
    ovLoad.classList.remove('on'); badge.classList.remove('on'); scrub.classList.remove('on');
    bDl.disabled = true; bCp.disabled = true;
    fi.value = ''; fiImg.value = ''; fiZip.value = '';

    // Reset image sequence state
    imageFrames = [];
    if (previewImg) {
      vid.style.display = '';
      if (previewCanvas.parentNode) previewCanvas.parentNode.removeChild(previewCanvas);
      previewImg = null;
    }

    fc = 80; ppf = 40;
    rFr.value = 80; rSp.value = 40; rFr.max = 300;
    vFr.textContent = '80'; vSp.innerHTML = '40<small>px</small>';
    updateRunway(); updateExSum();
  };

  // ── Export ──
  async function doExport(mode_export) {
    if (!ready) return;
    ovExport.classList.add('on');
    ovExBar.style.width = '0%'; ovExPct.textContent = '0%';

    let frames = [];
    const mimeType = exportFormat === 'webp' ? 'image/webp' : 'image/jpeg';

    if (mode === 'video') {
      // Existing video extraction logic with compression settings
      ovExT.textContent = 'Extracting ' + fc + ' frames…';
      const c = document.createElement('canvas');
      c.width = vw; c.height = vh;
      const ctx = c.getContext('2d');

      for (let i = 0; i < fc; i++) {
        const tt = Math.min((i / Math.max(1, fc - 1)) * dur, dur - 0.01);
        await new Promise(res => {
          let d = false;
          const fin = () => {
            if (d) return;
            d = true;
            try {
              ctx.drawImage(vid, 0, 0, vw, vh);
            } catch(e){}
            frames.push(c.toDataURL(mimeType, jpegQuality));
            res();
          };
          const ons = () => { vid.removeEventListener('seeked', ons); clearTimeout(to); fin(); };
          const to = setTimeout(() => { vid.removeEventListener('seeked', ons); fin(); }, 2500);
          vid.addEventListener('seeked', ons);
          vid.currentTime = tt;
        });
        const pct = Math.round(((i+1)/fc)*100);
        ovExBar.style.width = pct + '%'; ovExPct.textContent = pct + '%';
      }
    } else {
      // Image sequence: re-compress with selected quality/format
      ovExT.textContent = 'Compressing ' + imageFrames.length + ' frames…';
      const c = document.createElement('canvas');
      c.width = vw; c.height = vh;
      const ctx = c.getContext('2d');

      for (let i = 0; i < imageFrames.length; i++) {
        await new Promise((res) => {
          const img = new Image();
          img.onload = () => {
            ctx.clearRect(0, 0, vw, vh);
            ctx.drawImage(img, 0, 0, vw, vh);
            frames.push(c.toDataURL(mimeType, jpegQuality));
            res();
          };
          img.src = imageFrames[i];
        });
        const pct = Math.round(((i+1)/imageFrames.length)*100);
        ovExBar.style.width = pct + '%'; ovExPct.textContent = pct + '%';
      }
    }

    const html = buildHTML(frames);
    if (mode_export === 'dl') {
      const b = new Blob([html], {type:'text/html'});
      const a = document.createElement('a');
      a.href = URL.createObjectURL(b); a.download = 'scroll-video.html'; a.click();
      URL.revokeObjectURL(a.href);
    } else {
      await navigator.clipboard.writeText(html);
      bCp.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Copied!';
      setTimeout(() => { bCp.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> Copy Code'; }, 2200);
    }

    ovExport.classList.remove('on');
    // Restore scroll position
    const max = pvScroll.scrollHeight - pvScroll.clientHeight;
    if (max > 0 && mode === 'video') vid.currentTime = (pvScroll.scrollTop / max) * dur;
  }

  bDl.onclick = () => doExport('dl');
  bCp.onclick = () => doExport('cp');

  function buildHTML(frames) {
    const h = fc * ppf;
    const a = frames.map(f => '"' + f + '"').join(',\n');
    return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Scroll Video</title>
<style>*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}body{background:#000;overflow-x:hidden}.rw{position:relative;height:${h}px}.sk{position:sticky;top:0;height:100vh;width:100%;display:flex;align-items:center;justify-content:center;background:#000}canvas{display:block;max-width:100%;max-height:100vh;object-fit:contain}#b{position:fixed;top:0;left:0;height:2px;width:0;background:rgba(255,255,255,.3);z-index:99;pointer-events:none}.q{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);z-index:99;pointer-events:none;text-align:center;transition:opacity .5s;font-family:-apple-system,sans-serif}.q span{display:block;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:10px}.q .v{width:14px;height:14px;border-right:1.5px solid rgba(255,255,255,.35);border-bottom:1.5px solid rgba(255,255,255,.35);transform:rotate(45deg);margin:0 auto;animation:b 1.8s ease-in-out infinite}@keyframes b{0%,100%{transform:rotate(45deg) translate(0,0)}50%{transform:rotate(45deg) translate(3px,3px)}}.q.g{opacity:0}#l{position:fixed;inset:0;background:#000;z-index:9999;display:flex;align-items:center;justify-content:center;transition:opacity .6s}#l.d{opacity:0;pointer-events:none}#l .r{width:36px;height:36px;border:2px solid rgba(255,255,255,.1);border-top-color:rgba(255,255,255,.5);border-radius:50%;animation:s .8s linear infinite}@keyframes s{to{transform:rotate(360deg)}}</style>
</head><body>
<div id="l"><div class="r"></div></div><div id="b"></div>
<div class="q" id="q"><span>Scroll</span><div class="v"></div></div>
<div class="rw" id="rw"><div class="sk"><canvas id="c"></canvas></div></div>
<script>var F=[${a}];
(function(){var c=document.getElementById("c"),x=c.getContext("2d"),rw=document.getElementById("rw"),b=document.getElementById("b"),q=document.getElementById("q"),l=document.getElementById("l");var im=[],n=0,tot=F.length,cur=0,rf=false;F.forEach(function(s,i){var g=new Image;g.onload=function(){n++;if(i===0){c.width=g.naturalWidth;c.height=g.naturalHeight;p(0)}if(n===tot)l.classList.add("d")};g.src=s;im[i]=g});function p(i){var g=im[i];if(!g||!g.complete)return;x.drawImage(g,0,0,c.width,c.height)}function t(){var r=rw.getBoundingClientRect(),sc=rw.offsetHeight-window.innerHeight,s=Math.max(0,-r.top),v=Math.min(1,s/sc);b.style.width=(v*100)+"%";var i=Math.min(tot-1,Math.floor(v*tot));if(i!==cur&&im[i]){cur=i;p(i)}q.classList.toggle("g",v>0.03);rf=false}window.addEventListener("scroll",function(){if(!rf){rf=true;requestAnimationFrame(t)}},{passive:true});requestAnimationFrame(t)})();` + '<' + '/script>' + `
</body></html>`;
  }
})();
