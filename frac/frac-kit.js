/*
 * frac-kit.js — 분수·소수 단원 페이지 공통 도우미
 *
 * 각 분수 페이지(3162.html 등)는 원래 혼자 열리는 연습 앱입니다.
 * 이 파일을 붙이면 두 가지 방식으로 동작합니다.
 *  1) 진단 모드: 진단시스템(index.html)의 분수 탭에서 열렸을 때
 *     → 학생 정보 표시, 첫 입력에 타이머 시작, "제출 및 채점하기" → 구글 시트 저장 → 입력 잠금
 *  2) 연습 모드: 파일만 따로 열었을 때
 *     → 기록 없이 원래처럼 정답 확인·새 문제 사용
 *
 * 페이지 맨 아래에서 FracKit.init({...}) 한 번만 부르면 됩니다.
 *   check   : 정답 확인 버튼 선택자 ('#checkAllBtn'),  'create'면 버튼을 새로 만듦
 *   newBtn  : 새 문제 버튼 선택자 (진단 모드에서는 숨김)
 *   grade   : 채점 함수. 문제별 맞음/틀림을 [true,false,...] 배열로 돌려줘야 함
 *   hideInDiagnostic : 진단 모드에서 숨길 요소 선택자 배열 (문제별 개별 확인 버튼 등)
 *   activity: true면 채점 없는 활동 페이지 (제출 버튼 없음)
 *   methods : (선택) 문제별로 고른 풀이 방법을 ['받아내림','가분수 변환',...] 배열로 돌려주는 함수.
 *             주면 시트 '종합평가결과'의 '풀이방법' 칸에 함께 저장됩니다. (4215·4216은 FracKit.cardMethods 사용)
 */
