/*
 * m511-common.js — 5학년 1학기 1단원 '자연수의 혼합 계산'(M511, 5111~5115) 페이지 공통 도우미
 *
 * frac/m423-common.js(4학년 소수)의 화면 모양·입력칸·채점(M.box, M.choices, M.card, M.render, M.grade, M.fill)을
 * 그대로 쓰고, 혼합 계산에 필요한 것만 더합니다.  → 페이지에서 ../frac/m423-common.js 다음에 불러 주세요. (이 파일과 5111~5115.html은 혼합계산 폴더에 있음)
 *  - 식 풀기(M5.solve): ( ) 안 → ×÷ 앞에서부터 → +− 앞에서부터. 나누어떨어지지 않거나 음수가 되면 null
 *  - 가장 먼저 계산하는 기호 누르기(M5.pickFirst)
 *  - 계산 순서 쓰기(M5.order): 기호 아래 칸에 순서 번호 + 순서대로 계산한 값(①②③…)
 *  - 식과 답(M5.calc), 하나의 식 고르기(M5.exprChoices), ( ) 넣기(M5.parenChoices)
 *
 * 식은 배열로 씁니다.  예) 43 − (24 + 8)  →  [43, '−', '(', 24, '+', 8, ')']
 * 기호는 화면 글자 그대로 '+', '−', '×', '÷' 를 씁니다.
 *
 * ※ 이 파일을 고치면 5111~5115.html의 <script src="m511-common.js?v=…"> 의 v 값도 바꿔 주세요.
 */
