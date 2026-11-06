/*
 * m5f-common.js — 5학년 1학기 분수 영역 공통 도우미
 *   약수와 배수(M512, 5121~5124) → 약분과 통분(M514, 5141~5146) → 분수의 덧셈과 뺄셈(M515, 5151~5156)
 *   → 5학년 2학기 분수의 곱셈(M522, 5221~5226)
 *
 * frac/m423-common.js의 화면 모양·입력칸·고르기·채점(M.box, M.choices, M.cmp, M.card, M.line, M.render, M.grade, M.fill)을
 * 그대로 쓰고, 5학년 분수에 필요한 것만 더합니다.  → 페이지에서 m423-common.js 다음에 불러 주세요.
 *  - 분수 계산: F.gcd, F.lcm, F.simp(기약분수), F.add/F.sub, F.divisors, F.mixedOf(대분수)
 *  - 빈칸 분수(F.fin): 분모를 먼저, 분자를 나중에 입력 (전체 → 부분 순서. 화면에서는 분자가 위)
 *  - 답칸(F.ans): 기약분수·대분수·자연수 모양에 맞춰 칸을 만듦
 *  - 수 여러 개 고르기(F.nums), 보기 여러 개 고르기(F.multi), 분수 막대 그림(F.bar)
 *
 * ※ 이 파일을 고치면 각 페이지의 <script src="m5f-common.js?v=…"> 의 v 값도 바꿔 주세요.
 */
