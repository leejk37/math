/*
 * m423-common.js — 4학년 2학기 3단원 '소수의 덧셈과 뺄셈'(M423, 4231~4238) 페이지 공통 도우미
 *
 * 3학년 분수(m324-common.js)와 같은 모양(문제 카드, 💡 힌트, 안내 상자)에
 * 소수에 필요한 것을 더했습니다.
 *  - 소수 입력칸(M.dbox), 자연수 입력칸(M.box), 고르기(M.choices, M.places, M.cmp), 여러 개 고르기(M.multi)
 *  - 세로셈: 덧셈 M.vAdd(받아올림 칸), 뺄셈 M.vSub(받아내림 칸 — 자연수 뺄셈 단계와 같은 표기)
 *  - 그림: 모눈(M.gridSvg), 모눈 색칠(M.gridPick), 10칸 막대(M.bar / M.barPick), 수직선(M.lineSvg)
 *  - 채점(M.grade) → frac-kit.js가 시트에 저장,  정답 채우기(M.fill) → 검토 화면(m423-review.html)용
 *
 * 소수는 컴퓨터 계산에서 오차가 생기므로(0.1+0.2=0.30000000000000004),
 * 모든 수를 '가장 작은 자리 단위의 정수'로 다룹니다.  예) p=2 이면 1.82 → 182
 */
