import{a as e,d as t,f as n,n as r,p as i,r as a}from"./util-C3PkC1mi.js";import{L as o,a as s,c,g as l,h as ee,i as u,m as d,n as f,r as p,t as m}from"./index-BBsgxCGr.js";import{GLSL_EVA as h,barTime as g,brackets as te,condensed as _,duck as v,evaLabel as y,hexData as b,jp as x,makeScanPass as S,panel as C,segMeter as w,sevenSeg as T,songBar as E,ticker as D}from"./_eva-Ycn4hoBe.js";import{t as O}from"./scene-CTj40Zt3.js";import{a as k,c as A,d as j,f as M,i as N,l as P,n as F,o as I,p as L,r as ne,s as re,u as R}from"./atfield-kit-BK6GEdkj.js";var z=`
${h}
${m}
uniform float t, fi, zoom, deploy, red, glitch, bass, kickNow, breach;
uniform vec2 center, tilt;
uniform vec2 uKick[8];
uniform vec2 uClap[3];
uniform vec2 uHat[4];

const float R = 0.036;      // cell circumradius (plane units = frame heights)
const float V = 0.5;        // spectrum propagation speed (plane units / s)
const float VK = 1.35;      // kick wavefront speed
const float VC = 1.1;       // clap shatter ring speed

float oct(vec2 v) { v = abs(v); return max(max(v.x, v.y), (v.x + v.y) * 0.70710678); }

void main() {
  vec2 px = FRAG_PX;
  // hard row glitch on claps (rows offset horizontally, stable over the frame's shutter)
  float row = floor(px.y / 7.0);
  float gh = hash12(vec2(row, fi));
  if (gh < 0.16 * glitch) px.x += (hash12(vec2(row * 1.7, fi + 3.1)) - 0.5) * 120.0 * glitch;

  vec2 q = (px - center) / ${u.toFixed(1)};
  // the field plane, tilted in perspective (bass leans it), zoomed on the kick
  float w = 1.0 + dot(q, tilt);
  vec2 p = q / w * zoom;
  float dp0 = oct(p);
  float fw0 = fwidth(dp0);

  // ---- kick wavefronts: lattice warp + crisp octagon lines
  float warp = 0.0, fronts = 0.0, cellFront = 0.0;
  for (int i = 0; i < 8; i++) {
    float age = t - uKick[i].x;
    if (age < 0.0 || age > 1.8) continue;
    float a = uKick[i].y * exp(-age * 1.9);
    float d = dp0 - age * VK;
    warp += a * exp(-d * d / 0.0035);
    fronts += a * pxLine(abs(d) / max(fw0, 1e-5), 0.6, 2.2);
    fronts += a * 0.35 * exp(-abs(d) / 0.012) * step(d, 0.0) ;
  }
  p *= 1.0 - 0.035 * warp;
  float dp = oct(p);

  // ---- main hex lattice
  vec4 hc = hexCell(p, R);
  vec2 g = hc.xy, id = hc.zw, cc = p - g;
  float dc = oct(cc);
  float Rmax = deploy * (0.40 + 0.06 * bass);
  float inside = smoothstep(Rmax + 0.03, Rmax - 0.03, dc);

  // spectrum history: radius = delay, angle within the octant = band
  float lag = dc / V;
  float eL = melAvg(t - lag, 0.0, 5.0); eL = pow(smoothstep(0.55, 1.0, eL), 1.6);
  float ang = atan(cc.y, cc.x);
  float a8 = abs(fract(ang / (TAU / 8.0) + 0.5) * 2.0 - 1.0);
  float eH = pow(smoothstep(0.5, 1.0, melAt(t - lag, 10.0 + a8 * 46.0)), 2.0);

  for (int i = 0; i < 8; i++) {
    float age = t - uKick[i].x;
    if (age < 0.0 || age > 1.8) continue;
    float d = dc - age * VK;
    cellFront += uKick[i].y * exp(-age * 1.6) * exp(-d * d / 0.0022);
  }

  // clap shatter: a ring of cells breaks into shrunken, displaced red fragments
  float sh = 0.0;
  for (int i = 0; i < 3; i++) {
    float age = t - uClap[i].x;
    if (age < 0.0 || age > 1.2) continue;
    float d = dc - (0.06 + age * VC);
    sh = max(sh, uClap[i].y * exp(-d * d / 0.0045) * exp(-age * 2.4));
  }
  vec2 jit = (hash22(id + 13.1) - 0.5) * R * 1.3 * sh;
  float rr = R * (1.0 - 0.55 * sh * hash12(id + 2.7));
  float e = hexEdge(g - jit, rr);
  float fwp = length(fwidth(p));
  float epx = e / max(fwp, 1e-6);         // distance to the cell border in physical px
  float gap = 2.2 * PX_SCALE;
  float fill = smoothstep(gap, gap + 1.0, epx);
  float rim = pxLine(abs(epx - gap - 1.2 * PX_SCALE), 0.6, 1.8);
  float inner = pxLine(abs(epx - (R * 0.5) / max(fwp, 1e-6)), 0.5, 1.5); // inner hex echo

  // hat sparkle + high-band glitter
  float spark = 0.0;
  for (int i = 0; i < 4; i++) {
    float age = t - uHat[i].x;
    if (age < 0.0 || age > 0.5) continue;
    if (hash12(id + uHat[i].x * 13.7) < 0.05) spark += uHat[i].y * exp(-age / 0.07);
  }
  float hi = melAvg(t, 44.0, 56.0);
  if (hash12(id + floor(t * 15.0) * 7.31) < 0.03 * smoothstep(0.5, 1.0, hi)) spark += 0.8;

  float I = 0.06 + 1.1 * eL * (1.0 - 0.45 * dc / max(Rmax, 0.1)) + 0.4 * eH + 1.3 * cellFront + 1.6 * spark;
  I *= inside;
  I *= 0.8 + 0.35 * kickNow;

  vec3 hot = mix(C_ORANGE, C_AMBER, smoothstep(0.7, 1.5, I));
  vec3 col = vec3(0.0);
  col += hot * I * (0.07 * fill + 1.1 * rim + 0.25 * inner * eH);
  col += hot * 0.5 * cellFront * fill * inside;
  col += C_BONE * smoothstep(1.2, 2.4, I) * rim * 0.8;
  col = mix(col, C_RED * (0.3 * fill + 1.8 * rim) * (0.4 + I), sh * inside);

  // ---- back plane: fine lattice, deeper (parallax), faint
  vec2 pb = q / (1.0 + dot(q, tilt * 0.6)) * (zoom * 0.72 + 0.28);
  vec4 hb = hexCell(pb, 0.017);
  float eb = hexEdge(hb.xy, 0.017) / max(length(fwidth(pb)), 1e-6);
  float lb = pxLine(eb, 0.3, 1.2);
  float db = oct(pb);
  col += C_ORANGE * lb * (0.035 + 0.25 * fronts * 0.3 + 0.08 * smoothstep(Rmax + 0.2, Rmax, db)) * (1.0 - inside * 0.6);

  // ---- octagon range guides, 8 spokes, wavefront lines
  float gd = abs(fract(dp0 / 0.12 + 0.5) - 0.5) * 0.12;
  col += C_ORANGE * 0.10 * pxLine(gd / max(fw0, 1e-5), 0.3, 1.2) * smoothstep(0.95, 0.4, dp0);
  float sa = atan(q.y, q.x);
  float spoke = abs(fract(sa / (TAU / 8.0) + 0.5) - 0.5) * (TAU / 8.0) * length(q);
  col += C_ORANGE * 0.06 * pxLine(spoke / max(fwidth(q.x) + fwidth(q.y), 1e-5) * 0.7, 0.3, 1.0) * step(0.08, dp0);
  col += mix(C_AMBER, C_BONE, 0.3) * fronts * 1.3;
  // the rim of the deployed field
  col += C_AMBER * 1.2 * pxLine(abs(dp0 - Rmax - 0.035) / max(fw0, 1e-5), 0.8, 2.4) * deploy;

  // ---- core: the field's origin
  col += C_AMBER * (0.5 + 1.5 * kickNow) * exp(-dp / 0.022) * deploy;
  col += C_ORANGE * 0.06 * exp(-dp / 0.35) * deploy;

  // red end-of-plate shift (pattern blue incoming) + breach tint
  float l = luma(col);
  col = mix(col, C_RED * (0.3 + l * 3.0), red);
  col += C_RED * 0.02 * breach * smoothstep(0.9, 0.2, dp0);
  fragColor = vec4(col, 1.0);
}`,B=`A.T. FIELD DEPLOYED // ABSOLUTE TERROR FIELD // 位相空間 展開 // PHASE SPACE EXPANDING // FIELD INTERFERENCE: NONE // EVA-01 STANDING BY // MAGI CONSENSUS 3/3 // `,V=class extends O{field;text=new s;scan=S(.24);kicks=[];claps=[];hats=[];T={s:0,e:0,b35:0,b44:0};uk=M(8);uc=M(3);uh=M(4);mel=new Float32Array(64);init(){let e=this.ctx.audio;this.T={s:this.ctx.start,e:this.ctx.end,b35:g(e,35),b44:g(e,44)},this.kicks=R(e,`kick`,this.T.s-.05,this.T.e,.3),this.claps=R(e,`snare`,this.T.s-.05,this.T.e,.5),this.hats=R(e,`hat`,this.T.s-.05,this.T.e),this.field=new p(z,{t:{value:0},fi:{value:0},zoom:{value:1},deploy:{value:1},red:{value:0},glitch:{value:0},bass:{value:0},kickNow:{value:0},breach:{value:0},center:{value:new o(c/2,u/2)},tilt:{value:new o},uKick:{value:this.uk},uClap:{value:this.uc},uHat:{value:this.uh},...f(this.ctx.spectrum)})}render(o,s){let{renderer:f,audio:p}=this.ctx,m=this.T,h=o.t,S=h-m.s,O=v(o,p,1),M=p.hit(`kick`,h,.1),R=p.hit(`snare`,h,.12),z=r(p.env(`bass`,h)),V=E(p,h),H=Math.floor(V+1e-4),U=V-H,W=S<.9,G=h>=m.b44+.9?t(h,m.b44+.9,m.e,a.inQuad):0,K=n(h,g(p,H-(H-35)%2),.18);F(this.uk,this.kicks,h),F(this.uc,this.claps,h),F(this.uh,this.hats,h);let q=this.field.u;q.t.value=h,q.fi.value=e(h),q.deploy.value=.3+.7*t(S,0,.5,a.outExpo),q.zoom.value=(1-.05*O-.08*n(h,m.b35,.25))*(1-.04*G),q.bass.value=z,q.kickNow.value=M,q.red.value=G*(.6+.4*(e(h)>>2&1)),q.glitch.value=r(R*.9+G*.8),q.breach.value=R,q.tilt.value.set(.12*Math.sin(h*.37)+.08*z*Math.sin(h*1.3),.1*Math.cos(h*.29)-.06*z),this.field.render(f,s);let J=this.text;J.clear();let Y=J.ctx,X=-O*3,ie=O*4;if(W){let e=S/.9;Y.fillStyle=`rgba(5,4,3,0.82)`,Y.fillRect(0,300,c,480),Y.fillStyle=d(`orange`,1),Y.fillRect(0,296,c,4),Y.fillRect(0,780,c,4);let t=e<.06?1.08:1;_(Y,`A.T. FIELD`,c/2,700,440*t,{sx:.56,color:d(`bone`,1),align:`center`}),Y.font=x(46,700,!0),Y.fillStyle=d(`orange`,1),Y.textAlign=`center`,Y.fillText(`絶対恐怖領域　全開`,c/2,860),A(Y,`ABSOLUTE TERROR FIELD // FULL DEPLOYMENT`,c/2,262,20,d(`orange`,1),{w:700,align:`center`,track:5}),Y.textAlign=`left`}else{Y.save(),Y.translate(X,ie),ne(Y,40,34,c-80,{tag:`A.T. FIELD`,tagJp:`ATフィールド`,sub:`ABSOLUTE TERROR FIELD  //  PHASE SPACE DEPLOYMENT`,right:`BAR ${String(H).padStart(2,`0`)}/45  T+${S.toFixed(2)}`,rightJp:`位相空間 展開`});let n=C(Y,40,100,400,250,{title:`FIELD STRENGTH`,jp:`位相空間強度`}),s=1180+2700*z+520*M;A(Y,`OUTPUT`,n.x+2,n.y+16,12,d(`orange`,.7)),T(Y,s.toFixed(1).padStart(6,`0`),n.x,n.y+26,76,d(`amber`,1),d(`orange`,.07),{glow:8}),A(Y,`MJ`,n.x+n.w-30,n.y+100,14,d(`orange`,.8),{w:700}),w(Y,n.x,n.y+122,n.w,20,30,r(.25+.75*z+.2*M),{hotFrom:.83});let f=[0,0],m=0,g=0;for(let e=0;e<32;e++)p.waveAt(h-e*.0012,f),m=Math.max(m,Math.abs(f[0])),g=Math.max(g,Math.abs(f[1]));A(Y,`L`,n.x,n.y+168,12,d(`orange`,.8),{w:700}),w(Y,n.x+20,n.y+158,n.w-20,11,40,m,{hotFrom:.9}),A(Y,`R`,n.x,n.y+186,12,d(`orange`,.8),{w:700}),w(Y,n.x+20,n.y+176,n.w-20,11,40,g,{hotFrom:.9});let v=C(Y,40,366,400,196,{title:`WAVE PATTERN`,jp:`波形`});L(Y,p,h,v.x,v.y,v.w,v.h-14,{win:.045,col:d(`amber`,1),gain:1.1}),A(Y,`PATTERN ORANGE`,v.x,v.y+v.h+2,11,d(`orange`,.75),{w:600}),A(Y,`${(p.bassMidi(h)||0).toFixed(1).padStart(4,`0`)} MIDI`,v.x+v.w,v.y+v.h+2,11,d(`orange`,.75),{w:600,align:`right`});let E=c-440,O=C(Y,E,100,400,262,{title:`FIELD STATUS`,jp:`状態`}),F=t(S,.9,1.8,a.outCubic),V=R>.35;j(Y,O.x,O.y+18,O.w,`PHASE SPACE`,`位相空間`,F<1?`${(F*100).toFixed(1)}%`:`EXPANDED`,d(`green`,1)),j(Y,O.x,O.y+46,O.w,`INTEGRITY`,`強度`,`${(92+7.9*z).toFixed(1)}%`,d(`amber`,1)),j(Y,O.x,O.y+74,O.w,`INTERFERENCE`,`干渉`,V?`BREACH`:`NONE`,d(V?`red`:`green`,1),{box:V}),j(Y,O.x,O.y+102,O.w,`NEUTRALIZE`,`中和`,`${(R*38).toFixed(1).padStart(4,`0`)}%`,d(`amber`,1)),j(Y,O.x,O.y+130,O.w,`WAVE FRONT`,`波面`,`R${String(Math.floor((h-(this.kicks[k(this.kicks,h)]?.[0]??h))*1.35/.12)+1).padStart(2,`0`)}`,d(`amber`,1)),j(Y,O.x,O.y+158,O.w,`SYNC`,`同調`,`LOCKED`,d(`green`,1)),j(Y,O.x,O.y+186,O.w,`MAGI`,`マギ`,`3/3 承認`,d(`green`,1));let U=C(Y,E,378,400,262,{title:`OCTANT LAYERS`,jp:`層`});for(let e=0;e<8;e++){let t=10+Math.round(e*46/8),n=10+Math.round((e+1)*46/8),r=i(.35,1,re(p,h,t,n)),a=U.y+4+e*27;A(Y,`L${e+1}`,U.x,a+12,12,d(`orange`,.85),{w:700}),w(Y,U.x+34,a,U.w-110,14,24,r,{hotFrom:.85}),A(Y,`${I(t)}`,U.x+U.w,a+12,11,d(`orange`,.65),{align:`right`})}let W=Math.floor(o.beat*2);Y.font=l(ee.mono(400),12);for(let e=0;e<11;e++){let t=e===0;Y.fillStyle=d(t?`amber`:`orange`,t?.95:.5-e*.03),Y.fillText(`${(42992+(W+e)%64*16).toString(16).toUpperCase()}  ${b(e,W-e,8)} ${b(e+40,W-e,8)}`,E+10,670+e*19)}N(Y,`絶対恐怖領域`,c-26,110,22,d(`orange`,.75),!0);let K=c/2,q=u/2;Y.strokeStyle=d(`orange`,.5),Y.lineWidth=1,Y.beginPath(),Y.moveTo(K-470,q),Y.lineTo(K-40,q),Y.moveTo(K+40,q),Y.lineTo(K+470,q),Y.moveTo(K,q-500),Y.lineTo(K,q-40),Y.moveTo(K,q+40),Y.lineTo(K,q+500);for(let e=-20;e<=20;e++){if(!e)continue;let t=e%5?4:9;Y.moveTo(K+e*22,q-t),Y.lineTo(K+e*22,q+t),Y.moveTo(K-t,q+e*22),Y.lineTo(K+t,q+e*22)}Y.stroke(),P(Y,K,q,30+6*M),Y.strokeStyle=d(`amber`,.9),Y.lineWidth=1.5,Y.stroke(),te(Y,K-60,q-60,120,120,14,d(`orange`,.9),2);for(let e=1;e<=4;e++)A(Y,`R-${String(e).padStart(2,`0`)}`,K+e*.12*u*.7071+6,q-e*.12*u*.7071-4,11,d(`orange`,.7),{w:600});A(Y,`ORIGIN X+0.000 Y+0.000  θ ${(Math.sin(h*.37)*6.9).toFixed(2)}°`,K+70,q+80,11,d(`orange`,.8),{w:600}),V&&(Y.globalAlpha=r((R-.35)*3),Y.fillStyle=d(`red`,1),Y.fillRect(K-150,q-170,300,44),A(Y,`FIELD BREACH`,K,q-141,20,d(`ink`,1),{w:700,align:`center`,track:4}),Y.font=x(18,700,!1),Y.fillStyle=d(`red`,1),Y.textAlign=`center`,Y.fillText(`侵食　検知`,K,q-180),Y.textAlign=`left`,Y.globalAlpha=1),Y.restore(),Y.save(),Y.beginPath(),Y.moveTo(30,612),Y.lineTo(560,612),Y.lineTo(600,652),Y.lineTo(600,1062),Y.lineTo(30,1062),Y.closePath(),Y.fillStyle=`rgba(5,4,3,0.9)`,Y.fill(),Y.strokeStyle=d(`orange`,.6),Y.lineWidth=1.5,Y.stroke(),Y.restore();let J=G>0&&e(h)>>2&1?d(`red`,1):d(`bone`,1);if(A(Y,`ABSOLUTE TERROR FIELD`,50,640,15,d(`orange`,1),{w:700,track:4}),_(Y,`A.T.`,44,842,250,{sx:.58,color:J}),_(Y,`FIELD`,44,1040,250,{sx:.58,color:J}),Y.font=x(34,700,!0),Y.fillStyle=d(`orange`,1),Y.fillText(`位相空間`,432,790),Y.fillText(`展開`,432,834),y(Y,434,870,`phase space`,void 0,{size:.9}),D(Y,620,1046,c-660,B,h,{speed:110,color:d(`orange`,.75)}),Y.fillStyle=d(`orange`,.6),Y.fillRect(620,1056,c-660,1),G>0){let t=e(h)>>3&1;Y.fillStyle=d(`red`,t?1:.35),Y.fillRect(c/2-260,900,520,52),A(Y,`WARNING // PATTERN BLUE`,c/2,935,22,d(`ink`,1),{w:700,align:`center`,track:4})}}this.ctx.comp.draw(f,J.upload(),s),this.scan.u.t.value=h,this.scan.render(f,s);let Z=n(h,m.b35,.09),Q=7*Z+2.2*M*(U<.02?1:.4),$=e(h);return{bloom:.75,bloomThreshold:.7,bloomRadius:.75,halation:.12,vignette:.5,grain:.05,ca:1.2+3*R+5*Z,flash:.4*n(h,m.b35,.035)+.06*n(h,g(p,H),.04)*(H%2?0:1),zoom:1+.05*Z+.012*K+.006*O,shake:[Q*Math.sin($*2.1),Q*Math.cos($*1.7)]}}};export{V as default};