/*
 * m524-common.js — 5학년 2학기 4단원 '소수의 곱셈'(M524, 5241~5247) 페이지 공통 도우미
 *
 * frac/m423-common.js(4학년 소수: 카드·입력칸·고르기·채점)와 frac/m5f-common.js(분수 빈칸 F.fin 등)를
 * 그대로 쓰고, 소수의 곱셈에 필요한 것만 더합니다.  → 페이지에서 m423-common.js, m5f-common.js 다음에 불러 주세요.
 *  - 어림 고르기(D.est), 곱셈 세로셈 보기 + 답칸(D.vmul)
 *  - 자연수의 곱셈을 이용하는 화살표 표(D.arrows): 8 × 7 = 56 → 1/10배, 1/10배 → 1/100배 → 0.8 × 0.7 = 0.56
 *  - 그림: 0.1 막대 묶음(D.tenthGroups), 1과 0.1 막대(D.unitBars), 몇 배 수직선(D.mulLine)
 *  - 모눈 직사각형 색칠(D.rectPick): 왼쪽 아래 모서리부터 누른 칸까지 직사각형으로 색칠 → 가로·세로를 채점
 *  - M.grade / M.fill 을 넓혀 모눈 색칠도 채점·정답 채우기에 넣습니다. (페이지는 그대로 M.grade, 검토 화면은 M.fill)
 *
 * 수는 m423과 같이 '가장 작은 자리 단위의 정수'로 다룹니다.  예) 0.42 → (42, 2)   곱은 (a×b, pa+pb)
 *
 * ※ 이 파일을 고치면 5241~5247.html의 <script src="m524-common.js?v=…"> 의 v 값도 바꿔 주세요.
 */
