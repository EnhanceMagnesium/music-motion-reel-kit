import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';

function Opening({ scene, time, cues }) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const progress = interpolate(frame, [0, Math.max(1, (scene.end - scene.start) * fps)], [0, 1], { extrapolateRight: 'clamp' });
  const cueCount = cues.filter((cue) => cue.kind === 'accent').length;
  return (
    <AbsoluteFill style={{ background: '#f2e9d8', color: '#182b35', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      <div style={{ position: 'absolute', width: height * 0.48, height: height * 0.48, border: '3px solid #cc6549', borderRadius: '50%', left: '50%', top: '42%', transform: `translate(-50%, -50%) scale(${0.78 + progress * 0.22})`, opacity: 0.42 }} />
      <div style={{ position: 'absolute', left: 90, right: 90, top: height * 0.48, textAlign: 'center', transform: `translateY(${(1 - progress) * 26}px)` }}>
        <div style={{ fontSize: Math.round(width * 0.105), fontWeight: 800, letterSpacing: '-0.05em' }}>{scene.params?.label || 'Opening'}</div>
        <div style={{ marginTop: 30, fontSize: 30, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#5a6b68' }}>Local time {time.localSeconds.toFixed(2)} s</div>
        <div style={{ marginTop: 20, fontSize: 22, color: '#5a6b68' }}>Synthetic fixture • {cueCount} supplied cue</div>
      </div>
    </AbsoluteFill>
  );
}

function Closing({ scene, time }) {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const elapsed = frame / fps;
  const rotation = elapsed * 18;
  const scale = 0.9 + 0.1 * Math.sin(elapsed * Math.PI * 0.75);
  return (
    <AbsoluteFill style={{ background: '#15233d', color: '#f4c96b', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', inset: 0 }} aria-hidden="true">
        <circle cx={width / 2} cy={height / 2} r={width * 0.29} fill="none" stroke="#6a83a5" strokeWidth="2" opacity="0.5" />
        <path d={`M ${width / 2} ${height * 0.31} L ${width * 0.59} ${height * 0.46} L ${width * 0.5} ${height * 0.62} L ${width * 0.41} ${height * 0.46} Z`} fill="#f4c96b" transform={`rotate(${rotation} ${width / 2} ${height / 2}) scale(${scale})`} transform-origin={`${width / 2}px ${height / 2}px`} />
      </svg>
      <div style={{ position: 'absolute', left: 90, right: 90, bottom: height * 0.19, textAlign: 'center' }}>
        <div style={{ fontSize: Math.round(width * 0.09), fontWeight: 750, letterSpacing: '-0.04em' }}>{scene.params?.label || 'Closing'}</div>
        <div style={{ marginTop: 26, fontSize: 28, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#a9b9cb' }}>Production time {time.productionSeconds.toFixed(2)} s</div>
      </div>
    </AbsoluteFill>
  );
}

export const scenes = { opening: Opening, closing: Closing };
