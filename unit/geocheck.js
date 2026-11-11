// 그림에 적힌 각도(○○°)와 실제로 그려진 각도를 비교하는 검사기: node geocheck.js 412 422 424
const fs=require('fs'),vm=require('vm');const ctx={console,Math,BigInt};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname+'/kma-core.js','utf8'),ctx);
vm.runInContext(`const __geo=geo;var __log=[];geo=function(o){(o.ang||[]).forEach(g=>{const P=o.pts;const at=P[g.at],a=P[g.a],b=P[g.b];if(!at||!a||!b){__log.push({t:g.t,bad:'pt'});return;}
 const d1=Math.atan2(a[1]-at[1],a[0]-at[0]),d2=Math.atan2(b[1]-at[1],b[0]-at[0]);let d=Math.abs(d1-d2)*180/Math.PI;if(d>180)d=360-d;__log.push({t:g.t,m:d});});return __geo(o);};`,ctx);
for(const c of process.argv.slice(2)){vm.runInContext(fs.readFileSync(__dirname+`/gen/${c}.js`,'utf8'),ctx);let bad=0;const per={};
 for(let s=1000;s<1600;s++){const U=vm.runInContext(`KMA_UNITS['${c}']`,ctx);vm.runInContext(`R=makeRng(${s})`,ctx);
  U.gens.forEach((g,i)=>{vm.runInContext('__log=[]',ctx);const p=g();const log=vm.runInContext('__log',ctx);
   log.forEach(L=>{if(L.bad){per[i+1]=(per[i+1]||0)+1;return;}let want=null;const m=/^(\d+)°$/.exec(L.t);if(m)want=+m[1];else if(L.t==='□°'&&!p.choices)want=p.ans;
    if(want!==null&&Math.abs(want-L.m)>0.6){bad++;per[i+1]=(per[i+1]||0)+1;}});});}
 console.log(c,'angle mismatches',bad,JSON.stringify(per));}
