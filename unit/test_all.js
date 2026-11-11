// 사용: node test_all.js 421 [423 ...]
const fs=require('fs'),vm=require('vm');const ctx={console,Math,module:undefined};vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname+'/kma-core.js','utf8'),ctx);
for(const c of process.argv.slice(2)){vm.runInContext(fs.readFileSync(__dirname+`/gen/${c}.js`,'utf8'),ctx);
 let bad=0;const rg=Array(30).fill(0).map(()=>[1e9,-1]);const vari=Array(30).fill(0).map(()=>new Set());const t0=Date.now();
 for(let s=1000;s<4000;s++){const set=vm.runInContext(`generateSet('${c}',${s})`,ctx);if(set.length!==30)throw 'len';set.forEach((p,i)=>{const a=p.ans;if(!Number.isInteger(a)||a<0||a>999||/NaN|undefined|Infinity/.test(p.q+p.exp+(p.choices||[]).join())){bad++;if(bad<6)console.log('BAD',c,s,i+1,a);}rg[i][0]=Math.min(rg[i][0],a);rg[i][1]=Math.max(rg[i][1],a);vari[i].add(p.q+(p.choices||[]).join());});}
 console.log(c,'bad',bad,'ms',Date.now()-t0);console.log(rg.map((r,i)=>`${i+1}:${r[0]}-${r[1]}(${vari[i].size})`).join(' '));}
