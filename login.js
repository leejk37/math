/*
 * login.js — 진단 첫 화면(index.html)의 구글 로그인과 '평가자 선택' 자동 채우기
 *
 *  - '평가자 선택' 줄 오른쪽에 [🔑 구글 로그인] 버튼을 붙입니다. 로그인은 선택 사항입니다.
 *  - 로그인하면 서버(GAS 계정.gs의 whoAmI)가 시트에서 찾아
 *      학생 → 학년·반·번호·이름을 채우고 바꿀 수 없게 잠급니다.
 *      담임 → 학년·반을 채웁니다(번호는 선생님이 고름).
 *      그 밖의 교사·명단에 없는 계정 → 지금처럼 직접 고릅니다.
 *  - 실시간 현황판용 익명 로그인(api.js, Firebase 앱 이름 'live-report')과 섞이지 않도록
 *    이 파일은 따로 'student-login'이라는 이름의 Firebase 앱을 씁니다.
 *  - config.js의 FIREBASE가 비어 있으면 버튼을 만들지 않습니다(예전과 똑같이 작동).
 */
(function () {
  var FB_VER = '10.12.2';
  var SEL = ['grade', 'classNum', 'studentNum'];
  var am = null, auth = null, box = null, applied = null;

  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  ready(function () {
    var cfg = window.APP_CONFIG && window.APP_CONFIG.FIREBASE;
    var bar = $('grade') && $('grade').parentNode;
    if (!cfg || !cfg.apiKey || !bar) return;

    bar.style.flexWrap = 'wrap';
    box = document.createElement('span');
    box.id = 'loginBox';
    box.style.cssText = 'display:inline-flex;align-items:center;gap:8px;margin-right:10px;font-size:14px;color:#334155;';
    bar.insertBefore(box, bar.firstChild); // 로그인을 맨 앞에: 로그인하면 뒤의 선택 칸이 자동으로 채워짐
    show('<button type="button" disabled style="' + btnCss('#94a3b8') + '">🔑 로그인 준비 중…</button>');

    var base = 'https://www.gstatic.com/firebasejs/' + FB_VER + '/';
    Promise.all([import(base + 'firebase-app.js'), import(base + 'firebase-auth.js')]).then(function (m) {
      am = m[1];
      auth = am.getAuth(m[0].initializeApp(cfg, 'student-login'));
      am.onAuthStateChanged(auth, function (u) {
        if (u && !u.isAnonymous) identify(u); else signedOut();
      });
    }).catch(function () { show(''); });
  });

  function btnCss(bg) {
    return 'font-size:15px;font-weight:bold;padding:6px 12px;border-radius:8px;border:none;cursor:pointer;color:#fff;background:' + bg + ';';
  }
  function show(html) { if (box) box.innerHTML = html; }

  function signedOut() {
    unlock();
    markMine(null);
    applied = null;
    show('<button type="button" id="loginBtn" style="' + btnCss('#2563eb') + '">🔑 구글 로그인</button>');
    $('loginBtn').onclick = function () {
      var p = new am.GoogleAuthProvider();
      p.setCustomParameters({ prompt: 'select_account' });
      am.signInWithPopup(auth, p).catch(function (e) {
        if (e && e.code === 'auth/popup-closed-by-user') return;
        alert('로그인하지 못했습니다. 평가자를 직접 골라 주세요.\n(' + (e && e.message) + ')');
      });
    };
  }

  function logoutLink() {
    return ' <a href="#" id="logoutLink" style="color:#64748b;font-size:13px;">로그아웃</a>';
  }
  function bindLogout() {
    var a = $('logoutLink');
    if (a) a.onclick = function (ev) { ev.preventDefault(); am.signOut(auth); };
  }

  function identify(u) {
    show('<span>확인 중…</span>');
    u.getIdToken().then(function (t) {
      return window.callApi('whoAmI', [{ idToken: t }]);
    }).then(function (res) {
      if (!res || res.status === 'error') throw new Error((res && res.message) || '확인하지 못했습니다.');
      if (res.role === 'student') {
        whenListReady(function () {
          var ok = choose(res.grade, res.classNum, res.num);
          if (!ok) { show(tag('#fef3c7', '#92400e', '⚠ 명부와 맞지 않아요: ' + esc(res.grade + '학년 ' + res.classNum + ' ' + res.num + '번')) + logoutLink()); bindLogout(); return; }
          lock();
          markMine(res.grade);
          applied = res;
          show(tag('#dcfce7', '#166534', '🎒 ' + esc(res.grade + '학년 ' + res.classNum + ' ' + res.num + '번 ' + res.name)) + logoutLink());
          bindLogout();
        });
      } else if (res.role === 'teacher') {
        unlock();
        var h = res.homeroom || [];
        if (h.length) whenListReady(function () { choose(h[0].grade, h[0].classNum, null); });
        markMine(h.length ? h[0].grade : null);
        show(tag('#e0e7ff', '#3730a3', '👩‍🏫 ' + esc(h.length ? h.map(function (x) { return x.grade + '학년 ' + x.classNum; }).join(', ') + ' 담임' : '선생님')) + logoutLink());
        bindLogout();
      } else {
        unlock();
        show(tag('#f1f5f9', '#475569', esc(res.email) + ' — 명부에 없는 계정이에요. 직접 골라 주세요') + logoutLink());
        bindLogout();
      }
    }).catch(function (e) {
      unlock();
      show(tag('#fee2e2', '#991b1b', '로그인 확인 실패 — 직접 골라 주세요') + logoutLink());
      bindLogout();
      if (window.console) console.warn('로그인 확인 실패:', e && e.message);
    });
  }

  function tag(bg, fg, text) {
    return '<span style="background:' + bg + ';color:' + fg + ';padding:5px 10px;border-radius:8px;font-weight:bold;">' + text + '</span>';
  }

  // 학생명부를 불러와 반 목록이 채워질 때까지 기다림 (최대 20초)
  function whenListReady(fn) {
    var t0 = Date.now();
    (function wait() {
      var c = $('classNum');
      if (c && c.options.length > 0) return fn();
      if (Date.now() - t0 > 20000) return fn();
      setTimeout(wait, 200);
    })();
  }

  function setSel(id, v) {
    var s = $(id);
    if (!s) return false;
    v = String(v);
    if (![].some.call(s.options, function (o) { return o.value === v; })) return false;
    s.value = v;
    s.dispatchEvent(new Event('change'));
    return true;
  }

  function choose(grade, classNum, num) {
    if (!setSel('grade', grade)) return false;
    if (!setSel('classNum', classNum)) return false;
    // 대시보드의 학년·반도 같은 학급으로 맞춰 둠
    setSel('dashGrade', grade); setSel('dashClassNum', classNum);
    if (num == null) return true;
    return setSel('studentNum', num);
  }

  // 내 학년의 분수·소수 탭을 노랗게 강조 (자연수 탭은 모든 학년 공통이라 강조하지 않음)
  var MINE = { '3': ['btn-frac3'], '4': ['btn-frac4'], '5': ['btn-frac5', 'btn-dec5', 'btn-range5', 'btn-mix5'], '6': ['btn-frac6', 'btn-dec6'] };
  function markMine(grade) {
    [].forEach.call(document.querySelectorAll('#nav-menu .nav-btn.mine'), function (b) { b.classList.remove('mine'); b.title = ''; });
    (MINE[String(grade)] || []).forEach(function (id) { var b = $(id); if (b) { b.classList.add('mine'); b.title = '우리 학년 영역'; } });
  }

  function lock() {
    SEL.forEach(function (id) { var s = $(id); if (s) { s.disabled = true; s.title = '로그인한 학생으로 고정되어 있어요'; } });
  }
  function unlock() {
    SEL.forEach(function (id) { var s = $(id); if (s) { s.disabled = false; s.title = ''; } });
  }
})();
