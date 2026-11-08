/*
 * m421-common.js — 4학년 2학기 1단원 '분수의 덧셈과 뺄셈'(M421) 공통 도우미
 *   4211 진분수의 덧셈 → 4212 대분수의 덧셈 → 4213 진분수의 뺄셈
 *   → 4214a 대분수의 뺄셈(자연수끼리·분수끼리) → 4214b 대분수의 뺄셈(가분수로 바꾸어)
 *
 * frac/m423-common.js(화면 모양·입력칸·채점)와 frac/m5f-common.js(분수 빈칸 F.fn·F.ff, 보기 F.one, F.gen)를
 * 그대로 쓰고, 4학년에 맞게 바꾼 것만 더합니다.  → 페이지에서 m423-common.js, m5f-common.js 다음에 불러 주세요.
 *  - 4학년은 분모가 같은 분수만 다루고 약분을 배우지 않으므로, 답칸(G.ans)은 약분하지 않은 모양 그대로입니다.
 *    (계산 결과가 가분수이면 대분수로 나타냄. 5학년 F.ans는 기약분수로 바꾸므로 쓰지 않음)
 *  - 분수 막대 그림: 덧셈(G.addBars, 두 가지 색), 뺄셈(G.subBar, 덜어 낸 칸에 ×)
 *
 * ※ 이 파일을 고치면 4211~4214b.html의 <script src="m421-common.js?v=…"> 의 v 값도 바꿔 주세요.
 */
(function () {
  var css = '' +
    '.fraction .num.expr{height:auto;min-height:32px;gap:4px;padding:4px 6px 6px}' +   // 분자 자리에 '□ + □' 같은 식
    '.fraction .num.expr .op{font-size:20px}' +
    '.paren{font-size:30px;font-weight:normal;color:#64748b;margin:0 1px}' +
    '.bar-legend{font-size:15px;color:#475569;font-weight:bold;display:flex;gap:16px;justify-content:center;flex-wrap:wrap}' +
    '.bar-legend i{display:inline-block;width:14px;height:14px;border:1.5px solid #475569;vertical-align:-2px;margin-right:4px}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var G = window.G = {};
  var OP = F.OP, EQ = '<span class="op">=</span>';
  G.EQ = EQ;
  G.PLUS = OP['+'];
  G.MINUS = OP['-'];

  /* ---------- 글자 ---------- */
  // 대분수(자연수가 0이면 진분수) 글자
  G.mx = function (w, n, d) { return w ? M.mixed(w, n, d) : M.frac(n, d); };
  // 보기·문장용 글자: '3/7', '2 1/5'
  G.t = function (w, n, d) { return (w ? w + ' ' : '') + n + '/' + d; };
  // 가분수 n/d → 대분수(약분 없이) 글자: '1 2/7', '5/7', '2'
  G.tm = function (n, d) {
    var w = Math.floor(n / d), r = n % d;
    if (!r) return String(w);
    return (w ? w + ' ' : '') + r + '/' + d;
  };
  // 분자 자리에 식(예: 5 − 2)을 쓴 분수
  G.exfrac = function (top, d) {
    return '<span class="fraction"><span class="num expr">' + top + '</span><span class="frac-line"></span><span class="den">' + d + '</span></span>';
  };
  G.par = function (inner) { return '<span class="paren">(</span>' + inner + '<span class="paren">)</span>'; };

  /* ---------- 답칸 (약분하지 않음) ---------- */
  // 결과 n/d (가분수일 수 있음)를 대분수로 쓰는 칸. 분모·분자 모두 빈칸 (분모끼리 더하는 실수를 찾기 위해)
  G.ans = function (n, d) {
    var w = Math.floor(n / d), r = n % d;
    if (!r) return M.box(w);
    return w ? '<span class="mixed"><span class="whole">' + M.box(w) + '</span>' + F.ff(r, d) + '</span>' : F.ff(r, d);
  };
  // 같은 칸이지만 분모는 보여 줌 (풀이 과정 줄에서)
  G.ansN = function (n, d) {
    var w = Math.floor(n / d), r = n % d;
    if (!r) return M.box(w);
    return w ? '<span class="mixed"><span class="whole">' + M.box(w) + '</span>' + F.fn(r, d) + '</span>' : F.fn(r, d);
  };
  // 식 = 답칸
  G.calc = function (left, n, d) { return '<div class="eq">' + left + EQ + G.ans(n, d) + '</div>'; };

  /* ---------- 그림 ---------- */
  var C1 = '#93c5fd', C2 = '#fdba74';
  function bar(d, fill, w) {
    var h = 34, cw = w / d, out = '<svg width="' + (w + 4) + '" height="' + (h + 4) + '" viewBox="0 0 ' + (w + 4) + ' ' + (h + 4) + '">';
    for (var i = 0; i < d; i++) {
      var x = 2 + i * cw, f = fill(i);
      out += '<rect x="' + x + '" y="2" width="' + cw + '" height="' + h + '" fill="' + (f.c || '#fff') + '" stroke="#475569" stroke-width="1.5"/>';
      if (f.x) out += '<path d="M' + (x + 5) + ' 7L' + (x + cw - 5) + ' ' + (h - 3) + 'M' + (x + cw - 5) + ' 7L' + (x + 5) + ' ' + (h - 3) + '" stroke="#dc2626" stroke-width="2.5" stroke-linecap="round"/>';
    }
    return out + '</svg>';
  }
  // 덧셈 그림: 1을 d칸으로 나눈 막대에 a칸(파랑) 다음 b칸(주황). 합이 1보다 크면 막대가 2개
  G.addBars = function (d, a, b, w, labels) {
    w = w || 320;
    var n = Math.max(1, Math.ceil((a + b) / d)), out = '<div style="display:flex;flex-direction:column;gap:6px;align-items:center">';
    for (var k = 0; k < n; k++) {
      out += bar(d, function (i) { var p = k * d + i; return { c: p < a ? C1 : (p < a + b ? C2 : '') }; }, w);
    }
    out += '</div>';
    if (labels) out += '<div class="bar-legend"><span><i style="background:' + C1 + '"></i>' + labels[0] + '</span><span><i style="background:' + C2 + '"></i>' + labels[1] + '</span></div>';
    return out;
  };
  // 뺄셈 그림: a칸 색칠, 그중 끝의 b칸에 × (덜어 냄)
  G.subBar = function (d, a, b, w) {
    return bar(d, function (i) { return { c: i < a ? C1 : '', x: i >= a - b && i < a }; }, w || 320);
  };

  /* ---------- 문제 만들기 ---------- */
  // 분모가 d인 진분수 분자 두 개 (test로 조건)
  G.pair = function (dLo, dHi, test) {
    return F.gen(function () { var d = M.rand(dLo, dHi); return { d: d, a: M.rand(1, d - 1), b: M.rand(1, d - 1) }; }, test);
  };
})();
