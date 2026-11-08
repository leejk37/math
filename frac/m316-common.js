/*
 * m316-common.js — 3학년 1학기 6단원 '분수와 소수'(M316, 3161~3169) 그림 도우미
 *
 * frac/m423-common.js(화면 모양·입력칸·고르기·채점·글 속 분수 표기)와 frac/m5f-common.js(분수 빈칸 F.ff·F.fn, F.multi)를
 * 그대로 쓰고, 3학년 분수에 필요한 '똑같이 나눈 도형' 그림만 더합니다.  → m423-common.js, m5f-common.js 다음에 불러 주세요.
 *
 *  - S.circle(d, shade, opt)  원을 d조각 (opt.angles: 조각 크기를 다르게 — 똑같이 나누지 않은 그림)
 *  - S.rect(d, shade, opt)    직사각형을 세로로 d칸 (opt.widths: 칸 너비를 다르게)
 *  - S.poly(n, shade, opt)    정n각형을 가운데에서 n조각 (n = 4이면 정사각형을 대각선으로)
 *  - S.bar(d, shade, opt)     가로 막대 d칸 (opt.w 너비, opt.label: 0과 1 표시)
 *  shade: 앞에서부터 색칠할 조각 수.  opt.pick = true 이면 색칠하기 칸(M.cellPick에 넣어 씀)
 *
 * ※ 이 파일을 고치면 3162~3169.html의 <script src="m316-common.js?v=…"> 의 v 값도 바꿔 주세요.
 */
