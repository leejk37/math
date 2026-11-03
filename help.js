/*
 * help.js — 문제 옆 도움 버튼 (🤔 모르겠어요 / 🙋 확인해 주세요)
 *  - 사칙연산 문제 칸(.math-card)이 화면에 나타나면 자동으로 버튼 두 개를 붙입니다. (각 단계 코드는 고치지 않음)
 *  - 누르면: ① Firebase로 교사 현황판(live.html)에 바로 알림  ② GAS로 평가데이터 '도움요청' 시트에 한 줄 기록
 *  - 다시 누르면 취소. 선생님이 현황판에서 [해결]을 누르면 "선생님이 확인했어요"가 뜨고 버튼이 원래대로 돌아옵니다.
 *  - 다른 학생은 누가 요청했는지 볼 수 없습니다. Firebase에는 이름을 보내지 않습니다.
 *  - api.js 다음에 불러와야 합니다: <script src="api.js"></script> <script src="help.js"></script>
 *  - 분수 페이지(frac/*.html)에서는 frac-kit.js 다음에 <script src="../help.js"></script>로 불러옵니다.
 *    진단 모드(진단시스템에서 열었을 때)에서만 각 문제 카드(.quiz-card)의 '문제 N' 옆에 버튼이 붙습니다.
 */
