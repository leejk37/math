/*
 * m521-common.js — 5학년 2학기 1단원 '수의 범위와 어림하기'(M521, 5211~5217) 공통 도우미
 *
 * frac/m423-common.js의 화면 모양·입력칸·고르기·채점(M.box, M.dbox, M.choices, M.card, M.line, M.render, M.grade, M.fill)을
 * 그대로 쓰고, 이 단원에 필요한 것만 더합니다.  → 페이지에서 m423-common.js 다음에 불러 주세요.
 *  - N.line  : 수직선에 수의 범위 나타내기 (학생이 직접 그림)
 *              눈금을 누르면 ● → ○ → 지움,  선 위를 누르면 점(●·○)이나 끝까지 빨간 선이 칠해짐(다시 누르면 지움)
 *  - N.show  : 범위가 그려진 수직선 (보기용 — 읽기 문제)
 *  - N.multi : 보기 여러 개 고르기,  N.table : 표,  N.word : 문장제 상자
 *  - 어림 계산: N.up / N.down / N.round (10^k 단위),  소수는 정수 단위로 다룸 (m423과 같음)
 *
 * ※ 이 파일을 고치면 5211~5217.html의 <script src="m521-common.js?v=…"> 의 v 값도 바꿔 주세요.
 */
(function () {
  var css = '' +
    '.nl-wrap{display:flex;flex-direction:column;align-items:center;gap:4px;width:100%}' +
    // 자연수 칸 폭을 정답 자릿수에 맞춤 (어림 문제는 다섯 자리 수가 많음)
    '.ans-box[maxlength="3"]{width:58px}.ans-box[maxlength="4"]{width:70px}.ans-box[maxlength="5"]{width:84px}.ans-box[maxlength="6"]{width:96px}' +
    '.nl{max-width:100%;touch-action:manipulation;user-select:none;-webkit-user-select:none}' +
    '.nl .hit-iv,.nl .hit-tk{cursor:pointer}' +
    '.nl-tip{font-size:13px;color:#64748b}' +
    '.nl-clear{border:1.5px solid #cbd5e1;background:#fff;color:#475569;border-radius:12px;padding:2px 10px;font-size:12px;font-weight:bold;cursor:pointer;font-family:inherit}' +
    'body.fk-locked .nl-clear{display:none}' +
    '.range-label{display:inline-block;background:#fdf2f8;border:2px solid #f9a8d4;color:#9d174d;border-radius:12px;padding:4px 14px;font-size:19px;font-weight:bold}' +
    '.multi-group.opts{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}' +
    '.multi-group.opts .choice-btn{padding:5px 14px;min-width:56px}' +
    '.multi-group .choice-btn.selected{border-color:#3b82f6;background:#dbeafe;color:#1d4ed8}' +
    '.tbl{border-collapse:collapse;font-size:17px;font-weight:bold;color:#1e293b}' +
    '.tbl th,.tbl td{border:1.5px solid #cbd5e1;padding:6px 12px;text-align:center}' +
    '.tbl th{background:#f1f5f9;color:#334155;white-space:nowrap}' +
    '.tbl caption{font-size:14px;color:#475569;margin-bottom:4px}' +
    '.word{font-size:17px;color:#1e293b;line-height:1.75;text-align:left;max-width:760px;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;padding:10px 16px;word-break:keep-all}' +
    '.ride{display:inline-flex;flex-direction:column;align-items:center;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:14px;padding:6px 14px;font-size:15px;font-weight:bold;color:#1e293b;line-height:1.5}' +
    '.ride b{font-size:16px;color:#7c3aed}' +
    '@media (max-width:560px){.tbl{font-size:15px}.tbl th,.tbl td{padding:4px 6px}}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var N = window.N = {};
  var LINES = []; // 학생이 그리는 수직선들의 상태

  /* ---------- 어림 (정수에서) ---------- */
  // u = 10, 100, 1000 … (구하려는 자리의 단위)
  N.up = function (x, u) { return Math.ceil(x / u) * u; };
  N.down = function (x, u) { return Math.floor(x / u) * u; };
  N.round = function (x, u) { return Math.floor((x + u / 2) / u) * u; };
  // 소수 글자 (정수 n, 소수 p자리) — 끝자리 0도 그대로: dec(770,2)="7.70"
  N.dec = function (n, p) { return M.fmt(n, p); };
  N.PLACE = { 10: '십의 자리', 100: '백의 자리', 1000: '천의 자리', 10000: '만의 자리' };

  /* ---------- 범위 글자 ---------- */
  // r = {lo:{v, inc}|null, hi:{v, inc}|null}
  N.text = function (r) {
    var s = [];
    if (r.lo) s.push(r.lo.v + ' ' + (r.lo.inc ? '이상' : '초과'));
    if (r.hi) s.push(r.hi.v + ' ' + (r.hi.inc ? '이하' : '미만'));
    return s.join(' ') + '인 수';
  };
  N.has = function (r, x) {
    if (r.lo && (r.lo.inc ? x < r.lo.v : x <= r.lo.v)) return false;
    if (r.hi && (r.hi.inc ? x > r.hi.v : x >= r.hi.v)) return false;
    return true;
  };

  /* ---------- 수직선 ---------- */
  // opt = {from, to, every(이름 붙일 간격), unit(끝 이름 뒤 단위)}
  function geom(opt) {
    var n = opt.to - opt.from, step = Math.max(26, Math.min(46, 620 / n)), x0 = 22;
    return { n: n, step: step, x0: x0, W: x0 * 2 + n * step + (opt.unit ? 24 : 0), y: 34 };
  }
  function X(g, t) { return g.x0 + t * g.step; }
  function drawBase(opt, g) {
    var s = '<line x1="' + (g.x0 - 14) + '" y1="' + g.y + '" x2="' + (X(g, g.n) + 14) + '" y2="' + g.y + '" stroke="#1e293b" stroke-width="2"/>';
    var every = opt.every || (g.n > 12 ? 5 : 1);
    for (var t = 0; t <= g.n; t++) {
      var v = opt.from + t, big = v % every === 0, x = X(g, t).toFixed(1);
      s += '<line x1="' + x + '" y1="' + (g.y - (big ? 9 : 5)) + '" x2="' + x + '" y2="' + (g.y + (big ? 9 : 5)) + '" stroke="#1e293b" stroke-width="' + (big ? 2 : 1.2) + '"/>';
      if (big) s += '<text x="' + x + '" y="' + (g.y + 30) + '" text-anchor="middle" font-size="15" font-weight="bold" fill="#1e293b">' + v + '</text>';
    }
    if (opt.unit) s += '<text x="' + (X(g, g.n) + 22) + '" y="' + (g.y + 30) + '" font-size="14" fill="#475569">(' + opt.unit + ')</text>';
    return s;
  }
  function drawState(g, marks, shade) {
    var s = '';
    for (var k = 0; k < g.n; k++) if (shade[k])
      s += '<line x1="' + X(g, k).toFixed(1) + '" y1="' + g.y + '" x2="' + X(g, k + 1).toFixed(1) + '" y2="' + g.y + '" stroke="#ef4444" stroke-width="5" pointer-events="none"/>';
    for (var t = 0; t <= g.n; t++) if (marks[t])
      s += '<circle cx="' + X(g, t).toFixed(1) + '" cy="' + g.y + '" r="7" fill="' + (marks[t] === 1 ? '#ef4444' : '#fff') + '" stroke="#ef4444" stroke-width="2.5" pointer-events="none"/>';
    return s;
  }
  // 범위 r → 정답 상태
  function target(opt, r) {
    var g = geom(opt), marks = [], shade = [], a = 0, b = g.n - 1, t;
    for (t = 0; t <= g.n; t++) marks.push(0);
    if (r.lo) { marks[r.lo.v - opt.from] = r.lo.inc ? 1 : 2; a = r.lo.v - opt.from; }
    if (r.hi) { marks[r.hi.v - opt.from] = r.hi.inc ? 1 : 2; b = r.hi.v - opt.from - 1; }
    for (t = 0; t < g.n; t++) shade.push(t >= a && t <= b ? 1 : 0);
    return { marks: marks, shade: shade };
  }

  // 보기용: 범위 r이 그려진 수직선
  N.show = function (opt, r) {
    var g = geom(opt), T = target(opt, r);
    return '<svg class="nl" width="' + g.W + '" height="72" viewBox="0 0 ' + g.W + ' 72">' + drawBase(opt, g) + drawState(g, T.marks, T.shade) + '</svg>';
  };

  // 학생이 그리는 수직선. r = 정답 범위
  N.line = function (opt, r) {
    var id = LINES.length, g = geom(opt), T = target(opt, r), marks = [], shade = [];
    for (var t = 0; t <= g.n; t++) marks.push(0);
    for (var k = 0; k < g.n; k++) shade.push(0);
    LINES.push({ opt: opt, g: g, ans: T, marks: marks, shade: shade });
    return '<div class="nl-wrap"><div class="nl-pick" data-nl="' + id + '" tabindex="-1">' + svgOf(id) + '</div>' +
      '<div class="nl-tip">눈금을 누르면 ● → ○ → 지우기 &nbsp;·&nbsp; 선을 누르면 빨간 선 칠하기/지우기 ' +
      '<button type="button" class="nl-clear" tabindex="-1" data-nlclear="' + id + '">모두 지우기</button></div></div>';
  };
  function svgOf(id) {
    var L = LINES[id], g = L.g, s = '<svg class="nl" width="' + g.W + '" height="72" viewBox="0 0 ' + g.W + ' 72">' + drawBase(L.opt, g);
    s += '<g class="state">' + drawState(g, L.marks, L.shade) + '</g>';
    for (var k = 0; k < g.n; k++) // 선 칸 누르는 자리 (눈금 사이)
      s += '<rect class="hit-iv" data-k="' + k + '" x="' + (X(g, k) + 7).toFixed(1) + '" y="' + (g.y - 16) + '" width="' + (g.step - 14).toFixed(1) + '" height="32" fill="transparent"/>';
    for (var t = 0; t <= g.n; t++) // 눈금 누르는 자리
      s += '<rect class="hit-tk" data-t="' + t + '" x="' + (X(g, t) - 7).toFixed(1) + '" y="' + (g.y - 18) + '" width="14" height="44" fill="transparent"/>';
    return s + '</svg>';
  }
  function repaint(id) {
    var L = LINES[id], el = document.querySelector('.nl-pick[data-nl="' + id + '"] .state');
    if (el) el.innerHTML = drawState(L.g, L.marks, L.shade);
  }
  function locked() { return document.body.classList.contains('fk-locked'); }
  function clickTick(id, t) {
    var L = LINES[id];
    L.marks[t] = (L.marks[t] + 1) % 3;
  }
  // 칸 k를 누르면: 비어 있으면 양쪽으로 점(●·○)이나 끝을 만날 때까지 칠함, 칠해져 있으면 이어진 빨간 선을 지움
  function clickIv(id, k) {
    var L = LINES[id], a = k, b = k, j;
    if (L.shade[k]) {
      while (a > 0 && L.shade[a - 1] && !L.marks[a]) a--;
      while (b < L.g.n - 1 && L.shade[b + 1] && !L.marks[b + 1]) b++;
      for (j = a; j <= b; j++) L.shade[j] = 0;
    } else {
      while (a > 0 && !L.marks[a]) a--;
      while (b < L.g.n - 1 && !L.marks[b + 1]) b++;
      for (j = a; j <= b; j++) L.shade[j] = 1;
    }
  }
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest || locked()) return;
    var clr = t.closest('[data-nlclear]');
    if (clr) {
      var L0 = LINES[+clr.dataset.nlclear];
      L0.marks.fill(0); L0.shade.fill(0); repaint(+clr.dataset.nlclear);
      return;
    }
    var box = t.closest('.nl-pick');
    if (!box) return;
    var id = +box.dataset.nl;
    if (t.classList.contains('hit-tk')) clickTick(id, +t.dataset.t);
    else if (t.classList.contains('hit-iv')) clickIv(id, +t.dataset.k);
    else return;
    repaint(id);
    box.style.outline = '';
    box.dispatchEvent(new Event('input', { bubbles: true }));
  });
  function lineOk(id) {
    var L = LINES[id];
    return L.marks.join() === L.ans.marks.join() && L.shade.join() === L.ans.shade.join();
  }

  /* ---------- 고르기·표 ---------- */
  // 보기 여러 개 고르기: opts = [[값, 보이는 글자], ...], ans = 맞는 값들
  N.multi = function (opts, ans) {
    var a = ans.map(String).sort().join(',');
    return '<div class="multi-group opts" tabindex="-1" data-ans="' + a + '">' + opts.map(function (o) {
      return '<button type="button" class="choice-btn" data-v="' + o[0] + '">' + o[1] + '</button>';
    }).join('') + '</div>';
  };
  // 수만 보여 주고 여러 개 고르기
  N.nums = function (list, test) {
    return N.multi(list.map(function (v, i) { return [i, v]; }), list.map(function (v, i) { return test(v) ? i : null; }).filter(function (i) { return i !== null; }));
  };
  // 하나 고르기 (보기 순서를 섞음)
  N.one = function (right, wrongs) {
    var opts = [[0, right]].concat(wrongs.map(function (w, i) { return [i + 1, w]; }));
    return M.choices(0, M.shuffle(opts));
  };
  // 이상·이하·초과·미만 고르기 (ans: '이상' 등)
  N.WORDS = ['이상', '이하', '초과', '미만'];
  N.word4 = function (ans, only) {
    var ws = only || N.WORDS;
    return M.choices(ws.indexOf(ans), ws.map(function (w, i) { return [i, w]; }));
  };
  // 올림·버림·반올림 고르기
  N.METHODS = ['올림', '버림', '반올림'];
  N.method = function (ans) { return M.choices(N.METHODS.indexOf(ans), N.METHODS.map(function (w, i) { return [i, w]; })); };
  // 표: head = 첫 줄 글자들, rows = 다음 줄들 (각 줄 첫 칸은 머리)
  N.table = function (head, rows, caption) {
    var h = '<table class="tbl">' + (caption ? '<caption>' + caption + '</caption>' : '') + '<tr>' + head.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr>';
    rows.forEach(function (r) { h += '<tr>' + r.map(function (c, i) { return i ? '<td>' + c + '</td>' : '<th>' + c + '</th>'; }).join('') + '</tr>'; });
    return h + '</table>';
  };
  // 한글 낱말 뒤 조사: 마지막 글자에 받침이 있으면 a, 없으면 b
  N.josa = function (w, a, b) {
    var c = String(w).charCodeAt(String(w).length - 1) - 0xAC00;
    return c >= 0 && c <= 11171 && c % 28 ? a : b;
  };
  N.word = function (text) { return '<div class="word">' + text + '</div>'; };
  N.gen = function (make, test) {
    for (var k = 0; k < 5000; k++) { var v = make(); if (!test || test(v)) return v; }
    throw new Error('조건에 맞는 문제를 만들지 못했습니다');
  };
  // 서로 다른 수 k개
  N.distinct = function (k, make) {
    var out = [], guard = 0;
    while (out.length < k && guard++ < 5000) { var v = make(); if (out.indexOf(v) === -1) out.push(v); }
    return out;
  };

  /* ---------- 채점·정답 채우기에 수직선 더하기 ---------- */
  var baseReset = M.reset;
  M.reset = function () { LINES = []; baseReset(); };
  var baseGrade = M.grade;
  M.grade = function () {
    var res = baseGrade();
    document.querySelectorAll('.quiz-card').forEach(function (card, i) {
      var ok = true;
      card.querySelectorAll('.nl-pick').forEach(function (el) {
        var good = lineOk(+el.dataset.nl);
        if (!good) ok = false;
        el.style.outline = '3px solid ' + (good ? '#22c55e' : '#ef4444'); el.style.borderRadius = '10px';
      });
      if (!ok && res[i]) {
        res[i] = false;
        card.style.borderColor = '#ef4444';
        card.style.boxShadow = '0 4px 12px rgba(239,68,68,.15)';
      }
    });
    return res;
  };
  var baseFill = M.fill;
  M.fill = function (on) {
    baseFill(on);
    LINES.forEach(function (L, id) {
      for (var t = 0; t < L.marks.length; t++) L.marks[t] = on ? L.ans.marks[t] : 0;
      for (var k = 0; k < L.shade.length; k++) L.shade[k] = on ? L.ans.shade[k] : 0;
      repaint(id);
    });
  };
})();