(function () {
  var css = '' +
    '.fraction.fin{flex-direction:column-reverse}' +           // 분모 칸이 먼저(입력 순서), 화면은 분자가 위
    '.numpad{display:grid;grid-template-columns:repeat(auto-fill,minmax(46px,1fr));gap:6px;max-width:560px;width:100%}' +
    '.numpad .choice-btn{min-width:0;padding:6px 0;font-size:17px}' +
    '.multi-group.opts{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}' +
    '.multi-group.opts .choice-btn{padding:4px 12px}' +
    '.multi-group .choice-btn.selected{border-color:#3b82f6;background:#dbeafe;color:#1d4ed8}' +
    '.tbl{border-collapse:collapse;font-size:17px;font-weight:bold;color:#1e293b}' +
    '.tbl th,.tbl td{border:1.5px solid #cbd5e1;padding:6px 10px;text-align:center}' +
    '.tbl th{background:#f1f5f9;color:#334155;white-space:nowrap}' +
    '.prod{font-size:20px;font-weight:bold;color:#1e293b;line-height:1.9}' +
    '.word{font-size:17px;color:#1e293b;line-height:1.75;text-align:left;max-width:760px;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;padding:10px 16px;word-break:keep-all}' +
    '.mult-note{font-size:14px;color:#7c3aed;font-weight:bold}' +
    '@media (max-width:560px){.numpad{grid-template-columns:repeat(auto-fill,minmax(40px,1fr))}.tbl{font-size:15px}.tbl th,.tbl td{padding:4px 6px}}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var F = window.F = {};
  F.gcd = function (a, b) { while (b) { var t = a % b; a = b; b = t; } return a; };
  F.lcm = function (a, b) { return a / F.gcd(a, b) * b; };
  F.divisors = function (n) { var r = []; for (var d = 1; d <= n; d++) if (n % d === 0) r.push(d); return r; };
  // 분수 값 {n, d} (가분수 그대로). 기약분수로
  F.simp = function (n, d) { var g = F.gcd(n, d); return { n: n / g, d: d / g }; };
  F.add = function (a, b) { var L = F.lcm(a.d, b.d); return F.simp(a.n * L / a.d + b.n * L / b.d, L); };
  F.sub = function (a, b) { var L = F.lcm(a.d, b.d); return F.simp(a.n * L / a.d - b.n * L / b.d, L); };
  // 대분수 w n/d → 가분수 값
  F.v = function (w, n, d) { return { n: w * d + n, d: d }; };
  // 가분수 값 → {w, n, d} (n = 0이면 자연수)
  F.mixedOf = function (x) { return { w: Math.floor(x.n / x.d), n: x.n % x.d, d: x.d }; };
  F.lt = function (a, b) { return a.n * b.d < b.n * a.d; };
  F.eq = function (a, b) { return a.n * b.d === b.n * a.d; };

  /* ---------- 글자 ---------- */
  F.fr = function (n, d) { return M.frac(n, d); };
  F.mx = function (w, n, d) { return w ? M.mixed(w, n, d) : M.frac(n, d); };
  F.show = function (x) { // 값 → 기약 대분수 모양으로 보여 주기
    var m = F.mixedOf(x);
    if (!m.n) return String(m.w);
    return m.w ? M.mixed(m.w, m.n, m.d) : M.frac(m.n, m.d);
  };
  // 글자만 (보기 버튼·표 안): 3/4, 2 1/3
  F.txt = function (w, n, d) { return (w ? w + ' ' : '') + n + '/' + d; };

  /* ---------- 빈칸 ---------- */
  // 분수 빈칸: n, d 중 null인 쪽은 그대로 보여 줌. 둘 다 빈칸이면 분모 칸이 먼저
  F.fin = function (n, d) {
    var num = n == null ? '' : n, den = d == null ? '' : d;
    return '<span class="fraction fin"><span class="den">' + den + '</span><span class="frac-line"></span><span class="num">' + num + '</span></span>';
  };
  F.ff = function (n, d) { return F.fin(M.box(n), M.box(d)); };               // 분모·분자 모두 빈칸
  F.fn = function (n, d) { return F.fin(M.box(n), d); };                      // 분자만 빈칸
  F.fd = function (n, d) { return F.fin(n, M.box(d)); };                      // 분모만 빈칸
  // 답칸: 값 x를 기약분수(1보다 크면 대분수, 나누어떨어지면 자연수)로 쓰는 칸
  F.ans = function (x) {
    var m = F.mixedOf(F.simp(x.n, x.d));
    if (!m.n) return M.box(m.w);
    return m.w ? '<span class="mixed"><span class="whole">' + M.box(m.w) + '</span>' + F.ff(m.n, m.d) + '</span>' : F.ff(m.n, m.d);
  };
  // 대분수 빈칸 (자연수·분자 빈칸, 분모는 보여 줌 — 통분한 모양을 쓰는 단계용)
  F.mxn = function (w, n, d) {
    return '<span class="mixed"><span class="whole">' + M.box(w) + '</span>' + F.fn(n, d) + '</span>';
  };

  /* ---------- 고르기 ---------- */
  // 수 여러 개 고르기: nums = 보여 줄 수들, ans = 맞는 수들
  F.nums = function (nums, ans) {
    var a = ans.map(String).sort().join(',');
    return '<div class="multi-group numpad" tabindex="-1" data-ans="' + a + '">' + nums.map(function (v) {
      return '<button type="button" class="choice-btn" data-v="' + v + '">' + v + '</button>';
    }).join('') + '</div>';
  };
  // 보기 여러 개 고르기: opts = [[값, 보이는 글자], ...], ans = 맞는 값들
  F.multi = function (opts, ans) {
    var a = ans.map(String).sort().join(',');
    return '<div class="multi-group opts" tabindex="-1" data-ans="' + a + '">' + opts.map(function (o) {
      return '<button type="button" class="choice-btn" data-v="' + o[0] + '">' + o[1] + '</button>';
    }).join('') + '</div>';
  };
  // 하나 고르기 (보기 순서를 섞음): right = 맞는 보기 글자, wrongs = 틀린 보기 글자들
  F.one = function (right, wrongs) {
    var opts = [[0, right]].concat(wrongs.map(function (w, i) { return [i + 1, w]; }));
    return M.choices(0, M.shuffle(opts));
  };

  /* ---------- 그림 ---------- */
  // 분수 막대: d칸 중 앞 s칸 색칠 (w: 전체 폭)
  F.bar = function (d, s, w, color) {
    w = w || 300; var h = 34, cw = w / d, out = '<svg width="' + (w + 4) + '" height="' + (h + 4) + '" viewBox="0 0 ' + (w + 4) + ' ' + (h + 4) + '">';
    for (var i = 0; i < d; i++) out += '<rect x="' + (2 + i * cw) + '" y="2" width="' + cw + '" height="' + h + '" fill="' + (i < s ? (color || '#93c5fd') : '#fff') + '" stroke="#475569" stroke-width="1.5"/>';
    return out + '</svg>';
  };

  /* ---------- 분수의 덧셈·뺄셈 풀이 줄 ---------- */
  var OP = { '+': '<span class="op">+</span>', '-': '<span class="op">−</span>' };
  F.OP = OP;
  var EQ = '<span class="op">=</span>';
  // 자연수는 보여 주고 분자만 빈칸인 대분수 (w = 0이면 진분수)
  F.wn = function (w, n, d) { return w ? '<span class="mixed"><span class="whole">' + w + '</span>' + F.fn(n, d) + '</span>' : F.fn(n, d); };
  // 진분수 x op y 를 공통분모 L로 계산하는 줄: x op y = □/L op □/L = □/L (= 기약분수·대분수)
  F.stepsPP = function (x, y, op, L) {
    var a = x.n * L / x.d, b = y.n * L / y.d, raw = op === '+' ? a + b : a - b, res = F.simp(raw, L);
    var h = '<div class="eq">' + F.fr(x.n, x.d) + OP[op] + F.fr(y.n, y.d) + EQ + F.fn(a, L) + OP[op] + F.fn(b, L) + EQ + F.fn(raw, L);
    if (!(res.d === L && raw < L)) h += EQ + F.ans(res);
    return h + '</div>';
  };
  // 대분수 방법 1 (자연수끼리, 분수끼리): w1 x op w2 y = w1 □/L op w2 □/L = □ □/L (= 답)
  // borrow: 받아내림 줄을 하나 더 (w1−1)  (□/L) − w2 □/L
  F.stepsMM = function (w1, x, w2, y, op, L) {
    var a = x.n * L / x.d, b = y.n * L / y.d, h = '<div class="eq">' + F.mx(w1, x.n, x.d) + OP[op] + F.mx(w2, y.n, y.d) + EQ +
      F.wn(w1, a, L) + OP[op] + F.wn(w2, b, L) + EQ;
    var W = op === '+' ? w1 + w2 : w1 - w2, raw = op === '+' ? a + b : a - b;
    if (op === '-' && raw < 0) { // 받아내림
      h += '<span class="mixed"><span class="whole">' + M.box(w1 - 1) + '</span>' + F.fn(a + L, L) + '</span>' + OP['-'] + F.wn(w2, b, L) + EQ;
      W = w1 - 1 - w2; raw = a + L - b;
    }
    h += (W ? '<span class="mixed"><span class="whole">' + M.box(W) + '</span>' + F.fn(raw, L) + '</span>' : F.fn(raw, L));
    var v = F.simp(W * L + raw, L), m = F.mixedOf(v);
    if (!(raw < L && F.gcd(raw, L) === 1 && raw > 0)) h += EQ + F.ans(v);
    return h + '</div>';
  };
  // 대분수 방법 2 (가분수로 바꾸어): w1 x op w2 y = □/b op □/d = □/L op □/L = □/L = 답
  F.stepsImp = function (w1, x, w2, y, op, L) {
    var p = w1 * x.d + x.n, q = w2 * y.d + y.n, a = p * L / x.d, b = q * L / y.d, raw = op === '+' ? a + b : a - b;
    var done = raw < L && F.gcd(raw, L) === 1; // 이미 기약 진분수면 마지막 '= 답' 칸을 붙이지 않음
    return '<div class="eq">' + F.mx(w1, x.n, x.d) + OP[op] + F.mx(w2, y.n, y.d) + EQ + F.fn(p, x.d) + OP[op] + F.fn(q, y.d) + EQ +
      F.fn(a, L) + OP[op] + F.fn(b, L) + EQ + F.fn(raw, L) + (done ? '' : EQ + F.ans(F.simp(raw, L))) + '</div>';
  };
  // 식 = 답칸
  F.calc = function (left, x) { return '<div class="eq">' + left + EQ + F.ans(x) + '</div>'; };


  /* ---------- 분수의 곱셈 (M522, 5221~5226) ---------- */
  F.OP['x'] = '<span class="op">×</span>';
  // 곱 (기약분수)
  F.mul = function (a, b) { return F.simp(a.n * b.n, a.d * b.d); };
  F.nat = function (k) { return { n: k, d: 1 }; };
  // 글자만: 3/8, 1 1/5
  F.ft = function (x) { return x.n + '/' + x.d; };
  // 분수 모양 안에 식 쓰기: (3×6)/8
  F.ex = function (top, bot) { return M.frac(top, bot); };
  // □/d 칸 다음에, 약분하거나 대분수로 바꿀 수 있으면 '= 답' 칸을 하나 더 (분자만 빈칸 → 기약분수·대분수·자연수)
  F.tailN = function (raw, d) {
    var h = F.fn(raw, d);
    if (!(raw < d && F.gcd(raw, d) === 1)) h += EQ + F.ans(F.simp(raw, d));
    return h;
  };
  // 분모·분자 모두 빈칸인 곱 다음에 '= 답'
  F.tailF = function (n, d) {
    var h = F.ff(n, d);
    if (!(n < d && F.gcd(n, d) === 1)) h += EQ + F.ans(F.simp(n, d));
    return h;
  };
  // 보기 글자: 값 → '2 1/4', '3/5', '6'
  F.st = function (x) {
    var m = F.mixedOf(F.simp(x.n, x.d));
    if (!m.n) return String(m.w);
    return (m.w ? m.w + ' ' : '') + m.n + '/' + m.d;
  };

  /* ---------- 문제 만들기 도우미 ---------- */
  // 조건을 만족할 때까지 다시 뽑기
  F.gen = function (make, test) {
    for (var k = 0; k < 5000; k++) { var v = make(); if (!test || test(v)) return v; }
    throw new Error('조건에 맞는 문제를 만들지 못했습니다');
  };
  // 진분수 하나 (분모 lo~hi, 기약분수)
  F.proper = function (lo, hi) {
    return F.gen(function () { var d = M.rand(lo, hi); return { n: M.rand(1, d - 1), d: d }; }, function (x) { return F.gcd(x.n, x.d) === 1; });
  };
})();