(function () {
  var S = window.S = {};
  var FILL = '#93c5fd', LINE = '#64748b', EDGE = '#1e293b';
  function open(w, h) { return '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">'; }
  function cell(k, opt, shaded) {
    var fill = opt.pick ? '#fff' : (shaded ? (opt.color || FILL) : '#fff');
    return (opt.pick ? ' class="pick-cell" data-k="' + k + '" style="cursor:pointer"' : '') + ' fill="' + fill + '" stroke="' + LINE + '" stroke-width="1.3" stroke-dasharray="5,3"';
  }
  function pt(cx, cy, r, deg) { var a = deg * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
  function f(n) { return n.toFixed(2); }

  // 원: angles(각 조각의 각도, 합 360)를 주면 똑같지 않게 나눈 원
  S.circle = function (d, shade, opt) {
    opt = opt || {};
    var size = opt.size || 170, r = size / 2 - 4, c = size / 2, s = open(size, size), a0 = -90;
    var angles = opt.angles || Array.apply(null, Array(d)).map(function () { return 360 / d; });
    if (angles.length === 1) {
      s += '<circle cx="' + c + '" cy="' + c + '" r="' + r + '"' + cell(0, opt, shade > 0) + '/>';
    } else angles.forEach(function (ang, k) {
      var p0 = pt(c, c, r, a0), p1 = pt(c, c, r, a0 + ang);
      s += '<path d="M' + c + ' ' + c + 'L' + f(p0[0]) + ' ' + f(p0[1]) + 'A' + r + ' ' + r + ' 0 ' + (ang > 180 ? 1 : 0) + ' 1 ' + f(p1[0]) + ' ' + f(p1[1]) + 'Z"' + cell(k, opt, k < shade) + '/>';
      a0 += ang;
    });
    return s + '<circle cx="' + c + '" cy="' + c + '" r="' + r + '" fill="none" stroke="' + EDGE + '" stroke-width="2.5" pointer-events="none"/></svg>';
  };

  // 직사각형: 세로로 d칸 (widths: 각 칸 너비 비율)
  S.rect = function (d, shade, opt) {
    opt = opt || {};
    var W = opt.w || 220, H = opt.h || 130, s = open(W + 4, H + 4), x = 2;
    var ws = opt.widths || Array.apply(null, Array(d)).map(function () { return 1; });
    var tot = ws.reduce(function (a, b) { return a + b; }, 0);
    ws.forEach(function (wv, k) {
      var cw = W * wv / tot;
      s += '<rect x="' + f(x) + '" y="2" width="' + f(cw) + '" height="' + H + '"' + cell(k, opt, k < shade) + '/>';
      x += cw;
    });
    return s + '<rect x="2" y="2" width="' + W + '" height="' + H + '" fill="none" stroke="' + EDGE + '" stroke-width="2.5" pointer-events="none"/></svg>';
  };

  // 정n각형을 가운데 점에서 꼭짓점으로 나눈 n조각. off: 가운데 점을 옮겨 똑같지 않게
  S.poly = function (n, shade, opt) {
    opt = opt || {};
    var size = opt.size || 170, r = size / 2 - 6, c = size / 2, s = open(size, size);
    var start = n === 4 ? -135 : -90, vs = [];
    for (var i = 0; i < n; i++) vs.push(pt(c, c, r, start + 360 * i / n));
    var cx = c + (opt.off ? opt.off[0] : 0), cy = c + (opt.off ? opt.off[1] : 0);
    for (var k = 0; k < n; k++) {
      var a = vs[k], b = vs[(k + 1) % n];
      s += '<path d="M' + f(cx) + ' ' + f(cy) + 'L' + f(a[0]) + ' ' + f(a[1]) + 'L' + f(b[0]) + ' ' + f(b[1]) + 'Z"' + cell(k, opt, k < shade) + '/>';
    }
    return s + '<polygon points="' + vs.map(function (v) { return f(v[0]) + ',' + f(v[1]); }).join(' ') + '" fill="none" stroke="' + EDGE + '" stroke-width="2.5" pointer-events="none"/></svg>';
  };

  // 가로 막대 d칸 (label: 아래에 0과 1)
  S.bar = function (d, shade, opt) {
    opt = opt || {};
    var W = opt.w || 360, H = opt.h || 38, cw = W / d, s = open(W + 24, H + (opt.label ? 28 : 6));
    for (var k = 0; k < d; k++) s += '<rect x="' + f(12 + k * cw) + '" y="3" width="' + f(cw) + '" height="' + H + '"' + cell(k, opt, k < shade) + '/>';
    s += '<rect x="12" y="3" width="' + W + '" height="' + H + '" fill="none" stroke="' + EDGE + '" stroke-width="2.5" pointer-events="none"/>';
    if (opt.label) s += '<text x="12" y="' + (H + 22) + '" font-size="14" text-anchor="middle" fill="#334155">0</text><text x="' + (W + 12) + '" y="' + (H + 22) + '" font-size="14" text-anchor="middle" fill="#334155">1</text>';
    return s + '</svg>';
  };

  // 여러 칸짜리 막대 (0~max, 한 칸 1/d) — 1보다 큰 소수(3168·3169)용. 1마다 굵은 선과 수
  S.longBar = function (max, d, shade, opt) {
    opt = opt || {};
    var W = opt.w || 600, H = 36, n = max * d, cw = W / n, s = open(W + 24, H + 28);
    for (var k = 0; k < n; k++) s += '<rect x="' + f(12 + k * cw) + '" y="3" width="' + f(cw) + '" height="' + H + '"' + cell(k, opt, k < shade) + ' stroke-width="0.8"/>';
    for (var j = 0; j <= max; j++) {
      var x = 12 + j * d * cw;
      s += '<line x1="' + f(x) + '" y1="3" x2="' + f(x) + '" y2="' + (H + 3) + '" stroke="' + EDGE + '" stroke-width="2.2" pointer-events="none"/>' +
        '<text x="' + f(x) + '" y="' + (H + 22) + '" font-size="14" font-weight="bold" text-anchor="middle" fill="#334155">' + j + '</text>';
    }
    return s + '<rect x="12" y="3" width="' + W + '" height="' + H + '" fill="none" stroke="' + EDGE + '" stroke-width="2.2" pointer-events="none"/></svg>';
  };

  // 아무 도형이나 d조각으로 (분모에 맞는 도형을 골라 줌)
  S.any = function (d, shade, opt) {
    var kinds = ['circle', 'rect'];
    if (d >= 3 && d <= 8) kinds.push('poly');
    var k = (opt && opt.kind) || M.pick(kinds);
    return k === 'circle' ? S.circle(d, shade, opt) : k === 'rect' ? S.rect(d, shade, opt) : S.poly(d, shade, opt);
  };
  // 똑같이 나누지 않은 그림 (d조각)
  S.unequal = function (d, kind, opt) {
    opt = opt || {};
    function o(extra) { var r = {}; for (var k in opt) r[k] = opt[k]; for (var e in extra) r[e] = extra[e]; return r; }
    if (kind === 'circle') {
      var big = 360 / d * 1.6, rest = (360 - big) / (d - 1), arr = [big];
      for (var i = 1; i < d; i++) arr.push(rest);
      return S.circle(d, 0, o({ angles: M.shuffle(arr) }));
    }
    if (kind === 'poly') { var sz = (opt.size || 170) / 170; return S.poly(d, 0, o({ off: [M.pick([-1, 1]) * 22 * sz, M.pick([-1, 1]) * 14 * sz] })); }
    var ws = []; for (var j = 0; j < d; j++) ws.push(j % 2 ? 1 : 1.9);
    return S.rect(d, 0, o({ widths: M.shuffle(ws) }));
  };
  // '…으로/로' (3으로, 4로, 7로)
  S.ro = function (n) { return [0, 3, 6].indexOf(n % 10) !== -1 ? '으로' : '로'; };
})();
