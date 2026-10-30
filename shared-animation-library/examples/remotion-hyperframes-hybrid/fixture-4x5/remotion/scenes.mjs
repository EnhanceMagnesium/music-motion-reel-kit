// Synthetic hybrid-integration comparison, not a song production.
import React, { useLayoutEffect, useRef } from 'react';
import { AbsoluteFill, staticFile, useCurrentFrame, useDelayRender, useVideoConfig } from 'remotion';

const h = React.createElement;
const DURATION = 2.4;
const ROTATION_START = -120;
const ROTATION_SWEEP = 240;
let playerScriptPromise;

function hyperFramesDocument(width, height, gsapUrl) {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{box-sizing:border-box}html,body{width:100%;height:100%;margin:0;overflow:hidden}body,#root{background:#F0EEE6;color:#17364A;font-family:Arial,sans-serif}#root{position:relative;width:100%;height:100%;overflow:hidden}
.eyebrow{position:absolute;top:11%;left:0;width:100%;text-align:center;font-size:1.9vw;letter-spacing:.22em;font-weight:700;color:#527178}
.ring,.inner-ring{position:absolute;left:50%;top:42%;transform:translate(-50%,-50%);border-radius:50%}.ring{width:min(68vw,42vh);height:min(68vw,42vh);border:2px solid #9DB2AF}.inner-ring{width:min(39.44vw,24.36vh);height:min(39.44vw,24.36vh);border:1px solid #CAD3C9}
.core{position:absolute;left:50%;top:42%;width:min(11.56vw,7.14vh);height:min(11.56vw,7.14vh);transform:translate(-50%,-50%);border-radius:50%;background:#17364A}.core:after{content:"";position:absolute;left:50%;top:50%;width:min(2.38vw,1.47vh);height:min(2.38vw,1.47vh);transform:translate(-50%,-50%);border-radius:50%;background:#F0EEE6}
.orbit{position:absolute;left:50%;top:42%;width:min(68vw,42vh);height:min(68vw,42vh);transform:translate(-50%,-50%) rotate(-120deg)}.satellite{position:absolute;left:50%;top:0;width:min(5.1vw,3.15vh);height:min(5.1vw,3.15vh);transform:translate(-50%,-50%);border-radius:50%;background:#177B78;box-shadow:0 0 0 9px rgba(23,123,120,.12)}
.title{position:absolute;left:9%;bottom:16%;width:82%;text-align:center}.title-main{font-size:7.8vw;font-weight:700;letter-spacing:-.045em;line-height:1.05}.title-sub{margin-top:2.4vw;font-size:1.8vw;letter-spacing:.19em;color:#527178}
</style><script src="${gsapUrl}"></script></head><body>
<div id="root" data-composition-id="orbit-study" data-width="${width}" data-height="${height}" data-duration="${DURATION}">
<div class="eyebrow">MOTION STUDY&nbsp; / &nbsp;01</div><div class="ring"></div><div class="inner-ring"></div><div class="core"></div><div class="orbit"><div class="satellite"></div></div>
<div class="title"><div class="title-main">Orbit / Field 01</div><div class="title-sub">FRAME-DRIVEN MOTION&nbsp; • &nbsp;SYNTHETIC TEST</div></div></div>
<script>const orbitTimeline=window.gsap.timeline({paused:true});orbitTimeline.to('.orbit',{rotation:'+=240',duration:${DURATION},ease:'none'},0);window.__timelines=window.__timelines||{};window.__timelines['orbit-study']=orbitTimeline;</script>
</body></html>`;
}

function loadPlayer(scriptUrl) {
  if (customElements.get('hyperframes-player')) return Promise.resolve();
  if (playerScriptPromise) return playerScriptPromise;
  playerScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Could not load the local HyperFrames player: ${scriptUrl}`));
    document.head.appendChild(script);
  });
  return playerScriptPromise;
}

function OrbitArtwork({ width, height, rotation }) {
  const diameter = Math.min(width * 0.68, height * 0.42);
  const mark = (size, color, extra = {}) => h('div', {
    style: { position: 'absolute', width: size, height: size, borderRadius: '50%', background: color, ...extra },
  });
  return h(AbsoluteFill, { style: { background: '#F0EEE6', color: '#17364A', overflow: 'hidden', fontFamily: 'Arial, sans-serif' } },
    h('div', { style: { position: 'absolute', top: '11%', left: 0, width: '100%', textAlign: 'center', fontSize: width * 0.019, letterSpacing: '0.22em', fontWeight: 700, color: '#527178' } }, 'MOTION STUDY  /  01'),
    h('div', { style: { position: 'absolute', left: '50%', top: '42%', width: diameter, height: diameter, transform: 'translate(-50%, -50%)', borderRadius: '50%', border: '2px solid #9DB2AF', boxSizing: 'border-box' } }),
    h('div', { style: { position: 'absolute', left: '50%', top: '42%', width: diameter * 0.58, height: diameter * 0.58, transform: 'translate(-50%, -50%)', borderRadius: '50%', border: '1px solid #CAD3C9', boxSizing: 'border-box' } }),
    h('div', { style: { position: 'absolute', left: '50%', top: '42%', width: diameter * 0.17, height: diameter * 0.17, transform: 'translate(-50%, -50%)', borderRadius: '50%', background: '#17364A' } },
      mark(diameter * 0.035, '#F0EEE6', { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' })),
    h('div', { style: { position: 'absolute', left: '50%', top: '42%', width: diameter, height: diameter, transform: `translate(-50%, -50%) rotate(${rotation}deg)` } },
      mark(diameter * 0.075, '#177B78', { left: '50%', top: 0, transform: 'translate(-50%, -50%)', boxShadow: '0 0 0 9px rgba(23,123,120,0.12)' })),
    h('div', { style: { position: 'absolute', left: '50%', bottom: '16%', transform: 'translateX(-50%)', width: '82%', textAlign: 'center' } },
      h('div', { style: { fontSize: width * 0.078, fontWeight: 700, letterSpacing: '-0.045em', lineHeight: 1.05 } }, 'Orbit / Field 01'),
      h('div', { style: { marginTop: width * 0.024, fontSize: width * 0.018, letterSpacing: '0.19em', color: '#527178' } }, 'FRAME-DRIVEN MOTION  •  SYNTHETIC TEST')));
}

function DirectOrbit({ project, time }) {
  const progress = Math.max(0, Math.min(1, time.localSeconds / DURATION));
  return h(OrbitArtwork, { width: project.width, height: project.height, rotation: ROTATION_START + ROTATION_SWEEP * progress });
}

function HyperFramesOrbit({ project, time }) {
  const playerRef = useRef(null);
  const { delayRender, continueRender, cancelRender } = useDelayRender();
  const frame = time.frame;
  const localSeconds = time.localSeconds;
  const scriptUrl = staticFile('hyperframes-player.global.js');
  const gsapUrl = staticFile('gsap.min.js');
  const runtimeUrl = staticFile('hyperframe.runtime.iife.js');
  const subcomposition = hyperFramesDocument(project.width, project.height, gsapUrl);

  useLayoutEffect(() => {
    const player = playerRef.current;
    if (!player) return undefined;
    const handle = delayRender(`HyperFrames subcomposition seek to frame ${frame}`);
    let live = true;
    let released = false;
    let readyListener;
    let errorListener;
    const release = () => {
      if (released) return;
      released = true;
      continueRender(handle);
    };
    const fail = (error) => {
      if (!live || released) return;
      released = true;
      cancelRender(error instanceof Error ? error : new Error(String(error)));
    };
    const seekAndWaitForPaint = () => {
      if (!live) return;
      try {
        player.pause();
        player.seek(localSeconds);
        requestAnimationFrame(() => requestAnimationFrame(() => { if (live) release(); }));
      } catch (error) {
        fail(error);
      }
    };
    const onReady = () => seekAndWaitForPaint();
    const onError = (event) => fail(new Error(event?.detail?.message || 'HyperFrames subcomposition reported an error'));
    readyListener = onReady;
    errorListener = onError;
    loadPlayer(scriptUrl)
      .then(() => customElements.whenDefined('hyperframes-player'))
      .then(() => {
        if (!live) return;
        player.addEventListener('ready', readyListener);
        player.addEventListener('error', errorListener);
        if (player.ready) seekAndWaitForPaint();
      })
      .catch(fail);
    return () => {
      live = false;
      player.removeEventListener('ready', readyListener);
      player.removeEventListener('error', errorListener);
      release();
    };
  }, [cancelRender, continueRender, delayRender, frame, localSeconds, scriptUrl]);

  return h(AbsoluteFill, { style: { background: '#F0EEE6', overflow: 'hidden' } },
    h('hyperframes-player', {
      ref: playerRef,
      srcdoc: subcomposition,
      width: project.width,
      height: project.height,
      muted: true,
      'audio-locked': true,
      'runtime-src': runtimeUrl,
      'assets-loading-ui': 'none',
      style: { position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%' },
    }));
}

export const scenes = { DirectOrbit, HyperFramesOrbit };
