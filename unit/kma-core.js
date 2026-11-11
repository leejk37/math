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
