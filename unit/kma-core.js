// KMA형 단원평가 공용 도구 — 난수, 분수·소수 표시, 세트 생성 (단원별 문항은 gen/<코드>.js)
function makeRng(seed){let a=seed>>>0;return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
let R=Math.random;
const ri=(a,b)=>a+Math.floor(R()*(b-a+1));
const pick=arr=>arr[Math.floor(R()*arr.length)];
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}

// 표시용 HTML
const F=(n,d)=>`<span class="fr"><span class="nu">${n}</span><span class="de">${d}</span></span>`;
const M=(w,n,d)=>`<span class="mx">${w}${F(n,d)}</span>`;
// 전체 분자 t, 분모 d → 자연수/진분수/대분수 표시
function V(t,d){const w=Math.floor(t/d),r=t%d;if(r===0)return `${w}`;if(w===0)return F(r,d);return M(w,r,d);}
function VI(t,d){return F(t,d);} // 가분수 표시
const PH3=M('㉠','㉢','㉡'); // ㉠ ㉢/㉡
const ph2=d=>M('㉠','㉡',d);  // ㉠ ㉡/d
const sum3=(t,d)=>{const w=Math.floor(t/d),r=t%d;return {ans:w+d+r,w,r};};
const okMixed=(t,d)=>t>d&&t%d!==0;


// ── 소수: 모든 소수는 1000배 한 정수(천분의 일 단위)로 다룸 ──
function ds(n){const neg=n<0;n=Math.abs(n);const w=Math.floor(n/1000),f=String(n%1000).padStart(3,'0').replace(/0+$/,'');return (neg?'−':'')+w+(f?'.'+f:'');}
function dsp(n,dp){const w=Math.floor(n/1000),f=String(n%1000).padStart(3,'0').slice(0,dp);return w+(dp?'.'+f:'');} // 자릿수 고정(끝 0 표시)
const r2=(a,b)=>ri(a,b)*10;   // 소수 둘째 자리까지인 수(천분의 일 단위)
const r1=(a,b)=>ri(a,b)*100;  // 소수 첫째 자리까지인 수
const SEC_STD=[{name:'교과서 기본 과정',from:1,to:12},{name:'교과서 응용 과정',from:13,to:20},{name:'교과서 심화 과정',from:21,to:25},{name:'창의 사고력 도전 문제',from:26,to:30}];
const KMA_UNITS={};
function generateSet(code,seed){const U=KMA_UNITS[code];R=makeRng(seed);return U.gens.map((g,i)=>Object.assign({no:i+1},g()));}
if(typeof module!=='undefined')module.exports={KMA_UNITS,generateSet};