(function () {
  var GRIDS = {
    'add-quizGrid': { op: '덧셈', prefix: 'add' },
    'sub-quizGrid': { op: '뺄셈', prefix: 'sub' },
    'mul-quizGrid': { op: '곱셈', prefix: 'mul' },
    'div-quizGrid': { op: '나눗셈', prefix: 'div' }
  };
  var TYPES = {
    unknown: { icon: '🤔', label: '모르겠어요' },
    check: { icon: '🙋', label: '확인해 주세요' }
  };

  var css = document.createElement('style');
  css.textContent =
    '.help-bar{display:flex;gap:4px;align-self:stretch;justify-content:flex-end;margin:-2px 0 6px;flex-wrap:wrap}' +
    '.help-btn{font:inherit;font-size:11px;line-height:1.2;padding:3px 7px;border-radius:999px;border:1px solid #cbd5e1;background:#fff;color:#334155;cursor:pointer;white-space:nowrap}' +
    '.help-btn:hover{border-color:#94a3b8}' +
    '.help-btn.sending{opacity:.6;cursor:wait}' +
    '.help-btn.sent.unknown{background:#fff4e5;border-color:#f59e0b;color:#92400e;font-weight:bold}' +
    '.help-btn.sent.check{background:#e8f0fe;border-color:#3b6fd8;color:#1e3a8a;font-weight:bold}' +
    '.help-btn.done{background:#dcfce7;border-color:#16a34a;color:#166534;font-weight:bold}' +
    '.math-card.help-waiting{box-shadow:0 0 0 2px #f59e0b inset}' +
    '.quiz-card.help-waiting{box-shadow:0 0 0 3px #f59e0b inset!important}' +
    '.quiz-card .help-bar{margin:0;align-self:center;flex:0 0 auto;flex-direction:column;align-items:stretch;gap:4px}' +
    '.quiz-card .help-btn{font-size:13px;padding:4px 10px}';
  document.head.appendChild(css);

  function val(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || '').trim() : '';
  }
  function levelText(prefix) {
    var s = document.getElementById(prefix + '-subLevel');
    return (s && s.selectedIndex >= 0 && s.options[s.selectedIndex]) ? s.options[s.selectedIndex].text : '';
  }

  /* 버튼 상태 바꾸기 */
  function setIdle(card) {
    card.classList.remove('help-waiting');
    card.querySelectorAll('.help-btn').forEach(function (b) {
      var t = TYPES[b.dataset.type];
      b.className = 'help-btn';
      b.disabled = false;
      b.style.display = '';
      b.textContent = t.icon + ' ' + t.label;
      b.title = '';
    });
  }
  function setSent(card, type) {
    card.classList.add('help-waiting');
    card.querySelectorAll('.help-btn').forEach(function (b) {
      var t = TYPES[b.dataset.type];
      b.disabled = false;
      if (b.dataset.type === type) {
        b.className = 'help-btn sent ' + type;
        b.textContent = t.icon + ' 요청됨 ⏳';
        b.title = '다시 누르면 요청을 취소합니다';
      } else {
        b.className = 'help-btn';
        b.textContent = t.icon + ' ' + t.label;
      }
    });
  }
  function setDone(card) {
    card.classList.remove('help-waiting');
    card.querySelectorAll('.help-btn').forEach(function (b, i) {
      b.disabled = true;
      if (i === 0) { b.className = 'help-btn done'; b.textContent = '✓ 선생님이 확인했어요'; }
      else b.style.display = 'none';
    });
    setTimeout(function () { if (!card._help) setIdle(card); }, 4000);
  }

  /* 요청 정리: 감시 끊기 */
  function clear(card) {
    var h = card._help;
    card._help = null;
    if (h && h.unsub) { try { h.unsub(); } catch (e) {} }
    return h;
  }

  function cancel(card) {
    var h = clear(card);
    setIdle(card);
    if (h && h.fb && h.ref) h.fb.d.remove(h.ref).catch(function () {});
  }

  function send(card, type, q, meta) {
    var who = meta.who ? meta.who() : { grade: val('grade'), classNum: val('classNum'), studentNum: val('studentNum'), level: levelText(meta.prefix) };
    var g = who.grade, c = who.classNum, n = who.studentNum;
    if (!g || !c || !n) { alert('학년, 반, 번호를 먼저 골라 주세요.'); return; }

    if (card._help) cancel(card); // 같은 문제에 다른 종류로 바꾸는 경우
    var level = who.level || '';

    card.querySelectorAll('.help-btn').forEach(function (b) {
      b.disabled = true;
      if (b.dataset.type === type) b.classList.add('sending');
    });

    // ② 시트 기록 (실패해도 버튼 동작에는 영향 없음)
    if (window.callApi) {
      window.callApi('submitHelpRequest', [{ grade: g, classNum: c, studentNum: n, operation: meta.op, level: level, q: q, type: type }])
        .catch(function (e) { if (window.console) console.warn('도움요청 시트 기록 실패:', e && e.message); });
    }

    // ① 교사 현황판 알림
    var conn = window.liveConnect && window.liveConnect();
    if (!conn) { // Firebase 설정이 비어 있으면 시트 기록만
      setSent(card, type);
      card._help = { type: type };
      return;
    }
    conn.then(function (fb) {
      var d = fb.d;
      var path = 'help/' + window.liveToday() + '/' + window.liveKey(g) + '_' + window.liveKey(c) + '/' + window.liveKey(n);
      var ref = d.push(d.ref(fb.db, path));
      var h = { fb: fb, ref: ref, type: type, unsub: null };
      card._help = h;
      return d.set(ref, {
        type: type,
        op: String(meta.op).slice(0, 40),
        level: String(level).slice(0, 120),
        q: Math.max(1, Math.min(20, Number(q) || 1)),
        uid: String(fb.uid || ''),
        at: d.serverTimestamp()
      }).then(function () {
        if (card._help !== h) return; // 그 사이 취소됨
        setSent(card, type);
        h.unsub = d.onValue(ref, function (snap) {
          var v = snap.val();
          if (card._help !== h) return;
          if (!v) { clear(card); setIdle(card); return; }           // 선생님이 지움
          if (v.done) { clear(card); setDone(card); }                // 선생님이 해결
        }, function () {
          if (card._help === h) { clear(card); setIdle(card); }      // 읽기 권한이 사라짐 = 지워짐
        });
      });
    }).catch(function (e) {
      if (window.console) console.warn('도움 요청 전송 실패:', e && e.message);
      clear(card);
      setIdle(card);
      alert('도움 요청을 보내지 못했어요. 손을 들어 선생님을 불러 주세요.');
    });
  }

  function decorate(grid, meta, cardSel, numSel) {
    meta = meta || GRIDS[grid.id];
    grid.querySelectorAll(cardSel || '.math-card').forEach(function (card) {
      if (card.querySelector('.help-bar')) return;
      var qn = card.querySelector(numSel || '.question-num');
      var m = qn && qn.textContent.match(/(\d+)/);
      if (!m) return;
      var q = Number(m[1]);
      var bar = document.createElement('div');
      bar.className = 'help-bar';
      ['unknown', 'check'].forEach(function (type) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'help-btn';
        b.dataset.type = type;
        b.tabIndex = -1; // 답 칸 사이 Tab 이동을 방해하지 않게
        b.textContent = TYPES[type].icon + ' ' + TYPES[type].label;
        b.addEventListener('click', function (ev) {
          ev.preventDefault();
          var h = card._help;
          if (h && h.type === type) cancel(card);
          else send(card, type, q, meta);
        });
        bar.appendChild(b);
      });
      qn.insertAdjacentElement('afterend', bar);
    });
  }

  /* 분수 페이지: frac-kit.js의 진단 모드일 때만 */
  function startFrac() {
    var K = window.FracKit;
    if (!K || !K.isDiagnostic || !K.session) return false;
    var s = K.session;
    var meta = {
      op: s.operation || '분수',
      who: function () { return { grade: s.grade, classNum: s.classNum, studentNum: s.studentNum, level: s.level || '' }; }
    };
    var run = function () { decorate(document.body, meta, '.quiz-card', '.quiz-number'); };
    run();
    new MutationObserver(run).observe(document.body, { childList: true, subtree: true });
    return true;
  }

  function start() {
    if (window.FracKit) { startFrac(); return; }
    Object.keys(GRIDS).forEach(function (id) {
      var grid = document.getElementById(id);
      if (!grid) return;
      decorate(grid);
      new MutationObserver(function () { decorate(grid); }).observe(grid, { childList: true, subtree: true });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
