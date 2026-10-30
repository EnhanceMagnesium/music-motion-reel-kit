import{a as e,c as t,d as n,f as r,n as i,o as a,p as o,r as s}from"./util-C3PkC1mi.js";import{L as c,R as l,a as u,c as d,g as f,h as p,i as m,m as h,o as g,r as _,s as v,z as y}from"./index-BBsgxCGr.js";import{barTime as b,brackets as x,chamferPath as S,condensed as C,evaLabel as w,jp as T,makeScanPass as E,sevenSeg as D,songBar as O,ticker as k}from"./_eva-Ycn4hoBe.js";import{t as A}from"./scene-CTj40Zt3.js";import{ATLAS as j,CAM as M,FLOOR_Y as N,MINUTES as P,MONO as F,PC as I,RING as L,faceCorners as R,makeCam as z,makeFaceAtlas as B,memberAngle as V,memberBase as H,memberPos as U,memberYaw as W,meterH as G,noteLabel as K,project as q,smoothChroma as J,speakWeights as Y,speakerTurns as X,turnAt as Z,vtext as Q}from"./seele-kit-Ce2ekn9G.js";var $=`
${v}
uniform vec3 camPos, camR, camU, camF;
uniform vec2 tanXY;
uniform vec4 mono[12];          // centre xyz, yaw
uniform float inten[12];        // chroma per member 0..1
uniform float speak[12];        // speaking weight 0..1
uniform float power[12];        // powered on 0..1 (flicker)
uniform sampler2D atlas;
uniform vec3 ringC;
uniform float t, pads, bassE, voice, handAng, handOn, ringOn;

const vec3 HE = vec3(${F.hw.toFixed(3)}, ${F.hh.toFixed(3)}, ${F.hd.toFixed(3)});
const float FLOORY = ${N.toFixed(3)};
const float RR = ${L.r.toFixed(3)};
const float TEXPU = ${(j.ch/(2*F.hh)).toFixed(2)};  // atlas texels per world unit

// nearest monolith hit along the ray: returns distance (1e9 = miss), member, local hit point, local normal
float traceCouncil(vec3 ro, vec3 rd, out int hk, out vec3 hl, out vec3 hn) {
  float best = 1e9; hk = -1; hl = vec3(0.0); hn = vec3(0.0);
  for (int k = 0; k < 12; k++) {
    vec4 m = mono[k];
    float cy = cos(m.w), sy = sin(m.w);
    vec3 ax = vec3(cy, 0.0, -sy), az = vec3(sy, 0.0, cy);
    vec3 p = ro - m.xyz;
    vec3 o = vec3(dot(p, ax), p.y, dot(p, az));
    vec3 d = vec3(dot(rd, ax), rd.y, dot(rd, az));
    vec3 inv = 1.0 / (abs(d) + 1e-7) * sign(d + 1e-12);
    vec3 ta = (-HE - o) * inv, tb = (HE - o) * inv;
    vec3 tmn = min(ta, tb), tmx = max(ta, tb);
    float tn = max(max(tmn.x, tmn.y), tmn.z);
    float tf = min(min(tmx.x, tmx.y), tmx.z);
    if (tn < tf && tn > 0.0 && tn < best) {
      best = tn; hk = k; hl = o + d * tn;
      vec3 sel = vec3(tmn.x >= tn ? 1.0 : 0.0, tmn.y >= tn && tmn.x < tn ? 1.0 : 0.0, tmn.z >= tn && tmn.x < tn && tmn.y < tn ? 1.0 : 0.0);
      hn = -sign(d) * sel;
    }
  }
  return best;
}

// shade a monolith surface; dist = ray distance (for the texture LOD and hairline widths)
vec3 shadeMono(int k, vec3 L, vec3 N, float dist) {
  float I = inten[k], S = speak[k], P = power[k];
  float pw = dist * 2.0 * tanXY.y / (${m.toFixed(1)} * PX_SCALE);  // world units per physical px
  vec3 col;
  if (N.z > 0.5) {
    vec2 uv = vec2(0.5 - L.x / (2.0 * HE.x), 0.5 + L.y / (2.0 * HE.y));
    vec2 cell = vec2(float(k % 6), float(1 - k / 6));
    vec2 auv = (cell + clamp(uv, 0.002, 0.998)) / vec2(6.0, 2.0);
    float lod = max(0.0, log2(TEXPU * pw) - 0.35);
    vec3 m = textureLod(atlas, auv, lod).rgb;
    // black lacquer: faint vertical sheen, a touch of red spill from the text
    col = vec3(0.0022, 0.0017, 0.0016) * (0.45 + 0.9 * uv.y) * (0.35 + 0.65 * P);
    float lit = P * (0.07 + 1.25 * pow(I, 1.6)) + S * P * (1.1 + 1.9 * bassE);
    vec3 txt = mix(C_RED, mix(C_EMBER, C_BONE, 0.35), 0.3 * S);
    col += txt * m.r * lit;
    col += C_RED * m.g * P * (0.05 + 0.22 * I + 0.45 * S);
    col += C_RED * m.b * P * (0.08 + 0.3 * I + 0.5 * S);
    col += C_RED * 0.004 * lit * (1.0 - m.r);
    // voice meter: 16 segments in the framed slot (chroma level; the speaker's is its voice)
    vec2 mu = vec2((uv.x - 0.105) / 0.79, (uv.y - 0.14) / 0.08);
    if (mu.x > 0.0 && mu.x < 1.0 && mu.y > 0.0 && mu.y < 1.0) {
      float sgi = floor(mu.x * 16.0), sf = fract(mu.x * 16.0);
      float lvl = mix(I * 0.9, 0.55 + 0.45 * voice, S);
      float on = step(sgi + 0.5, lvl * 16.0) * step(0.14, sf) * step(sf, 0.86);
      col += mix(C_RED, C_EMBER, step(12.5, sgi)) * on * P * (0.12 + 0.5 * I + 1.4 * S) + C_RED * 0.01 * P;
    }
    // hairline rim around the face
    float e = min(min(uv.x, 1.0 - uv.x) * 2.0 * HE.x, min(uv.y, 1.0 - uv.y) * 2.0 * HE.y);
    float rim = pxLine(e / pw, 0.8, 2.2);
    col += C_RED * rim * P * (0.05 + 0.5 * I + 1.3 * S);
  } else {
    // sides / top / back: lacquer, a dim edge where it meets the front
    float up = N.y > 0.5 ? 1.0 : 0.0;
    col = vec3(0.0012, 0.001, 0.0009) * (1.0 + 2.5 * up) * (0.35 + 0.65 * P);
    float ez = (HE.z - L.z);
    col += C_RED * pxLine(ez / pw, 0.8, 2.0) * P * (0.03 + 0.25 * I + 0.8 * S);
  }
  return col;
}

vec3 shadeRay(vec2 px) {
  vec2 ndc = px / vec2(${d.toFixed(1)}, ${m.toFixed(1)}) * 2.0 - 1.0;
  vec3 rd = normalize(camF + ndc.x * tanXY.x * camR + ndc.y * tanXY.y * camU);
  vec3 ro = camPos;

  int hk; vec3 hl, hn;
  float th = traceCouncil(ro, rd, hk, hl, hn);

  // void: black with the faintest red breath at the horizon (the pads)
  vec3 col = C_INK * 0.25 + C_RED * 0.0035 * (0.4 + pads) * exp(-abs(rd.y + 0.12) * 9.0);

  // floor (computed for every ray so the derivatives are defined)
  float tfl = rd.y < -1e-4 ? (FLOORY - ro.y) / rd.y : 1e4;
  vec3 q = ro + rd * min(tfl, 400.0);
  vec2 v = q.xz - ringC.xz;
  float rr = length(v);
  float fw = max(length(fwidth(q.xz)), 1e-6);                     // world units per physical px
  float ang = atan(v.x, v.y);

  if (tfl < th && tfl < 1e3) {
    // mirror: trace the council again from the floor
    vec3 rr2 = vec3(rd.x, -rd.y, rd.z);
    int rk; vec3 rl, rn;
    float tr = traceCouncil(q + rr2 * 1e-3, rr2, rk, rl, rn);
    vec3 fc = vec3(0.0012, 0.001, 0.001);
    if (rk >= 0) {
      float hgt = (q.y + rr2.y * tr) - FLOORY;
      fc += shadeMono(rk, rl, rn, tfl + tr) * 0.16 * exp(-hgt * 0.55);
    }
    // red light pooled under the members (the speaker most)
    for (int k = 0; k < 12; k++) {
      vec2 d = q.xz - mono[k].xz;
      float g = dot(d, d);
      fc += C_RED * power[k] * (0.012 * inten[k] + 0.09 * speak[k] * (0.5 + bassE)) * exp(-g / 1.6);
    }
    // the clock on the floor: inner table ring with 60 ticks, member ticks lit by chroma, outer ring
    float R1 = RR - 1.9, R2 = RR + 1.25;
    float ringA = ringOn;
    float sweep = step(ang / 6.2831853 + 0.5, ringOn * 1.0001);
    float l1 = pxLine(abs(rr - R1) / fw, 0.5, 1.5) + pxLine(abs(rr - R2) / fw, 0.5, 1.5) * 0.7;
    float tk = ang / (6.2831853 / 60.0);
    float tkd = abs(fract(tk + 0.5) - 0.5) * (6.2831853 / 60.0) * rr;
    float isMaj = step(abs(fract((ang - ${L.off.toFixed(5)}) / (6.2831853 / 12.0) + 0.5) - 0.5), 0.02);
    float band = step(R1 - 0.28 - 0.3 * isMaj, rr) * step(rr, R1);
    float ticks = pxLine(tkd / fw, 0.5, 1.4) * band;
    int mk = int(mod(floor((ang - ${L.off.toFixed(5)}) / (6.2831853 / 12.0) + 0.5), 12.0));
    float mi = inten[mk], ms = speak[mk];
    vec3 rc = C_RED * (0.05 + 0.12 * pads);
    fc += (rc * l1 + C_RED * ticks * (0.05 + (0.5 * mi + 1.2 * ms) * isMaj)) * sweep * ringA;
    // arc segment on the outer ring under each member, lit by its chroma
    float seg = step(abs(fract((ang - ${L.off.toFixed(5)}) / (6.2831853 / 12.0) + 0.5) - 0.5), 0.36);
    fc += C_RED * pxLine(abs(rr - R2 - 0.12) / fw, 1.0, 2.6) * seg * (0.04 + 0.6 * mi * mi + 1.0 * ms) * sweep * ringA;
    // the clock hand: points at the member speaking
    vec2 hd = vec2(sin(handAng), cos(handAng));
    float along = dot(v, hd), across = abs(v.x * hd.y - v.y * hd.x);
    float hand = step(0.0, along) * step(along, R1 - 0.35) * pxLine(across / fw, 0.9, 2.4);
    float handGlow = step(0.0, along) * step(along, R1) * exp(-across / 0.18) * 0.25;
    fc += mix(C_RED, C_EMBER, 0.3) * (hand * 1.4 + handGlow) * handOn * (0.6 + 0.8 * bassE);
    fc += C_RED * pxLine(abs(rr - 0.32) / fw, 0.6, 1.6) * 0.5 * ringA;
    fc += C_RED * 0.35 * exp(-rr / 0.12) * handOn;
    // distance fog into the void
    col = mix(col, fc, exp(-max(tfl - 8.0, 0.0) * 0.035));
  } else if (hk >= 0) {
    col = shadeMono(hk, hl, hn, th) * exp(-max(th - 12.0, 0.0) * 0.02);
  }

  // atmosphere: a halo around every lit member (the speaker's haze), not occluded
  for (int k = 0; k < 12; k++) {
    vec3 c = mono[k].xyz - ro;
    float tc = max(dot(c, rd), 0.0);
    vec3 dd = ro + rd * tc - mono[k].xyz;
    float dy = max(abs(dd.y) - HE.y * 0.6, 0.0);
    float d2 = dd.x * dd.x + dd.z * dd.z + dy * dy;
    col += C_RED * power[k] * (0.0006 * inten[k] + 0.012 * speak[k] * (0.4 + bassE)) * exp(-d2 / 1.6);
  }
  return col;
}

void main() {
  vec3 col = vec3(0.0);
  for (int k = ssK0(); k < ssK1(); k++) col += shadeRay(FRAG_PX + rgss(k) / PX_SCALE);
  fragColor = vec4(col * ssWeight(), 1.0);
}`,ee=`SOUND ONLY // 人類補完委員会 // HUMAN INSTRUMENTALITY COMMITTEE // CLOSED SESSION 非公開 // RECORDING PROHIBITED 記録禁止 // VIDEO FEED: NONE 映像なし // AUDIO CHANNEL 12/12 // `,te=class extends A{pass;L=new u;scan=E(.2);T={s:0,e:0};turns=[];lines=[];order=[];inten=Array(12).fill(0);speak=Array(12).fill(0);power=Array(12).fill(0);mono=Array.from({length:12},()=>new y);ch=new Float32Array(12);init(){let e=this.ctx.audio;this.T={s:this.ctx.start,e:this.ctx.end},this.turns=X(e,this.T.s-.6,this.T.e+.2),this.order=[...Array(12).keys()].sort((e,t)=>a(e,41)-a(t,41));let t=this.turns.filter(e=>e.t0<this.T.e-.2).map(e=>({t:Math.max(e.t0,this.T.s+.15),k:e.pc}));for(let n=24;n<29;n++){let r=b(e,n);if(t.some(e=>Math.abs(e.t-r)<.9))continue;let i=Z(this.turns,r)?.pc??-1,a=J(e,r+.2,Array(12).fill(0)),o=0,s=-1;a.forEach((e,t)=>{t!==i&&e>s&&(s=e,o=t)}),t.push({t:r,k:i>=0?i:o})}t.sort((e,t)=>e.t-t.t);let n=t.slice(0,P.length);this.lines=n.map((e,t)=>{let r=P[t===n.length-1?P.length-1:t];return{t:e.t,k:e.k,jp:r[0],en:r[1]}}),this.pass=new _($,{ssTap:g,camPos:{value:new l},camR:{value:new l},camU:{value:new l},camF:{value:new l},tanXY:{value:new c(M.tanY*(d/m),M.tanY)},mono:{value:this.mono},inten:{value:this.inten},speak:{value:this.speak},power:{value:this.power},atlas:{value:B()},ringC:{value:new l(L.cx,N,L.cz)},t:{value:0},pads:{value:0},bassE:{value:0},voice:{value:0},handAng:{value:0},handOn:{value:0},ringOn:{value:0}})}camera(e){let n=i((e-this.T.s)/(this.T.e-this.T.s)),r=t(-.075,.075,n),a=t(M.dist+.5,M.dist-.9,s.inOutQuad(n)),o=[L.cx+Math.sin(r)*a,M.h-.3*n+.04*Math.sin(e*.7),L.cz-Math.cos(r)*a],c=0,l=0,u=!0;for(let n of this.turns){if(n.t0>e)break;let r=H(n.pc),a=(r[0]-L.cx)*.3,o=(r[2]-L.cz)*.18;if(u){c=a,l=o,u=!1;continue}let d=s.inOutCubic(i((e-n.t0)/1.4));c=t(c,a,d),l=t(l,o,d)}return z(o,[L.cx+c,-1.2,L.cz+l])}hand(e){let n=0,r=!0;for(let a of this.turns){if(a.t0>e)break;let o=V(a.pc);if(r){n=o,r=!1;continue}for(;o-n>Math.PI;)o-=Math.PI*2;for(;o-n<-Math.PI;)o+=Math.PI*2;n=t(n,o,s.outBack(i((e-a.t0)/.5)))}return n}render(t,c){let{renderer:l,audio:u,comp:f}=this.ctx,p=this.T,m=t.t,g=m-p.s,_=e(m),v=i(u.env(`other`,m)*1.4),y=i(u.env(`bass`,m)*1.4),b=Z(this.turns,m),x=n(m,p.e-.42,p.e-.05);J(u,m,this.inten);for(let e=0;e<12;e++)this.inten[e]=o(.08,1,this.inten[e]);Y(this.turns,m,this.speak);let S=[0,0],w=0;for(let e=0;e<24;e++)u.waveAt(m-e*.0025,S),w=Math.max(w,Math.abs(S[0]+S[1])*.5);let E=i(w*1.6);for(let e=0;e<12;e++){let t=this.order[e],n=.1+e*.07,r=g<n?0:g<n+.14?a(_,t,3)<(g-n)/.14?1:.12:1;if(x>0&&t!==b?.pc){let n=(11-e)/12;r*=x>n?a(_,t,9)<.3?.4:0:1}this.power[t]=r}let D=this.camera(m);for(let e=0;e<12;e++){let t=U(e,m);this.mono[e].set(t[0],t[1],t[2],W(e))}let O=this.pass.u;O.camPos.value.set(...D.pos),O.camR.value.set(...D.right),O.camU.value.set(...D.up),O.camF.value.set(...D.fwd),O.t.value=m,O.pads.value=v,O.bassE.value=y,O.voice.value=E,O.handAng.value=this.hand(m),O.handOn.value=b?i((m-this.turns[0].t0)/.3):0,O.ringOn.value=n(g,.05,1.1,s.inOutCubic),this.pass.render(l,c);let A=this.L;A.clear();let j=A.ctx,M=e=>{let t=(g-.25-e*.09)/.2;return t>=1?x>.6?a(_,e,5)<.5?.25:.7:1:t<=0?0:a(_,e)<t?1:.12},N=h(`red`,1);h(`orange`,1),j.globalAlpha=M(0),this.header(j,m,g),j.globalAlpha=M(1),this.roster(j,m,b),j.globalAlpha=M(2),this.voicePrint(j,m,b),j.globalAlpha=M(3),b&&this.callout(j,D,m,b,E),j.globalAlpha=M(4),this.minutes(j,m),j.globalAlpha=M(5);{let e=d-60;C(j,`HUMAN INSTRUMENTALITY`,e,900,46,{sx:.62,color:h(`bone`,.9),align:`right`,tracking:2}),C(j,`COMMITTEE`,e,1010,128,{sx:.58,color:h(`bone`,1),align:`right`}),j.font=T(22,700,!0),j.fillStyle=N,j.textAlign=`right`,j.fillText(`人類補完委員会　特別審議`,e,842),j.textAlign=`left`}Q(j,`人類補完計画`,30,180,20,h(`red`,.55)),j.globalAlpha=M(6)*.9,j.fillStyle=h(`red`,.45),j.fillRect(40,1040,1180,1),k(j,40,1062,1180,ee,m,{speed:55,color:h(`red`,.55),size:11}),j.globalAlpha=1,f.draw(l,A.upload(),c),this.scan.u.t.value=m,this.scan.render(l,c);let P=b?r(m,b.t0,.1):0;return{bloom:.75,bloomThreshold:.58,bloomRadius:.8,halation:.1,vignette:.62,grain:.06,ca:.7+1.6*P,flash:0,zoom:1+.004*P}}header(e,t,r){let i=n(r,.2,.7,s.outCubic);e.save(),e.font=f(p.mono(700),17),e.letterSpacing=`3px`;let a=`SOUND ONLY`,o=e.measureText(a).width;e.letterSpacing=`0px`;let c=o+118;e.fillStyle=h(`red`,1),e.beginPath(),e.moveTo(40,34),e.lineTo(40+c,34),e.lineTo(40+c+34*.7,68),e.lineTo(40,68),e.closePath(),e.fill(),e.fillStyle=h(`ink`,1),e.textBaseline=`middle`,e.font=f(p.mono(700),17),e.letterSpacing=`3px`,e.fillText(a,54,52),e.letterSpacing=`0px`,e.font=T(19,700,!1),e.fillText(`音声のみ`,68+o,52);let l=40+c+34*.7+8,u=d-40;e.fillStyle=h(`red`,.8),e.fillRect(l,66,(u-l)*i,2),e.fillRect(u-60,60,60*i,6),e.textBaseline=`alphabetic`,e.font=f(p.mono(500),13),e.letterSpacing=`2.5px`,e.fillStyle=h(`orange`,.8),e.fillText(`HUMAN INSTRUMENTALITY COMMITTEE  //  CLOSED SESSION  //  VIDEO FEED: NONE`,l+12,58);let m=this.ctx.audio,g=O(m,t),_=Math.floor(g+1e-4),v=Math.max(0,r),y=Math.floor(v),b=Math.floor((v-y)*100);D(e,`00:${String(y).padStart(2,`0`)}:${String(b).padStart(2,`0`)}`,u-250,82,38,h(`red`,1),h(`red`,.07),{thick:4.4}),e.font=f(p.mono(600),11),e.letterSpacing=`2px`,e.fillStyle=h(`orange`,.75),e.textAlign=`right`,e.fillText(`SESSION  BAR ${String(_).padStart(2,`0`)}/29`,u,140),e.font=T(12,600,!1),e.letterSpacing=`0px`,e.fillText(`審議経過時間`,u,158),e.restore()}roster(e,t,n){e.save(),w(e,64,136,`council  12/12`,`委員会 出席`,{color:h(`orange`,.9),size:.9});for(let t=0;t<12;t++){let n=184+t*30,r=this.inten[t],i=this.speak[t],a=this.power[t],o=i>.5?h(`red`,1):h(`orange`,.85);i>.5&&(e.fillStyle=h(`red`,.9),e.fillRect(56,n-16,252,22)),e.fillStyle=i>.5?h(`ink`,1):o,e.font=f(p.mono(700),14),e.letterSpacing=`1.5px`,e.textBaseline=`alphabetic`,e.fillText(String(t+1).padStart(2,`0`),64,n),e.font=f(p.mono(500),12),e.fillText(I[t].padEnd(2,` `),94,n),e.letterSpacing=`0px`,G(e,126,n-11,110,9,14,r*a,i>.5?h(`ink`,1):h(`red`,.9),i>.5?`rgba(0,0,0,0.25)`:h(`red`,.1),i>.5?void 0:h(`amber`,1)),e.font=T(12,700,!1),e.fillStyle=i>.5?h(`ink`,1):h(`orange`,a>.5?.5:.25),e.fillText(i>.5?`発言中`:a>.5?`在席`:`待機`,250,n)}e.restore()}voicePrint(e,t,n){let r=this.ctx.audio,i=d-440;e.save(),w(e,i,436,`voice print  //  chroma  2 bars`,`声紋分析`,{color:h(`orange`,.9),size:.9});let a=i+34,s=3.6,c=s/72,l=Math.floor(t/c);for(let t=0;t<72;t++){let n=(l-71+t)*c;r.chroma(n,this.ch);let i=(71-t)/72;for(let n=0;n<12;n++){let r=o(.2,1,this.ch[n]);r<.04||(e.fillStyle=h(`red`,r*(.95-.55*i)),e.fillRect(a+366/72*t+.5,470+(11-n)*13+1,366/72-1,11))}}e.strokeStyle=h(`amber`,.9),e.lineWidth=1.5,e.beginPath();let u=!1;for(let n=0;n<=144;n++){let i=t-s+s*n/144,o=r.bassMidi(i);if(o<=0){u=!1;continue}let c=(Math.round(o)%12+12)%12,l=a+366*n/144,d=470+(11-c)*13+13/2;u?e.lineTo(l,d):e.moveTo(l,d),u=!0}e.stroke(),e.font=f(p.mono(600),10),e.textBaseline=`middle`;for(let t=0;t<12;t++)e.fillStyle=n?.pc===t?h(`red`,1):h(`orange`,.6),e.fillText(I[t],i,470+(11-t)*13+13/2+1);e.strokeStyle=h(`orange`,.35),e.lineWidth=1,e.strokeRect(a-.5,469.5,367,157);let m=this.ctx.audio,g=O(m,t);for(let n=Math.floor(g)-2;n<=Math.floor(g);n++){let r=a+366*(1-(t-b(m,n))/s);r<a||r>a+366||(e.fillStyle=h(`orange`,.5),e.fillRect(r,464,1,168),e.font=f(p.mono(600),10),e.textBaseline=`alphabetic`,e.fillText(`${n}`,r+3,468))}e.fillStyle=h(`red`,1),e.fillRect(a+366,462,2,172),e.restore()}callout(e,t,n,r,a){let o=this.ctx.audio,c=r.pc,l=n-r.t0,u=d-440,m=R(t,c,n),g=m.map(e=>e[0]),_=m.map(e=>e[1]),v=Math.min(...g),y=Math.max(...g),b=Math.min(..._),C=Math.max(..._),w=l>.3||(l*16|0)%2==0;e.save();let E=1+.35*(1-s.outCubic(i(l/.18))),O=(v+y)/2,k=(b+C)/2,A=(y-v)/2*E+14,j=(C-b)/2*E+14;w&&x(e,O-A,k-j,A*2,j*2,22,h(`red`,1),2);let M=O,N=k-j;e.strokeStyle=h(`red`,.85),e.lineWidth=1.5,e.beginPath(),e.moveTo(M,N),e.lineTo(M,236),e.lineTo(u,236),e.stroke(),e.fillStyle=h(`red`,1),e.fillRect(M-3,N-3,6,6),e.font=f(p.mono(600),11),e.letterSpacing=`2px`,e.fillStyle=h(`red`,.9),e.fillText(`M-${String(c+1).padStart(2,`0`)}  Z ${q(t,U(c,n))[2].toFixed(2)}`,M+8,228),e.letterSpacing=`0px`,S(e,u,176,400,214,[0,18,0,18]),e.fillStyle=`rgba(10,2,2,0.78)`,e.fill(),e.strokeStyle=h(`red`,1),e.lineWidth=1.5,e.stroke(),e.fillStyle=h(`red`,1),e.fillRect(u,176,170,26),e.fillStyle=h(`ink`,1),e.font=f(p.mono(700),13),e.letterSpacing=`2px`,e.textBaseline=`middle`,e.fillText(`SPEAKER`,u+10,190),e.letterSpacing=`0px`,e.font=T(14,700,!1),e.fillText(`発言者`,u+106,190),e.textBaseline=`alphabetic`;let P=w?h(`red`,1):h(`red`,.3);D(e,String(c+1).padStart(2,`0`),u+16,220,92,P,h(`red`,.07),{thick:10});let F=u+150;e.fillStyle=h(`red`,1),e.font=f(p.mono(700),15),e.letterSpacing=`2px`,e.fillText(`MEMBER ${String(c+1).padStart(2,`0`)}  /  ${I[c]}`,F,234),e.font=f(p.mono(500),12),e.fillStyle=h(`orange`,.85),e.fillText(`BASS  ${K(o.bassMidi(n))}`,F,256),e.fillText(`TURN  ${l.toFixed(2).padStart(5,`0`)} S`,F,274),e.letterSpacing=`0px`,e.font=T(13,700,!1),e.fillStyle=h(`red`,.8),e.fillText(`映像なし　音声のみ`,F,296);let L=u+16;e.strokeStyle=h(`red`,.2),e.lineWidth=1,e.beginPath();for(let t=0;t<=10;t++)e.moveTo(L+368*t/10,326),e.lineTo(L+368*t/10,376);e.moveTo(L,351),e.lineTo(L+368,351),e.stroke();let z=[0,0];e.strokeStyle=h(`red`,1),e.lineWidth=1.6,e.beginPath();for(let t=0;t<=200;t++){let r=o.waveAt(n-.045+.045*t/200,z),i=L+368*t/200,a=351-(r[0]+r[1])*.5*50*.9;t?e.lineTo(i,a):e.moveTo(i,a)}e.stroke(),G(e,u+400-16-120,208,120,8,12,a,h(`red`,1),h(`red`,.12),h(`amber`,1)),e.restore()}minutes(e,t){let n=this.lines.filter(e=>e.t<=t);e.save(),w(e,64,640,`minutes  //  proceedings`,`議事録`,{color:h(`orange`,.9),size:.9}),e.fillStyle=h(`orange`,.4),e.fillRect(64,670,250,1),n.slice(-8).forEach((t,n,r)=>{let i=694+n*22,a=n===r.length-1;e.font=f(p.mono(700),11),e.letterSpacing=`1.5px`,e.textBaseline=`alphabetic`,e.fillStyle=a?h(`red`,1):h(`red`,.55),e.fillText(`${String(t.k+1).padStart(2,`0`)}`,64,i),e.fillStyle=a?h(`orange`,.9):h(`orange`,.45),e.font=f(p.mono(500),11),e.fillText(`${(t.t-this.T.s).toFixed(2).padStart(5,`0`)}  ${I[t.k].padEnd(2,` `)}  ${t.en.split(` `).slice(0,2).join(` `)}…`,94,i)});let r=n[n.length-1];if(r){let n=t-r.t,a=Math.floor(i(n/.5)*r.jp.length),o=Math.floor(i((n-.12)/.5)*r.en.length),s=d/2;e.font=T(34,700,!0),e.letterSpacing=`2px`;let c=e.measureText(r.jp).width,l=s-c/2;e.fillStyle=`rgba(4,1,1,0.72)`,e.fillRect(l-90,934,c+130,90),e.fillStyle=h(`red`,1),e.fillRect(l-76,946,52,34),e.fillStyle=h(`ink`,1),e.font=f(p.mono(700),20),e.textAlign=`center`,e.textBaseline=`middle`,e.fillText(String(r.k+1).padStart(2,`0`),l-50,964),e.textAlign=`left`,e.textBaseline=`alphabetic`,e.font=T(34,700,!0),e.fillStyle=h(`bone`,1),e.fillText(r.jp.slice(0,a),l,978),a<r.jp.length&&t*3%1<.6&&(e.fillStyle=h(`red`,1),e.fillRect(l+e.measureText(r.jp.slice(0,a)).width+4,948,12,34)),e.letterSpacing=`2.5px`,e.font=f(p.mono(500),14),e.fillStyle=h(`orange`,.9),e.fillText(r.en.slice(0,o),l,1008),e.letterSpacing=`0px`}e.restore()}};export{te as default};