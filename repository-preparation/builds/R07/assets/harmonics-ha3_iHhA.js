import{d as e,n as t,p as n,r}from"./util-C3PkC1mi.js";import{L as i,a,g as o,h as s,l as c,m as l,n as u,r as d,t as f,z as p}from"./index-BBsgxCGr.js";import{GLSL_EVA as m,barTime as h,brackets as g,chamferPath as _,condensed as v,duck as y,evaLabel as b,hexData as x,hexPath as S,jp as C,makeScanPass as w,panel as T,scale as E,segMeter as D,sevenSeg as O,songBar as k,ticker as A}from"./_eva-Ycn4hoBe.js";import{t as j}from"./scene-CTj40Zt3.js";var M=64,N=28,P=[`C`,`C#`,`D`,`D#`,`E`,`F`,`F#`,`G`,`G#`,`A`,`A#`,`B`],F={x:146,y:282,w:1214,h:404},I={x:146,y:818,w:1214,h:132},L=3.6,R=1.2,z=e=>2595*Math.log10(1+e/700),B=z(30),V=z(16e3),H=e=>(z(e)-B)/(V-B)*65-1,U=e=>700*(10**((B+(e+1)/65*(V-B))/2595)-1),W=e=>t((e-.42)/.58)**1.45,G=`
${f}
${m}
uniform float t, uV[${M}], uP[${M}], uDuck, uFill, uClap, uIn;
uniform vec4 uS, uWv;
uniform vec2 uWin; // past, future seconds

vec3 hudCol(float fill) { return mix(C_ORANGE, C_AMBER, fill); }

void main() {
  vec2 p = vec2(FRAG_PX.x, 1080.0 - FRAG_PX.y);
  vec3 col = C_INK;
  vec3 base = hudCol(uFill);
  float bright = (1.0 - 0.22 * uDuck) * uIn;

  // ---------------- analyser
  vec2 q = p - uS.xy - vec2(0.0, uDuck * 4.0);
  if (q.x > -30.0 && q.x < uS.z + 30.0 && q.y > -40.0 && q.y < uS.w + 10.0) {
    // hex-lattice ground
    vec4 hc = hexCell(q + vec2(0.0, 7.0), 17.0);
    float he = hexEdge(hc.xy, 17.0);
    float lat = pxLine(he, 0.4, 1.3) * 0.05;
    // dB grid lines every 4 rows
    float rh = uS.w / ${N}.0;
    float gy = abs(mod(uS.w - q.y + 0.5 * rh * 0.0, rh * 4.0));
    float grid = pxLine(min(gy, rh * 4.0 - gy), 0.3, 1.2) * 0.07;
    col += base * (lat + grid) * uIn;
  }
  if (q.x >= 0.0 && q.x < uS.z && q.y >= 0.0 && q.y < uS.w) {
    float cw = uS.z / ${M}.0, rh = uS.w / ${N}.0;
    int b = int(q.x / cw);
    float fx = q.x - float(b) * cw;
    float r = (uS.w - q.y) / rh;
    int ri = int(r);
    float fy = (r - float(ri)) * rh;
    bool inBlock = fx > 2.0 && fx < cw - 2.0 && fy > 3.0;
    float v = uV[b] * ${N}.0;
    float lit = float(ri) < floor(v) ? 1.0 : float(ri) < v ? v - float(ri) : 0.0;
    float k = float(ri) / ${N}.0;
    vec3 bc = k > 0.82 ? C_RED : k > 0.64 ? mix(base, C_AMBER, 0.7) : base;
    if (inBlock) {
      col += bc * 0.045;
      col += bc * lit * (0.78 + 0.4 * k + 0.7 * uClap * step(0.82, k)) * bright;
      // inner bevel: the block's top edge a touch hotter
      col += bc * lit * 0.35 * step(rh - 4.5, fy) * bright;
    }
    // peak-hold tick
    float pk = uP[b] * ${N}.0;
    float py = uS.w - pk * rh;
    float dpk = abs(q.y - py);
    if (fx > 1.0 && fx < cw - 1.0 && pk > 0.6) col += mix(C_AMBER, C_RED, step(0.82, uP[b])) * (1.0 - smoothstep(0.8, 1.8, dpk)) * 1.6 * uIn;
  }

  // ---------------- mirrored waveform strip
  vec2 w = p - uWv.xy;
  if (w.x >= 0.0 && w.x < uWv.z && w.y >= 0.0 && w.y < uWv.w) {
    float colW = 3.0;
    float ci = floor(w.x / colW);
    float u = (ci + 0.5) * colW / uWv.z;
    float span = uWin.x + uWin.y;
    float tc = t - uWin.x + u * span;
    float dt = span * colW / uWv.z;
    float aL = 0.0, aR = 0.0;
    for (int i = 0; i < 10; i++) {
      vec2 s = waveAt(tc + (float(i) / 9.0 - 0.5) * dt);
      aL = max(aL, abs(s.x)); aR = max(aR, abs(s.y));
    }
    float mid = uWv.w * 0.5;
    float dy = w.y - mid;
    float a = dy < 0.0 ? aL : aR;
    float hgt = pow(a, 0.8) * (mid - 4.0);
    float inBar = step(abs(dy), hgt) * step(1.0, abs(dy)) * step(mod(w.x, colW), colW - 1.0);
    bool fut = tc > t;
    float age = (t - tc) / uWin.x;
    vec3 wc = fut ? C_GRAPHITE * 0.9 : mix(base * 1.25, base * 0.45, clamp(age, 0.0, 1.0));
    if (!fut && t - tc < 0.06) wc = C_AMBER * 1.8;
    col += wc * inBar * uIn;
    // centre rule + faint envelope line
    col += base * pxLine(abs(dy), 0.3, 1.0) * 0.35 * uIn;
  }
  fragColor = vec4(col, 1.0);
}`,K=class extends j{bg;text=new a;scan=w(.22);V=new Float32Array(M);P=new Float32Array(M);ch=new Float32Array(12);T={s:0,e:0,fill:0,b18:0};constructor(e){super(e),this.bg=new d(G,{t:{value:0},uV:{value:this.V},uP:{value:this.P},uDuck:{value:0},uFill:{value:0},uClap:{value:0},uIn:{value:1},uS:{value:new p(F.x,F.y,F.w,F.h)},uWv:{value:new p(I.x,I.y,I.w,I.h)},uWin:{value:new i(L,R)},...u(e.spectrum)})}init(){let e=this.ctx.audio;this.T.s=this.ctx.start,this.T.e=this.ctx.end,this.T.fill=h(e,23),this.T.b18=h(e,18)}render(i,a){let{renderer:u,audio:d}=this.ctx,f=this.T,p=i.t,m=y(i,d),w=n(f.fill-.02,f.fill+.12,p),j=d.hit(`snare`,p,.1),z=p-f.s,B=e(z,0,.18,r.outCubic);for(let e=0;e<M;e++){let t=W(d.mel(p,e)),n=t;for(let t=1;t<=16;t++){let r=t*.05;n=Math.max(n,W(d.mel(p-r,e))-r*r*1.6)}this.V[e]=t*B,this.P[e]=n*B}d.chroma(p,this.ch),c(u,a,[.0015,.0012,.001]);let V=this.bg.u;V.t.value=p,V.uDuck.value=m,V.uFill.value=w,V.uClap.value=j,V.uIn.value=B,this.bg.render(u,a);let G=this.text;G.clear();let K=G.ctx,q=w>.5?`amber`:`orange`,J=e=>l(q,e);K.textBaseline=`alphabetic`,K.globalAlpha=B,b(K,80,78,`eva unit-01  //  harmonic analysis`,void 0,{color:J(.8)}),v(K,`HARMONICS`,72,190,138,{sx:.56,color:l(`bone`,1),bold:.03}),K.font=C(34,700,!0),K.fillStyle=J(1),K.fillText(`ハーモニクス`,552,150),K.font=C(20,600,!1),K.fillText(`波形解析  第一発令所`,554,186);let Y=d.events(`hat`,f.s-20,p).length;K.font=o(s.mono(500),13),K.letterSpacing=`1px`;for(let e=0;e<5;e++){let t=Y-e,n=Math.floor((t*37%M+M)%M),r=(this.V[n]*12-6).toFixed(1),i=`${(16128+t*16).toString(16).toUpperCase().slice(-4)}  BAND ${String(n).padStart(2,`0`)}  ${r.startsWith(`-`)?``:`+`}${r}dB  ${x(t,3,6)}  ${e===0?`<`:` `}`;K.fillStyle=J(e===0?.95:.55-e*.08),K.fillText(i,880,88+e*21)}K.letterSpacing=`0px`;{let e=1410,t=w>.5,n=t?(p-f.fill)*2.222%1<.6?1:.35:1,r=l(t?`amber`:`green`,1);_(K,e,64,430,132,[0,18,0,18]),K.fillStyle=t?`rgba(60,36,0,${.35+.35*n})`:`rgba(4,30,12,0.55)`,K.fill(),K.strokeStyle=r,K.lineWidth=2,K.stroke(),K.fillStyle=r,K.fillRect(e,64,16,132),b(K,1444,94,`harmonics status`,t?`波形 異常`:`波形 正常`,{color:r}),K.globalAlpha=B*(.4+.6*n),v(K,t?`DEVIATION`:`NORMAL`,1818,172,76,{sx:.6,color:r,align:`right`}),K.globalAlpha=B;for(let e=0;e<6;e++)K.fillStyle=(t?e<2+Math.floor((p-f.fill)*4.44%5):e<3)?r:l(`graphite`,.8),K.fillRect(1444+e*18,162,12,8)}{T(K,80,216,1300,526,{title:`spectrum analyser`,jp:`周波数解析`,color:j>.45?l(`red`,1):J(1),fill:`rgba(0,0,0,0)`}),K.font=o(s.mono(600),13),K.letterSpacing=`2px`,K.textAlign=`right`,K.fillStyle=J(.85),K.fillText(`64 BANDS  30Hz-16kHz  MEL  //  CH.MIX`,1356,237),K.letterSpacing=`0px`,K.textAlign=`left`,K.fillStyle=j>.2?l(`red`,.4+.6*t(j*1.4)):l(`blood`,.5),_(K,910,222,60,18,5),K.fill(),K.fillStyle=l(`ink`,1),K.font=o(s.mono(700),12),K.fillText(`CLIP`,925,236);let e=m*4;K.font=o(s.mono(500),11),K.textAlign=`right`,K.fillStyle=J(.7);for(let t=0;t<=N;t+=4){let n=F.y+F.h-t/N*F.h+e;K.fillText(t===N?`0`:`-${(N-t)/4*6}`,F.x-14,n+4),K.fillStyle=J(.5),K.fillRect(F.x-10,n,5,1),K.fillStyle=J(.7)}K.fillText(`dB`,F.x-14,F.y-16+e),K.textAlign=`center`;let n=[100,200,400,600,1e3,2e3,4e3,8e3,12e3],r=F.w/M;for(let t of n){let n=F.x+(H(t)+.5)*r;K.fillStyle=J(.5),K.fillRect(n,F.y+F.h+8+e,1,7),K.fillStyle=J(.8),K.fillText(t>=1e3?`${t/1e3}k`:`${t}`,n,F.y+F.h+30+e)}K.textAlign=`left`,K.fillStyle=J(.6),K.fillText(`Hz`,F.x+F.w+6,F.y+F.h+30+e);let i=0;for(let e=1;e<M;e++)this.V[e]>this.V[i]&&(i=e);let a=F.x+(i+.5)*r,c=F.y+F.h-this.V[i]*F.h+e;K.strokeStyle=l(`amber`,.9),K.lineWidth=1.2,K.beginPath(),K.moveTo(a,c-8),K.lineTo(a+18,c-30),K.lineTo(a+96,c-30),K.stroke(),K.font=o(s.mono(600),12),K.fillStyle=l(`amber`,1);let u=U(i);K.fillText(`PK ${u>=1e3?(u/1e3).toFixed(2)+`k`:u.toFixed(0)}`,a+22,c-35);for(let[e,t]of[[1354,716],[106,716]])S(K,e,t,12),K.strokeStyle=J(.8),K.lineWidth=1.5,K.stroke(),S(K,e,t,6),K.fillStyle=J(.5+.5*m),K.fill();if(g(K,F.x-6,F.y-6+e,F.w+12,F.h+12,14,J(.55),1.5),w>0){let e=(p-f.fill)*4.444%1<.55?1:.3;K.globalAlpha=B*w,_(K,1020,266,330,64,10),K.fillStyle=`rgba(50,30,0,${.5+.3*e})`,K.fill(),K.strokeStyle=l(`amber`,1),K.lineWidth=2,K.stroke(),K.fillStyle=l(`amber`,.4+.6*e),K.font=o(s.mono(700),18),K.letterSpacing=`3px`,K.fillText(`PAD SWELL`,1036,294),K.letterSpacing=`0px`,K.font=C(16,700,!1),K.fillText(`低域消失  注意`,1036,318);let t=(8+30*d.env(`other`,p)).toFixed(1);v(K,`+${t}%`,1336,316,46,{sx:.62,color:l(`amber`,1),align:`right`}),K.globalAlpha=B}}{T(K,80,762,1300,214,{title:`harmonic waveform`,jp:`波形`,color:J(1),fill:`rgba(0,0,0,0)`}),K.font=o(s.mono(600),13),K.letterSpacing=`2px`,K.textAlign=`right`,K.fillStyle=J(.85),K.fillText(`L / R  PEAK  2 BARS`,1356,783),K.letterSpacing=`0px`,K.textAlign=`left`;let e=e=>I.x+(e-(p-L))/4.8*I.w,t=Math.floor(k(d,p-L)),n=Math.ceil(k(d,p+R));K.font=o(s.mono(600),11);for(let r=t;r<=n;r++){let t=h(d,r);for(let n=0;n<4;n++){let i=e(t+n*.45);i<I.x||i>I.x+I.w||(K.fillStyle=J(n===0?.8:.35),K.fillRect(i,I.y-(n===0?12:6),1,n===0?12:6),K.fillRect(i,I.y+I.h,1,n===0?10:5),n===0&&K.fillText(`${r}`,i+4,I.y-3))}}let r=e(p);K.fillStyle=l(`amber`,1),K.fillRect(r-1,I.y-14,2,I.h+28),K.beginPath(),K.moveTo(r-7,I.y-20),K.lineTo(r+7,I.y-20),K.lineTo(r,I.y-12),K.closePath(),K.fill(),K.font=o(s.mono(600),11),K.fillStyle=J(.7),K.fillText(`L`,I.x-22,I.y+30),K.fillText(`R`,I.x-22,I.y+I.h-18),K.fillStyle=l(`graphite`,1),K.fillText(`NEXT`,r+12,I.y+I.h+12)}let X=this.ch;{T(K,1410,216,430,318,{title:`chroma`,jp:`音階分析`,color:J(1)});let e=1572,t=0;for(let e=1;e<12;e++)X[e]>X[t]&&(t=e);K.strokeStyle=J(.35),K.lineWidth=1,K.beginPath(),K.arc(e,396,138,0,Math.PI*2),K.stroke();for(let t=0;t<48;t++){let n=-Math.PI/2+t/48*Math.PI*2,r=t%4==0?8:4;K.beginPath(),K.moveTo(e+Math.cos(n)*138,396+Math.sin(n)*138),K.lineTo(e+Math.cos(n)*(138+r),396+Math.sin(n)*(138+r)),K.stroke()}let n=-Math.PI/2+t/12*Math.PI*2;K.strokeStyle=l(`amber`,.9),K.lineWidth=2,K.beginPath(),K.moveTo(e+Math.cos(n)*56,396+Math.sin(n)*56),K.lineTo(e+Math.cos(n)*74,396+Math.sin(n)*74),K.stroke();for(let n=0;n<12;n++){let r=-Math.PI/2+n/12*Math.PI*2,i=e+Math.cos(r)*104,a=396+Math.sin(r)*104,c=X[n]**1.6;S(K,i,a,25,Math.PI/6),K.fillStyle=n===t?l(`amber`,.25+.75*c):J(.06+.8*c),K.fill(),K.strokeStyle=J(.8),K.lineWidth=1.3,K.stroke(),K.font=o(s.mono(700),13),K.textAlign=`center`,K.fillStyle=c>.45?l(`ink`,1):J(.9),K.fillText(P[n],i,a+5)}S(K,e,396,52,Math.PI/6),K.fillStyle=`rgba(30,18,6,0.9)`,K.fill(),K.strokeStyle=J(1),K.lineWidth=2,K.stroke(),v(K,P[t],e,418,64,{sx:.7,color:l(`bone`,1),align:`center`}),K.font=o(s.mono(600),10),K.fillStyle=J(.8),K.fillText(`KEY`,e,368),K.textAlign=`left`;let r=[...Array(12).keys()].sort((e,t)=>X[t]-X[e]).slice(0,5);K.font=o(s.mono(600),13),r.forEach((e,t)=>{let n=286+t*44;K.fillStyle=J(t===0?1:.75),K.fillText(`${P[e].padEnd(2,` `)}  ${(X[e]*100).toFixed(0).padStart(3,` `)}%`,1728,n),D(K,1728,n+8,92,6,10,X[e],{color:J(1),hot:l(`amber`,1),hotFrom:.8,dim:J(.1)})}),K.font=C(14,600,!1),K.fillStyle=J(.7),K.fillText(`主音`,1728,516)}{T(K,1410,548,430,194,{title:`band levels`,jp:`帯域`,color:J(1)});let e=(e,t)=>{let n=0;for(let r=e;r<=t;r++)n+=this.V[r];return n/(t-e+1)};[[`SUB`,e(0,5)],[`LOW`,e(6,15)],[`MID`,e(16,34)],[`HIGH`,e(35,63)],[`BASS`,t(d.env(`bass`,p)*1.25)],[`PAD`,t(d.env(`other`,p)*1.1)]].forEach(([e,t],n)=>{let r=1438+n*66;K.font=o(s.mono(600),12),K.fillStyle=J(.9),K.textAlign=`center`,K.fillText((t*100).toFixed(0).padStart(2,`0`),r+16,600),D(K,r,606,32,94,14,t,{vertical:!0,color:J(1),hot:l(`red`,1),hotFrom:.78,dim:J(.09),gap:2}),K.fillStyle=J(.8),K.fillText(e,r+16,720),K.textAlign=`left`})}{T(K,1410,762,430,214,{title:`sync harmonics`,jp:`同期`,color:J(1)});let e=1430;K.strokeStyle=J(.14),K.lineWidth=1,K.beginPath();for(let t=0;t<=8;t++)K.moveTo(e+t/8*390,812),K.lineTo(e+t/8*390,956);for(let t=0;t<=4;t++)K.moveTo(e,812+t/4*144),K.lineTo(1820,812+t/4*144);K.stroke(),K.strokeStyle=J(.4),K.beginPath(),K.moveTo(e,884),K.lineTo(1820,884),K.stroke();let t=[0,0],n=p-.03,r=d.waveAt(p-.03,t)[0];for(let e=p-.03+1/11025;e<p-.002;e+=1/11025){let i=d.waveAt(e,t)[0];r<0&&i>=0&&(n=e),r=i}for(let[r,i,a]of[[1,l(`green`,.85),1.4],[0,l(`amber`,1),1.8]]){K.strokeStyle=i,K.lineWidth=a,K.beginPath();for(let i=0;i<=220;i++){let a=d.waveAt(n+i/220*.028,t)[r],o=e+i/220*390,s=884-a*144*.46;i?K.lineTo(o,s):K.moveTo(o,s)}K.stroke()}K.font=o(s.mono(600),11),K.fillStyle=l(`amber`,1),K.fillText(`PILOT`,1436,826),K.fillStyle=l(`green`,1),K.fillText(`EVA-01`,1488,826);let i=d.bassMidi(p);K.textAlign=`right`,K.fillStyle=J(.9),K.fillText(i>0?`F0 ${(440*2**((i-69)/12)).toFixed(1)}Hz ${P[Math.round(i)%12]}${Math.floor(Math.round(i)/12)-1}`:`F0 ---.-Hz`,1814,826),K.textAlign=`left`}{let e=k(d,p),t=Math.floor(e),n=Math.floor((e-t)*4)+1;O(K,`${String(t).padStart(2,`0`)}.${n}`,80,998,34,J(1),J(.08)),K.font=o(s.mono(600),11),K.fillStyle=J(.7),K.fillText(`BAR.BEAT`,80,1052);let r=p,i=Math.floor(r/60),a=Math.floor(r%60),c=Math.floor(r%1*100);O(K,`${String(i).padStart(2,`0`)}:${String(a).padStart(2,`0`)}:${String(c).padStart(2,`0`)}`,234,998,34,J(.85),J(.08)),K.fillText(`T+`,234,1052),A(K,560,1024,1280,w>.5?`WARNING // HARMONIC DEVIATION // LOW BAND DROPOUT // 低域消失 // PAD SWELL DETECTED // STAND BY FOR BREAK // 待機`:`HARMONICS NORMAL // 波形 正常 // SYNC 133.33 BPM // EVA-01 PILOT LINK STABLE // A10 NERVE CONNECTION OK // 神経接続 良好`,p,{speed:110,color:J(.65)}),K.fillStyle=J(.5),K.fillRect(560,1036,1280,1),E(K,560,996,1840,996,64,{major:8,tick:4,color:J(.35)})}return K.globalAlpha=1,this.ctx.comp.draw(u,G.upload(),a),this.scan.u.t.value=p,this.scan.render(u,a),{bloom:.6,bloomThreshold:.75,halation:.1,vignette:.4,ca:.9+1.2*j,grain:.05}}};export{K as default};