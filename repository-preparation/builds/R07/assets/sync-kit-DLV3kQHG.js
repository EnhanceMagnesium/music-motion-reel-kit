import{n as e,o as t}from"./util-C3PkC1mi.js";import{R as n,f as r,p as i,r as a}from"./index-BBsgxCGr.js";import{GLSL_EVA as o}from"./_eva-Ycn4hoBe.js";function s(){return new a(`
    ${o}
    uniform float t, rad, lvl, seed, kick, vis, creep, glow;
    uniform vec3 colA, colB, colC;
    void main() {
      vec2 p = vec2(FRAG_PX.x, 1080.0 - FRAG_PX.y);
      vec4 h = hexCell(p, rad);
      float e = hexEdge(h.xy, rad);
      float line = pxLine(e, 0.5, 1.5);
      vec2 cc = p - h.xy;
      float n = hash12(h.zw + seed * 1.37);
      float inner = smoothstep(1.5, 3.5, e);
      vec2 uv = p / vec2(1920.0, 1080.0) - 0.5;
      float fall = 1.0 - smoothstep(0.25, 0.8, length(uv * vec2(1.0, 1.4)));
      vec3 fc = mix(colA, colB, creep);
      vec3 c = C_INK + fc * line * 0.055 * (0.5 + 0.5 * fall) * (1.0 + 1.4 * kick);
      float yl = 1080.0 * (1.0 - lvl);
      float below = step(yl, cc.y);
      float rim = below * (1.0 - step(yl + rad * 1.6, cc.y));
      c += colC * inner * (below * 0.02 * (0.55 + 0.45 * n) + rim * 0.07 * (0.6 + 0.4 * glow) * (0.5 + 0.5 * n));
      c += fc * inner * step(0.988, n) * 0.06;
      fragColor = vec4(c * vis, 1.0);
    }`,{t:{value:0},rad:{value:38},lvl:{value:0},seed:{value:0},kick:{value:0},vis:{value:1},creep:{value:0},glow:{value:0},colA:{value:[...i.orange]},colB:{value:[...i.purple]},colC:{value:[...i.lime]}})}function c(){let e=new a(`
    uniform sampler2D tex; uniform float amt, seed, split, opacity, sq, beam; uniform vec3 tint;
    vec4 tap(vec2 uv) { if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return vec4(0.0); return texture(tex, uv); }
    void main() {
      vec2 uv = vUv;
      uv.y = (uv.y - 0.5) / max(sq, 1e-3) + 0.5;
      float y = (1.0 - vUv.y) * 1080.0;
      float bA = floor(y / 38.0), bB = floor(y / 7.0);
      float onA = step(1.0 - amt * 0.34, hash12(vec2(bA, seed)));
      float onB = step(1.0 - amt * 0.22, hash12(vec2(bB, seed + 3.1)));
      float dx = (hash12(vec2(bA, seed + 7.7)) - 0.5) * 0.14 * onA + (hash12(vec2(bB, seed + 1.3)) - 0.5) * 0.03 * onB;
      uv.x += dx * amt;
      float s = (split + amt * 6.0 * (onA + onB)) / 1920.0;
      vec4 r = tap(uv + vec2(s, 0.0)), g = tap(uv), b = tap(uv - vec2(s, 0.0));
      float a = max(g.a, max(r.a, b.a));
      vec3 c = vec3(r.r * r.a, g.g * g.a, b.b * b.a) * tint;
      float ln = beam * exp(-abs(vUv.y - 0.5) * 1080.0 / 2.2) * (1.0 - smoothstep(0.2, 0.62, abs(vUv.x - 0.5)));
      c += vec3(1.6, 1.4, 2.2) * ln;
      a = max(a, clamp(ln, 0.0, 1.0));
      fragColor = vec4(c, a) * opacity;
    }`,{tex:{value:null},amt:{value:0},seed:{value:0},split:{value:0},opacity:{value:1},sq:{value:1},beam:{value:0},tint:{value:new n(1,1,1)}},{blending:5,transparent:!0}),t=e.mat;return t.blendEquation=100,t.blendSrc=201,t.blendDst=205,t.blendSrcAlpha=201,t.blendDstAlpha=205,{pass:e,draw(t,n,r,i={}){let a=e.u;a.tex.value=n,a.amt.value=i.amt??0,a.seed.value=i.seed??0,a.split.value=i.split??0,a.opacity.value=i.opacity??1,a.sq.value=i.sq??1,a.beam.value=i.beam??0,a.tint.value.set(...i.tint??[1,1,1]),e.render(t,r)}}}var l={};for(let e of Object.keys(r)){let t=parseInt(r[e].slice(1),16);l[e]=[t>>16&255,t>>8&255,t&255]}function u(t,n,r,i=`red`,a=0,o=1){let s=l[t],c=l[n],u=l[i],d=e(r),f=e(a),p=e=>Math.round((s[e]+(c[e]-s[e])*d)*(1-f)+u[e]*f);return`rgba(${p(0)},${p(1)},${p(2)},${o})`}var d=e=>.12*Math.exp(-(((e+.08)/.022)**2))-.16*Math.exp(-(((e+.016)/.007)**2))+1*Math.exp(-((e/.008)**2))-.32*Math.exp(-(((e-.02)/.009)**2))+.18*Math.exp(-(((e-.13)/.035)**2)),f=e=>-.2*Math.exp(-(((e+.03)/.014)**2))+.85*Math.exp(-((e/.013)**2))-.55*Math.exp(-(((e-.032)/.016)**2))+.26*Math.exp(-(((e-.1)/.03)**2)),p=`0123456789ABCDEF#%?/*=<>ERR:;_`;function m(e,n,r){if(r<=0)return e;let i=``;for(let a=0;a<e.length;a++){let o=e[a];i+=o!==` `&&t(n,a,41)<r?p[Math.floor(t(n,a,42)*30)]:o}return i}export{c as makeSyncComp,s as makeSyncGround,u as mix3,f as qrsEva,d as qrsPilot,m as scramble};