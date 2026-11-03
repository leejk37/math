/*
 * m324-common.js — 3학년 2학기 4단원 '분수'(M324, 3241~3247) 페이지 공통 도우미
 *
 * 각 페이지는 문제 카드 HTML만 만들고, 아래 기능은 여기서 함께 씁니다.
 *  - 분수·대분수 글자 모양(M.frac, M.mixed), 입력칸(M.box), 고르기 버튼(M.choices)
 *  - 입력칸 자동 다음칸 이동(M.wire)
 *  - 채점(M.grade): 카드마다 맞음/틀림 배열 → frac-kit.js가 시트에 저장
 * 진단 저장·타이머는 frac-kit.js가 맡습니다(이 파일은 화면만).
 */
(function () {
  var css = '' +
    '*{box-sizing:border-box}' +
    'body{background:#f8fafc;font-family:"Malgun Gothic","맑은 고딕",sans-serif;margin:0;padding:24px 16px;display:flex;flex-direction:column;align-items:center}' +
    '.header-text{font-size:24px;font-weight:bold;color:#1e293b;margin:4px 0 8px;text-align:center}' +
    '.sub-text{font-size:14px;color:#64748b;margin-bottom:22px;text-align:center;line-height:1.6}' +
    '.quiz-container{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;width:100%;max-width:920px;margin-bottom:26px}' +
    '.quiz-card{background:#fff;border:2px solid #cbd5e1;border-radius:12px;padding:38px 16px 18px;position:relative;display:flex;flex-direction:column;align-items:center;gap:12px;box-shadow:0 4px 6px rgba(0,0,0,.03);transition:border-color .3s,box-shadow .3s}' +
    '.quiz-card.wide{grid-column:1/-1}' +
    '.quiz-number{position:absolute;top:12px;left:15px;font-size:14px;font-weight:bold;color:#475569}' +
    '.q-text{font-size:18px;color:#1e293b;line-height:1.7;text-align:center;font-weight:bold}' +
    '.eq{display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:6px;font-size:22px;font-weight:bold;color:#1e293b}' +
    '.fraction{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;margin:0 3px}' +
    '.fraction .num,.fraction .den{display:flex;align-items:center;justify-content:center;min-width:30px;height:38px;padding:0 6px;font-size:24px;font-weight:bold}' +
    '.fraction .frac-line{width:100%;height:3px;background:#1e293b;border-radius:2px;margin:1px 0}' +
    '.fraction.sm .num,.fraction.sm .den{height:26px;min-width:22px;font-size:18px;padding:0 3px}' +
    '.mixed{display:inline-flex;align-items:center;gap:2px;vertical-align:middle}' +
    '.mixed .whole{font-size:28px;font-weight:bold;display:flex;align-items:center}' +
    '.op{font-size:26px;font-weight:900;color:#334155;margin:0 4px}' +
    '.ans-box{width:44px;height:38px;border:2px solid #94a3b8;border-radius:6px;font-size:21px;font-weight:bold;text-align:center;outline:none;background:#fff;color:#0284c7;padding:0;font-family:inherit}' +
    '.ans-box.w1{width:36px}' +
    '.ans-box:focus{border-color:#3b82f6;box-shadow:0 0 0 3px rgba(59,130,246,.2);background:#f0f9ff}' +
    '.unit{font-size:20px;font-weight:bold;margin-left:2px}' +
    '.tail{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}' +
    '.choice-group{display:flex;gap:8px;flex-wrap:wrap;justify-content:center}' +
    '.choice-btn{border:2px solid #cbd5e1;background:#fff;color:#334155;border-radius:10px;padding:8px 14px;font-size:17px;font-weight:bold;cursor:pointer;font-family:inherit;min-width:48px}' +
    '.choice-btn:hover{border-color:#94a3b8;background:#f8fafc}' +
    '.choice-btn.selected{border-color:#3b82f6;background:#dbeafe;color:#1d4ed8}' +
    '.choice-btn.cmp{width:42px;height:34px;border-radius:17px;padding:0;font-size:20px;min-width:0}' +
    '.choice-group:has(.cmp){flex-direction:column;flex-wrap:nowrap;gap:4px}' +
    '.eq.cmp-row{flex-wrap:nowrap}' +
    '.choice-group:focus{outline:none}' +
    '.quiz-card.current{border-color:#3b82f6;box-shadow:0 0 0 4px rgba(59,130,246,.18)}' +
    '.help-btn{position:absolute;top:8px;right:10px;border:1.5px solid #fcd34d;background:#fffbeb;color:#92400e;border-radius:14px;padding:3px 10px;font-size:13px;font-weight:bold;cursor:pointer;font-family:inherit}' +
    '.help-box{display:none;background:#fffbeb;border:1.5px dashed #f59e0b;border-radius:10px;padding:8px 12px;font-size:15px;color:#78350f;line-height:1.6;text-align:center;width:100%}' +
    '.help-box.show{display:block}' +
    '.rule-box{display:inline-block;text-align:left;background:#eff6ff;border:2px solid #3b82f6;border-radius:12px;padding:10px 18px;margin-bottom:8px;color:#1e293b}' +
    '.rule-title{font-size:19px;font-weight:bold;color:#1d4ed8;margin-bottom:6px}' +
    '.rule-line{font-size:16px;margin:3px 0}' +
    '.rule-tag{display:inline-block;min-width:44px;text-align:center;border-radius:6px;padding:1px 6px;margin-right:6px;font-weight:bold;color:#fff}' +
    '.rule-tag.den{background:#2563eb}.rule-tag.num{background:#ea580c}' +
    '.btn-group{display:flex;gap:12px}' +
    '.action-btn{color:#fff;border:none;border-radius:8px;padding:12px 24px;font-size:16px;font-weight:bold;cursor:pointer;box-shadow:0 4px 6px rgba(0,0,0,.1);font-family:inherit}' +
    '.check-btn{background:#3b82f6}.check-btn:hover{background:#2563eb}' +
    '.reset-btn{background:#8b5cf6}.reset-btn:hover{background:#7c3aed}' +
    'svg{max-width:100%;height:auto}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var M = window.M = {};

  M.rand = function (a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; };
  M.pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  M.shuffle = function (arr) {
    for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
    return arr;
  };

  // 숫자 뒤 조사 고르기: 숫자를 읽었을 때 끝소리에 받침이 있으면 a, 없으면 b
  // (예: M.josa(12,'은','는') → '는'(십이), M.josa(16,'은','는') → '은'(십육), M.josa(20,'을','를') → '을'(이십))
  M.josa = function (n, a, b) {
    var last = Number(n) % 10;
    var batchim = last === 0 ? true : [1, 3, 6, 7, 8].indexOf(last) !== -1;
    return batchim ? a : b;
  };

  // 정답이 들어 있는 입력칸. 칸 크기(maxlength)는 정답 자릿수에 맞춤 → 다 쓰면 자동으로 다음 칸
  M.box = function (ans) {
    // 칸은 정답 자릿수만큼만 받음 (3241처럼 분모·분자가 한 자리면 한 자리씩, 다 쓰면 바로 다음 칸)
    var s = String(ans);
    return '<input type="text" inputmode="numeric" autocomplete="off" class="ans-box' + (s.length === 1 ? ' w1' : '') +
      '" maxlength="' + s.length + '" data-ans="' + s + '">';
  };
  // 분수 (분자·분모에 숫자 또는 M.box(...) HTML을 넣을 수 있음)
  M.frac = function (n, d, small) {
    return '<span class="fraction' + (small ? ' sm' : '') + '"><span class="num">' + n + '</span><span class="frac-line"></span><span class="den">' + d + '</span></span>';
  };
  M.mixed = function (w, n, d, small) {
    return '<span class="mixed"><span class="whole"' + (small ? ' style="font-size:20px"' : '') + '>' + w + '</span>' + M.frac(n, d, small) + '</span>';
  };
  // 고르기 버튼 묶음: options = [[값, 보이는 글자], ...]
  M.choices = function (ans, options, cls) {
    return '<div class="choice-group" tabindex="-1" data-ans="' + ans + '">' + options.map(function (o) {
      return '<button type="button" class="choice-btn' + (cls ? ' ' + cls : '') + '" data-v="' + o[0] + '">' + o[1] + '</button>';
    }).join('') + '</div>';
  };
  // hint가 있으면 오른쪽 위에 '💡 도움' 버튼 → 누르면 카드 아래에 도움말이 나타남
  M.card = function (i, inner, wide, hint) {
    return '<div class="quiz-card' + (wide ? ' wide' : '') + '" id="card-' + i + '"><div class="quiz-number">문제 ' + (i + 1) + '</div>' + inner +
      (hint ? '<button type="button" class="help-btn" onclick="this.parentNode.querySelector(\'.help-box\').classList.toggle(\'show\')">💡 도움</button>' +
        '<div class="help-box">' + hint + '</div>' : '') + '</div>';
  };

  // 묶음 그림: groups개 묶음, 묶음마다 size개, 앞쪽 shaded묶음 색칠
  M.groupsSvg = function (groups, size, shaded, color) {
    var cell = 22, pad = 7, gap = 10;
    var cols = size === 4 ? 2 : Math.min(size, 3), rows = Math.ceil(size / cols);
    var gw = cols * cell + pad * 2, gh = rows * cell + pad * 2;
    var perRow = groups <= 4 ? groups : Math.ceil(groups / 2);
    var lines = Math.ceil(groups / perRow);
    var W = perRow * gw + (perRow - 1) * gap + 4, H = lines * gh + (lines - 1) * gap + 4;
    var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '">';
    for (var g = 0; g < groups; g++) {
      var gx = 2 + (g % perRow) * (gw + gap), gy = 2 + Math.floor(g / perRow) * (gh + gap);
      var on = g < shaded;
      // 묶음 테두리를 굵고 선명하게: 색칠한 묶음은 빨간 테두리·연한 바탕, 나머지는 진한 회색 테두리
      s += '<rect x="' + gx + '" y="' + gy + '" width="' + gw + '" height="' + gh + '" rx="10" fill="' + (on ? '#fee2e2' : '#f8fafc') + '" stroke="' + (on ? '#dc2626' : '#475569') + '" stroke-width="2.6"/>';
      for (var k = 0; k < size; k++) {
        var cx = gx + pad + (k % cols) * cell + cell / 2, cy = gy + pad + Math.floor(k / cols) * cell + cell / 2;
        s += '<circle cx="' + cx + '" cy="' + cy + '" r="8" fill="' + (on ? (color || '#f87171') : '#fff') + '" stroke="#334155" stroke-width="1.5"/>';
      }
    }
    return s + '</svg>';
  };

  // 띠(테이프) 그림: parts칸으로 나누고 앞쪽 shaded칸 색칠, 위에 전체 길이 글자
  M.tapeSvg = function (parts, shaded, label) {
    var W = 260, h = 34, top = label ? 22 : 2;
    var s = '<svg viewBox="0 0 ' + (W + 4) + ' ' + (top + h + 4) + '" width="' + (W + 4) + '" height="' + (top + h + 4) + '">';
    if (label) {
      s += '<line x1="2" y1="12" x2="' + (W + 2) + '" y2="12" stroke="#64748b" stroke-width="1.2"/>' +
        '<line x1="2" y1="6" x2="2" y2="18" stroke="#64748b"/><line x1="' + (W + 2) + '" y1="6" x2="' + (W + 2) + '" y2="18" stroke="#64748b"/>' +
        '<rect x="' + (W / 2 - 34) + '" y="2" width="72" height="18" fill="#fff"/>' +
        '<text x="' + (W / 2 + 2) + '" y="16" text-anchor="middle" font-size="14" font-weight="bold" fill="#334155">' + label + '</text>';
    }
    var pw = W / parts;
    for (var p = 0; p < parts; p++) {
      s += '<rect x="' + (2 + p * pw) + '" y="' + top + '" width="' + pw + '" height="' + h + '" fill="' + (p < shaded ? '#93c5fd' : '#fff') + '" stroke="#334155" stroke-width="1.5"/>';
    }
    return s + '</svg>';
  };

  // 자(눈금 0~len)와 그 아래 띠: parts칸으로 나누고 앞쪽 shaded칸 색칠 (교과서 3243 ③ 모양)
  M.rulerTapeSvg = function (len, unit, parts, shaded) {
    var W = 290, x0 = 14, step = (W - 52) / len, s = '<svg viewBox="0 0 ' + W + ' 86" width="' + W + '" height="86">';
    for (var t = 0; t <= len; t++) {
      var x = x0 + t * step;
      s += '<line x1="' + x + '" y1="20" x2="' + x + '" y2="30" stroke="#334155" stroke-width="1.4"/>' +
        '<text x="' + x + '" y="15" text-anchor="middle" font-size="12" fill="#334155">' + t + '</text>';
    }
    s += '<line x1="' + x0 + '" y1="30" x2="' + (x0 + len * step) + '" y2="30" stroke="#334155" stroke-width="1.4"/>' +
      '<text x="' + (W - 2) + '" y="15" text-anchor="end" font-size="11" fill="#64748b">(' + unit + ')</text>';
    var pw = len * step / parts;
    for (var p = 0; p < parts; p++) {
      s += '<rect x="' + (x0 + p * pw) + '" y="42" width="' + pw + '" height="30" fill="' + (p < shaded ? '#93c5fd' : '#fff') + '" stroke="#334155" stroke-width="1.5"/>';
    }
    return s + '</svg>';
  };

  // 12시간 시계: 0시(12)부터 시계 방향으로 shadedHours시간만큼 색칠, parts>0이면 12시간을 parts부분으로 나누는 선
  M.clockSvg = function (shadedHours, parts) {
    var R = 70, C = 82, s = '<svg viewBox="0 0 164 164" width="164" height="164">';
    s += '<circle cx="' + C + '" cy="' + C + '" r="' + R + '" fill="#fff" stroke="#38bdf8" stroke-width="5"/>';
    if (shadedHours > 0) {
      var a1 = (shadedHours / 12) * 2 * Math.PI - Math.PI / 2;
      var ex = C + (R - 3) * Math.cos(a1), ey = C + (R - 3) * Math.sin(a1);
      s += shadedHours >= 12 ? '<circle cx="' + C + '" cy="' + C + '" r="' + (R - 3) + '" fill="#bfdbfe"/>' :
        '<path d="M' + C + ' ' + C + ' L' + C + ' ' + (C - R + 3) + ' A' + (R - 3) + ' ' + (R - 3) + ' 0 ' + (shadedHours > 6 ? 1 : 0) + ' 1 ' + ex.toFixed(1) + ' ' + ey.toFixed(1) + ' Z" fill="#bfdbfe"/>';
    }
    if (parts > 0) {
      for (var p = 0; p < parts; p++) {
        var a = (p / parts) * 2 * Math.PI - Math.PI / 2;
        s += '<line x1="' + C + '" y1="' + C + '" x2="' + (C + (R - 3) * Math.cos(a)).toFixed(1) + '" y2="' + (C + (R - 3) * Math.sin(a)).toFixed(1) + '" stroke="#ef4444" stroke-width="1.6"/>';
      }
    }
    for (var h = 1; h <= 12; h++) {
      var ah = (h / 12) * 2 * Math.PI - Math.PI / 2;
      s += '<text x="' + (C + (R - 15) * Math.cos(ah)).toFixed(1) + '" y="' + (C + (R - 15) * Math.sin(ah) + 5).toFixed(1) + '" text-anchor="middle" font-size="14" font-weight="bold" fill="#1e293b">' + h + '</text>';
    }
    return s + '<circle cx="' + C + '" cy="' + C + '" r="3" fill="#1e293b"/></svg>';
  };

  // 수직선 0~max(자연수), 눈금은 분모 d칸씩, 화살표는 at번째 눈금 (교과서 3244 수직선 모양)
  M.numberLineSvg = function (max, d, at) {
    var W = 300, x0 = 16, total = max * d, step = (W - 32) / total;
    var s = '<svg viewBox="0 0 ' + W + ' 70" width="' + W + '" height="70">';
    s += '<line x1="' + x0 + '" y1="40" x2="' + (x0 + total * step) + '" y2="40" stroke="#334155" stroke-width="2"/>';
    for (var t = 0; t <= total; t++) {
      var x = x0 + t * step, big = t % d === 0;
      s += '<line x1="' + x + '" y1="' + (big ? 32 : 35) + '" x2="' + x + '" y2="' + (big ? 48 : 45) + '" stroke="#334155" stroke-width="' + (big ? 2 : 1.3) + '"/>';
      if (big) s += '<text x="' + x + '" y="64" text-anchor="middle" font-size="14" font-weight="bold" fill="#1e293b">' + (t / d) + '</text>';
    }
    var ax = x0 + at * step;
    return s + '<path d="M' + ax + ' 28 L' + (ax - 6) + ' 14 L' + (ax + 6) + ' 14 Z" fill="#ef4444"/><line x1="' + ax + '" y1="4" x2="' + ax + '" y2="16" stroke="#ef4444" stroke-width="3"/></svg>';
  };

  // 대분수·가분수 그림: 사각형(또는 원) 여러 개를 d칸으로 나누고 앞에서부터 filled칸 색칠
  M.piecesSvg = function (count, d, filled, round) {
    var size = 54, gap = 10, W = count * size + (count - 1) * gap + 4;
    var s = '<svg viewBox="0 0 ' + W + ' ' + (size + 4) + '" width="' + W + '" height="' + (size + 4) + '">';
    for (var c = 0; c < count; c++) {
      var x = 2 + c * (size + gap), y = 2;
      for (var k = 0; k < d; k++) {
        var on = c * d + k < filled, col = on ? '#fcd34d' : '#fff';
        if (round) {
          var r = size / 2, cx = x + r, cy = y + r;
          var a0 = (k / d) * 2 * Math.PI - Math.PI / 2, a1 = ((k + 1) / d) * 2 * Math.PI - Math.PI / 2;
          s += d === 1 ? '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + col + '" stroke="#334155" stroke-width="1.5"/>' :
            '<path d="M' + cx + ' ' + cy + ' L' + (cx + r * Math.cos(a0)).toFixed(1) + ' ' + (cy + r * Math.sin(a0)).toFixed(1) + ' A' + r + ' ' + r + ' 0 0 1 ' + (cx + r * Math.cos(a1)).toFixed(1) + ' ' + (cy + r * Math.sin(a1)).toFixed(1) + ' Z" fill="' + col + '" stroke="#334155" stroke-width="1.5"/>';
        } else {
          var pw = size / d;
          s += '<rect x="' + (x + k * pw) + '" y="' + y + '" width="' + pw + '" height="' + size + '" fill="' + col + '" stroke="#334155" stroke-width="1.5"/>';
        }
      }
    }
    return s + '</svg>';
  };

  // 입력칸·버튼 동작 연결 (문제를 새로 그린 뒤 매번 호출)
  M.wire = function () {
    // 이동 순서(stops): 화면 순서대로 입력칸과 고르기 묶음을 이어 붙임
    //  - 분자·분모가 모두 빈칸인 분수는 분모 → 분자 순서 (분수를 쓰는 순서와 같게)
    //  - 고르기 문제(진분수/가분수, >·=·< 등)도 한 칸으로 쳐서, 고르면 다음 문제로 넘어감
    var stops = [];
    Array.prototype.forEach.call(document.querySelectorAll('.ans-box, .choice-group'), function (el) {
      if (stops.indexOf(el) !== -1) return;
      var fr = el.classList.contains('ans-box') && el.closest('.fraction');
      var num = fr && fr.querySelector(':scope > .num .ans-box'), den = fr && fr.querySelector(':scope > .den .ans-box');
      if (num && den && el === num) { stops.push(den, num); return; }
      stops.push(el);
    });
    var checkBtn = document.getElementById('checkBtn');
    function go(i) {
      if (i < 0) return;
      if (i < stops.length) stops[i].focus(); else if (checkBtn) checkBtn.focus();
    }
    // 지금 풀고 있는 문제 카드에 파란 테두리
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
      el.addEventListener('focus', function () { this.select(); });
      el.addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');
        if (this.value.length >= this.maxLength) go(i + 1);
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === 'ArrowRight' || e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); go(i + 1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
        else if (e.key === 'Backspace' && this.value === '') { e.preventDefault(); go(i - 1); }
      });
    });
    go(0);
  };

  // 채점: 카드 안의 모든 입력칸·고르기가 맞아야 그 문제 정답
  M.grade = function () {
    return Array.prototype.map.call(document.querySelectorAll('.quiz-card'), function (card) {
      var ok = true;
      card.querySelectorAll('.ans-box').forEach(function (inp) {
        var good = inp.value !== '' && String(parseInt(inp.value, 10)) === inp.getAttribute('data-ans');
        if (!good) ok = false;
        inp.style.borderColor = good ? '#22c55e' : '#ef4444';
        inp.style.backgroundColor = good ? '#f0fdf4' : '#fef2f2';
      });
      card.querySelectorAll('.choice-group').forEach(function (grp) {
        var sel = grp.querySelector('.choice-btn.selected');
        var good = !!sel && sel.getAttribute('data-v') === grp.getAttribute('data-ans');
        if (!good) ok = false;
        if (sel) { sel.style.borderColor = good ? '#22c55e' : '#ef4444'; sel.style.backgroundColor = good ? '#dcfce7' : '#fee2e2'; }
        else grp.querySelectorAll('.choice-btn').forEach(function (b) { b.style.borderColor = '#ef4444'; });
      });
      card.style.borderColor = ok ? '#22c55e' : '#ef4444';
      card.style.boxShadow = ok ? '0 4px 12px rgba(34,197,94,.15)' : '0 4px 12px rgba(239,68,68,.15)';
      return ok;
    });
  };

  // 페이지 뼈대 HTML 이후 공통 시작: generate()를 만들어 두면 첫 화면에서 자동 실행
  M.render = function (cardsHtml) {
    document.getElementById('quiz').innerHTML = cardsHtml.join('');
    M.wire();
  };
})();