(function () {
  var css = '' +
    '*{box-sizing:border-box}' +
    'body{background:#f8fafc;font-family:"Malgun Gothic","맑은 고딕",sans-serif;margin:0;padding:24px 16px;display:flex;flex-direction:column;align-items:center}' +
    '.header-text{font-size:24px;font-weight:bold;color:#1e293b;margin:4px 0 8px;text-align:center}' +
    '.sub-text{font-size:14px;color:#64748b;margin-bottom:22px;text-align:center;line-height:1.6}' +
    '.quiz-container{display:grid;grid-template-columns:1fr;gap:16px;width:100%;max-width:960px;margin-bottom:26px}' +
    '.quiz-card{background:#fff;border:2px solid #cbd5e1;border-radius:12px;padding:40px 16px 18px;position:relative;display:flex;flex-direction:column;align-items:center;gap:12px;box-shadow:0 4px 6px rgba(0,0,0,.03);transition:border-color .3s,box-shadow .3s}' +
    '.quiz-card.wide{grid-column:1/-1}' +
    '.quiz-number{position:absolute;top:12px;left:15px;font-size:14px;font-weight:bold;color:#fff;background:#2563eb;border-radius:999px;padding:2px 10px;line-height:1.5}' +
    '.q-text{font-size:18px;color:#1e293b;line-height:1.7;text-align:center;font-weight:bold}' +
    '.q-small{font-size:15px;color:#475569;text-align:center;line-height:1.6}' +
    '.eq{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:6px;font-size:21px;font-weight:bold;color:#1e293b}' +
    '.row{display:flex;flex-wrap:wrap;gap:22px;justify-content:center;align-items:flex-start}' +
    '.fraction{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 3px}' +
    '.fraction .num,.fraction .den{display:flex;align-items:center;justify-content:center;min-width:30px;height:32px;padding:0 6px;font-size:21px;font-weight:bold}' +
    '.fraction .frac-line{width:100%;height:3px;background:#1e293b;border-radius:2px;margin:1px 0}' +
    '.fraction.sm .num,.fraction.sm .den{height:24px;min-width:22px;font-size:16px;padding:0 3px}' +
    '.mixed{display:inline-flex;align-items:center;gap:2px;vertical-align:middle}' +
    '.mixed .whole{font-size:26px;font-weight:bold;display:flex;align-items:center}' +
    '.ans-box{width:44px;height:38px;border:2px solid #94a3b8;border-radius:6px;font-size:20px;font-weight:bold;text-align:center;outline:none;background:#fff;color:#0284c7;padding:0;font-family:inherit}' +
    '.ans-box.w1{width:36px}' +
    '.ans-box.dec{width:84px}' +
    '.ans-box:focus{border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.2);background:#f0f9ff}' +
    '.unit{font-size:19px;font-weight:bold;margin-left:2px}' +
    '.tail{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}' +
    '.choice-group,.multi-group{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}' +
    '.choice-btn{border:2px solid #cbd5e1;background:#fff;color:#334155;border-radius:10px;padding:7px 12px;font-size:16px;font-weight:bold;cursor:pointer;font-family:inherit;min-width:44px}' +
    '.choice-btn:hover{border-color:#94a3b8;background:#f8fafc}' +
    '.choice-btn.selected{border-color:#3b82f6;background:#dbeafe;color:#1d4ed8}' +
    '.choice-btn.cmp{width:42px;height:34px;border-radius:17px;padding:0;font-size:20px;min-width:0}' +
    '.choice-group.cmpg{flex-direction:column;flex-wrap:nowrap;gap:4px}' +
    '.choice-group:focus,.multi-group:focus{outline:none}' +
    '.cmp-row{display:flex;align-items:center;gap:8px;font-size:21px;font-weight:bold;color:#1e293b}' +
    '.quiz-card.current{border-color:#3b82f6;box-shadow:0 0 0 4px rgba(59,130,246,.18)}' +
    '.hint-btn{position:absolute;top:8px;right:10px;border:1.5px solid #fcd34d;background:#fffbeb;color:#92400e;border-radius:14px;padding:3px 10px;font-size:13px;font-weight:bold;cursor:pointer;font-family:inherit}' +
    '.quiz-card>.help-bar{position:absolute;top:8px;right:10px;margin:0;flex-direction:row}' +
    '.quiz-card>.help-bar~.hint-btn{right:92px}' +
    '.hint-box{display:none;background:#fffbeb;border:1.5px dashed #f59e0b;border-radius:10px;padding:8px 12px;font-size:15px;color:#78350f;line-height:1.7;text-align:center;width:100%}' +
    '.hint-box.show{display:block}' +
    // 문제 지시문을 '문제 N' 바로 옆에 (M.inlineQuestion = true 인 페이지). 도움말·도움 버튼은 카드 아래쪽 오른편으로
    '.quiz-card.inline-q{padding-top:12px;padding-bottom:50px}' +
    '.inline-q>.quiz-number{top:15px}' +
    '.inline-q>.q-head{align-self:stretch;text-align:left;padding-left:66px;margin:0 0 2px;font-size:17px;line-height:1.6;word-break:keep-all}' +
    '.inline-q>.hint-btn,.inline-q>.help-bar{top:auto;bottom:12px}' +
    '.rule-box{display:inline-block;text-align:left;background:#eff6ff;border:2px solid #3b82f6;border-radius:12px;padding:10px 18px;margin-bottom:8px;color:#1e293b;max-width:760px}' +
    '.rule-title{font-size:19px;font-weight:bold;color:#1d4ed8;margin-bottom:6px}' +
    '.rule-line{font-size:16px;margin:4px 0;line-height:1.55}' +
    '.rule-tag{display:inline-block;min-width:44px;text-align:center;border-radius:6px;padding:1px 6px;margin-right:6px;font-weight:bold;color:#fff;background:#2563eb}' +
    '.rule-tag.t2{background:#ea580c}.rule-tag.t3{background:#16a34a}.rule-tag.t4{background:#7c3aed}' +
    '.btn-group{display:flex;gap:12px}' +
    '.action-btn{color:#fff;border:none;border-radius:8px;padding:12px 24px;font-size:16px;font-weight:bold;cursor:pointer;box-shadow:0 4px 6px rgba(0,0,0,.1);font-family:inherit}' +
    '.check-btn{background:#3b82f6}.check-btn:hover{background:#2563eb}' +
    '.reset-btn{background:#8b5cf6}.reset-btn:hover{background:#7c3aed}' +
    /* 세로셈 */
    '.vt{border-collapse:collapse;font-family:"Courier New",Courier,monospace}' +
    '.vt td{width:32px;height:38px;border:1px dashed #94a3b8;padding:0;text-align:center;vertical-align:middle;font-size:22px;font-weight:bold;color:#1e293b;position:relative}' +
    '.vt td.dot{width:12px;border-left:none;border-right:none;font-size:24px}' +
    '.vt td.op{width:24px}' +
    '.vt td.ln{border-bottom:2.5px solid #1e293b}' +
    '.vt td.nb{border:none}' +
    '.vt td.top{border:none;height:28px;vertical-align:bottom}' +
    '.vt .ans-box.vc{width:100%;height:100%;border:none;border-radius:0;font-size:22px;font-family:"Courier New",Courier,monospace;background:transparent}' +
    '.vt .ans-box.vc:focus{background:#e0f2fe;box-shadow:none}' +
    '.vt .ans-box.carry{width:22px;height:22px;font-size:13px;border:1.5px dashed #f59e0b;background:#fef3c7;color:#b45309;border-radius:4px;margin:0 auto 3px;display:block}' +
    '.vt .ans-box.borrow{width:28px;height:22px;font-size:13px;border:1.5px dashed #a855f7;background:#f3e8ff;color:#7e22ce;border-radius:4px;margin:0 auto 3px;display:block}' +
    '.vt .dg{position:relative;display:inline-block;width:22px}' +
    '.vt .dg.cut::after{content:"";position:absolute;left:-3px;right:-3px;top:50%;height:2.5px;background:#ef4444;transform:rotate(-45deg)}' +
    '.vlabel{font-size:15px;color:#475569;font-weight:bold;margin-bottom:4px;text-align:center}' +
    /* 그림 */
    '.pick-cell{cursor:pointer}' +
    '.pick{display:inline-block}' +
    '.digit-cards{display:flex;gap:8px;justify-content:center}' +
    '.digit-card{width:40px;height:52px;border:2px solid #f59e0b;border-radius:8px;background:#fffbeb;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:bold;color:#92400e}' +
    '.speech{background:#f1f5f9;border-radius:14px;padding:10px 14px;font-size:16px;font-weight:bold;color:#1e293b;text-align:center;min-width:150px}' +
    '.speech .who{display:block;font-size:13px;color:#64748b;margin-bottom:4px}' +
    '.place-table{border-collapse:collapse;font-size:18px;font-weight:bold}' +
    '.place-table th{font-size:12px;color:#475569;background:#f1f5f9;padding:4px 6px;border:1px solid #cbd5e1}' +
    '.place-table td{width:46px;height:38px;text-align:center;border:1px solid #cbd5e1}' +
    'svg{max-width:100%;height:auto}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var M = window.M = {};

  /* ---------- 수 다루기 ---------- */
  M.rand = function (a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; };
  M.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  M.shuffle = function (arr) {
    for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
    return arr;
  };
  M.pow = function (p) { return Math.pow(10, p); };
  // 정수 n(10^-p 단위) → 소수 글자.  fmt(28,1)="2.8", fmt(7,2)="0.07", fmt(120,2)="1.20"
  M.fmt = function (n, p) {
    if (!p) return String(n);
    var s = String(n).padStart(p + 1, '0');
    return s.slice(0, -p) + '.' + s.slice(-p);
  };
  // 끝자리 0을 지운 글자.  fmt0(120,2)="1.2", fmt0(300,2)="3"
  M.fmt0 = function (n, p) {
    var s = M.fmt(n, p);
    if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    return s;
  };
  // 학생 글자 → 10^-p 단위 정수. 형식이 틀리면 null, 더 작은 자리에 0 아닌 숫자가 있으면 -1
  M.parse = function (raw, p) {
    raw = String(raw == null ? '' : raw).trim();
    if (/^\.\d+$/.test(raw)) raw = '0' + raw;
    if (!/^\d+(\.\d+)?$/.test(raw)) return null;
    var parts = raw.split('.'), ip = parts[0], fp = parts[1] || '';
    if (fp.length > p) { if (/[1-9]/.test(fp.slice(p))) return -1; fp = fp.slice(0, p); }
    while (fp.length < p) fp += '0';
    return parseInt(ip, 10) * M.pow(p) + (p ? parseInt(fp, 10) : 0);
  };
  // 숫자 글자를 읽었을 때 끝소리 받침이 있으면 a, 없으면 b (영·일·삼·육·칠·팔·십 → 받침)
  M.josa = function (s, a, b) {
    var t = String(s).replace(/[^0-9]/g, '');
    var last = t.length ? +t[t.length - 1] : 0;
    return [0, 1, 3, 6, 7, 8].indexOf(last) !== -1 ? a : b;
  };
  var DIG = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
  // 소수 읽기: "1.76" → "일 점 칠육"
  M.readDec = function (str) {
    var parts = String(str).split('.');
    var ip = +parts[0], w = '';
    if (ip === 0) w = '영';
    else {
      var th = Math.floor(ip / 1000) % 10, h = Math.floor(ip / 100) % 10, t = Math.floor(ip / 10) % 10, o = ip % 10;
      if (th) w += (th > 1 ? DIG[th] : '') + '천';
      if (h) w += (h > 1 ? DIG[h] : '') + '백';
      if (t) w += (t > 1 ? DIG[t] : '') + '십';
      if (o) w += DIG[o];
    }
    if (parts[1]) w += ' 점 ' + parts[1].split('').map(function (d) { return DIG[+d]; }).join('');
    return w;
  };
  // 두 자리 수를 자연수처럼 읽기: 17 → "십칠" (오개념 보기용)
  M.readInt = function (n) {
    var t = Math.floor(n / 10) % 10, o = n % 10, h = Math.floor(n / 100);
    return (h ? (h > 1 ? DIG[h] : '') + '백' : '') + (t ? (t > 1 ? DIG[t] : '') + '십' : '') + (o ? DIG[o] : '');
  };
  M.PLACE = ['일의 자리', '소수 첫째 자리', '소수 둘째 자리', '소수 셋째 자리'];

  /* ---------- 글자 모양 ---------- */
  M.frac = function (n, d, small) {
    return '<span class="fraction' + (small ? ' sm' : '') + '"><span class="num">' + n + '</span><span class="frac-line"></span><span class="den">' + d + '</span></span>';
  };
  M.mixed = function (w, n, d) {
    return '<span class="mixed"><span class="whole">' + w + '</span>' + M.frac(n, d) + '</span>';
  };

  /* ---------- 입력칸 ---------- */
  // 자연수 칸: 정답 자릿수만큼 쓰면 다음 칸으로
  M.box = function (ans) {
    var s = String(ans);
    return '<input type="text" inputmode="numeric" autocomplete="off" class="ans-box' + (s.length === 1 ? ' w1' : '') +
      '" maxlength="' + s.length + '" data-kind="int" data-ans="' + s + '">';
  };
  // 소수 칸: 값이 같으면 정답(0.6 = 0.60). exact면 쓴 모양까지 같아야 정답("소수로 쓰기" 문제)
  M.dbox = function (n, p, exact) {
    var a = exact ? M.fmt(n, p) : M.fmt0(n, p);
    return '<input type="text" inputmode="decimal" autocomplete="off" class="ans-box dec" maxlength="' + (a.length + 2) +
      '" data-adv="' + a.length + '" data-kind="' + (exact ? 'exact' : 'dec') + '" data-p="' + p + '" data-ans="' + a + '">';
  };
  // 순서가 바뀌어도 되는 두 수(덧셈식의 두 수): 두 칸 모두 같은 묶음 이름(g)
  M.pairbox = function (g, n, p) {
    var a = M.fmt0(n, p);
    return '<input type="text" inputmode="decimal" autocomplete="off" class="ans-box dec" maxlength="' + (a.length + 3) +
      '" data-kind="pair" data-g="' + g + '" data-p="' + p + '" data-ans="' + a + '">';
  };
  // 고르기: options = [[값, 보이는 글자], ...]
  M.choices = function (ans, options, cls) {
    return '<div class="choice-group' + (cls === 'cmp' ? ' cmpg' : '') + '" tabindex="-1" data-ans="' + ans + '">' + options.map(function (o) {
      return '<button type="button" class="choice-btn' + (cls ? ' ' + cls : '') + '" data-v="' + o[0] + '">' + o[1] + '</button>';
    }).join('') + '</div>';
  };
  // 자리 이름 고르기 (maxPlace: 3이면 소수 셋째 자리까지 보임)
  M.places = function (ansIdx, maxPlace) {
    var opts = [];
    for (var i = 0; i <= maxPlace; i++) opts.push([i, M.PLACE[i]]);
    return M.choices(ansIdx, opts);
  };
  // >, =, < 고르기
  M.cmp = function (a, b) {
    var ans = a > b ? 'gt' : (a < b ? 'lt' : 'eq');
    return M.choices(ans, [['gt', '&gt;'], ['eq', '='], ['lt', '&lt;']], 'cmp');
  };
  // 0~9 중 여러 개 고르기
  M.multi = function (ansArr) {
    var s = '<div class="multi-group" tabindex="-1" data-ans="' + ansArr.slice().sort().join(',') + '">';
    for (var d = 0; d <= 9; d++) s += '<button type="button" class="choice-btn" data-v="' + d + '">' + d + '</button>';
    return s + '</div>';
  };

  /* ---------- 카드 ---------- */
  M.card = function (i, inner, wide) {
    return '<div class="quiz-card' + (wide ? ' wide' : '') + '" id="card-' + i + '"><div class="quiz-number">문제 ' + (i + 1) + '</div>' + inner + '</div>';
  };

  /* ---------- 세로셈 ---------- */
  var SEQ = 0; // 세로셈 칸의 입력 순서 번호
  function digitArr(n, p, intLen, shownP) {
    var P = M.pow(p), ip = String(Math.floor(n / P)), fp = String(n % P).padStart(p, '0'), arr = [];
    for (var k = 0; k < intLen; k++) arr.push(k < intLen - ip.length ? '' : ip[k - (intLen - ip.length)]);
    for (var f = 0; f < p; f++) arr.push(f < shownP ? fp[f] : '');
    return arr;
  }
  function vbox(ans, cls, extra) {
    return '<input type="text" inputmode="numeric" autocomplete="off" class="ans-box ' + cls + '" maxlength="' + (cls === 'borrow' ? 2 : 1) +
      '" data-kind="' + (cls === 'carry' ? 'carry' : 'int') + '" data-ans="' + ans + '" data-seq="' + (SEQ++) + '"' + (extra || '') + '>';
  }
  // 덧셈 세로셈. a,b: 10^-p 단위.  aP,bP: 화면에 보일 소수 자릿수(1.82 + 0.5처럼 짧은 수는 빈칸)
  M.vAdd = function (a, b, p, aP, bP) {
    if (aP == null) aP = p; if (bP == null) bP = p;
    var s = a + b, P = M.pow(p);
    var intLen = Math.max(String(Math.floor(s / P)).length, String(Math.floor(a / P)).length, String(Math.floor(b / P)).length);
    var n = intLen + p;
    var A = digitArr(a, p, intLen, aP), B = digitArr(b, p, intLen, bP), S = digitArr(s, p, intLen, p);
    var ad = digitArr(a, p, intLen, p).map(Number), bd = digitArr(b, p, intLen, p).map(Number);
    var carry = new Array(n).fill(0), c = 0;
    for (var col = n - 1; col >= 0; col--) { carry[col] = c; c = Math.floor(((+ad[col] || 0) + (+bd[col] || 0) + c) / 10); }
    // 입력 순서: 오른쪽 답 → 왼쪽 열 받아올림 → 그 열 답 → ...
    var seqAns = [], seqCar = [], order = [];
    for (col = n - 1; col >= 0; col--) { if (col < n - 1) order.push(['c', col]); order.push(['a', col]); }
    var base = SEQ; SEQ += order.length + 1;
    order.forEach(function (o, i) { (o[0] === 'a' ? seqAns : seqCar)[o[1]] = base + i; });
    var h = '<table class="vt" data-op="+" data-a="' + a + '" data-b="' + b + '" data-p="' + p + '">';
    h += '<tr><td class="top"></td>';
    for (col = 0; col < n; col++) {
      if (col === intLen) h += '<td class="top"></td>';
      h += '<td class="top">' + (col < n - 1 ? carryBox(carry[col] ? String(carry[col]) : '', seqCar[col]) : '') + '</td>';
    }
    h += '</tr><tr><td class="op"></td>';
    A.forEach(function (d, k) { if (k === intLen) h += '<td class="dot">.</td>'; h += '<td' + (d === '' && k < intLen ? ' class="nb"' : '') + '>' + d + '</td>'; });
    h += '</tr><tr><td class="op ln">+</td>';
    B.forEach(function (d, k) { if (k === intLen) h += '<td class="dot ln">.</td>'; h += '<td class="ln">' + d + '</td>'; });
    h += '</tr><tr><td class="op"></td>';
    for (col = 0; col < n; col++) {
      if (col === intLen) h += '<td class="dot">.</td>';
      h += '<td>' + ansBox(S[col], seqAns[col]) + '</td>';
    }
    return h + '</tr></table>';
  };
  function carryBox(ans, seq) {
    return '<input type="text" inputmode="numeric" autocomplete="off" class="ans-box carry" maxlength="1" data-kind="carry" data-ans="' + ans + '" data-seq="' + seq + '">';
  }
  function ansBox(ans, seq) {
    return '<input type="text" inputmode="numeric" autocomplete="off" class="ans-box vc" maxlength="1" data-kind="int" data-ans="' + ans + '" data-seq="' + seq + '">';
  }
  function borrowBox(ans, seq, col) {
    return '<input type="text" inputmode="numeric" autocomplete="off" class="ans-box borrow" maxlength="' + String(ans).length + '" data-kind="int" data-ans="' + ans + '" data-seq="' + seq + '" data-col="' + col + '">';
  }
  // 뺄셈 세로셈 (a > b).  받아내림 칸은 자연수 뺄셈 단계와 같은 표기:
  //   빌려주기만 하는 자리 = (그 자리 숫자 − 1), 받기만 하는 자리 = 10, 받고 다시 빌려주는 자리 = (그 자리 숫자 + 9)
  //   예) 6.5 − 2.8 → 일의 자리 위 5, 소수 첫째 자리 위 10
  //       2.2 − 1.35 → 일의 자리 위 1, 소수 첫째 자리 위 11, 소수 둘째 자리(빈칸=0) 위 10
  // 받아내림 칸은 받아내림이 일어나는 자리에만 나타납니다(자연수 뺄셈 단계와 같음).
  M.vSub = function (a, b, p, aP, bP) {
    if (aP == null) aP = p; if (bP == null) bP = p;
    var s = a - b, P = M.pow(p);
    var intLen = Math.max(String(Math.floor(a / P)).length, String(Math.floor(b / P)).length);
    var n = intLen + p;
    var A = digitArr(a, p, intLen, aP), B = digitArr(b, p, intLen, bP);
    var ad = digitArr(a, p, intLen, p).map(function (x) { return +x || 0; });
    var bd = digitArr(b, p, intLen, p).map(function (x) { return +x || 0; });
    var borrowIn = new Array(n).fill(0), ans = new Array(n).fill(0), bw = 0; // borrowIn[c]=1: c열이 왼쪽에서 10을 받음
    for (var col = n - 1; col >= 0; col--) {
      var v = ad[col] - bw, need = 0;
      if (v < bd[col]) { v += 10; need = 1; }
      ans[col] = v - bd[col]; borrowIn[col] = need; bw = need;
    }
    // 답 칸 정답: 맨 앞자리 0은 일의 자리만 보임(0.27 처럼), 그 앞자리는 빈칸
    var sIntLen = String(Math.floor(s / P)).length;
    var ansStr = ans.map(function (d, k) { return (k < intLen - sIntLen) ? '' : String(d); });
    var note = new Array(n).fill(null);
    for (col = 0; col < n; col++) {
      var recv = borrowIn[col] === 1, lend = col + 1 < n && borrowIn[col + 1] === 1;
      if (recv && lend) note[col] = ad[col] + 9;
      else if (recv) note[col] = 10;
      else if (lend) note[col] = ad[col] - 1;
    }
    // 입력 순서: 오른쪽부터. 받아내림이 필요한 열이면 [빌려주는 자리 칸 → 받는 자리 칸] 다음에 그 열의 답
    var order = [], used = {};
    for (col = n - 1; col >= 0; col--) {
      if (borrowIn[col]) {
        if (note[col - 1] != null && !used[col - 1]) { order.push(['n', col - 1]); used[col - 1] = 1; }
        if (!used[col]) { order.push(['n', col]); used[col] = 1; }
      }
      if (ansStr[col] !== '') order.push(['a', col]);
    }
    var base = SEQ; SEQ += order.length + 1;
    var seqA = [], seqN = [];
    order.forEach(function (o, i) { (o[0] === 'a' ? seqA : seqN)[o[1]] = base + i; });
    var h = '<table class="vt" data-op="-" data-a="' + a + '" data-b="' + b + '" data-p="' + p + '">';
    h += '<tr><td class="top"></td>';
    for (col = 0; col < n; col++) {
      if (col === intLen) h += '<td class="top"></td>';
      h += '<td class="top">' + (note[col] != null ? borrowBox(note[col], seqN[col], col) : '') + '</td>';
    }
    h += '</tr><tr><td class="op"></td>';
    A.forEach(function (d, k) {
      if (k === intLen) h += '<td class="dot">.</td>';
      h += '<td' + (d === '' && k < intLen ? ' class="nb"' : '') + '><span class="dg" data-col="' + k + '">' + d + '&#8203;</span></td>';
    });
    h += '</tr><tr><td class="op ln">−</td>';
    B.forEach(function (d, k) { if (k === intLen) h += '<td class="dot ln">.</td>'; h += '<td class="ln">' + d + '</td>'; });
    h += '</tr><tr><td class="op"></td>';
    for (col = 0; col < n; col++) {
      if (col === intLen) h += '<td class="dot">.</td>';
      h += '<td' + (ansStr[col] === '' ? ' class="nb"' : '') + '>' + (ansStr[col] === '' ? '' : ansBox(ansStr[col], seqA[col])) + '</td>';
    }
    return h + '</tr></table>';
  };
  // 세로셈 하나를 제목과 함께
  M.vBlock = function (label, tableHtml) {
    return '<div><div class="vlabel">' + label + '</div>' + tableHtml + '</div>';
  };

  /* ---------- 그림 ---------- */
  function svgOpen(w, h) { return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">'; }
  // 10×10 모눈: 왼쪽 세로줄부터 위→아래로 n칸 색칠. 꽉 찬 세로줄(0.1)은 분홍, 나머지 칸(0.01)은 초록 (교과서 색)
  M.gridSvg = function (n, size) {
    var c = (size || 200) / 10, s = svgOpen(c * 10 + 4, c * 10 + 4), full = Math.floor(n / 10);
    for (var k = 0; k < 100; k++) {
      var col = Math.floor(k / 10), row = k % 10;
      var fill = k < n ? (col < full ? '#f9a8d4' : '#86efac') : '#fff';
      s += '<rect x="' + (2 + col * c) + '" y="' + (2 + row * c) + '" width="' + c + '" height="' + c + '" fill="' + fill + '" stroke="#7dd3fc" stroke-width="1" stroke-dasharray="' + (row ? '3,2' : '') + '"/>';
    }
    for (var j = 0; j <= 10; j++) s += '<line x1="' + (2 + j * c) + '" y1="2" x2="' + (2 + j * c) + '" y2="' + (2 + 10 * c) + '" stroke="#0ea5e9" stroke-width="1.3"/>';
    return s + '<rect x="2" y="2" width="' + (10 * c) + '" height="' + (10 * c) + '" fill="none" stroke="#0369a1" stroke-width="2"/></svg>';
  };
  // 모눈 색칠하기: 왼쪽 세로줄부터 위→아래 순서로 채워짐. base칸은 미리 색칠(바꿀 수 없음)
  var PICKS = [];
  M.gridPick = function (ans, base, size) {
    var id = PICKS.length, c = (size || 200) / 10;
    PICKS.push({ kind: 'grid', base: base || 0, val: base || 0, max: 100 });
    var s = '<div class="pick" data-pick="' + id + '" data-ans="' + ans + '" tabindex="-1">' + svgOpen(c * 10 + 4, c * 10 + 4);
    for (var k = 0; k < 100; k++) {
      var col = Math.floor(k / 10), row = k % 10;
      s += '<rect class="pick-cell" data-k="' + k + '" x="' + (2 + col * c) + '" y="' + (2 + row * c) + '" width="' + c + '" height="' + c + '" fill="#fff" stroke="#7dd3fc" stroke-width="1"/>';
    }
    for (var j = 0; j <= 10; j++) s += '<line x1="' + (2 + j * c) + '" y1="2" x2="' + (2 + j * c) + '" y2="' + (2 + 10 * c) + '" stroke="#0ea5e9" stroke-width="1.3" pointer-events="none"/>';
    return s + '<rect x="2" y="2" width="' + (10 * c) + '" height="' + (10 * c) + '" fill="none" stroke="#0369a1" stroke-width="2" pointer-events="none"/></svg></div>';
  };
  // 10칸 막대 색칠하기 (세로: 아래부터, 가로: 왼쪽부터)
  M.barPick = function (ans, vertical, topLabel) {
    var id = PICKS.length;
    PICKS.push({ kind: 'bar', base: 0, val: 0, max: 10 });
    return '<div class="pick" data-pick="' + id + '" data-ans="' + ans + '" tabindex="-1">' + barSvg(0, vertical, topLabel, true) + '</div>';
  };
  // 색칠된 10칸 막대 그림 (보기용)
  M.bar = function (n, vertical, topLabel, color) { return barSvg(n, vertical, topLabel, false, color); };
  function barSvg(n, vertical, topLabel, pick, color) {
    color = color || '#93c5fd';
    var s, k, x, y;
    if (vertical) {
      var w = 60, h = 200, ch = h / 10;
      s = svgOpen(w + 46, h + 16);
      for (k = 0; k < 10; k++) { // k: 아래에서 몇 번째
        y = 8 + (9 - k) * ch;
        s += '<rect ' + (pick ? 'class="pick-cell" data-k="' + k + '" ' : '') + 'x="4" y="' + y + '" width="' + w + '" height="' + ch + '" fill="' + (k < n ? color : '#fff') + '" stroke="#64748b" stroke-width="1" stroke-dasharray="4,3"/>';
      }
      s += '<rect x="4" y="8" width="' + w + '" height="' + h + '" fill="none" stroke="#1e293b" stroke-width="2" pointer-events="none"/>';
      s += '<text x="' + (w + 9) + '" y="14" font-size="13" fill="#334155">' + (topLabel || '1') + '</text><text x="' + (w + 9) + '" y="' + (h + 12) + '" font-size="13" fill="#334155">0</text>';
    } else {
      var W = 300, H = 34, cw = W / 10;
      s = svgOpen(W + 30, H + 26);
      for (k = 0; k < 10; k++) {
        x = 4 + k * cw;
        s += '<rect ' + (pick ? 'class="pick-cell" data-k="' + k + '" ' : '') + 'x="' + x + '" y="4" width="' + cw + '" height="' + H + '" fill="' + (k < n ? color : '#fff') + '" stroke="#64748b" stroke-width="1" stroke-dasharray="4,3"/>';
      }
      s += '<rect x="4" y="4" width="' + W + '" height="' + H + '" fill="none" stroke="#1e293b" stroke-width="2" pointer-events="none"/>';
      s += '<text x="4" y="' + (H + 22) + '" font-size="13" text-anchor="middle" fill="#334155">0</text><text x="' + (W + 4) + '" y="' + (H + 22) + '" font-size="13" text-anchor="middle" fill="#334155">' + (topLabel || '1') + '</text>';
    }
    return s + '</svg>';
  }
  // 수직선: start(10^-p 단위)부터 ticks칸, 큰 눈금 major칸마다 이름.  arrows: [{at:칸 번호, color}]
  M.lineSvg = function (opt) {
    var W = opt.width || 620, x0 = 24, x1 = W - 34, step = (x1 - x0) / opt.ticks;
    var s = svgOpen(W, 78);
    s += '<line x1="' + x0 + '" y1="44" x2="' + x1 + '" y2="44" stroke="#1e293b" stroke-width="2"/>';
    for (var t = 0; t <= opt.ticks; t++) {
      var x = x0 + t * step, big = t % opt.major === 0, mid = opt.mid && t % opt.mid === 0;
      var hgt = big ? 10 : (mid ? 7 : 4);
      s += '<line x1="' + x.toFixed(1) + '" y1="' + (44 - hgt) + '" x2="' + x.toFixed(1) + '" y2="' + (44 + hgt) + '" stroke="#1e293b" stroke-width="' + (big ? 2 : 1) + '"/>';
      if (big) s += '<text x="' + x.toFixed(1) + '" y="70" text-anchor="middle" font-size="14" font-weight="bold" fill="#1e293b">' + (opt.trim ? M.fmt0 : M.fmt)(opt.start + t * opt.unit, opt.p) + (t === opt.ticks && opt.suffix ? ' ' + opt.suffix : '') + '</text>';
    }
    (opt.arrows || []).forEach(function (a) {
      var ax = x0 + a.at * step;
      s += '<path d="M' + ax.toFixed(1) + ' 32 L' + (ax - 6).toFixed(1) + ' 18 L' + (ax + 6).toFixed(1) + ' 18 Z" fill="' + (a.color || '#ef4444') + '"/><line x1="' + ax.toFixed(1) + '" y1="6" x2="' + ax.toFixed(1) + '" y2="20" stroke="' + (a.color || '#ef4444') + '" stroke-width="3"/>' +
        (a.label ? '<text x="' + ax.toFixed(1) + '" y="12" dx="8" font-size="12" font-weight="bold" fill="' + (a.color || '#ef4444') + '">' + a.label + '</text>' : '');
    });
    return s + '</svg>';
  };
  function paintPick(el) {
    var st = PICKS[+el.dataset.pick];
    var cells = el.querySelectorAll('.pick-cell');
    cells.forEach(function (r) {
      var k = +r.dataset.k;
      var fill = '#fff';
      if (k < st.base) fill = '#f9a8d4';
      else if (k < st.val) fill = st.kind === 'grid' ? '#86efac' : '#93c5fd';
      r.setAttribute('fill', fill);
    });
  }
  function bindPicks() {
    document.querySelectorAll('.pick').forEach(function (el) {
      paintPick(el);
      el.querySelectorAll('.pick-cell').forEach(function (r) {
        r.addEventListener('click', function () {
          if (document.body.classList.contains('fk-locked')) return;
          var st = PICKS[+el.dataset.pick], k = +r.dataset.k;
          if (k < st.base) return;
          st.val = (k < st.val) ? k : k + 1;
          if (st.val < st.base) st.val = st.base;
          paintPick(el);
          el.dispatchEvent(new Event('input', { bubbles: true }));
        });
      });
    });
  }
  M.pickValue = function (el) { return PICKS[+el.dataset.pick].val; };

  /* ---------- 화면 그리기와 입력 순서 ---------- */
  // PICKS는 그림 글자를 만들 때 쌓이므로, generate() 맨 앞에서 M.reset()을 불러 비웁니다.
  M.reset = function () { PICKS = []; SEQ = 0; };
  // cards: M.card(...) 글자 배열, hints[i]: i번 문제의 💡 도움말
  M.render = function (cards, hints) {
    var html = cards.map(function (c, i) {
      var h = hints && hints[i];
      if (!h) return c;
      var cut = c.lastIndexOf('</div>');
      return c.slice(0, cut) + '<button type="button" class="hint-btn" tabindex="-1" title="풀이 방법을 봅니다 (선생님께 알리지 않음)" onclick="this.parentNode.querySelector(\'.hint-box\').classList.toggle(\'show\')">💡 힌트</button>' +
        '<div class="hint-box">' + h + '</div>' + c.slice(cut);
    });
    document.getElementById('quiz').innerHTML = html.join('');
    if (M.inlineQuestion) {
      // 각 카드의 첫 지시문(.q-text)을 '문제 N' 바로 옆(카드 맨 위)으로 옮김 — 그림·식은 그 아래로
      document.querySelectorAll('#quiz .quiz-card').forEach(function (card) {
        var q = card.querySelector('.q-text');
        var num = card.querySelector('.quiz-number');
        if (!q || !num) return;
        q.classList.add('q-head');
        num.insertAdjacentElement('afterend', q);
        card.classList.add('inline-q');
      });
    }
    bindPicks();
    M.wire();
  };

  M.wire = function () {
    // 입력 순서: 화면 순서. 단, 세로셈 안에서는 계산 순서(data-seq)대로
    var all = Array.prototype.slice.call(document.querySelectorAll('#quiz .ans-box, #quiz .choice-group, #quiz .multi-group'));
    var keyed = all.map(function (el, i) {
      var t = el.closest('.vt');
      if (t && el.dataset.seq != null) {
        var first = all.indexOf(t.querySelector('.ans-box'));
        var minSeq = Math.min.apply(null, Array.prototype.map.call(t.querySelectorAll('.ans-box'), function (x) { return +x.dataset.seq; }));
        return { el: el, k: first + (+el.dataset.seq - minSeq) / 1000 };
      }
      return { el: el, k: i };
    });
    keyed.sort(function (a, b) { return a.k - b.k; });
    var stops = keyed.map(function (o) { return o.el; });
    var checkBtn = document.getElementById('checkBtn');
    function go(i) { if (i < 0) return; if (i < stops.length) stops[i].focus(); else if (checkBtn) checkBtn.focus(); }
    if (!M._focusBound) {
      M._focusBound = true;
      document.addEventListener('focusin', function (e) {
        var card = e.target.closest && e.target.closest('.quiz-card');
        document.querySelectorAll('.quiz-card.current').forEach(function (c) { if (c !== card) c.classList.remove('current'); });
        if (card) card.classList.add('current');
      });
    }
    stops.forEach(function (el, i) {
      if (el.classList.contains('choice-group')) {
        el.querySelectorAll('.choice-btn').forEach(function (btn) {
          btn.addEventListener('click', function () {
            el.querySelectorAll('.choice-btn').forEach(function (b) { b.classList.remove('selected'); });
            btn.classList.add('selected');
            go(i + 1);
          });
        });
        el.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); go(i + 1); }
          else if (e.key === 'Backspace' || e.key === 'Tab' && e.shiftKey) { e.preventDefault(); go(i - 1); }
        });
        return;
      }
      if (el.classList.contains('multi-group')) {
        el.querySelectorAll('.choice-btn').forEach(function (btn) {
          btn.addEventListener('click', function () { btn.classList.toggle('selected'); });
        });
        return;
      }
      var dec = el.dataset.kind === 'dec' || el.dataset.kind === 'exact' || el.dataset.kind === 'pair';
      el.addEventListener('focus', function () { this.select(); });
      el.addEventListener('input', function () {
        var v = this.value.replace(dec ? /[^0-9.]/g : /[^0-9]/g, '');
        if (dec) { var k = v.indexOf('.'); if (k >= 0) v = v.slice(0, k + 1) + v.slice(k + 1).replace(/\./g, ''); }
        if (v !== this.value) this.value = v;
        // 받아내림 칸 숫자를 쓰면 윗수 숫자에 빗금
        if (this.classList.contains('borrow')) {
          var t = this.closest('.vt'), dg = t && t.querySelector('.dg[data-col="' + this.dataset.col + '"]');
          if (dg && dg.textContent.replace(/​/g, '') !== '') dg.classList.toggle('cut', this.value !== '');
        }
        var adv = dec ? +(this.dataset.adv || this.maxLength) : this.maxLength;
        if (this.value.length >= adv) go(i + 1);
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); go(i + 1); }
        else if (e.key === 'Tab' && e.shiftKey) { e.preventDefault(); go(i - 1); }
        else if (e.key === 'Backspace' && this.value === '') { e.preventDefault(); go(i - 1); }
        else if (!dec && e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
        else if (!dec && e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
      });
    });
    go(0);
  };

  /* ---------- 채점 ---------- */
  function okBox(inp) {
    var v = inp.value, a = inp.getAttribute('data-ans'), k = inp.dataset.kind, p = +inp.dataset.p || 0;
    if (k === 'carry') return (v === '' ? '' : String(+v === 0 ? '' : +v)) === a; // 받아올림 없음 = 빈칸 또는 0
    if (k === 'exact') return v.trim() === a;
    if (k === 'dec') { var x = M.parse(v, p); return x != null && x === M.parse(a, p); }
    return v !== '' && String(parseInt(v, 10)) === a;
  }
  function paint(el, good) {
    el.style.borderColor = good ? '#22c55e' : '#ef4444';
    el.style.backgroundColor = good ? '#f0fdf4' : '#fef2f2';
  }
  M.grade = function () {
    return Array.prototype.map.call(document.querySelectorAll('.quiz-card'), function (card) {
      var ok = true;
      card.querySelectorAll('.ans-box').forEach(function (inp) {
        if (inp.dataset.kind === 'pair') return;
        var good = okBox(inp);
        if (!good) ok = false;
        if (inp.dataset.kind === 'carry' && inp.value === '' && inp.getAttribute('data-ans') === '') return; // 비워 둔 받아올림 칸은 표시하지 않음
        paint(inp, good);
      });
      // 순서가 바뀌어도 되는 두 수
      var groups = {};
      card.querySelectorAll('.ans-box[data-kind="pair"]').forEach(function (inp) { (groups[inp.dataset.g] = groups[inp.dataset.g] || []).push(inp); });
      Object.keys(groups).forEach(function (g) {
        var els = groups[g], p = +els[0].dataset.p;
        var want = els.map(function (e) { return M.parse(e.getAttribute('data-ans'), p); }).sort(function (x, y) { return x - y; });
        var got = els.map(function (e) { return M.parse(e.value, p); }).sort(function (x, y) { return x - y; });
        var good = want.every(function (w, i) { return got[i] === w; });
        if (!good) ok = false;
        els.forEach(function (e) { paint(e, good); });
      });
      card.querySelectorAll('.choice-group').forEach(function (grp) {
        var sel = grp.querySelector('.choice-btn.selected');
        var good = !!sel && sel.getAttribute('data-v') === grp.getAttribute('data-ans');
        if (!good) ok = false;
        if (sel) { sel.style.borderColor = good ? '#22c55e' : '#ef4444'; sel.style.backgroundColor = good ? '#dcfce7' : '#fee2e2'; }
        else grp.querySelectorAll('.choice-btn').forEach(function (b) { b.style.borderColor = '#ef4444'; });
      });
      card.querySelectorAll('.multi-group').forEach(function (grp) {
        var sel = Array.prototype.map.call(grp.querySelectorAll('.choice-btn.selected'), function (b) { return b.getAttribute('data-v'); }).sort().join(',');
        var good = sel === grp.getAttribute('data-ans');
        if (!good) ok = false;
        grp.style.outline = '3px solid ' + (good ? '#22c55e' : '#ef4444'); grp.style.borderRadius = '10px';
      });
      card.querySelectorAll('.pick').forEach(function (el) {
        var good = M.pickValue(el) === +el.getAttribute('data-ans');
        if (!good) ok = false;
        el.style.outline = '3px solid ' + (good ? '#22c55e' : '#ef4444');
      });
      card.style.borderColor = ok ? '#22c55e' : '#ef4444';
      card.style.boxShadow = ok ? '0 4px 12px rgba(34,197,94,.15)' : '0 4px 12px rgba(239,68,68,.15)';
      return ok;
    });
  };

  /* ---------- 정답 채우기 (검토 화면용) ---------- */
  M.fill = function (on) {
    document.querySelectorAll('#quiz .ans-box').forEach(function (inp) {
      inp.value = on ? inp.getAttribute('data-ans') : '';
      inp.style.color = on ? '#b45309' : '';
      if (inp.classList.contains('borrow')) inp.dispatchEvent(new Event('input'));
    });
    document.querySelectorAll('#quiz .choice-group').forEach(function (g) {
      g.querySelectorAll('.choice-btn').forEach(function (b) { b.classList.toggle('selected', on && b.dataset.v === g.dataset.ans); });
    });
    document.querySelectorAll('#quiz .multi-group').forEach(function (g) {
      var a = g.dataset.ans.split(',');
      g.querySelectorAll('.choice-btn').forEach(function (b) { b.classList.toggle('selected', on && a.indexOf(b.dataset.v) !== -1); });
    });
    document.querySelectorAll('#quiz .pick').forEach(function (el) {
      var st = PICKS[+el.dataset.pick];
      st.val = on ? +el.getAttribute('data-ans') : st.base;
      paintPick(el);
    });
  };
})();
