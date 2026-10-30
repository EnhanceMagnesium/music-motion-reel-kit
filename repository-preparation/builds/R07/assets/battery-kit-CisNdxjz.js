import{n as e}from"./util-C3PkC1mi.js";import{R as t,f as n,g as r,h as i,m as a,p as o,r as s}from"./index-BBsgxCGr.js";import{GLSL_EVA as c,chamferPath as l,jp as u,sevenSeg as d,songBar as f,ticker as p}from"./_eva-Ycn4hoBe.js";var m=e=>{let t=parseInt((n[e]??e).replace(`#`,``),16);return[t>>16&255,t>>8&255,t&255]};function h(t,n,r,i=1){let a=m(t),o=m(n),s=e(r);return`rgba(${Math.round(a[0]+(o[0]-a[0])*s)},${Math.round(a[1]+(o[1]-a[1])*s)},${Math.round(a[2]+(o[2]-a[2])*s)},${i})`}function g(e,t,n=t*.11){let r=0;for(let i of e)r+=i===`:`||i===`.`?n*2.6:t*.52+n*1.2;return r}function _(e,t,n,a,o,s,c={}){e.font=r(i.mono(c.w??600),o),e.letterSpacing=`${c.track??o*.16}px`,e.fillStyle=s,e.textAlign=c.align??`left`,e.textBaseline=`alphabetic`,e.fillText(t,n,a),e.letterSpacing=`0px`,e.textAlign=`left`}function v(e,t,n,o,s={}){let c=s.size??13,l=s.lead??c*1.65,u=s.keyW??118;e.save(),e.fillStyle=s.color??a(`orange`,1),e.font=r(i.mono(600),c),e.letterSpacing=`1.5px`,e.textBaseline=`alphabetic`,o.forEach(([r,i],a)=>{e.fillText(r,t,n+a*l),e.fillText(`: `+i,t+u,n+a*l)}),e.restore()}function y(e,t,n,o){let s=o.col,c=1864;e.save(),e.fillStyle=s,l(e,56,34,78,52,[0,16,0,0]),e.fill(),e.fillStyle=a(`ink`,1),e.font=r(i.mono(700),30),e.textBaseline=`middle`,e.textAlign=`center`,e.fillText(`07`,92,62),e.textAlign=`left`,e.textBaseline=`alphabetic`,e.fillStyle=s,e.font=r(i.mono(700),22),e.letterSpacing=`5px`,e.fillText(`INTERNAL BATTERY`,152,60);let m=e.measureText(`INTERNAL BATTERY`).width;e.letterSpacing=`0px`,e.font=u(22,700,!1),e.fillText(`内部電源  活動限界`,152+m+18,60),e.font=r(i.mono(500),12),e.letterSpacing=`2.4px`,e.globalAlpha=.75,e.fillText(`EVA UNIT-01  //  UMBILICAL CABLE MONITOR  //  S2-LESS POWER SUPPLY  //  エントリープラグ電源系統`,152,82),e.globalAlpha=1,e.letterSpacing=`0px`,e.fillRect(56,100,1808,2),e.globalAlpha=.6;for(let t=56;t<=c;t+=24)e.fillRect(t,102,1,(t-56)%120==0?8:4);e.globalAlpha=1;let h=Math.floor(t/60),_=t-h*60,v=`${String(h).padStart(2,`0`)}:${_.toFixed(2).padStart(5,`0`)}`,y=g(v,30,3.6);d(e,v,c-y,40,30,s,o.dim,{thick:3.6});let b=f(n,t),x=Math.floor(b),S=Math.floor((b-x)*4)+1;e.font=r(i.mono(600),12),e.letterSpacing=`2.4px`,e.textAlign=`right`,e.fillText(o.right??`BAR ${String(x).padStart(3,`0`)}  BEAT ${S}  133.33 BPM`,c-y-24,58),e.font=u(13,600,!1),e.letterSpacing=`0px`,e.fillText(o.rightJp??`経過時間  小節  拍`,c-y-24,80);for(let t=0;t<4;t++)e.globalAlpha=t+1===S?1:.18,e.fillRect(c-y-24-150+t*18,86,12,5);e.globalAlpha=1,e.textAlign=`left`,e.fillRect(56,1028,1808,1),p(e,306,1054,1558,o.tick,t,{speed:90,color:s.replace(/,[\d.]+\)$/,`,0.62)`),size:12}),e.fillStyle=s,l(e,56,1036,230,26,[0,0,10,0]),e.fill(),e.fillStyle=a(`ink`,1),e.font=r(i.mono(700),12),e.letterSpacing=`2px`,e.textBaseline=`middle`,e.fillText(`NERV HQ  中央作戦室`,66,1050),e.restore()}function b(t,n,r,i,o,s,c,u){t.save(),t.fillStyle=u.col,t.fillRect(n+i*.32,r,i*.36,8),l(t,n,r+10,i,o-10,[0,8,0,8]),t.strokeStyle=u.col,t.lineWidth=u.lw??2,t.stroke();let d=n+6,f=r+10+6,p=i-12,m=o-10-12,h=(m-3*(s-1))/s,g=e(c)*s,_=c<.25;for(let e=0;e<s;e++){let n=e<Math.floor(g)?1:e<g?g-e:0,r=f+m-(e+1)*h-e*3;t.fillStyle=n>0?_?u.low:u.col:u.dim,t.globalAlpha=n>0?.3+.7*n:1,t.fillRect(d,r,p,h),n>0&&e===Math.ceil(g)-1&&(u.flash??0)>0&&(t.globalAlpha=u.flash,t.fillStyle=a(`bone`,1),t.fillRect(d,r,p,h))}t.restore()}function x(t,n,o,s,c,l){let u=l.n??10,d=Math.PI*1.1,f=Math.PI*1.9;t.save(),t.lineWidth=1.2,t.strokeStyle=l.col,t.beginPath(),t.arc(n,o,s,d,f),t.stroke();let p=l.redFrom??.8;t.strokeStyle=l.hot,t.lineWidth=6,t.beginPath(),t.arc(n,o,s-5,d+(f-d)*p,f),t.stroke(),t.lineWidth=1.2;for(let e=0;e<=u*5;e++){let a=d+(f-d)*e/(u*5),c=e%5==0,m=s-(c?14:8);t.strokeStyle=e/(u*5)>=p?l.hot:l.col,t.beginPath(),t.moveTo(n+Math.cos(a)*m,o+Math.sin(a)*m),t.lineTo(n+Math.cos(a)*s,o+Math.sin(a)*s),t.stroke(),c&&e/5%2==0&&(t.fillStyle=l.col,t.font=r(i.mono(500),10),t.textAlign=`center`,t.textBaseline=`middle`,t.fillText(l.label(e/5),n+Math.cos(a)*(s-26),o+Math.sin(a)*(s-26)))}let m=d+(f-d)*e(c);t.strokeStyle=a(`amber`,1),t.lineWidth=2.4,t.beginPath(),t.moveTo(n-Math.cos(m)*10,o-Math.sin(m)*10),t.lineTo(n+Math.cos(m)*(s-4),o+Math.sin(m)*(s-4)),t.stroke(),t.fillStyle=a(`amber`,1),t.beginPath(),t.arc(n,o,5,0,Math.PI*2),t.fill(),t.textAlign=`left`,t.textBaseline=`alphabetic`,t.restore()}function S(e,t,n,r=.42,i=.2){let a=[],o=e.events(`vocal`,t,n).filter(e=>e[1]>.2).map(e=>e[0]),s=.01;for(let i=t+s;i<n-s;i+=s){let t=e.env(`vocal`,i);t>r&&t>=e.env(`vocal`,i-s)&&t>e.env(`vocal`,i+s)&&t-Math.min(e.env(`vocal`,i-.12),e.env(`vocal`,i+.12))>.08&&o.push(i)}o.sort((e,t)=>e-t);for(let e of o)(!a.length||e-a[a.length-1]>=i)&&a.push(e);return a}function C(e,t){let n=0,r=e.length-1,i=-1;for(;n<=r;){let a=n+r>>1;e[a]<=t?(i=a,n=a+1):r=a-1}return i}function w(e){return new s(`
    ${c}
    uniform sampler2D uTex;
    uniform float uT, uFi, uGlitch, uAlarm, uPower, uOff, uKick, uGround;
    uniform vec3 uGroundCol;
    vec4 ui(vec2 uv) { vec4 c = texture(uTex, uv); return vec4(c.rgb * c.a, c.a); }
    void main() {
      vec2 px = FRAG_PX;
      vec2 uv = vUv;
      // CRT power-off: squash the picture vertically into a line, then the line into a dot
      float sq = 1.0 - smoothstep(0.0, 0.55, uOff) * 0.995;
      float sx = 1.0 - smoothstep(0.55, 0.9, uOff) * 0.998;
      vec2 cuv = vec2((uv.x - 0.5) / sx + 0.5, (uv.y - 0.5) / sq + 0.5);
      float inside = step(0.0, cuv.x) * step(cuv.x, 1.0) * step(0.0, cuv.y) * step(cuv.y, 1.0);
      // row glitch: bands of rows displaced horizontally (stable over a frame's shutter)
      float row = floor(px.y / 9.0);
      float g = hash12(vec2(row, uFi));
      float band = step(1.0 - 0.22 * uGlitch, hash12(vec2(floor(px.y / 46.0), uFi + 7.0)));
      float off = (g < 0.2 * uGlitch || band > 0.5) ? (hash12(vec2(row * 1.3, uFi + 1.7)) - 0.5) * 0.09 * uGlitch : 0.0;
      vec2 suv = cuv + vec2(off, 0.0);
      // ground: dim hex lattice, a few cells lit, brighter on the kick
      vec2 gp = vec2(px.x, 1080.0 - px.y);
      vec4 h = hexCell(gp, 38.0);
      float e = hexEdge(h.xy, 38.0);
      float line = pxLine(e, 0.5, 1.5);
      float cell = step(0.986, hash12(h.zw + floor(uT * 2.2222) * 1.37)) * smoothstep(0.0, 8.0, e);
      vec2 q = gp / vec2(1920.0, 1080.0) - 0.5;
      float fall = 1.0 - smoothstep(0.25, 0.75, length(q * vec2(1.0, 1.4)));
      vec3 col = C_INK + uGroundCol * (line * uGround * (0.55 + 0.45 * fall) * (1.0 + 1.2 * uKick) + cell * uGround * 0.35);
      // UI, with a slight RGB split on glitch rows
      vec4 a = ui(suv);
      if (off != 0.0) { a.r = ui(suv + vec2(0.004, 0.0)).r; a.b = ui(suv - vec2(0.004, 0.0)).b; }
      col = col * (1.0 - a.a) + a.rgb;
      // alarm wash: red from the edges, strongest on the frame border
      float edge = smoothstep(0.18, 0.62, length(q * vec2(1.0, 1.25)));
      col += C_RED * uAlarm * (0.006 + 0.11 * edge * edge);
      col *= uPower;
      // power-off: the collapsing picture brightens into an orange-white line, then black
      float lineGlow = smoothstep(0.35, 0.6, uOff) * (1.0 - smoothstep(0.85, 1.0, uOff));
      col = col * inside * (1.0 + 2.5 * smoothstep(0.2, 0.55, uOff));
      float dy = abs(uv.y - 0.5) * 1080.0, dx = abs(uv.x - 0.5) * 1920.0;
      float ln = exp(-dy / 2.2) * (1.0 - smoothstep(960.0 * sx - 40.0, 960.0 * sx + 4.0, dx));
      col += mix(C_ORANGE, C_BONE, 0.6) * ln * lineGlow * 3.0;
      col *= 1.0 - step(0.999, uOff);
      fragColor = vec4(col, 1.0);
    }`,{uTex:{value:e},uT:{value:0},uFi:{value:0},uGlitch:{value:0},uAlarm:{value:0},uPower:{value:1},uOff:{value:0},uKick:{value:0},uGround:{value:.05},uGroundCol:{value:new t(...o.orange)}})}export{b as batteryCell,y as batteryChrome,C as lastIdx,w as makeBatteryComp,v as meta,h as mixc,_ as mono,x as needleGauge,g as segWidth,S as vocalChops};