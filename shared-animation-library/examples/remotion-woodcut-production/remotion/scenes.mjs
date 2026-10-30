// TECHNICAL FIXTURE registry: two synthetic woodcut scenes built on the shared adapter. Not a finished song, not approved art, no song story.
// Props per remotion-runtime/README.md: { project, scene, time, cues, assets, fonts, role }. Everything is derived from `time`, never from earlier frames.
import React from 'react';
import { AbsoluteFill } from 'remotion';
import { WoodcutCanvas, deriveSeed, drawStrokes, ellipse, getPrinterStats, getWoodcutSessionStats, plate } from '../../../adapters/remotion/woodcut/woodcut.mjs';
import { FIXTURE_GEOMETRY_VERSION, buildFixtureGeometry } from './fixture-geometry.mjs';

const h = React.createElement;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Fixture-owned telemetry for the browser check (a documented callback sink, not a patch of any Remotion/browser global).
const events = typeof window !== 'undefined' ? (window.__woodcutFixtureEvents ||= []) : null;
if (typeof window !== 'undefined') window.__woodcutFixtureStats = () => ({ sessions: getWoodcutSessionStats(), printers: getPrinterStats() });
const record = (e) => { if (events && events.length < 20000) events.push({ ...e, seq: events.length, t: Math.round(performance.now() * 100) / 100 }); };

function FixtureCarve({ project, scene, time }) {
  const p = scene.params || {};
  const seed = deriveSeed(project.seed, 'fixture', scene.id);       // stable per project + scene
  const { width, height } = project;                                 // actual composition size (4:5 or 9:16)
  return h(AbsoluteFill, { style: { background: '#EFE8D8' } },
    h(WoodcutCanvas, {
      label: `fixture ${scene.id}`, width, height, seed, geometryVersion: FIXTURE_GEOMETRY_VERSION, geometryParams: { rayCount: p.rayCount ?? 28 },
      time, errorMode: p.errorMode ?? 'cancel', onEvent: record, buildGeometry: buildFixtureGeometry,
      drawMask: async (g, c) => {
        if (p.drawDelayMs) await sleep(p.drawDelayMs);
        if (p.failAtFrame === time.frame) throw new Error(`controlled fixture failure at frame ${time.frame}`);
        const t = time.localSeconds;
        drawStrokes(g, c.geometry.strokes.border, { t, color: '#fff' });
        drawStrokes(g, c.geometry.strokes.rays, { t, color: '#fff' });
        drawStrokes(g, c.geometry.strokes.flecks, { t, color: '#fff' });
      },
      drawColor: (g, c) => plate(g, [ellipse(c.geometry.center[0], c.geometry.center[1], c.geometry.radius, c.geometry.radius * 0.9)], 0.85),
      printerOptions: { mode: 'print' },
    }),
    h('div', { style: { position: 'absolute', left: 24, bottom: 24, font: '20px sans-serif', color: '#111', background: 'rgba(255,255,255,0.7)', padding: '4px 8px', zIndex: 3 } },
      `TECHNICAL FIXTURE — NOT ART — ${scene.id} — frame ${time.frame}`));
}

export const scenes = {
  CarveA: (props) => h(FixtureCarve, props),
  CarveB: (props) => h(FixtureCarve, props),
};
