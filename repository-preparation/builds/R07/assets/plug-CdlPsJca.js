import{a as e,d as t,f as n,n as r,o as i,p as a,r as o}from"./util-C3PkC1mi.js";import{L as s,R as c,a as l,c as u,g as d,h as f,i as ee,m as p,n as m,p as te,r as h,t as g}from"./index-BBsgxCGr.js";import{GLSL_EVA as ne,barTime as _,brackets as re,chamferPath as ie,condensed as ae,duck as oe,hexData as se,jp as v,makeScanPass as y,panel as b,segMeter as ce,sevenSeg as x,songBar as le,ticker as ue}from"./_eva-Ycn4hoBe.js";import{t as S}from"./scene-CTj40Zt3.js";import{c as C,d as w,f as T,i as de,l as fe,n as pe,p as me,r as he,u as E}from"./atfield-kit-BK6GEdkj.js";import{Drive as D,STAGES as O,ecgTrace as ge,plugSchematic as _e}from"./plug-kit-Csi-mWqm.js";var k=`rgba(8,5,2,0.88)`,A=960,j=470,M=1.6,ve=`
${ne}
${g}
uniform float t, zc, fov, roll, lcl, clarity, bass, kickNow, fi, race, flickAmt, pad, vel, glitch, coreK;
uniform vec3 flickCol;
uniform vec2 center;
uniform sampler2D uZT;
uniform vec3 uZTInfo;          // z0, texels per unit, n
uniform vec2 uKick[8];
uniform vec2 uClap[4];

const float FL = 0.82842712;   // octagon face length (apothem 1)
const float CR = 0.079716;     // wall hex circumradius: 48 cells around (sqrt3 * CR * 48 = 8 * FL)
const float DZ = ${M.toFixed(3)};
const float DW = ${7 .toFixed(3)};

float octR(vec2 v) { v = abs(v); return max(max(v.x, v.y), (v.x + v.y) * 0.70710678); }
float writeTime(float z) {
  float x = clamp((z - uZTInfo.x) * uZTInfo.y, 0.0, uZTInfo.z - 1.001);
  int i = int(floor(x));
  float a = texelFetch(uZT, ivec2(i, 0), 0).r, b = texelFetch(uZT, ivec2(i + 1, 0), 0).r;
  return min(mix(a, b, x - float(i)), t);
}

void main() {
  vec2 px = FRAG_PX;
  // clap row glitch (stable over the frame's shutter)
  float row = floor(px.y / 6.0);
  if (hash12(vec2(row, fi)) < 0.12 * glitch) px.x += (hash12(vec2(row * 1.7, fi + 3.1)) - 0.5) * 90.0 * glitch;

  vec2 q = (px - center) / ${ee.toFixed(1)};
  float cr = cos(roll), sr = sin(roll);
  q = mat2(cr, sr, -sr, cr) * q;
  float o = max(octR(q), 1e-4);
  float zd = fov / o;                 // distance ahead to the wall hit
  float zw = zc + zd;                 // world depth of the hit
  float ang = atan(q.y, q.x);
  float kf = floor(ang / (TAU / 8.0) + 0.5);
  float s = tan(ang - kf * TAU / 8.0);  // position along the face, ±FL/2 at the corners
  float u = kf * FL + s;              // unrolled wall coordinate (period 8 FL)
  float fwu = min(fwidth(u), fwidth(mod(u, 8.0 * FL)));
  float fwz = max(fwidth(zw), 1e-6);
  vec2 wp = vec2(u, zw);

  // ---- wall plates: hex grid, each plate lit by the spectrum it was written with
  vec4 hc = hexCell(wp, CR);
  vec2 g = hc.xy, cc = wp - g;
  float fwp = max(length(vec2(fwu, fwz)), 1e-6);
  float epx = hexEdge(g, CR) / fwp;
  float lod = smoothstep(0.5, 0.12, fwp / CR);
  float edgeL = pxLine(epx, 0.5, 1.6) * lod;
  float fillM = mix(0.55, smoothstep(1.6, 3.2, epx), lod);
  float tau = writeTime(cc.y - DW);
  float ub = abs(mod(cc.x + 2.0 * FL + 4.0 * FL, 8.0 * FL) - 4.0 * FL) / (4.0 * FL); // 0 floor .. 1 ceiling
  float en = pow(smoothstep(0.62, 1.0, melAt(tau, mix(1.0, 58.0, ub))), 2.2);
  float cellH = hash12(hc.zw + 7.3);

  // ---- frame rings (every DZ; heavy segmented ribs every 4th)
  float rk = floor(zw / DZ + 0.5);
  float rd = abs(zw - rk * DZ);
  float heavy = step(abs(mod(rk, 4.0)), 0.5);
  float ringL = pxLine(rd / fwz, 0.6, 1.8);
  float ribW = mix(0.03, 0.085, heavy);
  float rib = smoothstep(ribW + fwz, ribW, rd) * mix(1.0, step(0.07, abs(s)) * step(abs(s), 0.37), heavy);
  float tr = writeTime(rk * DZ - DW);
  float eR = pow(smoothstep(0.5, 1.0, 0.5 * (melAt(tr, 1.5) + melAt(tr, 4.5))), 1.4);

  // ---- corner rails and speed streaks
  float railL = pxLine(abs(FL * 0.5 - abs(s)) / max(fwu, 1e-6), 0.6, 1.8);
  float cw = FL / 6.0;
  float cid = floor(u / cw);
  float lineU = pxLine(abs(fract(u / cw) - 0.5) * cw / max(fwu, 1e-6), 0.4, 1.3);
  float sg = fract(zw * 0.11 + hash11(cid * 3.7) * 9.0);
  float streak = lineU * step(0.55, hash11(cid + 0.5)) * smoothstep(0.0, 0.05, sg) * smoothstep(0.02 + 0.006 * vel, 0.0, sg - 0.05);

  // ---- kick pings (light shooting down the tunnel) and clap rings (red)
  float ping = 0.0, clapR = 0.0;
  for (int i = 0; i < 8; i++) {
    float age = t - uKick[i].x;
    if (age < 0.0 || age > 1.0) continue;
    float d = zd - (0.6 + age * 34.0);
    ping += uKick[i].y * exp(-age * 3.2) * exp(-d * d / 1.4);
  }
  for (int i = 0; i < 4; i++) {
    float age = t - uClap[i].x;
    if (age < 0.0 || age > 1.2) continue;
    float d = zd - (0.9 + age * 20.0);
    clapR += uClap[i].y * exp(-age * 2.6) * exp(-d * d / 0.35);
  }

  // ---- compose the wall
  float fog = exp(-zd * 0.07);
  float nearDim = 0.08 + 0.92 * smoothstep(1.1, 4.2, zd);
  vec3 hot = mix(C_ORANGE, C_AMBER, sat(en * 0.7 + ping * 0.6));
  vec3 wall = C_ORANGE * 0.003;
  wall += hot * (0.0015 + 0.2 * en * step(0.45, cellH)) * fillM * (0.5 + 0.7 * cellH);
  wall += C_ORANGE * (0.045 + 0.4 * en) * edgeL;
  wall += C_ORANGE * (0.45 + 1.1 * eR + 0.6 * pad * (1.0 - race)) * ringL;
  wall += C_ORANGE * rib * mix(0.10, 0.32 + 0.5 * eR, heavy);
  wall += C_AMBER * (0.35 + 0.5 * eR) * railL;
  wall += C_AMBER * streak * 2.2 * race * smoothstep(8.0, 30.0, vel);
  wall += hot * ping * (0.35 * fillM + 1.4 * ringL + 0.5 * edgeL + 0.4 * rib);
  wall += C_BONE * smoothstep(0.9, 1.6, ping + en * 0.6) * ringL * 0.6;
  wall = mix(wall, C_RED * (0.12 * fillM + 2.0 * ringL + 1.0 * rib + 0.6 * edgeL), sat(clapR));
  // interface flicker at the lock (the plug walls cycling colours before the link settles)
  wall = mix(wall, flickCol * (luma(wall) * 2.6 + 0.02 * fillM), flickAmt);
  vec3 col = wall * fog * nearDim;

  // ---- depth haze (LCL volume) and the core light at the far end
  col += C_ORANGE * 0.025 * (1.0 - fog) * (0.6 + 0.4 * pad);
  col += C_AMBER * exp(-o / 0.05) * (0.25 + 0.35 * coreK);
  col += C_BONE * exp(-o / 0.011) * (0.6 + 1.6 * coreK);
  col += C_AMBER * 0.35 * (kickNow * race) * exp(-o / 0.12);

  // ---- LCL: the fluid line rises from the floor during the break; clears after electrolysis
  vec2 sp = FRAG_PX;
  float L = lcl * 1180.0 - 60.0 + (6.0 * sin(sp.x * 0.012 + t * 2.1) + 3.0 * sin(sp.x * 0.031 - t * 3.4)) * (1.0 - step(1.0, lcl));
  float wet = step(sp.y, L);
  float tintK = 1.0 - 0.65 * clarity;
  vec3 wetCol = col * mix(vec3(1.0), vec3(1.05, 0.72, 0.42), tintK) + C_ORANGE * 0.004 * tintK;
  vec3 dryCol = mix(col, vec3(luma(col)), 0.55) * 0.42;
  col = mix(dryCol, wetCol, wet);
  col += C_AMBER * 1.3 * pxLine(abs(sp.y - L) * PX_SCALE, 0.8, 2.2) * (1.0 - step(1.0, lcl));
  col += C_ORANGE * 0.10 * exp(-max(L - sp.y, 0.0) / 30.0) * wet * (1.0 - step(1.0, lcl));
  // bubbles: columns of rising rings, dense while flooding, sparse after
  float bub = 0.0;
  for (int j = 0; j < 2; j++) {
    float cs = j == 0 ? 54.0 : 31.0;
    float colI = floor(sp.x / cs);
    float vb = (j == 0 ? 170.0 : 110.0) + hash11(colI * 1.3 + float(j) * 17.0) * 160.0;
    float yy = sp.y - t * vb;
    float cellY = floor(yy / cs);
    vec2 id = vec2(colI, cellY + float(j) * 101.0);
    float h1 = hash12(id);
    float dens = mix(0.05, 0.22, 1.0 - clarity) * (j == 0 ? 1.0 : 0.7);
    if (h1 < dens) {
      vec2 c0 = vec2((colI + 0.5 + 0.3 * sin(t * 3.0 + h1 * 40.0)) * cs, (cellY + 0.5) * cs + t * vb);
      float r = (j == 0 ? 3.0 : 1.8) + 4.0 * hash12(id + 3.1);
      float d = abs(length(sp - c0) - r);
      bub += pxLine(d * PX_SCALE, 0.5, 1.4) * (0.5 + 0.5 * h1 / dens);
    }
  }
  col += C_AMBER * 0.4 * bub * wet;

  fragColor = vec4(col, 1.0);
}`,ye=`ENTRY PLUG INSERTION // エントリープラグ挿入 // LCL 注水 // PLUG LOCK // 神経接続 開始 // A10 NERVE CONNECTION: NO ABNORMALITY // 双方向回線 開きます // HARMONICS ALL NORMAL // SYNC RATIO 41.3% // EVANGELION UNIT-01 STANDING BY // `,be=[`orange`,`red`,`green`,`amber`,`bone`,`red`,`orange`,`green`,`purple`,`amber`,`red`,`bone`],xe=class extends S{tunnel;text=new l;scan=y(.24);drive;T={s:0,e:0,lock:0,k1:0,lcl:0,fire:0,beat:.45};kicks=[];kicksAll=[];claps=[];hats=[];done=[];act=[];uk=T(8);uc=T(4);mel=new Float32Array(64);roll0=0;init(){let e=this.ctx.audio,t=this.ctx.start,n=this.ctx.end,i=60/e.bpm,a=e.sections.find(e=>e.name===`drop2`),o=a&&a.start>t&&a.start<n?a.start:_(e,56),l=E(e,`kick`,o+.3,n-.2,.8),u=l[0]?.[0]??o+i*4/3;this.T={s:t,e:n,lock:o,k1:u,lcl:o-i,fire:n-i,beat:i},this.kicksAll=E(e,`kick`,t-3,n,.3),this.kicks=this.kicksAll.filter(([e])=>e>=u-.03),this.claps=E(e,`snare`,u-.05,n,.5),this.hats=E(e,`hat`,t-3,n).map(e=>e[0]),this.roll0=.2*(o-t);let d=[t+.25,o,this.T.lcl,o],f=O.length-4;for(let e=0;e<f;e++)d.push(l[e]?.[0]??u+(this.T.fire-.1-u)*e/(f-1));this.done=d,this.act=d.map((e,n)=>n===0||n===1?t:n===2?t+.45:n===3?o-2*i:d[n-1]);let p=t=>{let n=r(e.env(`bass`,t));if(t<o)return 1.3+1.7*r(e.env(`other`,t));if(t<u){let e=(t-o)/(u-o);return .12+11*e*e*(.5+.5*n)}return 11+6*n+46*e.hit(`kick`,t,.06)};this.drive=new D(t-4,n+.5,1/1e3,p);let g=this.drive.inverseTexture(4096);this.tunnel=new h(ve,{t:{value:0},zc:{value:0},fov:{value:.95},roll:{value:0},lcl:{value:0},clarity:{value:0},bass:{value:0},kickNow:{value:0},fi:{value:0},race:{value:0},flickAmt:{value:0},pad:{value:0},vel:{value:0},glitch:{value:0},coreK:{value:0},flickCol:{value:new c(...te.orange)},center:{value:new s(A,ee-j)},uZT:{value:g.tex},uZTInfo:{value:g.info},uKick:{value:this.uk},uClap:{value:this.uc},...m(this.ctx.spectrum)})}roll(e,t){let n=this.T;if(e<n.lock)return .2*(e-n.s);let r=e-n.lock;return this.roll0+.06*Math.exp(-r*5)*Math.sin(r*30)+.03*Math.sin(e*1.7)*t}hatStep(e){let t=0,n=this.hats.length;for(;t<n;){let r=t+n>>1;this.hats[r]<=e?t=r+1:n=r}return t}stage(e,t){return t>=this.done[e]?[2,t-this.done[e]]:t>=this.act[e]?[1,0]:[0,0]}render(s,c){let{renderer:l,audio:m}=this.ctx,h=this.T,g=s.t,ne=g-h.s,_=e(g),y=oe(s,m,1),S=m.hit(`kick`,g,.1)*+(g>=h.k1-.03),T=g>=h.k1-.05?m.hit(`snare`,g,.12):0,E=r(m.env(`bass`,g)),D=r(m.env(`other`,g)),ve=le(m,g),xe=Math.floor(ve+1e-4),N=g>=h.lock,P=+(g>=h.k1),Ce=N&&!P,we=g>=h.fire,F=this.drive.vel(g),I=this.drive.at(g),L=this.roll(g,E),R=N?1.02:r(t(g,h.s+.15,h.lcl,o.inOutQuad)*1.02,0,1.02),Te=t(g,this.done[5],this.done[5]+.35,o.outCubic);pe(this.uk,this.kicks,g),pe(this.uc,this.claps,g);let z=this.tunnel.u;z.t.value=g,z.fi.value=_,z.zc.value=I,z.roll.value=L,z.fov.value=.95-.2*r((F-10)/40)+.04*n(g,h.lock,.08),z.lcl.value=R,z.clarity.value=Te,z.bass.value=E,z.kickNow.value=S,z.race.value=P,z.pad.value=D,z.vel.value=F,z.glitch.value=T,z.coreK.value=(N?.4+.9*E:.15*D)+1.2*n(g,h.lock,.12)+(we?2*t(g,h.fire,h.e,o.inQuad):0);let Ee=Ce?Math.floor((g-h.lock)/(h.beat/4)):0;z.flickAmt.value=Ce?.85*(1-.5*t(g,h.lock,h.k1)):0,z.flickCol.value.set(...te[be[Ee%be.length]]),this.tunnel.render(l,c);let De=this.text;De.clear();let B=De.ctx,Oe=-y*3,ke=y*4,V=(e=1)=>p(`orange`,e);B.save(),B.translate(Oe,ke);let Ae=we?`発進`:P?`神経接続`:N?`プラグ固定`:`LCL注水`;he(B,40,34,u-80,{tag:`ENTRY PLUG`,tagJp:`エントリープラグ`,sub:`EVANGELION UNIT-01  //  INSERTION + ACTIVATION SEQUENCE`,right:`BAR ${String(xe).padStart(2,`0`)}/60  T+${ne.toFixed(2)}`,rightJp:Ae});let je=N?1:t(I,this.drive.at(h.s),this.drive.at(h.lock),o.linear),H=b(B,40,100,390,330,{title:`PLUG DEPTH`,jp:`挿入深度`,fill:k});C(B,`INSERTION`,H.x,H.y+14,11,V(.7),{w:600});let Me=43.6*je;x(B,Me.toFixed(2).padStart(5,`0`),H.x,H.y+24,56,N?p(`amber`,1):p(`amber`,.95),V(.07)),C(B,`M`,H.x+196,H.y+78,13,V(.8),{w:700});let U=H.y+112,W=(e,t,n,r=V(1))=>{C(B,e,H.x,n,11,V(.65),{w:600}),C(B,t,H.x+206,n,12,r,{w:700,align:`right`})};W(`ROTATION`,`${(L*180/Math.PI).toFixed(2)}°`,U),W(`VELOCITY`,`${F.toFixed(1).padStart(5,`0`)} m/s`,U+22),W(`ANGLE`,`${(.4*Math.sin(g*.8)).toFixed(3)} rad`,U+44),W(`STATUS`,N?`LOCKED`:`INSERTING`,U+66,N?p(`green`,1):p(`amber`,Se(g,3))),B.font=v(13,600,!1),B.fillStyle=V(.7),B.fillText(N?`プラグ固定完了`:`挿入中`,H.x,U+90);let Ne=this.hatStep(g);B.font=d(f.mono(400),10);for(let e=0;e<4;e++)B.fillStyle=V(e===0?.85:.45-e*.08),B.fillText(`${(1504+(Ne+e)%64*8).toString(16).toUpperCase()} ${se(e+11,Ne-e,8)}`,H.x,U+114+e*14);_e(B,H.x+214,H.y,156,H.h-38,je,t(g,h.lock,h.lock+.12),{}),ce(B,H.x,H.y+H.h-16,H.w,12,36,je,{hotFrom:1.1,color:p(`amber`,1)});let G=b(B,40,446,390,262,{title:`LCL`,jp:`注水`,fill:k}),Pe=r(R)*100;C(B,Te>0?`ELECTROLYSIS`:`FLOODING`,G.x,G.y+14,11,V(.7),{w:600}),x(B,Pe.toFixed(1).padStart(5,`0`),G.x,G.y+24,50,p(Pe>=100?`green`:`amber`,1),V(.07)),C(B,`%`,G.x+196,G.y+70,14,V(.8),{w:700}),ce(B,G.x+G.w-40,G.y+4,40,110,16,r(R),{vertical:!0,hotFrom:1.1,color:p(`amber`,1)}),C(B,`TANK`,G.x+G.w-20,G.y+130,10,V(.7),{w:600,align:`center`});let Fe=101.3+38*r(R)+6*E;w(B,G.x,G.y+100,G.w-60,`PRESSURE`,`圧力`,`${Fe.toFixed(1)} kPa`,p(`amber`,1)),w(B,G.x,G.y+124,G.w-60,`TEMP`,`温度`,`${(35.4+1.2*r(R)+.2*D).toFixed(1)}°C`,p(`amber`,1)),w(B,G.x,G.y+148,G.w,`O2 SATURATION`,`酸素`,`${(62+36*r(R)).toFixed(1)}%`,p(`amber`,1));let K=this.stage(5,g);w(B,G.x,G.y+172,G.w,`ELECTROLYSIS`,`電化`,K[0]===2?`ON`:K[0]===1?`STANDBY`:`OFF`,K[0]===2?p(`green`,1):V(.8),{box:K[0]===2&&K[1]<.3}),C(B,`${se(3,Math.floor(s.beat*2),6)}  VISC ${(1.02+.03*D).toFixed(3)}  PH 7.${String(Math.floor(D*90)).padStart(2,`0`)}`,G.x,G.y+G.h-4,10,V(.5),{w:500});let q=b(B,40,724,390,276,{title:`PULSE`,jp:`脈拍`,fill:k,color:T>.3?p(`red`,1):void 0});B.strokeStyle=V(.14),B.lineWidth=1,B.beginPath();for(let e=1;e<10;e++){let t=q.x+q.w*e/10;B.moveTo(t,q.y),B.lineTo(t,q.y+130)}for(let e=1;e<4;e++){let t=q.y+130*e/4;B.moveTo(q.x,t),B.lineTo(q.x+q.w,t)}B.stroke(),ge(B,m,this.kicks,g,q.x,q.y,q.w,130,{col:p(`green`,1),span:2.4}),me(B,m,g,q.x,q.y+140,q.w,56,{win:.05,col:p(`amber`,.9),gain:1,grid:!1,n:180,lw:1.2});let Ie=P?133+Math.round(8*S):0;C(B,`HR`,q.x,q.y+q.h-4,11,V(.7),{w:600}),C(B,P?`${Ie} BPM`:`--- BPM`,q.x+30,q.y+q.h-4,13,P?p(`green`,1):V(.5),{w:700}),C(B,`NERVE ${P?`ACTIVE`:`IDLE`}`,q.x+q.w,q.y+q.h-4,11,P?p(`green`,1):V(.6),{w:700,align:`right`}),B.font=v(13,600,!1),B.fillStyle=V(.6),B.textAlign=`center`,B.fillText(`パイロット 心拍`,q.x+q.w/2,q.y+q.h-4),B.textAlign=`left`;let Le=u-430,J=b(B,Le,100,390,500,{title:`STARTUP`,jp:`起動手順`,fill:k});for(let e=0;e<O.length;e++){let t=O[e],[n,r]=this.stage(e,g),i=J.y+18+e*29.3,a=n===2&&r<.35;a&&(B.fillStyle=p(t.col??`green`,.9*(1-r/.35)),B.fillRect(J.x-4,i-16,J.w+8,23));let o=n===0?V(.3):a?p(`ink`,1):V(.95);C(B,String(e+1).padStart(2,`0`),J.x,i,11,V(n===0?.25:.6),{w:600}),C(B,t.en,J.x+30,i,12,o,{w:600,track:1.6}),B.font=d(f.mono(600),12),B.letterSpacing=`1.6px`;let s=B.measureText(t.en).width;B.letterSpacing=`0px`,B.font=v(12,600,!1),B.fillStyle=n===0?V(.22):a?p(`ink`,1):V(.6),B.fillText(t.jp,J.x+30+s+8,i);let c=n===2?t.ok:n===1?Se(g,4)>.5?`••••`:``:`----`,l=n===2?p(a?`ink`:t.col??`green`,1):n===1?p(`amber`,1):V(.25);B.font=/[^\x00-\x7f]/.test(c)?v(13,700,!1):d(f.mono(700),12),B.fillStyle=l,B.textAlign=`right`,B.letterSpacing=`1.5px`,B.fillText(c,J.x+J.w,i),B.textAlign=`left`,B.letterSpacing=`0px`,n===1&&(B.fillStyle=p(`amber`,1),B.fillRect(J.x+22,i-9,4,9))}let Y=b(B,Le,616,390,190,{title:`SYNC RATIO`,jp:`シンクロ率`,fill:k}),Re=this.done[7],ze=this.done[13],X=-1;g>=Re&&(X=g>=ze?41.3:41.3*o.outCubic(t(g,Re,ze))+(i(_>>1,3)-.5)*3*(1-t(g,Re,ze)));let Be=X<0?`--.-`:r(X,0,99.9).toFixed(1).padStart(4,`0`);x(B,Be,Y.x,Y.y+6,84,p(X>=41.3?`amber`:`orange`,1),V(.07)),ae(B,`%`,Y.x+256,Y.y+86,64,{color:V(1)}),ce(B,Y.x,Y.y+104,Y.w,14,40,X<0?0:X/100,{hotFrom:.9}),C(B,X>=41.3?`SYNCHRONIZED  同調完了`:X>=0?`SYNCHRONIZING  同調中`:`AWAITING LINK  待機`,Y.x,Y.y+Y.h-2,11,X>=41.3?p(`green`,1):V(.8),{w:700}),C(B,`ABS. BORDER 0.0`,Y.x+Y.w,Y.y+Y.h-2,10,V(.55),{align:`right`});let Z=b(B,Le,822,390,178,{title:`HARMONICS`,jp:`ハーモニクス`,fill:k});m.melFrame(g,this.mel);let Ve=Z.w/48;for(let e=0;e<48;e++){let t=a(.45,1,this.mel[Math.floor(e*60/48)]),n=6+t*88;B.fillStyle=t>.94?p(`red`,1):t>.7?p(`amber`,1):V(.85),B.fillRect(Z.x+e*Ve,Z.y+96-n,Ve-2,n)}B.fillStyle=V(.4),B.fillRect(Z.x,Z.y+98,Z.w,1);let He=g>=this.done[12];C(B,He?`ALL NORMAL`:`MEASURING`,Z.x,Z.y+Z.h-4,12,p(He?`green`:`amber`,1),{w:700}),B.font=v(13,700,!1),B.fillStyle=p(He?`green`:`amber`,1),B.fillText(He?`全て正常値`:`計測中`,Z.x+106,Z.y+Z.h-4),C(B,`30 — 16K HZ`,Z.x+Z.w,Z.y+Z.h-4,10,V(.55),{align:`right`});let Ue=Math.cos(L),We=Math.sin(L),Ge=z.fov.value,Ke=Math.ceil((I+1.2)/M),qe=Math.floor((I+16)/M);B.font=d(f.mono(600),11),B.letterSpacing=`1px`;for(let e=Ke;e<=qe;e++){if(e%4)continue;let t=e*M-I,n=Ge/t*ee,i=r(Math.exp(-t*.07)*1.3)*r((t-1.2)/1.2),a=n,o=n*Math.tan(Math.PI/8),s=A+a*Ue-o*We,c=j-(a*We+o*Ue);B.strokeStyle=V(.8*i),B.lineWidth=1,B.beginPath(),B.moveTo(s+4,c-4),B.lineTo(s+26,c-26),B.lineTo(s+96,c-26),B.stroke(),B.fillStyle=V(.95*i),B.fillText(`F-${String(e).padStart(3,`0`)}`,s+30,c-31),B.fillStyle=V(.6*i),B.fillText(`${(t*4.2).toFixed(1)}m`,s+30,c-12)}if(B.letterSpacing=`0px`,fe(B,A,j,46+8*S),B.strokeStyle=p(`amber`,.9),B.lineWidth=1.5,B.stroke(),re(B,864,374,192,192,18,V(.85),2),B.strokeStyle=V(.5),B.lineWidth=1,B.beginPath(),B.moveTo(800,j),B.lineTo(850,j),B.moveTo(1070,j),B.lineTo(1120,j),B.moveTo(A,310),B.lineTo(A,360),B.moveTo(A,580),B.lineTo(A,630),B.stroke(),C(B,`Z ${(I*4.2).toFixed(1).padStart(6,`0`)}`,1064,590,11,V(.8),{w:600}),C(B,`θ ${(L*180/Math.PI).toFixed(1)}°`,856,590,11,V(.8),{w:600,align:`right`}),B.save(),ie(B,800,104,320,112,[0,0,18,18]),B.fillStyle=`rgba(5,4,3,0.82)`,B.fill(),B.strokeStyle=V(.55),B.lineWidth=1,B.stroke(),B.restore(),N){C(B,P?`VELOCITY`:`PLUG LOCKED`,A,128,12,P?V(.8):p(`green`,1),{w:700,align:`center`,track:4});let e=F.toFixed(1).padStart(5,`0`);x(B,e,872,138,46,p(`amber`,1),V(.07)),C(B,`M/S`,1052,180,12,V(.8),{w:700}),B.font=v(15,700,!1),B.fillStyle=V(.8),B.textAlign=`center`,B.fillText(P?`神経接続 進行中`:`プラグ固定`,A,206),B.textAlign=`left`}else{let e=Math.max(0,h.lock-g);C(B,`NEURAL LINK IN`,A,128,12,V(.8),{w:700,align:`center`,track:4});let t=`00:${e.toFixed(2).padStart(5,`0`)}`;x(B,t,842,138,46,p(`amber`,1),V(.07)),B.font=v(15,700,!1),B.fillStyle=V(.8),B.textAlign=`center`,B.fillText(`神経接続まで`,A,206),B.textAlign=`left`}de(B,`エントリープラグ`,470,250,20,V(.55),!0),de(B,`神経接続`,u-470,250,20,V(.55),!0),B.restore();let Je=u-940;B.save(),ie(B,470,822,Je,178,[0,26,0,26]),B.fillStyle=`rgba(5,4,3,0.86)`,B.fill(),B.strokeStyle=V(.6),B.lineWidth=1.5,B.stroke(),B.restore(),C(B,N?`NEURAL CONNECTION // UNIT-01`:`INSERTION // UNIT-01`,494,850,13,V(1),{w:700,track:4}),ae(B,`ENTRY PLUG`,490,982,150,{sx:.58,color:p(`bone`,1)});let Ye=0;for(let e=0;e<O.length;e++)g>=this.done[e]&&(Ye=e);let Xe=O.findIndex((e,t)=>g<this.done[t]&&g>=this.act[t]),Ze=N?Ye:Math.max(0,Xe),Q=O[Ze],Qe=g-this.done[Ze],$e=g>=this.done[Ze],$=470+Je-24;$e&&Qe<.16&&(B.fillStyle=p(Q.col??`green`,1),B.fillRect(1030,866,Je-584,122));let et=$e&&Qe<.16;B.textAlign=`right`,C(B,`STAGE ${String(Ze+1).padStart(2,`0`)}/${O.length}`,$,850,12,V(.8),{w:700,align:`right`,track:3}),B.font=v(Q.jp.length>7?34:40,700,!0),B.fillStyle=et?p(`ink`,1):V(1),B.textAlign=`right`,B.fillText(Q.jp,$,922),C(B,Q.en,$-150,956,13,et?p(`ink`,1):V(.85),{w:700,align:`right`,track:2.5});let tt=$e?Q.ok:Se(g,4)>.5?`IN PROGRESS`:``;if(B.font=/[^\x00-\x7f]/.test(tt)?v(17,700,!1):d(f.mono(700),14),B.fillStyle=p(et?`ink`:$e?Q.col??`green`:`amber`,1),B.textAlign=`right`,B.fillText(tt,$,956),C(B,`3RD CHILDREN  //  サードチルドレン`,$,986,11,et?p(`ink`,1):V(.6),{w:600,align:`right`}),B.textAlign=`left`,ue(B,40,1046,u-80,ye,g,{speed:110,color:V(.7)}),B.fillStyle=V(.6),B.fillRect(40,1056,u-80,1),Ce){let e=(g-h.lock)/(h.k1-h.lock);B.fillStyle=`rgba(5,4,3,0.84)`,B.fillRect(0,330,u,300),B.fillStyle=V(1),B.fillRect(0,326,u,4),B.fillRect(0,630,u,4),B.font=v(150*(e<.08?1.06:1),800,!0),B.fillStyle=p(`bone`,1),B.textAlign=`center`,B.fillText(`神経接続　開始`,A,540),C(B,`NEURAL CONNECTION // START`,A,590,22,V(1),{w:700,align:`center`,track:6}),C(B,`PLUG LOCKED  //  LCL 100%  //  ${se(9,_>>2,8)}`,A,366,14,V(.85),{w:600,align:`center`,track:4}),B.textAlign=`left`}if(we){let e=(g-h.fire)/(h.e-h.fire);B.fillStyle=`rgba(5,4,3,0.8)`,B.fillRect(0,360,u,250),B.fillStyle=p(`red`,1),B.fillRect(0,356,u,4),B.fillRect(0,610,u,4),B.font=v(170*(e<.1?1.08:1),800,!0),B.fillStyle=p(`bone`,1),B.textAlign=`center`,B.fillText(`発進`,A,540),C(B,`EVANGELION UNIT-01  //  LAUNCH`,A,590,20,p(`red`,1),{w:700,align:`center`,track:6}),B.textAlign=`left`}this.ctx.comp.draw(l,De.upload(),c),this.scan.u.t.value=g,this.scan.render(l,c);let nt=n(g,h.lock,.1),rt=n(g,h.fire,.08),it=n(g,h.k1,.1),at=8*nt+6*it+5*rt+2.2*S;return{bloom:.72,bloomThreshold:.78,bloomRadius:.75,halation:.12,vignette:.55,grain:.05,ca:1+2.5*T+4*nt+3*it,flash:.45*n(g,h.lock,.04)+.3*n(g,h.k1,.035)+.5*n(g,h.fire,.05),zoom:1+.04*nt+.03*it+.008*y,shake:[at*Math.sin(_*2.1),at*Math.cos(_*1.7)]}}};function Se(e,t){return e*t%1<.55?1:.25}export{xe as default};