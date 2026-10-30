// Isolated numeric checks: read pinned sources; do not load canvas, browser, GPU or media.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const kit = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = p => fs.readFileSync(path.join(kit, 'repository-downloads', p), 'utf8');
function isolate(source, names, prelude='') {
  return vm.runInNewContext(`${prelude}\n${source.replace(/\bexport /g,'')}\n({${names.join(',')}})`, {Math});
}
const r03 = isolate(read('lemomo-ai/lemo-opuscar/core/lib.js'), ['clamp','lerp','seg','ss','ei','eo','eio','back','spring','mulberry','hash','vnoise','monotone','track','env','TAU']);
const reel = read('tuzhechen2005/opus-video-skills/skills/kinetic-reel/template/reel/reel.js');
const r02 = isolate(reel.split('// ---------- math ----------')[1].split('// ---------- canvases ----------')[0] + '\n' + reel.match(/const easeInOut =[^\n]+/)[0] + '\n' + reel.match(/const ioExpo =[^\n]+/)[0], ['clamp','lerp','seg','ease','easeOut','easeIn','expoOut','backOut','hash','beatPulse','TAU','easeInOut','ioExpo'], 'const BEAT = 60 / 120;');
const core = read('buildwithhanif/claude-animation-skill/plugins/claude-animation/skills/claude-animation/lib/core.mjs');
const r06 = isolate(core.split('// ------------------------------------------------------------------ numbers')[1].split('// ------------------------------------------------------------------ canvas helpers')[0], ['clamp','lerp','rad','ss','hash','rng','noise1','eOut','eIn','eIO','eExpo','eBack','eElastic','eBounce','popS','mid','centroid','ellPts','rrect','catmull','densify','pathOf','ik']);
const film = read('buildwithhanif/claude-animation-skill/plugins/claude-animation/skills/claude-animation/lib/film.mjs');
const {exposure} = isolate(film.match(/export function exposure\([\s\S]+?\n}/)[0], ['exposure']);
let checks = 0;
const exact=(a,b)=>{assert.equal(a,b);checks++;};
let maxBackDelta=0, maxNoiseAdapterDelta=0;
for (let i=-2000;i<=4000;i++) {
 const x=i/2000;
 for (const f of ['clamp','hash']) {exact(r03[f](x),r02[f](x));exact(r03[f](x),r06[f](x));}
 exact(r03.lerp(-3,9,x),r02.lerp(-3,9,x));exact(r03.lerp(-3,9,x),r06.lerp(-3,9,x));
 exact(r03.seg(x,.2,.8),r02.seg(x,.2,.8));
 exact(r03.ss(x),r02.ease(x));exact(r03.ss(x),r06.ss(0,1,x));
 exact(r03.eo(x),r02.easeOut(x));exact(r03.eo(x),r06.eOut(x));
 exact(r03.ei(x),r02.easeIn(x));exact(r03.ei(x),r06.eIn(x));
 exact(r03.eio(x),r02.easeInOut(x));exact(r03.eio(x),r06.eIO(x));
 exact(r02.expoOut(x),r06.eExpo(x));
 maxBackDelta=Math.max(maxBackDelta,Math.abs(r03.back(x,1.8)-r06.eBack(x,1.8)));
 maxNoiseAdapterDelta=Math.max(maxNoiseAdapterDelta,Math.abs((r03.vnoise(x)*2-1)-r06.noise1(x)));
}
assert.ok(maxBackDelta < 1e-14); assert.ok(maxNoiseAdapterDelta < 1e-14);
assert.notEqual(r03.back(.5),r02.backOut(.5));
assert.notEqual(r03.mulberry(7)(),r06.rng(7)());
const inlineParkMiller = seed => () => (seed = seed*16807%2147483647)/2147483647;
const a=inlineParkMiller(7),b=r06.rng(7);for(let i=0;i<1000;i++)exact(a(),b());
exact(r06.rng(2147483647)(),0);exact(r06.rng(0)(),16807/2147483647);
assert.ok(Number.isNaN(r03.seg(1,1,1)));assert.ok(Number.isNaN(r06.ss(1,1,1)));
exact(r02.beatPulse(-.25),Math.exp(3.5));
const tr=[{at:0,on:2},{at:4.5,on:1},{at:8,hold:true}];
exact(exposure(1/24,tr,24),0);exact(exposure(2/24,tr,24),2/24);exact(exposure(4.5,tr,24),4.5);exact(exposure(9,tr,24),8);
// Epsilon explicitly rounds a time just below a frame boundary into that frame.
exact(exposure(1/24-1e-9,[{at:0,on:1}],24),1/24);
const result={status:'PASS',checks,node:process.version,scope:'numeric extraction only; no rendering or source mutation',sampling:'6001 scalar samples [-1,2], 1000 Park-Miller draws, boundary probes',maxBackDelta,maxNoiseAdapterDelta,backDefaultAtHalf:{R03:r03.back(.5),R02:r02.backOut(.5),R06:r06.eBack(.5)},firstSeed7:{mulberry:r03.mulberry(7)(),parkMiller:r06.rng(7)()},rngDegenerateSeed:r06.rng(2147483647)()};
fs.writeFileSync(path.join(kit,'compatibility-preparation/helper-equivalence-results.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