(function () {
  var css = '' +
    // 식 (기호 아래에 순서 칸)
    '.ex{display:inline-flex;align-items:flex-start;gap:2px;font-size:25px;font-weight:bold;color:#1e293b;font-family:"Malgun Gothic","맑은 고딕",sans-serif}' +
    '.ex .t{display:flex;flex-direction:column;align-items:center;min-width:16px;line-height:40px;padding:0 1px}' +
    '.ex .t.op{min-width:34px}' +
    '.ex .t .ans-box{width:32px;height:30px;font-size:17px;border-color:#c4b5fd;background:#faf5ff;color:#7c3aed;margin-top:2px}' +
    '.ex .t .ans-box:focus{border-color:#7c3aed;box-shadow:0 0 0 3px rgba(124,58,237,.2)}' +
    '.ex-eq{display:inline-flex;align-items:flex-start;gap:8px;font-size:25px;font-weight:bold;color:#1e293b}' +
    '.ex-eq>.eqs{line-height:40px}' +
    // 기호를 직접 눌러 고르기
    '.ex-pick{display:inline-flex;align-items:center;gap:4px;font-size:25px;font-weight:bold;color:#1e293b;flex-wrap:nowrap}' +
    '.ex-pick .choice-btn{min-width:40px;height:40px;padding:0 8px;font-size:24px;border-radius:20px;line-height:1}' +
    '.ex-pick .nm{padding:0 2px}' +
    // 순서대로 계산한 값
    '.steps{display:flex;flex-wrap:wrap;gap:8px 14px;align-items:center;justify-content:center;font-size:18px;font-weight:bold;color:#1e293b}' +
    '.steps .sn{display:inline-flex;align-items:center;gap:6px}' +
    '.steps .sn b{color:#7c3aed;font-size:20px}' +
    '.steps .arrow{color:#94a3b8}' +
    '.ex-opts .choice-btn{font-size:19px;padding:8px 14px;letter-spacing:.5px}' +
    '.ex-opts{flex-direction:column;align-items:stretch;max-width:420px}' +
    // 좁은 화면(휴대폰): 식 글자를 줄이고, 넘치면 다음 줄로
    '@media (max-width:560px){.ex,.ex-pick,.ex-eq{font-size:19px;flex-wrap:wrap;justify-content:center}.ex .t.op{min-width:26px}' +
    '.ex .t .ans-box{width:26px}.ex-pick .choice-btn{min-width:30px;height:32px;font-size:18px;padding:0 5px}.qbox{padding:8px 10px}.steps{font-size:16px}}' +
    '.word{font-size:17px;color:#1e293b;line-height:1.75;text-align:left;max-width:760px;background:#f8fafc;border:1.5px solid #e2e8f0;border-radius:12px;padding:10px 16px;word-break:keep-all}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var M5 = window.M5 = {};
  var CIRC = ['①', '②', '③', '④', '⑤', '⑥'];
  M5.CIRC = CIRC;
  function isOp(t) { return t === '+' || t === '−' || t === '×' || t === '÷'; }
  M5.isOp = isOp;

  /* ---------- 식 풀기 ----------
   * 돌려주는 값: { value, steps:[{i: 식 배열에서 그 기호의 위치, v: 그 계산의 결과}] }  (계산 순서대로)
   * 나누어떨어지지 않거나 0보다 작아지면 null  (5학년 혼합 계산은 자연수 범위)
   */
  M5.solve = function (tk) {
    var a = tk.map(function (t, i) { return typeof t === 'number' ? { n: t } : { s: t, i: i }; });
    var steps = [];
    function flat(seg) {
      var k;
      function apply(k) {
        var x = seg[k - 1].n, y = seg[k + 1].n, op = seg[k].s, v;
        if (op === '+') v = x + y;
        else if (op === '−') v = x - y;
        else if (op === '×') v = x * y;
        else { if (y === 0 || x % y !== 0) return false; v = x / y; }
        if (v < 0) return false;
        steps.push({ i: seg[k].i, v: v });
        seg.splice(k - 1, 3, { n: v });
        return true;
      }
      for (k = 1; k < seg.length; ) { if (seg[k].s === '×' || seg[k].s === '÷') { if (!apply(k)) return null; } else k += 2; }
      for (k = 1; k < seg.length; ) { if (!apply(k)) return null; }
      return seg[0];
    }
    while (true) {
      var close = -1, open = -1;
      for (var j = 0; j < a.length; j++) if (a[j].s === ')') { close = j; break; }
      if (close < 0) break;
      for (j = close; j >= 0; j--) if (a[j].s === '(') { open = j; break; }
      var r = flat(a.slice(open + 1, close));
      if (!r) return null;
      a.splice(open, close - open + 1, r);
    }
    var last = flat(a);
    if (!last) return null;
    return { value: last.n, steps: steps };
  };
  // 조건에 맞는 식인지: 풀리고, 모든 중간값·답이 [0, max]
  M5.ok = function (tk, max) {
    var s = M5.solve(tk);
    if (!s) return null;
    max = max || 999;
    if (s.value > max) return null;
    for (var k = 0; k < s.steps.length; k++) if (s.steps[k].v > max * 4) return null;
    return s;
  };
  // 조건을 만족할 때까지 다시 만들기 (make: 식 배열을 돌려주는 함수, test: 추가 조건)
  M5.gen = function (make, test, max) {
    for (var n = 0; n < 5000; n++) {
      var tk = make(), s = M5.ok(tk, max);
      if (s && (!test || test(tk, s))) return tk;
    }
    throw new Error('조건에 맞는 식을 만들지 못했습니다');
  };
  // 오개념 계산: '앞에서부터 차례대로'(괄호·기호 순서 무시) — 이 값이 정답과 달라야 진단이 됨
  M5.leftToRight = function (tk) {
    var t = tk.filter(function (x) { return x !== '(' && x !== ')'; }), v = t[0];
    for (var k = 1; k < t.length; k += 2) {
      var y = t[k + 1], op = t[k];
      if (op === '+') v += y; else if (op === '−') v -= y; else if (op === '×') v *= y; else v /= y;
    }
    return v;
  };
  // 괄호를 지운 식 (괄호를 무시하는 오개념 확인용)
  M5.noParen = function (tk) { return tk.filter(function (x) { return x !== '(' && x !== ')'; }); };

  /* ---------- 글자 ---------- */
  M5.str = function (tk) {
    var s = '';
    tk.forEach(function (t, k) {
      if (t === '(') s += (k && tk[k - 1] !== '(' ? ' ' : '') + '(';
      else if (t === ')') s += ')';
      else if (isOp(t)) s += ' ' + t + ' ';
      else s += t;
    });
    return s.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').trim();
  };
  function nm(t) { return '<span class="nm">' + t + '</span>'; }

  /* ---------- 가장 먼저 계산하는 기호 누르기 ---------- */
  M5.pickFirst = function (tk) {
    var s = M5.solve(tk), ans = s.steps[0].i, h = '<div class="choice-group ex-pick" tabindex="-1" data-ans="' + ans + '">';
    tk.forEach(function (t, k) {
      h += isOp(t) ? '<button type="button" class="choice-btn" data-v="' + k + '">' + t + '</button>' : nm(t);
    });
    return h + '</div>';
  };

  /* ---------- 계산 순서 쓰기 ----------
   * 기호 아래 칸: 그 기호를 몇 번째로 계산하는지(1, 2, 3 …)
   * 아래 줄: ① 첫째 계산 값 → ② 둘째 계산 값 → … (마지막 값이 답)
   */
  M5.order = function (tk, unit) {
    var s = M5.solve(tk), rank = {};
    s.steps.forEach(function (st, k) { rank[st.i] = k + 1; });
    var h = '<div class="ex">';
    tk.forEach(function (t, k) {
      if (isOp(t)) h += '<span class="t op">' + t + M.box(rank[k]) + '</span>';
      else h += '<span class="t">' + t + '</span>';
    });
    h += '</div><div class="steps">';
    s.steps.forEach(function (st, k) {
      var last = k === s.steps.length - 1;
      h += (k ? '<span class="arrow">→</span>' : '') + '<span class="sn"><b>' + CIRC[k] + '</b>' + M.box(st.v) + (last && unit ? unit : '') + (last ? ' (답)' : '') + '</span>';
    });
    return h + '</div>';
  };
  M5.orderNote = '<div class="q-small">기호 아래 보라색 칸에 <b>계산하는 순서(1, 2, 3 …)</b>를 쓰고, 그 순서대로 계산한 값을 ①, ②, … 칸에 써요.</div>';

  /* ---------- 식 = □ ---------- */
  M5.calc = function (tk) {
    var s = M5.solve(tk);
    return '<div class="eq">' + M5.str(tk) + ' = <span class="tail">' + M.box(s.value) + '</span></div>';
  };

  /* ---------- 하나의 식 고르기 ----------
   * right: 맞는 식, wrongs: 틀린 식 후보들 (계산이 안 되거나 값이 정답과 같은 식은 빠짐)
   * 보기가 3개가 되지 않으면 null → 페이지에서 수를 다시 뽑습니다.
   */
  M5.exprChoices = function (right, wrongs) {
    var rv = M5.solve(right).value, seen = {}, opts = [[0, M5.str(right)]];
    seen[M5.str(right)] = 1;
    wrongs.forEach(function (w) {
      var s = M5.solve(w), key = M5.str(w);
      if (opts.length >= 3 || seen[key] || !s || s.value === rv) return;
      seen[key] = 1; opts.push([opts.length, key]);
    });
    if (opts.length < 3) return null;
    return '<div class="choice-group ex-opts" tabindex="-1" data-ans="0">' + M.shuffle(opts).map(function (o) {
      return '<button type="button" class="choice-btn" data-v="' + o[0] + '">' + o[1] + '</button>';
    }).join('') + '</div>';
  };

  /* ---------- ( ) 넣기 ----------
   * tk: 괄호 없는 식. 연속한 수 2개 또는 3개를 ( )로 묶는 모든 경우 중
   * 계산이 되는 식만 모아, 값이 하나뿐인(다른 묶음과 겹치지 않는) 식을 정답으로 고릅니다.
   * 돌려주는 값: { target, html } 또는 null
   */
  M5.parenChoices = function (tk) {
    var nums = [], k;
    for (k = 0; k < tk.length; k += 2) nums.push(k);
    var plain = M5.solve(tk), cands = [];
    for (var a = 0; a < nums.length; a++) for (var b = a + 1; b < nums.length; b++) {
      if (a === 0 && b === nums.length - 1) continue;
      var t = tk.slice(0, nums[a]).concat(['('], tk.slice(nums[a], nums[b] + 1), [')'], tk.slice(nums[b] + 1));
      var s = M5.solve(t);
      if (s && (!plain || s.value !== plain.value)) cands.push({ tk: t, v: s.value });
    }
    var count = {};
    cands.forEach(function (c) { count[c.v] = (count[c.v] || 0) + 1; });
    var good = cands.filter(function (c) { return count[c.v] === 1 && c.v <= 300; });
    if (!good.length || cands.length < 3) return null;
    var right = M.pick(good), others = M.shuffle(cands.filter(function (c) { return c !== right && c.v !== right.v; })).slice(0, 2);
    if (others.length < 2) return null;
    var opts = [[0, M5.str(right.tk)]].concat(others.map(function (o, i) { return [i + 1, M5.str(o.tk)]; }));
    return {
      target: right.v,
      html: '<div class="choice-group ex-opts" tabindex="-1" data-ans="0">' + M.shuffle(opts).map(function (o) {
        return '<button type="button" class="choice-btn" data-v="' + o[0] + '">' + o[1] + '</button>';
      }).join('') + '</div>'
    };
  };

  /* ---------- 두 식의 결과 비교 ---------- */
  M5.compare = function (t1, t2) {
    var v1 = M5.solve(t1).value, v2 = M5.solve(t2).value;
    return '<div class="cmp-row" style="flex-wrap:wrap;justify-content:center;gap:12px">' +
      '<div class="qbox">' + M5.calc(t1) + '</div>' + M.cmp(v1, v2) + '<div class="qbox">' + M5.calc(t2) + '</div></div>';
  };
})();
