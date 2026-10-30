import{n as e}from"./util-C3PkC1mi.js";import{f as t,r as n}from"./index-BBsgxCGr.js";function r(){let e=new n(`
    uniform sampler2D tex; uniform float amt, seed, split, opacity;
    vec4 tap(vec2 uv) { if (uv.x < 0.0 || uv.x > 1.0) return vec4(0.0); return texture(tex, uv); }
    void main() {
      vec2 uv = vUv;
      float y = (1.0 - vUv.y) * 1080.0;
      float bA = floor(y / 46.0), bB = floor(y / 9.0);
      float onA = step(1.0 - amt * 0.34, hash12(vec2(bA, seed)));
      float onB = step(1.0 - amt * 0.22, hash12(vec2(bB, seed + 3.1)));
      float dx = (hash12(vec2(bA, seed + 7.7)) - 0.5) * 0.16 * onA + (hash12(vec2(bB, seed + 1.3)) - 0.5) * 0.03 * onB;
      uv.x += dx * amt;
      float s = (split + amt * 5.0 * (onA + onB)) / 1920.0;
      vec4 r = tap(uv + vec2(s, 0.0)), g = tap(uv), b = tap(uv - vec2(s, 0.0));
      float a = max(g.a, max(r.a, b.a));
      vec3 c = vec3(r.r * r.a, g.g * g.a, b.b * b.a);
      fragColor = vec4(c, a) * opacity;
    }`,{tex:{value:null},amt:{value:0},seed:{value:0},split:{value:0},opacity:{value:1}},{blending:5,transparent:!0}),t=e.mat;return t.blendEquation=100,t.blendSrc=201,t.blendDst=205,t.blendSrcAlpha=201,t.blendDstAlpha=205,{pass:e,draw(t,n,r,i,a,o=0,s=1){e.u.tex.value=n,e.u.amt.value=i,e.u.seed.value=a,e.u.split.value=o,e.u.opacity.value=s,e.render(t,r)}}}function i(e,t,n,r=0){let i=e.onsets[t]??[],a=0,o=i.length;for(;a<o;){let e=a+o>>1;i[e][0]<=n?a=e+1:o=e}for(let e=a-1;e>=0;e--)if(i[e][1]>=r)return e;return-1}function a(e,t,n,r=0){let a=i(e,t,n,r);return a<0?-1e9:e.onsets[t][a][0]}function o(t,n,r=.34,a=.6){let o=i(t,`kick`,n,a);if(o<0)return 0;let[s,c]=t.onsets.kick[o],l=e((n-s)/r);return(1-l)*(1-l)*Math.min(1,c)}var s=e=>{let n=parseInt(t[e].slice(1),16);return[n>>16&255,n>>8&255,n&255]};function c(t,n,r,i=1){let a=s(t),o=s(n),c=e(r);return`rgba(${Math.round(a[0]+(o[0]-a[0])*c)},${Math.round(a[1]+(o[1]-a[1])*c)},${Math.round(a[2]+(o[2]-a[2])*c)},${i})`}export{o as kickDuck,i as lastIdx,a as lastT,r as makeGlitchComp,c as mix};