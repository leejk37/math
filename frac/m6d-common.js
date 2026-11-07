/*
 * m6d-common.js — 6학년 '소수의 나눗셈' 페이지 공통 도우미
 *   1학기 3단원 소수의 나눗셈(M613, 6131~6137) → 2학기 2단원 소수의 나눗셈(M622, 6221~6226)
 *
 * frac/m423-common.js(카드·입력칸·고르기·채점), frac/m5f-common.js(분수 빈칸 F.fin, 여러 개 고르기 F.multi),
 * frac/m524-common.js(어림 고르기 D.est, '몇 배' 고르기 D.baePick)를 그대로 쓰고, 소수의 나눗셈에 필요한 것만 더합니다.
 *   → 페이지에서 m423-common.js, m5f-common.js, m524-common.js 다음에 불러 주세요.
 *
 *  - 세로 나눗셈(D.vdiv): 몫 칸 → 빼는 수 줄 → 남은 수(내린 수까지) 줄 순서로 입력.  교과서처럼
 *      · 몫의 일의 자리 앞에 오는 0은 쓰지 않고, 일의 자리 0(0.62의 0)과 소수 첫째 자리 0(1.07의 0)은 칸으로 씀
 *      · 소수점 아래에 0을 내려 계산하는 자리는 나누어지는 수에 흐린 0으로 보여 줌 (2.6 → 2.6 0)
 *      · 몫을 자연수까지만 구하는 '나누어 주고 남는 양'은 마지막 줄에 소수점까지 보여 줌 (14.5 ÷ 3 → 4 … 2.5)
 *  - 보기용 세로 나눗셈(D.vdivShow): 잘못 계산한 풀이 보여 주기 (몫만 바꾸어 보여 줄 수 있음)
 *  - 자연수의 나눗셈을 이용하는 화살표 표: D.divArrows(260 ÷ 4 = 65 → 2.6 ÷ 4 = □),
 *    D.shiftArrows(3.6 ÷ 0.2 —□배→ 36 ÷ 2 = □ → 3.6 ÷ 0.2 = □)
 *  - 몫에 소수점 찍기(D.dotPick): 숫자 사이 칸을 눌러 소수점 위치 고르기
 *  - 1과 0.1 수 모형(D.blocks), 잘못 계산한 풀이 상자(D.wrongBox), 남는 양 막대(D.takeBar)
 *
 * 수는 m423과 같이 '가장 작은 자리 단위의 정수'로 다룹니다.  예) 6.27 → (627, 2)
 *
 * ※ 이 파일을 고치면 6131~6137.html, 6221~6226.html의 <script src="m6d-common.js?v=…"> 의 v 값도 바꿔 주세요.
 */