(function () {
  var css = '' +
    '.fraction .num,.fraction .den{height:auto;min-height:32px;gap:3px}' +
    '.fraction .num .ans-box,.fraction .den .ans-box{margin:1px 0}' +
    '.vmul{display:inline-flex;flex-direction:column;align-items:flex-end;font-family:"Courier New",Courier,monospace;font-size:24px;font-weight:bold;color:#1e293b;padding:4px 10px;letter-spacing:3px}' +
    '.vmul .vr{white-space:pre;line-height:1.35}' +
    '.vmul .vline{align-self:stretch;height:2.5px;background:#1e293b;margin:3px 0 6px}' +
    '.vmul .ans-box{letter-spacing:0;font-family:"Courier New",Courier,monospace}' +
    '.arr{border-collapse:collapse;font-size:21px;font-weight:bold;color:#1e293b}' +
    '.arr td{padding:2px 6px;text-align:center;vertical-align:middle;white-space:nowrap}' +
    '.arr td.ar{font-size:14px;color:#db2777;line-height:1.2}' +
    '.arr td.ar .fraction .num,.arr td.ar .fraction .den{min-height:0}' +
    '.arr .choice-group{flex-wrap:nowrap;gap:4px}' +
    '.arr .choice-btn{padding:2px 6px;font-size:13px;min-width:0}' +
    '.bae .fraction .num,.bae .fraction .den{font-size:13px;height:16px;min-height:0;min-width:0;padding:0 2px}' +
    '.bae .fraction .frac-line{height:1.5px}' +
    '.mbox{display:flex;flex-wrap:wrap;gap:14px 26px;justify-content:center;align-items:flex-start;width:100%}' +
    '.mpanel{flex:1 1 380px;max-width:460px;border:1.5px dashed #cbd5e1;border-radius:12px;padding:10px 12px 14px;display:flex;flex-direction:column;align-items:center;gap:10px}' +
    '.ans-box[data-kind="int"][maxlength="3"]{width:54px}' +
    '.ans-box[data-kind="int"][maxlength="4"]{width:66px}' +
    '.ans-box[data-kind="int"][maxlength="5"]{width:78px}' +
    '.mpanel .eq{font-size:19px;gap:4px}' +
    '.mpanel .eq .ans-box.dec{width:72px}' +
    '.mtag{align-self:flex-start;font-size:13px;font-weight:bold;color:#fff;background:#16a34a;border-radius:999px;padding:1px 10px}' +
    '.rpick{display:inline-block;cursor:pointer}' +
    '.rpick rect.c{transition:fill .1s}' +
    '.fk-locked .rpick{pointer-events:none}' +
    '.rule-tbl{border-collapse:collapse;font-size:20px;font-weight:bold;color:#1e293b}' +
    '.rule-tbl td{padding:4px 8px;white-space:nowrap}' +
    '.rule-tbl td.l{text-align:right}' +
    '.oxp{display:flex;gap:16px;align-items:center;justify-content:center;flex-wrap:wrap}' +
    '.sign{border:3px solid #94a3b8;background:#fff;border-radius:10px;padding:6px 16px;font-size:26px;font-weight:bold;color:#1e293b}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var D = window.D = {};
  var EQ = '<span style="margin:0 4px">=</span>';
  D.EQ = EQ;

  // 0이 아닌 끝자리를 가진 소수 만들기: 정수부 lo~hi, 소수 p자리
  D.dec = function (lo, hi, p) {
    var n;
    do { n = M.rand(lo, hi) * M.pow(p) + M.rand(0, M.pow(p) - 1); } while (n % 10 === 0 || n === 0);
    return n;
  };
  D.f = function (n, p) { return M.fmt(n, p); };

  /* ---------- 어림 ---------- */
  // 곱 v(10^-p 단위)의 크기를 어림: 가장 큰 자리에서 반올림한 값, 그 10배, 그 1/10 중 고르기
  D.est = function (v, p, unit) {
    var d = String(v).length, base = Math.pow(10, d - 1), r = Math.round(v / base) * base;
    var opts = [r * 100, r * 10, r].map(function (x) { return M.fmt0(x, p + 1); });
    var ans = opts[1];
    return M.choices(ans, M.shuffle(opts.slice()).map(function (o) { return [o, '약 ' + o + (unit ? ' ' + unit : '')]; }));
  };

  /* ---------- 세로셈(보기) + 답칸 ---------- */
  // 둘째 줄은 '×'를 맨 앞에, 수는 오른쪽 맞춤 (교과서처럼 끝자리를 맞춤)
  D.vmul = function (a, pa, b, pb) {
    var A = M.fmt(a, pa), B = M.fmt(b, pb);
    var w = Math.max(A.length, B.length) + 2;
    function pad(s, n) { while (s.length < n) s = ' ' + s; return s; }
    return '<div class="vmul"><div class="vr">' + pad(A, w) + '</div><div class="vr">×' + pad(B, w - 1) + '</div>' +
      '<div class="vline"></div><div class="vr">' + M.dbox(a * b, pa + pb) + '</div></div>';
  };

  /* ---------- 몇 배 고르기 ---------- */
  // shift: 0이면 1배(쓰지 않음), 1 → 1/10배, 2 → 1/100배, 3 → 1/1000배.  고르기 보기는 1/10, 1/100, 1/1000
  D.baeLabel = function (shift) { return '<span class="bae">' + M.frac(1, Math.pow(10, shift), true) + '</span>배'; };
  D.baePick = function (shift) {
    return M.choices(String(shift), [1, 2, 3].map(function (s) { return [String(s), D.baeLabel(s)]; }));
  };

  /* ---------- 자연수의 곱셈을 이용하는 화살표 표 ----------
   * o = { A, pa, B, pb, topBox: 자연수 곱도 빈칸으로(두 가지 방법 문제), pick: 결과 쪽 '몇 배'를 고르게 함 }
   *   위: (A의 숫자만) × (B의 숫자만) = 자연수 곱       아래: 소수 × 소수 = □
   */
  D.arrows = function (o) {
    var P = o.A * o.B, shift = o.pa + o.pb;
    var top = '<tr><td>' + o.A + '</td><td>×</td><td>' + o.B + '</td><td>=</td><td>' + (o.topBox ? M.box(P) : P) + '</td></tr>';
    function ar(p) { return p ? '↓ ' + D.baeLabel(p) : ''; }
    var mid = '<tr><td class="ar">' + ar(o.pa) + '</td><td></td><td class="ar">' + ar(o.pb) + '</td><td></td><td class="ar">' +
      (o.pick ? '<div style="display:flex;align-items:center;gap:4px;justify-content:center">↓ ' + D.baePick(shift) + '</div>' : ar(shift)) + '</td></tr>';
    var bot = '<tr><td>' + M.fmt(o.A, o.pa) + '</td><td>×</td><td>' + M.fmt(o.B, o.pb) + '</td><td>=</td><td>' + M.dbox(P, shift) + '</td></tr>';
    return '<table class="arr">' + top + mid + bot + '</table>';
  };

  /* ---------- 두 가지 방법 상자 ---------- */
  D.methods = function (left, right) {
    return '<div class="mbox"><div class="mpanel"><span class="mtag">방법 ① 분수의 곱셈</span>' + left + '</div>' +
      '<div class="mpanel"><span class="mtag" style="background:#7c3aed">방법 ② 자연수의 곱셈</span>' + right + '</div></div>';
  };

  /* ---------- 그림 ---------- */
  function svgOpen(w, h) { return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">'; }
  // 0.a 막대 n묶음 (한 칸 = 0.1)
  D.tenthGroups = function (a, n) {
    var cw = Math.min(22, Math.floor(600 / (n * a + n))), gap = cw, H = 34;
    var W = n * a * cw + (n - 1) * gap + 8, s = svgOpen(W, H + 28), x = 4;
    for (var g = 0; g < n; g++) {
      var gx = x;
      for (var k = 0; k < a; k++) {
        s += '<rect x="' + x + '" y="22" width="' + cw + '" height="' + H + '" fill="#fde68a" stroke="#92400e" stroke-width="1" stroke-dasharray="' + (k ? '3,2' : '') + '"/>';
        x += cw;
      }
      s += '<rect x="' + gx + '" y="22" width="' + (a * cw) + '" height="' + H + '" fill="none" stroke="#92400e" stroke-width="2"/>';
      s += '<text x="' + (gx + a * cw / 2) + '" y="15" text-anchor="middle" font-size="13" font-weight="bold" fill="#475569">' + M.fmt(a, 1) + '</text>';
      x += gap;
    }
    return s + '</svg>';
  };
  // a.b 막대 n개 (0부터 max까지 눈금, 1까지 분홍, 0.1칸 b개 진하게)
  D.unitBars = function (x, n) {
    var a = Math.floor(x / 10), b = x % 10, max = a + 1, uw = Math.min(110, Math.floor(260 / max)), H = 26;
    var one = function () {
      var W = max * uw + 20, s = svgOpen(W, H + 30);
      for (var u = 0; u <= max; u++) s += '<text x="' + (10 + u * uw) + '" y="12" text-anchor="middle" font-size="12" fill="#334155">' + u + '</text>';
      s += '<rect x="10" y="18" width="' + (max * uw) + '" height="' + H + '" fill="#fff" stroke="#1e293b" stroke-width="1.5"/>';
      s += '<rect x="10" y="18" width="' + (a * uw) + '" height="' + H + '" fill="#f9a8d4" stroke="#1e293b" stroke-width="1"/>';
      for (var k = 0; k < b; k++) s += '<rect x="' + (10 + a * uw + k * uw / 10) + '" y="18" width="' + (uw / 10) + '" height="' + H + '" fill="#f9a8d4"/>';
      for (var t = 1; t < max * 10; t++) {
        if (t % 10 === 0) { s += '<line x1="' + (10 + t * uw / 10) + '" y1="18" x2="' + (10 + t * uw / 10) + '" y2="' + (18 + H) + '" stroke="#1e293b" stroke-width="1.5"/>'; continue; }
        if (t < a * 10) continue;
        s += '<line x1="' + (10 + t * uw / 10) + '" y1="18" x2="' + (10 + t * uw / 10) + '" y2="' + (18 + H) + '" stroke="#475569" stroke-width="1" stroke-dasharray="2,2"/>';
      }
      return s + '</svg>';
    };
    var h = '<div class="row" style="gap:10px">';
    for (var i = 0; i < n; i++) h += one();
    return h + '</div>';
  };
  // (자연수) × (소수) 수직선: 위 띠는 n의 크기(0, n, 2n …), 아래는 몇 배(0, 1, 2 …).  x: 곱하는 소수(0.1 단위)
  D.mulLine = function (n, x) {
    var max = Math.floor(x / 10) + 1, W = 600, L = 20, step = (W - 2 * L) / (max * 10), s = svgOpen(W, 118);
    // 위 띠
    for (var u = 0; u <= max; u++) s += '<text x="' + (L + u * 10 * step) + '" y="14" text-anchor="middle" font-size="13" font-weight="bold" fill="#334155">' + (n * u) + '</text>';
    s += '<rect x="' + L + '" y="22" width="' + (x * step) + '" height="28" fill="#bfdbfe"/>';
    s += '<rect x="' + L + '" y="22" width="' + (max * 10 * step) + '" height="28" fill="none" stroke="#1e293b" stroke-width="1.5"/>';
    for (var t = 1; t < max * 10; t++) {
      var tx = L + t * step;
      s += '<line x1="' + tx + '" y1="22" x2="' + tx + '" y2="50" stroke="' + (t % 10 ? '#64748b' : '#1e293b') + '" stroke-width="' + (t % 10 ? 1 : 1.8) + '"' + (t % 10 ? ' stroke-dasharray="3,3"' : '') + '/>';
    }
    // 아래 수직선 (몇 배)
    s += '<line x1="' + L + '" y1="78" x2="' + (W - L) + '" y2="78" stroke="#1e293b" stroke-width="2"/>';
    for (t = 0; t <= max * 10; t++) {
      tx = L + t * step;
      var big = t % 10 === 0, mid = t % 5 === 0;
      s += '<line x1="' + tx + '" y1="' + (78 - (big ? 8 : mid ? 6 : 4)) + '" x2="' + tx + '" y2="' + (78 + (big ? 8 : mid ? 6 : 4)) + '" stroke="#1e293b" stroke-width="' + (big ? 2 : 1) + '"/>';
      if (big) s += '<text x="' + tx + '" y="104" text-anchor="middle" font-size="13" font-weight="bold" fill="#1e293b">' + (t / 10) + '</text>';
    }
    var mx = L + x * step;
    s += '<line x1="' + mx + '" y1="50" x2="' + mx + '" y2="78" stroke="#db2777" stroke-width="2" stroke-dasharray="4,3"/>';
    s += '<circle cx="' + mx + '" cy="78" r="5" fill="#db2777"/><text x="' + mx + '" y="104" text-anchor="middle" font-size="13" font-weight="bold" fill="#db2777">' + M.fmt(x, 1) + '</text>';
    s += '<text x="' + (W - L) + '" y="70" text-anchor="end" font-size="11" fill="#64748b">(몇 배)</text>';
    return s + '</svg>';
  };

  /* ---------- 모눈 직사각형 색칠 ----------
   * cols×rows 칸 모눈(10칸 = 1).  칸을 누르면 왼쪽 아래 모서리부터 그 칸까지 직사각형으로 색칠됩니다.
   * 같은 모서리 칸을 다시 누르면 지워집니다.  정답: 가로 aw칸, 세로 ah칸
   */
  D.rectPick = function (aw, ah, cols, rows, cell) {
    var c = cell || 20, L = 22, T = 6, W = cols * c, H = rows * c;
    var s = '<div class="rpick" data-w="0" data-h="0" data-aw="' + aw + '" data-ah="' + ah + '" data-cols="' + cols + '" data-rows="' + rows + '">' + svgOpen(W + L + 10, H + T + 24);
    for (var i = 0; i < cols; i++) for (var j = 0; j < rows; j++) {
      s += '<rect class="c" data-i="' + i + '" data-j="' + j + '" x="' + (L + i * c) + '" y="' + (T + H - (j + 1) * c) + '" width="' + c + '" height="' + c + '" fill="#fff" stroke="#93c5fd" stroke-width="0.8" stroke-dasharray="2,2"/>';
    }
    for (i = 0; i <= cols; i += 10) s += '<line x1="' + (L + i * c) + '" y1="' + T + '" x2="' + (L + i * c) + '" y2="' + (T + H) + '" stroke="#2563eb" stroke-width="1.6" pointer-events="none"/>';
    for (j = 0; j <= rows; j += 10) s += '<line x1="' + L + '" y1="' + (T + H - j * c) + '" x2="' + (L + W) + '" y2="' + (T + H - j * c) + '" stroke="#2563eb" stroke-width="1.6" pointer-events="none"/>';
    for (i = 0; i <= cols; i += 10) s += '<text x="' + (L + i * c) + '" y="' + (T + H + 17) + '" text-anchor="middle" font-size="13" font-weight="bold" fill="#334155">' + (i / 10) + '</text>';
    for (j = 10; j <= rows; j += 10) s += '<text x="' + (L - 6) + '" y="' + (T + H - j * c + 5) + '" text-anchor="end" font-size="13" font-weight="bold" fill="#334155">' + (j / 10) + '</text>';
    return s + '</svg></div>';
  };
  function paintRect(el) {
    var w = +el.dataset.w, h = +el.dataset.h;
    el.querySelectorAll('rect.c').forEach(function (r) {
      r.setAttribute('fill', (+r.dataset.i < w && +r.dataset.j < h) ? '#fdba74' : '#fff');
    });
  }
  function bindRects() {
    document.querySelectorAll('.rpick').forEach(function (el) {
      if (el._bound) return;
      el._bound = true;
      el.querySelectorAll('rect.c').forEach(function (r) {
        r.addEventListener('click', function () {
          if (document.body.classList.contains('fk-locked')) return;
          var i = +r.dataset.i + 1, j = +r.dataset.j + 1;
          if (+el.dataset.w === i && +el.dataset.h === j) { i = 0; j = 0; }
          el.dataset.w = i; el.dataset.h = j;
          el.style.outline = '';
          paintRect(el);
          el.dispatchEvent(new Event('input', { bubbles: true }));
        });
      });
    });
  }

  /* ---------- M.render / M.grade / M.fill 넓히기 ---------- */
  var baseRender = M.render, baseGrade = M.grade, baseFill = M.fill;
  M.render = function (cards, hints) { baseRender(cards, hints); bindRects(); };
  M.grade = function () {
    var res = baseGrade();
    document.querySelectorAll('.quiz-card').forEach(function (card, i) {
      var any = false;
      card.querySelectorAll('.rpick').forEach(function (el) {
        any = true;
        var good = el.dataset.w === el.dataset.aw && el.dataset.h === el.dataset.ah;
        el.style.outline = '3px solid ' + (good ? '#22c55e' : '#ef4444');
        if (!good) res[i] = false;
      });
      if (any) {
        card.style.borderColor = res[i] ? '#22c55e' : '#ef4444';
        card.style.boxShadow = res[i] ? '0 4px 12px rgba(34,197,94,.15)' : '0 4px 12px rgba(239,68,68,.15)';
      }
    });
    return res;
  };
  M.fill = function (on) {
    baseFill(on);
    document.querySelectorAll('#quiz .ans-box[data-kind="pair"]').forEach(function (inp) {
      inp.value = on ? inp.getAttribute('data-ans') : '';
      inp.style.color = on ? '#b45309' : '';
    });
    document.querySelectorAll('#quiz .rpick').forEach(function (el) {
      el.dataset.w = on ? el.dataset.aw : 0; el.dataset.h = on ? el.dataset.ah : 0; paintRect(el);
    });
  };
})();