// ── 도형 그림(SVG) 공용 도구 ──
// pts: {이름:[x,y]} (수학 좌표, 위가 +y), segs: [[a,b],..] 또는 [[a,b,'dash']], polys: [[a,b,c,..]] (색칠),
// lab: {이름:'ㄱ'} 꼭짓점 이름, ang: [{at,a,b,t}] 각 표시(∠a-at-b, 글자 t), rt: [[at,a,b]] 직각 표시,
// tick: [[a,b,n]] 같은 길이 표시(n줄), len: [[a,b,'5 cm',side]] 변 길이(side=1/-1 바깥쪽), txt:[[x,y,'글']]
function geo(o){const P=o.pts,W=o.w||320,H0=o.h||220,pad=o.pad||34;const xs=Object.values(P).map(p=>p[0]),ys=Object.values(P).map(p=>p[1]);
 const mnx=Math.min(...xs),mxx=Math.max(...xs),mny=Math.min(...ys),mxy=Math.max(...ys);const sc=Math.min((W-2*pad)/((mxx-mnx)||1),(H0-2*pad)/((mxy-mny)||1));
 const H=Math.round((mxy-mny)*sc+2*pad);const X=p=>pad+(p[0]-mnx)*sc+((W-2*pad)-(mxx-mnx)*sc)/2,Y=p=>H-pad-(p[1]-mny)*sc;const S=k=>[X(P[k]),Y(P[k])];
 const cx=xs.reduce((a,b)=>a+b,0)/xs.length,cy=ys.reduce((a,b)=>a+b,0)/ys.length,C=[X([cx,cy]),Y([cx,cy])];let s='';
 (o.polys||[]).forEach(pl=>{s+=`<polygon points="${pl.map(k=>S(k).join(',')).join(' ')}" fill="${pl.fill||'#eef2ff'}" stroke="none"/>`;});
 (o.segs||[]).forEach(g=>{const [a,b]=[S(g[0]),S(g[1])];s+=`<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#334155" stroke-width="2"${g[2]==='dash'?' stroke-dasharray="5 4"':''}/>`;});
 const u=(a,b)=>{const d=[b[0]-a[0],b[1]-a[1]],l=Math.hypot(d[0],d[1])||1;return [d[0]/l,d[1]/l];};
 (o.rt||[]).forEach(([at,a,b])=>{const p=S(at),ua=u(p,S(a)),ub=u(p,S(b)),k=11;const q1=[p[0]+ua[0]*k,p[1]+ua[1]*k],q2=[q1[0]+ub[0]*k,q1[1]+ub[1]*k],q3=[p[0]+ub[0]*k,p[1]+ub[1]*k];s+=`<polyline points="${q1.join(',')} ${q2.join(',')} ${q3.join(',')}" fill="none" stroke="#334155" stroke-width="1.5"/>`;});
 (o.ang||[]).forEach(g=>{const p=S(g.at),ua=u(p,S(g.a)),ub=u(p,S(g.b)),r=g.r||20;const a1=[p[0]+ua[0]*r,p[1]+ua[1]*r],a2=[p[0]+ub[0]*r,p[1]+ub[1]*r];const cr=ua[0]*ub[1]-ua[1]*ub[0];
  s+=`<path d="M${a1.join(' ')} A${r} ${r} 0 0 ${cr>0?1:0} ${a2.join(' ')}" fill="none" stroke="#2563eb" stroke-width="1.5"/>`;let bx=ua[0]+ub[0],by=ua[1]+ub[1];const bl=Math.hypot(bx,by)||1;bx/=bl;by/=bl;const tr=r+(g.tr||14);
  s+=`<text x="${p[0]+bx*tr}" y="${p[1]+by*tr+5}" font-size="14" text-anchor="middle" fill="#1d4ed8">${g.t}</text>`;});
 (o.tick||[]).forEach(([a,b,n])=>{const A=S(a),B=S(b),m=[(A[0]+B[0])/2,(A[1]+B[1])/2],d=u(A,B),nx=-d[1],ny=d[0];for(let i=0;i<(n||1);i++){const off=(i-((n||1)-1)/2)*5;const c=[m[0]+d[0]*off,m[1]+d[1]*off];s+=`<line x1="${c[0]+nx*6}" y1="${c[1]+ny*6}" x2="${c[0]-nx*6}" y2="${c[1]-ny*6}" stroke="#334155" stroke-width="1.5"/>`;}});
 (o.len||[]).forEach(([a,b,t,sd])=>{const A=S(a),B=S(b),m=[(A[0]+B[0])/2,(A[1]+B[1])/2],d=u(A,B);let nx=-d[1],ny=d[0];if(sd===undefined){if((m[0]-C[0])*nx+(m[1]-C[1])*ny<0){nx=-nx;ny=-ny;}}else{nx*=sd;ny*=sd;}s+=`<text x="${m[0]+nx*15}" y="${m[1]+ny*15+5}" font-size="14" text-anchor="middle">${t}</text>`;});
 Object.entries(o.lab||{}).forEach(([k,t])=>{const p=S(k);let d=[p[0]-C[0],p[1]-C[1]];const l=Math.hypot(d[0],d[1])||1;const q=[p[0]+d[0]/l*15,p[1]+d[1]/l*15+5];s+=`<text x="${q[0]}" y="${q[1]}" font-size="15" text-anchor="middle">${t}</text>`;});
 (o.dots||[]).forEach(k=>{const p=S(k);s+=`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#334155"/>`;});
 (o.txt||[]).forEach(([x,y,t,fs])=>{s+=`<text x="${X([x,y])}" y="${Y([x,y])+5}" font-size="${fs||14}" text-anchor="middle">${t}</text>`;});
 return `<svg viewBox="0 0 ${W} ${H}" class="fig" style="max-width:${W}px">${s}</svg>`;}
const rad=d=>d*Math.PI/180;
const pol=(r,deg,o=[0,0])=>[o[0]+r*Math.cos(rad(deg)),o[1]+r*Math.sin(rad(deg))];
// 정수 좌표 세 점의 삼각형 종류: 'acute' | 'right' | 'obtuse' | null(일직선)
function triType(A,B,C){const cr=(B[0]-A[0])*(C[1]-A[1])-(B[1]-A[1])*(C[0]-A[0]);if(cr===0)return null;
 const d=(P,Q,Rr)=>(Q[0]-P[0])*(Rr[0]-P[0])+(Q[1]-P[1])*(Rr[1]-P[1]);const ds3=[d(A,B,C),d(B,A,C),d(C,A,B)];if(ds3.some(x=>x===0))return 'right';if(ds3.some(x=>x<0))return 'obtuse';return 'acute';}
// 선분으로 이어진 그림에서 크고 작은 삼각형 세기: lines = [[점 이름들(한 직선 위)],..]
function trianglesIn(P,lines){const on=(a,b)=>lines.some(L=>L.includes(a)&&L.includes(b));const ks=Object.keys(P),out=[];
 for(let i=0;i<ks.length;i++)for(let j=i+1;j<ks.length;j++)for(let k=j+1;k<ks.length;k++){const [a,b,c]=[ks[i],ks[j],ks[k]];if(!on(a,b)||!on(b,c)||!on(a,c))continue;if(lines.some(L=>L.includes(a)&&L.includes(b)&&L.includes(c)))continue;const t=triType(P[a],P[b],P[c]);if(t)out.push(t);}
 return out;}
