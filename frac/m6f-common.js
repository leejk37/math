/*
 * m6f-common.js — 6학년 분수 영역 공통 도우미
 *   6학년 1학기 1단원 분수의 나눗셈(M611, 6111~6115) → 6학년 2학기 1단원 분수의 나눗셈(M621, 6211~6216)
 *
 * frac/m423-common.js(화면 모양·입력칸·고르기·채점 M.*)와 frac/m5f-common.js(분수 계산·빈칸 F.*)를 그대로 쓰고,
 * 분수의 나눗셈에 필요한 것만 더합니다.  → 페이지에서 m423-common.js, m5f-common.js 다음에 불러 주세요.
 *  - 계산: G.div(나눗셈 몫, 기약분수), G.coprime
 *  - 글자: G.J(조사), G.fs(보기 버튼 안의 작은 분수), G.word(문장제 상자)
 *  - 고르기: G.speech(말풍선 고르기 — 누가 바르게 했나요?)
 *  - 두 가지 방법 상자: G.methods
 *  - 그림: G.unitBars(1을 똑같이 나눈 막대 여러 개), G.jumps(0~1 막대에서 덜어 내기·묶기), G.area(분수를 자연수로 나누는 넓이 그림)
 *
 * ※ 이 파일을 고치면 6111~6115.html, 6211~6216.html의 <script src="m6f-common.js?v=…"> 의 v 값도 바꿔 주세요.
 */