(function () {
  var css = '' +
    '.vd td{width:30px;height:34px}' +
    '.vd td.dv{border:none;width:auto;padding:0 2px 0 6px;text-align:right;white-space:nowrap;font-size:22px}' +
    '.vd td.dv .br{display:inline-block;margin-left:3px;font-size:26px;transform:scaleY(1.25);color:#1e293b}' +
    '.vd td.bar{border-top:2.5px solid #1e293b}' +
    '.vd td.gr{color:#94a3b8}' +
    '.vd td.qd{background:#f0f9ff}' +
    '.vd td.dot{width:10px}' +
    '.vd td.e{border-color:transparent}' +
    '.vd td.e.ln,.vd td.ln{border-bottom:2.5px solid #1e293b}' +
    '.vd.show td{border-color:transparent}' +
    '.vd.show td.bar{border-top:2.5px solid #1e293b}' +
    '.vd.show td.ln{border-bottom:2px solid #1e293b}' +
    '.vd.show td.wq{color:#dc2626}' +
    '.vdlab{font-size:15px;color:#475569;font-weight:bold;margin-bottom:4px;text-align:center}' +
    '.dotpick{display:inline-flex;align-items:center;gap:0;flex-wrap:nowrap;font-size:26px;font-weight:bold;color:#1e293b;font-family:"Courier New",Courier,monospace}' +
    '.dotpick .dp-d{padding:0 2px}' +
    '.dotpick .choice-btn.dp-gap{width:22px;height:30px;min-width:0;padding:0;margin:0 1px;border:1.5px dashed #94a3b8;border-radius:6px;font-size:26px;line-height:20px;background:#fff;color:#1d4ed8}' +
    '.dotpick .choice-btn.dp-gap.selected::after{content:"."}' +
    '.wbox{border:2px solid #fca5a5;background:#fff7f7;border-radius:12px;padding:8px 16px;display:flex;flex-direction:column;align-items:center;gap:6px}' +
    '.wbox .who{font-size:13px;font-weight:bold;color:#fff;background:#ef4444;border-radius:999px;padding:1px 10px;align-self:flex-start}' +
    '.wbox .wtxt{font-size:16px;font-weight:bold;color:#7f1d1d}' +
    '.arr2{border-collapse:collapse;font-size:21px;font-weight:bold;color:#1e293b}' +
    '.arr2 td{padding:2px 6px;text-align:center;vertical-align:middle;white-space:nowrap}' +
    '.arr2 td.ar{font-size:14px;color:#db2777}' +
    '.arr2 td.ar .ans-box{width:56px;height:30px;font-size:17px}' +
    '.blk{display:inline-flex;align-items:center;justify-content:center;border:1.5px solid #1e3a8a;border-radius:3px;font-weight:bold;color:#1e3a8a;margin:2px}' +
    '.blk.one{width:40px;height:40px;background:#bfdbfe;font-size:15px}' +
    '.blk.ten{width:30px;height:24px;background:#fbcfe8;border-color:#9d174d;color:#9d174d;font-size:12px}' +
    '.blk.hun{width:24px;height:16px;background:#bbf7d0;border-color:#166534;color:#166534;font-size:9px}' +
    '.blkrow{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;max-width:720px}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var D = window.D;
  if (!D) throw new Error('m524-common.js를 먼저 불러 주세요');

  /* ---------- 세로 나눗셈 계획 ----------
   * a: 나누어지는 수(10^-pa 단위 정수), n: 나누는 수(자연수)
   * qp: 몫을 소수 몇째 자리까지 구할지 (생략하면 나누어떨어질 때까지, 최대 3자리)
   * 결과: { cols, intLen, fracLen, digs, grey[], q[](null=빈칸), rows:[{start,end,val,line,dot}] }
   */
  D.divPlan = function (a, pa, n, qp, greyInt) {
    var P = M.pow(pa), intStr = String(Math.floor(a / P)), fracStr = pa ? String(a % P).padStart(pa, '0') : '';
    if (qp == null) {
      qp = pa;
      while (qp < 4 && (a * M.pow(qp - pa)) % n !== 0) qp++;
    }
    var intLen = intStr.length, fracLen = Math.max(pa, qp);
    var digs = (intStr + fracStr + new Array(fracLen - pa + 1).join('0')).split('').map(Number);
    var grey = digs.map(function (d, i) { return i >= intLen + pa || (greyInt && i >= intLen - greyInt && i < intLen); });
    var E = intLen + qp - 1, lastReal = intLen + pa - 1, remMode = E < lastReal;
    var q = [], r = 0, started = false, ev = [];
    for (var j = 0; j <= E; j++) {
      r = r * 10 + digs[j];
      var qd = Math.floor(r / n);
      r -= qd * n;
      if (qd > 0) started = true;
      q[j] = (started || j >= intLen - 1) ? qd : null;
      if (qd > 0) ev.push({ j: j, prod: qd * n, rem: r });
    }
    function partial(rem, from, to) { var v = rem; for (var k = from; k <= to; k++) v = v * 10 + digs[k]; return v; }
    var rows = [];
    ev.forEach(function (e, i) {
      var ps = String(e.prod);
      rows.push({ start: e.j - ps.length + 1, end: e.j, val: ps, line: true, after: e.j });
      var nx = ev[i + 1];
      if (nx) {
        var v = String(partial(e.rem, e.j + 1, nx.j));
        rows.push({ start: nx.j - v.length + 1, end: nx.j, val: v, after: e.j });
      } else {
        var end = remMode ? lastReal : E;
        var s = String(partial(e.rem, e.j + 1, end));
        if (remMode) while (end - s.length + 1 > intLen - 1) s = '0' + s;   // 남는 양 0.5처럼 일의 자리부터
        rows.push({ start: end - s.length + 1, end: end, val: s, dot: remMode, after: e.j, last: true });
      }
    });
    return { cols: intLen + fracLen, intLen: intLen, fracLen: fracLen, digs: digs, grey: grey, q: q, qp: qp, rows: rows, n: n, E: E };
  };

  // 몫(10^-qp 단위 정수)과 남은 수
  D.quot = function (a, pa, n, qp) {
    var num = a * M.pow(Math.max(0, qp - pa)), den = n * M.pow(Math.max(0, pa - qp));
    return { q: Math.floor(num / den), exact: num % den === 0 };
  };

  function cellBox(ans, seq) {
    return '<input type="text" inputmode="numeric" autocomplete="off" class="ans-box vc" maxlength="1" data-kind="int" data-ans="' + ans + '" data-seq="' + seq + '">';
  }

  /* ---------- 세로 나눗셈 그리기 ----------
   * o = { a, pa, n, qp, divLabel: 나누는 수 글자(기본 n), greyInt: 나누어지는 수 끝의 자연수 자리 중 흐리게 할 개수(9 → 900),
   *       label: 위에 붙일 제목, show: true면 칸 없이 숫자로(보기용), qOver: {열 번호: 글자} 몫을 바꾸어 보여 줌(잘못한 풀이) }
   */
  function render(o) {
    var p = D.divPlan(o.a, o.pa, o.n, o.qp, o.greyInt), show = !!o.show;
    var seq = 0, qSeq = [], rowSeq = [];
    // 입력 순서: 몫 j → (그 자리에서 뺀 경우) 빼는 수 줄 → 남은 수 줄 → 몫 j+1 ...
    for (var j = 0; j <= p.E; j++) {
      if (p.q[j] != null) qSeq[j] = seq++;
      p.rows.forEach(function (rw, ri) {
        if (rw.after !== j) return;
        rowSeq[ri] = [];
        for (var c = rw.start; c <= rw.end; c++) rowSeq[ri][c] = seq++;
      });
    }
    var hasDot = p.fracLen > 0;
    function dotCell(content, cls) { return hasDot ? '<td class="dot' + (content ? '' : ' e') + (cls ? ' ' + cls : '') + '">' + (content || '') + '</td>' : ''; }
    var h = '<table class="vt vd' + (show ? ' show' : '') + '">';
    // 몫 줄
    h += '<tr><td class="dv"></td>';
    for (var c = 0; c < p.cols; c++) {
      if (c === p.intLen) h += dotCell(p.qp > 0 || (o.qOver && o.qOver.dot) ? '.' : '');
      var qv = p.q[c], over = o.qOver && o.qOver[c] != null ? o.qOver[c] : null;
      if (o.qOver) h += '<td class="wq">' + (over == null ? '' : over) + '</td>';
      else if (qv == null) h += '<td class="e"></td>';
      else h += '<td class="qd">' + (show ? qv : cellBox(qv, qSeq[c])) + '</td>';
    }
    h += '</tr>';
    // 나누는 수 ) 나누어지는 수
    h += '<tr><td class="dv">' + (o.divLabel || p.n) + '<span class="br">)</span></td>';
    for (c = 0; c < p.cols; c++) {
      if (c === p.intLen) h += dotCell('.', 'bar');
      h += '<td class="bar' + (p.grey[c] ? ' gr' : '') + '">' + p.digs[c] + '</td>';
    }
    h += '</tr>';
    // 계산 줄
    p.rows.forEach(function (rw, ri) {
      h += '<tr><td class="dv"></td>';
      for (c = 0; c < p.cols; c++) {
        var inRow = c >= rw.start && c <= rw.end;
        if (c === p.intLen) h += dotCell(rw.dot ? '.' : '', rw.line && rw.start < p.intLen && rw.end >= p.intLen ? 'ln' : '');
        var cls = (inRow ? '' : 'e') + (rw.line && inRow ? ' ln' : '');
        var d = inRow ? rw.val.charAt(c - rw.start) : '';
        h += '<td class="' + cls.trim() + '">' + (inRow ? (show ? d : cellBox(d, rowSeq[ri][c])) : '') + '</td>';
      }
      h += '</tr>';
    });
    h += '</table>';
    return o.label ? '<div><div class="vdlab">' + o.label + '</div>' + h + '</div>' : h;
  }
  D.vdiv = function (o) { return render(o); };
  D.vdivShow = function (o) { o.show = true; return render(o); };

  /* ---------- 잘못 계산한 풀이 상자 ---------- */
  D.wrongBox = function (who, inner, note) {
    return '<div class="wbox"><span class="who">' + who + '</span>' + inner + (note ? '<div class="wtxt">' + note + '</div>' : '') + '</div>';
  };

  /* ---------- 자연수의 나눗셈을 이용하는 화살표 표 (나누는 수는 그대로) ----------
   * o = { A: 자연수 나누어지는 수, n, pa: 소수 나누어지는 수의 소수 자릿수, pick: 몫 쪽 '몇 배'를 고르게, topBox: 자연수 몫도 칸 }
   *   A ÷ n = A/n   →   (A의 1/10^pa) ÷ n = □
   */
  D.divArrows = function (o) {
    var Q = o.A / o.n;
    var top = '<tr><td>' + o.A + '</td><td>÷</td><td>' + o.n + '</td><td>=</td><td>' + (o.topBox ? M.box(Q) : Q) + '</td></tr>';
    var mid = '<tr><td class="ar">↓ ' + D.baeLabel(o.pa) + '</td><td></td><td class="ar">그대로</td><td></td><td class="ar">' +
      (o.pick ? '<div style="display:flex;align-items:center;gap:4px;justify-content:center">↓ ' + D.baePick(o.pa) + '</div>' : '↓ ' + D.baeLabel(o.pa)) + '</td></tr>';
    var bot = '<tr><td>' + M.fmt0(o.A, o.pa) + '</td><td>÷</td><td>' + o.n + '</td><td>=</td><td>' + M.dbox(Q, o.pa) + '</td></tr>';
    return '<table class="arr">' + top + mid + bot + '</table>';
  };

  /* ---------- 나누는 수와 나누어지는 수를 똑같이 몇 배 하는 화살표 표 ----------
   * a, pa: 나누어지는 수,  b, pb: 나누는 수,  s: 몇 자리 옮길지(10^s배)
   *   a ÷ b —(□배)→ A ÷ B = □   →  a ÷ b = □      (A, B는 자연수가 되어야 함)
   * o.showA: 아래 줄의 자연수를 보여 줄지(기본 true), o.boxB: 아래 줄 나누는 수를 칸으로
   */
  D.shiftArrows = function (o) {
    var s = o.s, A = o.a * M.pow(s - o.pa), B = o.b * M.pow(s - o.pb), Q = A / B;
    var showA = o.showA !== false;
    var top = '<tr><td>' + M.fmt(o.a, o.pa) + '</td><td>÷</td><td>' + M.fmt(o.b, o.pb) + '</td><td></td><td></td></tr>';
    var mid = '<tr><td class="ar">↓ ' + M.box(M.pow(s)) + '배</td><td></td><td class="ar">↓ ' + M.box(M.pow(s)) + '배</td><td></td><td></td></tr>';
    var bot = '<tr><td>' + (showA ? A : M.box(A)) + '</td><td>÷</td><td>' + (o.boxB ? M.box(B) : B) + '</td><td>=</td><td>' + M.box(Q) + '</td></tr>';
    return '<div class="row" style="align-items:center;gap:14px"><table class="arr2">' + top + mid + bot + '</table>' +
      '<div class="eq">➡ ' + M.fmt(o.a, o.pa) + ' ÷ ' + M.fmt(o.b, o.pb) + ' = ' + M.box(Q) + '</div></div>';
  };

  /* ---------- 몫에 소수점 찍기 ----------
   * digits: 소수점을 뺀 숫자 글자(예 '304'), gap: 소수점이 들어갈 자리(앞에서 몇 번째 숫자 뒤인지, 3.04면 1)
   */
  D.dotPick = function (digits, gap) {
    var s = '<div class="choice-group dotpick" tabindex="-1" data-ans="' + gap + '">';
    for (var i = 0; i < digits.length; i++) {
      s += '<span class="dp-d">' + digits.charAt(i) + '</span>';
      if (i < digits.length - 1) s += '<button type="button" class="choice-btn dp-gap" data-v="' + (i + 1) + '" title="여기에 소수점 찍기"></button>';
    }
    return s + '</div>';
  };
  // 수(10^-p 단위)의 숫자 글자와 소수점 자리 (0.62 → '062', 1)
  D.digitsOf = function (v, p) {
    var s = M.fmt(v, p).replace('.', ''), g = M.fmt(v, p).indexOf('.');
    return { digits: s, gap: g < 0 ? s.length : g };
  };

  /* ---------- 수 모형: 1, 0.1, 0.01 ---------- */
  D.blocks = function (ones, tenths, hundredths) {
    var h = '<div class="blkrow">', k;
    for (k = 0; k < ones; k++) h += '<span class="blk one">1</span>';
    for (k = 0; k < tenths; k++) h += '<span class="blk ten">0.1</span>';
    for (k = 0; k < (hundredths || 0); k++) h += '<span class="blk hun">0.01</span>';
    return h + '</div>';
  };

  /* ---------- 남는 양 막대: 전체 a(10^-pa 단위)에서 n씩 덜어 내기 ---------- */
  D.takeBar = function (a, pa, n, unit) {
    var W = 600, L = 16, total = a / M.pow(pa), scale = (W - 2 * L) / total, k = Math.floor(total / n);
    var s = '<svg viewBox="0 0 ' + W + ' 74" width="' + W + '" height="74">';
    for (var i = 0; i < k; i++) {
      s += '<rect x="' + (L + i * n * scale) + '" y="10" width="' + (n * scale) + '" height="30" fill="' + (i % 2 ? '#fde68a' : '#fef3c7') + '" stroke="#92400e" stroke-width="1.2"/>';
      s += '<text x="' + (L + (i + 0.5) * n * scale) + '" y="30" text-anchor="middle" font-size="13" font-weight="bold" fill="#92400e">' + n + ' ' + (unit || '') + '</text>';
    }
    s += '<rect x="' + (L + k * n * scale) + '" y="10" width="' + ((total - k * n) * scale) + '" height="30" fill="#e2e8f0" stroke="#64748b" stroke-width="1.2" stroke-dasharray="4,3"/>';
    s += '<rect x="' + L + '" y="10" width="' + (total * scale) + '" height="30" fill="none" stroke="#1e293b" stroke-width="2"/>';
    s += '<text x="' + L + '" y="60" text-anchor="middle" font-size="13" fill="#334155">0</text>';
    s += '<text x="' + (L + total * scale) + '" y="60" text-anchor="middle" font-size="13" font-weight="bold" fill="#334155">' + M.fmt(a, pa) + '</text>';
    return s + '</svg>';
  };
})();