(function () {
  var SESSION_KEY = 'frac_session';
  var params = new URLSearchParams(location.search);
  var nonce = params.get('s');
  var session = null;
  try {
    var saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    if (saved && nonce && saved.nonce === nonce) session = saved;
  } catch (e) {}

  var embedded = window.parent && window.parent !== window;
  var K = window.FracKit = { isDiagnostic: !!session, session: session, embedded: embedded };

  // ---------- 공통 스타일 ----------
  var css = '' +
    '#fk-bar{position:sticky;top:0;z-index:50;display:flex;flex-wrap:wrap;align-items:center;gap:10px;' +
    'background:#fff7ed;border:2px solid #fdba74;border-radius:12px;padding:10px 14px;margin:0 0 18px;' +
    'font-family:"Malgun Gothic","맑은 고딕",sans-serif;font-size:15px;color:#7c2d12;box-shadow:0 2px 6px rgba(0,0,0,.05);width:100%;box-sizing:border-box}' +
    '#fk-bar.fk-practice{background:#f1f5f9;border-color:#cbd5e1;color:#475569}' +
    '#fk-who{font-weight:bold}' +
    '#fk-timer{font-weight:bold;font-variant-numeric:tabular-nums;margin-left:auto}' +
    '#fk-msg{flex-basis:100%;font-weight:bold;display:none}' +
    '#fk-msg.ok{display:block;color:#15803d}#fk-msg.bad{display:block;color:#b91c1c}#fk-msg.info{display:block;color:#334155}' +
    '.fk-btn{border:none;border-radius:8px;padding:8px 14px;font-size:14px;font-weight:bold;cursor:pointer;font-family:inherit}' +
    '.fk-btn-main{background:#ea580c;color:#fff}.fk-btn-sub{background:#e2e8f0;color:#334155}.fk-btn-blue{background:#3b82f6;color:#fff}' +
    '#fk-actions{display:flex;gap:8px;flex-wrap:wrap}' +
    '#fk-bottom{margin:22px 0 10px;display:flex;justify-content:center}' +
    '#fk-bottom .fk-btn{font-size:17px;padding:12px 28px}' +
    '.fk-locked svg,.fk-locked .piece,.fk-locked .choice-btn,.fk-locked .op-btn{pointer-events:none}' +
    '.fk-hidden{display:none!important}';
  if (embedded) {
    // iframe 안에서는 페이지 높이를 내용에 맞추어야 부모 화면이 높이를 정확히 맞출 수 있음
    css += 'html,body{height:auto!important;min-height:0!important;overflow:visible!important}';
  }
  var styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ---------- 타이머 ----------
  var startTime = 0, timerId = null, started = false, submitted = false;
  function fmt(sec) {
    return String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');
  }
  function elapsed() { return started ? Math.floor((Date.now() - startTime) / 1000) : 0; }
  function startTimer() {
    if (started || submitted || !K.isDiagnostic) return;
    started = true;
    startTime = Date.now();
    timerId = setInterval(function () {
      var t = document.getElementById('fk-timer');
      if (t) t.textContent = '⏱ ' + fmt(elapsed());
    }, 1000);
  }

  // ---------- 부모(index.html)에 높이·종료 알리기 ----------
  function post(msg) {
    if (!embedded) return;
    try { window.parent.postMessage(msg, location.origin); } catch (e) {}
  }
  function reportHeight() {
    var h = Math.ceil(document.body.getBoundingClientRect().height) + 60;
    post({ type: 'frac-height', h: h });
  }

  function setMsg(text, kind) {
    var m = document.getElementById('fk-msg');
    if (!m) return;
    m.textContent = text;
    m.className = kind || '';
    reportHeight();
  }

  function $(sel) { return sel ? document.querySelector(sel) : null; }

  // ---------- 제출 후 잠금 ----------
  function lockPage() {
    document.body.classList.add('fk-locked');
    document.querySelectorAll('input, select, textarea, button').forEach(function (el) {
      if (el.closest('#fk-bar')) return;
      if (el.tagName === 'INPUT' && el.type !== 'radio' && el.type !== 'checkbox') el.readOnly = true;
      else el.disabled = true;
    });
  }

  // ---------- 시트로 저장 ----------
  function submit(results, onDone, methods) {
    var s = K.session;
    var correct = results.filter(Boolean).length;
    var score = Math.round(correct / results.length * 100);
    var sec = elapsed();
    var payload = {
      targetSheet: '종합평가결과',
      grade: s.grade, classNum: s.classNum, studentNum: s.studentNum, name: s.name,
      operation: s.operation, level: s.level,
      score: score, timeString: fmt(sec), timeSeconds: sec,
      results: results.map(function (r) { return r ? 'O' : 'X'; })
    };
    if (Array.isArray(methods) && methods.length) payload.methods = methods.map(function (m) { return String(m || '').slice(0, 20); });
    setMsg('저장 중입니다... ⏳', 'info');
    callApi('submitDiagnostic', [payload]).then(function () {
      setMsg(results.length + '문제 중 ' + correct + '개 정답 · ' + score + '점 · ' + fmt(sec) + ' — 저장되었습니다 ✔', 'ok');
      onDone(true);
    }).catch(function (err) {
      setMsg('저장하지 못했습니다: ' + err.message + ' (다시 저장 버튼을 눌러 주세요)', 'bad');
      onDone(false, payload);
    });
  }

  // ---------- 초기화 ----------
  K.init = function (opts) {
    opts = opts || {};
    var s = K.session;

    // 상단 막대
    var bar = document.createElement('div');
    bar.id = 'fk-bar';
    if (!K.isDiagnostic) bar.className = 'fk-practice';
    bar.innerHTML =
      '<span id="fk-who"></span>' +
      '<span id="fk-timer"></span>' +
      '<span id="fk-actions"></span>' +
      '<div id="fk-msg"></div>';
    document.body.insertBefore(bar, document.body.firstChild);

    var who = document.getElementById('fk-who');
    var timerEl = document.getElementById('fk-timer');
    var actions = document.getElementById('fk-actions');

    if (K.isDiagnostic) {
      who.textContent = '👤 ' + s.grade + '학년 ' + s.classNum + ' ' + s.studentNum + '번 ' + s.name + '  ·  ' + s.level;
      timerEl.textContent = opts.activity ? '' : '⏱ 00:00';
    } else {
      who.textContent = opts.activity ? '🧩 활동 페이지' : '📝 연습 모드 — 기록이 저장되지 않습니다';
    }

    function addAction(label, cls, fn) {
      var b = document.createElement('button');
      b.className = 'fk-btn ' + cls;
      b.textContent = label;
      b.onclick = fn;
      actions.appendChild(b);
      return b;
    }
    if (embedded) addAction('↩ 단계 선택으로', 'fk-btn-sub', function () {
      if (K.isDiagnostic && started && !submitted && !confirm('풀던 문제가 저장되지 않습니다. 단계 선택으로 돌아갈까요?')) return;
      post({ type: 'frac-exit' });
    });

    // 진단 모드에서 숨길 것들
    if (K.isDiagnostic) {
      (opts.hideInDiagnostic || []).forEach(function (sel) {
        document.querySelectorAll(sel).forEach(function (el) { el.classList.add('fk-hidden'); });
      });
      var nb = $(opts.newBtn);
      if (nb) nb.classList.add('fk-hidden');
    }

    if (!opts.activity && typeof opts.grade === 'function') {
      // 정답 확인 버튼 찾기 (없으면 새로 만듦)
      var checkBtn = opts.check === 'create' ? null : $(opts.check);
      if (!checkBtn) {
        var wrap = document.createElement('div');
        wrap.id = 'fk-bottom';
        checkBtn = document.createElement('button');
        checkBtn.className = 'fk-btn fk-btn-main';
        checkBtn.textContent = '전체 정답 확인';
        wrap.appendChild(checkBtn);
        document.body.appendChild(wrap);
      }
      if (K.isDiagnostic) checkBtn.textContent = '제출 및 채점하기 ✔️';

      // 첫 입력·클릭에 타이머 시작 (제출 버튼·상단 막대는 제외)
      ['input', 'change', 'pointerdown'].forEach(function (evt) {
        document.addEventListener(evt, function (e) {
          if (!e.target || !e.target.closest) return;
          if (e.target.closest('#fk-bar') || e.target === checkBtn) return;
          startTimer();
        }, true);
      });

      checkBtn.onclick = function () {
        if (!K.isDiagnostic) {
          var r = opts.grade();
          var c = r.filter(Boolean).length;
          setMsg(r.length + '문제 중 ' + c + '개 정답', c === r.length ? 'ok' : 'bad');
          return;
        }
        if (submitted) return;
        if (!started) { alert('아직 풀이를 시작하지 않았습니다.'); return; }
        if (!confirm('제출하면 고칠 수 없습니다. 제출할까요?')) return;

        submitted = true;
        clearInterval(timerId);
        var results = opts.grade();
        var methods = null;
        if (typeof opts.methods === 'function') { try { methods = opts.methods(); } catch (e) { methods = null; } }
        lockPage();
        checkBtn.classList.add('fk-hidden');

        var retryBtn = null;
        function afterSave(ok, payload) {
          if (ok) {
            if (retryBtn) retryBtn.remove();
            addAction('🔄 이번 단계 다시 풀기', 'fk-btn-blue', function () { location.reload(); });
          } else if (!retryBtn) {
            retryBtn = addAction('💾 다시 저장', 'fk-btn-main', function () { submit(results, afterSave, methods); });
          }
          reportHeight();
        }
        submit(results, afterSave, methods);
      };
    }

    // iframe 높이 알리기
    reportHeight();
    if (window.ResizeObserver) new ResizeObserver(reportHeight).observe(document.body);
    window.addEventListener('load', reportHeight);
  };

  // ---------- 풀이 방법 읽기: 카드마다 name="method-N" 라디오(m1 받아내림 / m2 가분수 변환)가 있는 4215·4216용 ----------
  var METHOD_NAMES = { m1: '받아내림', m2: '가분수 변환' };
  K.cardMethods = function (cardSel) {
    return Array.prototype.map.call(document.querySelectorAll(cardSel), function (card) {
      var r = card.querySelector('input[type="radio"][name^="method-"]:checked');
      return r ? (METHOD_NAMES[r.value] || r.value) : '';
    });
  };

  // ---------- 채점 도우미: 입력칸에 정답이 data-속성으로 들어 있는 카드형 페이지(4213~4216)용 ----------
  K.gradeCards = function (cardSel, attr, visibleOnly) {
    return Array.prototype.map.call(document.querySelectorAll(cardSel), function (card) {
      var ok = true;
      card.querySelectorAll('.ans-box').forEach(function (inp) {
        if (visibleOnly && inp.offsetParent === null) return;
        var exp = parseInt(inp.getAttribute(attr), 10);
        var act = parseInt(inp.value, 10);
        var good = !isNaN(act) && act === exp;
        if (!good) ok = false;
        inp.style.borderColor = good ? '#22c55e' : '#ef4444';
        inp.style.backgroundColor = good ? '#f0fdf4' : '#fef2f2';
      });
      card.style.borderColor = ok ? '#22c55e' : '#ef4444';
      card.style.boxShadow = ok ? '0 4px 12px rgba(34,197,94,.15)' : '0 4px 12px rgba(239,68,68,.15)';
      return ok;
    });
  };
})();
