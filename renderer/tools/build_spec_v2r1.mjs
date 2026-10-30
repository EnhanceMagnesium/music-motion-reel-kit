// Generates renderer/specs/his-line-v2r1.json from the cut frame table and the ember track (so the iris centre is COMPUTED, not typed).
// Usage (from renderer/):  node tools/build_spec_v2r1.mjs      Writes specs/his-line-v2r1.json. Pure Node: loads the scene modules into a stub context; draws nothing.
import { writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadHL } from '../../productions/his-line/tools/hl_vm.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..'), out = resolve(root, 'specs/his-line-v2r1.json');
const SCRIPTS = ['00_core', '01_lib', '02_cues', '03_print', '04_type', '05_cam', '06_trans', '07_text', '08_hits', '09_fx', 'shots/shots_a', 'shots/shots_b', 'shots/shots_c', 'entry'].map(n => `../scenes/his-line-v2r1/${n}.js`);
const CUTS = [0, 80, 150, 237, 289, 350, 402, 472, 550, 610, 679, 749], END = 864, FPS = 24;
const startOf = f => Math.floor(f / FPS * 1e5) / 1e5;                         // at most 1e-5 s below the frame time, so `t >= start` selects the new shot on that frame
const ids = ['s01 hook: bead strikes the line, ticks and density bands, paper edge enters', 's02 a pen draws the deed; label, rule, lift', 's03 deed enters the wall; twelve courses, plaque, three planes',
  's04 cropped giant words thin with the low band; hold; bead anticipates', 's05 ground flip and completed hairline on frame 289; edges build the deed', 's06 curved double impressions settle into register',
  's07 reading: wet loose ink becomes dry registered print', 's08 translucent sheet over the ember; the dry edge advances', 's09 the room answers: joints and radiating outlines', 's10 room planes: wall, floor, deed unrolls',
  's11 strip to the line; registration drift; the ember arcs', 's12 ember becomes seal; contact on frame 790; stamp, snap, sparks, closure'];
const trans = [null, { flashOnCut: .08 }, { flashOnCut: .08 }, { transitionIn: { type: 'wipe', col: '#e7dfcc', dur: .25 } }, { flashOnCut: .12 }, { flashOnCut: .06 }, { transitionIn: { type: 'push', dy: -1, dur: .2 } },
  { transitionIn: { type: 'flip', dur: .28 } }, { transitionIn: { type: 'slats', n: 10, dur: .4 } }, { flashOnCut: .06 }, { transitionIn: { type: 'wipe', col: '#e7dfcc', dur: .3 } }, null];
const spec = { name: 'his-line-v2r1', width: 1080, height: 1920, fps: FPS, duration: 36, audio: '../../productions/his-line/audio/His_Line_master.m4a', audioStart: 0, cues: '../../productions/his-line/cues_v2.json',
  sceneScripts: SCRIPTS,
  fonts: [{ family: 'HL Display', url: '../assets/fonts/DejaVuSansCondensed-Bold.ttf', descriptors: { weight: '700' } }, { family: 'HL Label', url: '../assets/fonts/DejaVuSansMono.ttf', descriptors: { weight: '400' } }],
  assets: ['../assets/fonts/DejaVuSansCondensed-Bold.ttf', '../assets/fonts/DejaVuSansMono.ttf'],
  scenes: CUTS.map((f, i) => Object.assign({ start: startOf(f), end: i + 1 < CUTS.length ? startOf(CUTS[i + 1]) : 36, type: `hl-s${String(i + 1).padStart(2, '0')}`, id: ids[i] }, trans[i] || {})) };
spec.scenes[11].transitionIn = { type: 'iris', cx: 540, cy: 960, col: '#e7dfcc', dur: .35 };   // placeholder; replaced below by the computed ember position
for (const p of SCRIPTS) if (!existsSync(resolve(root, 'specs', p))) throw new Error(`missing scene script ${p}`);
writeFileSync(out, JSON.stringify(spec, null, 1));
const { HL, cues } = loadHL(out);
HL.cue.init(cues); HL.hits.init(); HL.fx.init();
const tOut = HL.outgoingTime(spec.scenes[10]), e = HL.fx.ember.screen(tOut);
spec.scenes[11].transitionIn.cx = +e.x.toFixed(3); spec.scenes[11].transitionIn.cy = +e.y.toFixed(3);
writeFileSync(out, JSON.stringify(spec, null, 1));
console.log(`wrote ${out}\noutgoing frozen time ${tOut} s (frame ${(tOut * FPS).toFixed(3)}), ember ${e.x.toFixed(3)},${e.y.toFixed(3)} r ${e.r.toFixed(2)}; iris centre set to that`);