(function () {
  var css = '' +
    '.fraction .num,.fraction .den{height:auto;min-height:32px;gap:3px}' +
    '.fraction .num .ans-box,.fraction .den .ans-box{margin:1px 0}' +
    '.gbox{display:flex;flex-wrap:wrap;gap:14px 26px;justify-content:center;align-items:flex-start;width:100%}' +
    '.gpanel{flex:1 1 380px;max-width:460px;border:1.5px dashed #cbd5e1;border-radius:12px;padding:10px 12px 14px;display:flex;flex-direction:column;align-items:center;gap:10px}' +
    '.gpanel .eq{font-size:19px;gap:4px}' +
    '.gtag{align-self:flex-start;font-size:13px;font-weight:bold;color:#fff;background:#16a34a;border-radius:999px;padding:1px 10px}' +
    '.gtag.t2{background:#7c3aed}' +
    '.wrong-calc{font-size:20px;font-weight:bold;color:#b91c1c;background:#fef2f2;border:2px dashed #fca5a5;border-radius:12px;padding:8px 18px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:center}' +
    '.sub-q{font-size:16px;font-weight:bold;color:#334155;align-self:stretch;text-align:left;padding-left:8px;border-left:4px solid #93c5fd}' +
    '.frac-row{display:flex;gap:26px;justify-content:center;align-items:center;flex-wrap:wrap;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:999px;padding:8px 26px;font-size:21px;font-weight:bold}' +
    '.flow{border-collapse:collapse;font-size:18px;font-weight:bold;color:#1e293b}' +
    '.flow td{padding:6px 8px;vertical-align:middle;white-space:nowrap}' +
    '.flow td.lab{font-size:15px;color:#475569;text-align:right}' +
    '.flow td .eq{justify-content:flex-start;font-size:19px}' +
    '.choice-btn .fraction .num,.choice-btn .fraction .den{min-height:0}' +
    '.choice-btn .fraction.sm .num,.choice-btn .fraction.sm .den{height:20px;font-size:15px}' +
    '.choice-btn .mixed .whole{font-size:17px}' +
    '.why .choice-btn{text-align:left;max-width:520px;line-height:1.5}' +
    '.why{flex-direction:column;align-items:center}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var G = window.G = {};
  G.EQ = '<span class="op">=</span>';
  G.X = '<span class="op">×</span>';
  G.DV = '<span class="op">÷</span>';
  G.P = '<span class="op">+</span>';
  G.LP = '<span class="op">(</span>';
  G.RP = '<span class="op">)</span>';
  G.ARR = '<span class="op" style="color:#2563eb">→</span>';

  /* ---------- 계산 ---------- */
  G.coprime = function (a, b) { return F.gcd(a, b) === 1; };
  // 분수 a ÷ 분수 b (값 {n, d}) → 기약분수
  G.div = function (a, b) { return F.simp(a.n * b.d, a.d * b.n); };
  G.nat = function (k) { return { n: k, d: 1 }; };

  /* ---------- 글자 ---------- */
  // 조사: 분수는 분자를 마지막에 읽으므로(사분의 삼) 분자로, 자연수는 그 수로 받침을 판단
  G.J = function (s, a, b) {
    var t = String(s), k = t.indexOf('/') >= 0 ? t.split('/')[0].split(' ').pop() : t;
    return t + M.josa(k, a, b);
  };
  // '으로/로': 받침이 ㄹ(일·칠·팔)이거나 받침이 없으면 '로', 그 밖의 받침(영·삼·육·십·백)은 '으로'
  G.ro = function (s) {
    var t = String(s), k = t.indexOf('/') >= 0 ? t.split('/')[0].split(' ').pop() : t.replace(/[^0-9]/g, '');
    var last = +k[k.length - 1];
    var eu = last === 3 || last === 6 || (last === 0 && k.length > 1);
    return t + (eu ? '으로' : '로');
  };
  // '이에요/예요' (수 뒤): 3 → '3이에요', 2 → '2예요'
  G.ye = function (s) {
    var t = String(s), k = t.indexOf('/') >= 0 ? t.split('/')[0].split(' ').pop() : t;
    return t + M.josa(k, '이에요', '예요');
  };
  // 글자만: 값 → '2 1/4', '3/5', '6' (기약분수·대분수)
  G.t = function (x) { return F.st(x); };
  // 보기 버튼 안에 넣는 작은 분수 (값 → 기약 대분수 모양)
  G.fs = function (x) {
    var m = F.mixedOf(F.simp(x.n, x.d));
    if (!m.n) return String(m.w);
    var f = M.frac(m.n, m.d, true);
    return m.w ? '<span class="mixed"><span class="whole">' + m.w + '</span>' + f + '</span>' : f;
  };
  // 보기 버튼 안에 쓰는 작은 분수 (분자·분모 그대로)
  G.sf = function (n, d) { return M.frac(n, d, true); };
  G.smx = function (w, n, d) { return w ? '<span class="mixed"><span class="whole">' + w + '</span>' + M.frac(n, d, true) + '</span>' : M.frac(n, d, true); };
  // 문장제 상자
  G.word = function (text) { return '<div class="word">' + text + '</div>'; };

  /* ---------- 고르기 ---------- */
  // 말풍선 고르기: items = [[이름, 보이는 글자, 맞으면 true], ...]  (보기 순서는 섞지 않음 — 이름 순서 그대로)
  G.speech = function (items) {
    var ans = 0;
    items.forEach(function (it, i) { if (it[2]) ans = i; });
    return '<div class="choice-group speech-pick" tabindex="-1" data-ans="' + ans + '">' + items.map(function (it, i) {
      return '<button type="button" class="choice-btn" data-v="' + i + '"><span class="who">' + it[0] + '</span>' + it[1] + '</button>';
    }).join('') + '</div>';
  };
  // 이유 고르기 (긴 글 보기를 세로로): right = 맞는 글, wrongs = 틀린 글들 — 순서를 섞음
  G.why = function (right, wrongs) {
    var opts = [[0, right]].concat(wrongs.map(function (w, i) { return [i + 1, w]; }));
    M.shuffle(opts);
    return '<div class="choice-group why" tabindex="-1" data-ans="0">' + opts.map(function (o) {
      return '<button type="button" class="choice-btn" data-v="' + o[0] + '">' + o[1] + '</button>';
    }).join('') + '</div>';
  };

  /* ---------- 두 가지 방법 상자 ---------- */
  G.methods = function (l1, h1, l2, h2) {
    return '<div class="gbox"><div class="gpanel"><span class="gtag">' + l1 + '</span>' + h1 + '</div>' +
      '<div class="gpanel"><span class="gtag t2">' + l2 + '</span>' + h2 + '</div></div>';
  };

  /* ---------- 그림 ---------- */
  function svgOpen(w, h) { return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">'; }
  // SVG 안의 분수 글자 (가운데 x, 분수선 높이 y)
  function sFrac(x, y, n, d, size, color) {
    size = size || 12; color = color || '#334155';
    var w = Math.max(String(n).length, String(d).length) * size * 0.62 + 4;
    return '<text x="' + x + '" y="' + (y - 3) + '" text-anchor="middle" font-size="' + size + '" font-weight="bold" fill="' + color + '">' + n + '</text>' +
      '<line x1="' + (x - w / 2) + '" y1="' + y + '" x2="' + (x + w / 2) + '" y2="' + y + '" stroke="' + color + '" stroke-width="1.2"/>' +
      '<text x="' + x + '" y="' + (y + size + 1) + '" text-anchor="middle" font-size="' + size + '" font-weight="bold" fill="' + color + '">' + d + '</text>';
  }
  G.sFrac = sFrac;

  // 1을 d칸으로 나눈 막대 k개, 막대마다 앞 s칸 색칠 — (자연수) ÷ (자연수)에서 '1 ÷ d가 k개'를 보여 줌
  G.unitBars = function (k, d, s) {
    var W = Math.min(150, Math.floor(560 / k) - 12), H = 34, cw = W / d, h = '<div class="row" style="gap:12px">';
    for (var b = 0; b < k; b++) {
      var out = svgOpen(W + 4, H + 22);
      for (var i = 0; i < d; i++) {
        out += '<rect x="' + (2 + i * cw).toFixed(2) + '" y="2" width="' + cw.toFixed(2) + '" height="' + H + '" fill="' + (i < s ? '#93c5fd' : '#fff') + '" stroke="#64748b" stroke-width="1" stroke-dasharray="' + (i ? '4,3' : '') + '"/>';
      }
      out += '<rect x="2" y="2" width="' + W + '" height="' + H + '" fill="none" stroke="#1e293b" stroke-width="2"/>';
      out += '<text x="' + (2 + W / 2) + '" y="' + (H + 18) + '" text-anchor="middle" font-size="13" font-weight="bold" fill="#475569">1</text>';
      h += out + '</svg>';
    }
    return h + '</div>';
  };

  /* 0~1 막대(d칸)에 앞 a칸 색칠, b칸씩 묶은 곡선 표시 — (분수) ÷ (분수)에서 '몇 번 덜어 낼 수 있나'
   *  o.ticks: 아래에 k/d 눈금 글자 (d ≤ 12일 때 기본으로 표시)
   *  o.arcLabel: 곡선 위에 b/d 글자 (기본 true)
   *  o.endLabel: [n, d] — 색칠 끝에 보여 줄 분수 (예: 3/4 = 6/8 그림에서 3/4)
   */
  G.jumps = function (d, a, b, o) {
    o = o || {};
    var W = 600, L = 16, cw = (W - 2 * L) / d, top = b ? 46 : 14, H = 38, s = svgOpen(W, top + H + 46);
    for (var i = 0; i < d; i++) {
      s += '<rect x="' + (L + i * cw).toFixed(2) + '" y="' + top + '" width="' + cw.toFixed(2) + '" height="' + H + '" fill="' + (i < a ? '#fde68a' : '#fff') + '" stroke="#64748b" stroke-width="1" stroke-dasharray="' + (i ? '4,3' : '') + '"/>';
    }
    s += '<rect x="' + L + '" y="' + top + '" width="' + (d * cw).toFixed(2) + '" height="' + H + '" fill="none" stroke="#1e293b" stroke-width="2"/>';
    // 묶음 곡선
    if (b) {
      var groups = Math.floor(a / b);
      for (var g = 0; g < groups; g++) {
        var x1 = L + g * b * cw, x2 = L + (g + 1) * b * cw, mx = (x1 + x2) / 2;
        s += '<path d="M' + x1.toFixed(1) + ' ' + (top - 2) + ' Q' + mx.toFixed(1) + ' ' + (top - 30) + ' ' + x2.toFixed(1) + ' ' + (top - 2) + '" fill="none" stroke="#2563eb" stroke-width="1.8" stroke-dasharray="4,3"/>';
        if (o.arcLabel !== false) s += '<rect x="' + (mx - 11).toFixed(1) + '" y="' + (top - 40) + '" width="22" height="30" fill="#fff"/>' + sFrac(mx, top - 25, b, d, 11, '#1d4ed8');
      }
    }
    // 아래 눈금
    var showTicks = o.ticks != null ? o.ticks : d <= 12;
    for (var t = 0; t <= d; t++) {
      var x = L + t * cw;
      s += '<line x1="' + x.toFixed(1) + '" y1="' + (top + H) + '" x2="' + x.toFixed(1) + '" y2="' + (top + H + 6) + '" stroke="#1e293b" stroke-width="1.2"/>';
      if (t === 0 || t === d) s += '<text x="' + x.toFixed(1) + '" y="' + (top + H + 22) + '" text-anchor="middle" font-size="14" font-weight="bold" fill="#1e293b">' + (t ? 1 : 0) + '</text>';
      else if (showTicks) s += sFrac(x, top + H + 21, t, d, 11);
    }
    if (o.endLabel) {
      var ex = L + a * cw;
      s += '<line x1="' + ex.toFixed(1) + '" y1="' + (top - 4) + '" x2="' + ex.toFixed(1) + '" y2="' + (top + H + 4) + '" stroke="#db2777" stroke-width="2.2"/>';
      s += '<rect x="' + (ex - 13).toFixed(1) + '" y="' + (top - 42) + '" width="26" height="32" fill="#fff"/>' + sFrac(ex, top - 26, o.endLabel[0], o.endLabel[1], 12, '#db2777');
    }
    return s + '</svg>';
  };

  /* (분수) ÷ (자연수) 넓이 그림: 1을 d줄로 나눈 사각형에서 아래 n줄 색칠, 세로로 k등분해 첫 칸에 빗금 */
  G.area = function (n, d, k) {
    var W = 240, H = 168, L = 34, T = 8, rh = H / d, cw = W / k;
    var s = svgOpen(L + W + 12, T + H + 30) + '<defs><pattern id="hatch6" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="7" stroke="#dc2626" stroke-width="2"/></pattern></defs>';
    s += '<rect x="' + L + '" y="' + (T + H - n * rh) + '" width="' + W + '" height="' + (n * rh) + '" fill="#fbcfe8"/>';
    s += '<rect x="' + L + '" y="' + (T + H - n * rh) + '" width="' + cw + '" height="' + (n * rh) + '" fill="url(#hatch6)" stroke="#dc2626" stroke-width="2"/>';
    for (var r = 1; r < d; r++) s += '<line x1="' + L + '" y1="' + (T + r * rh) + '" x2="' + (L + W) + '" y2="' + (T + r * rh) + '" stroke="#64748b" stroke-width="1" stroke-dasharray="4,3"/>';
    for (var c = 1; c < k; c++) s += '<line x1="' + (L + c * cw) + '" y1="' + T + '" x2="' + (L + c * cw) + '" y2="' + (T + H) + '" stroke="#1e293b" stroke-width="1.4" stroke-dasharray="6,3"/>';
    s += '<rect x="' + L + '" y="' + T + '" width="' + W + '" height="' + H + '" fill="none" stroke="#1e293b" stroke-width="2"/>';
    s += '<text x="' + (L - 6) + '" y="' + (T + 6) + '" text-anchor="end" font-size="13" font-weight="bold" fill="#334155">1</text>';
    s += '<text x="' + (L - 6) + '" y="' + (T + H + 4) + '" text-anchor="end" font-size="13" font-weight="bold" fill="#334155">0</text>';
    s += sFrac(L - 14, T + H - n * rh + 2, n, d, 11, '#be185d');
    for (c = 0; c < k; c++) s += sFrac(L + (c + 0.5) * cw, T + H + 14, 1, k, 10, c ? '#94a3b8' : '#dc2626');
    return s + '</svg>';
  };

  /* ---------- 문제 만들기 ---------- */
  // 기약 진분수 (분모 lo~hi)
  G.proper = function (lo, hi) { return F.proper(lo, hi); };
  // 서로소인 두 수 (a < b 또는 a > b 조건은 test로)
  G.pair = function (alo, ahi, blo, bhi, test) {
    return F.gen(function () { return [M.rand(alo, ahi), M.rand(blo, bhi)]; }, function (p) { return G.coprime(p[0], p[1]) && (!test || test(p)); });
  };
})();
