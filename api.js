/*
 * api.js — 화면(GitHub Pages)과 서버(GAS)를 이어 주는 파일
 *  1) callApi('함수이름', [인자...]) : GAS에 요청하고 결과를 받습니다.
 *  2) google.script.run 대체품 : 기존 Index.html 코드를 거의 고치지 않고 그대로 쓰도록
 *     google.script.run.withSuccessHandler(…).withFailureHandler(…).함수(…) 형태를 흉내 냅니다.
 *  3) 학생이 제출(submitDiagnostic)하면 교사용 실시간 현황판(live.html)으로도 결과를 보냅니다.
 *     (config.js의 FIREBASE가 채워져 있을 때만)
 */
(function () {
  var STORE_KEY = 'math_api_url';
  var ADMIN_KEY = 'math_admin_pw';

  // 주소 뒤 ?api=… 로 들어오면 이 기기에 저장
  try {
    var p = new URLSearchParams(location.search).get('api');
    if (p) localStorage.setItem(STORE_KEY, p);
  } catch (e) {}

  function getApiUrl() {
    var fromConfig = (window.APP_CONFIG && window.APP_CONFIG.API_URL) || '';
    if (fromConfig) return fromConfig;
    try { return localStorage.getItem(STORE_KEY) || ''; } catch (e) { return ''; }
  }

  function getAdminPassword() {
    try { return sessionStorage.getItem(ADMIN_KEY) || ''; } catch (e) { return ''; }
  }
  window.setAdminPassword = function (pw) {
    try { if (pw) sessionStorage.setItem(ADMIN_KEY, pw); else sessionStorage.removeItem(ADMIN_KEY); } catch (e) {}
  };

  // ---- 실시간 현황판(Firebase)으로 제출 결과 보내기 ----
  // 학생이 제출하면 시트 저장과 별도로 Firebase에도 짧은 기록을 보냅니다.
  // 이름은 보내지 않습니다(학년·반·번호만). 현황판이 이름을 학생명부에서 붙입니다.
  // config.js에 FIREBASE가 비어 있으면 아무 일도 하지 않습니다.
  var FB_VER = '10.12.2';
  var liveConn = null;

  function liveKey(v) {
    // '4학년' → '4' (\uD559\uB144 = '학년'. 페이지 문자 인코딩과 상관없이 작동하도록 코드로 적음)
    var s = String(v == null ? '' : v).replace(/\uD559\uB144/g, '').trim().replace(/[.#$\[\]\/]/g, '_');
    return s || '-';
  }
  window.liveKey = liveKey;

  window.liveToday = function () {
    var tz = (window.APP_CONFIG && window.APP_CONFIG.TIME_ZONE) || 'Asia/Seoul';
    try { return new Intl.DateTimeFormat('sv-SE', { timeZone: tz }).format(new Date()); } // 2026-11-03
    catch (e) { return new Date().toISOString().slice(0, 10); }
  };

  function liveConnect() {
    var cfg = window.APP_CONFIG && window.APP_CONFIG.FIREBASE;
    if (!cfg || !cfg.apiKey || !cfg.databaseURL) return null;
    if (!liveConn) {
      var base = 'https://www.gstatic.com/firebasejs/' + FB_VER + '/';
      liveConn = Promise.all([
        import(base + 'firebase-app.js'),
        import(base + 'firebase-auth.js'),
        import(base + 'firebase-database.js')
      ]).then(function (m) {
        var app = m[0].initializeApp(cfg, 'live-report');
        var auth = m[1].getAuth(app);
        // 학생 기기는 '익명 로그인'으로 쓰기 권한만 얻습니다(읽기는 불가).
        return auth.authStateReady()
          .then(function () { return auth.currentUser || m[1].signInAnonymously(auth); })
          .then(function () { return { db: m[2].getDatabase(app), d: m[2], uid: auth.currentUser && auth.currentUser.uid }; });
      });
      liveConn.catch(function () { liveConn = null; }); // 실패하면 다음 제출 때 다시 시도
    }
    return liveConn;
  }

  window.liveConnect = liveConnect; // help.js(도움 버튼)도 같은 연결을 씁니다

  function reportLive(data) {
    if (!data) return;
    var conn = liveConnect();
    if (!conn) return;
    conn.then(function (fb) {
      var d = fb.d;
      var path = 'live/' + window.liveToday() + '/' + liveKey(data.grade) + '_' + liveKey(data.classNum) + '/' + liveKey(data.studentNum);
      var marks = (Array.isArray(data.results) ? data.results : [])
        .slice(0, 20).map(function (r) { return String(r).trim().toUpperCase() === 'O' ? 'O' : 'X'; }).join('');
      return d.push(d.ref(fb.db, path), {
        op: String(data.operation || '').slice(0, 40),
        level: String(data.level || '').slice(0, 120),
        score: Math.max(0, Math.min(100, Number(data.score) || 0)),
        sec: Math.max(0, Math.min(36000, Math.round(Number(data.timeSeconds) || 0))),
        results: marks,
        at: d.serverTimestamp()
      });
    }).catch(function (e) {
      // 현황판 전송이 실패해도 학생 화면과 시트 저장에는 영향이 없습니다.
      if (window.console) console.warn('실시간 현황판 전송 실패:', e && e.message ? e.message : e);
    });
  }

  window.callApi = function (action, args) {
    if (action === 'submitDiagnostic') {
      try { reportLive(args && args[0]); } catch (e) { /* 무시 */ }
    }
    var url = getApiUrl();
    if (!url) return Promise.reject(new Error('서버 주소가 설정되지 않았습니다. config.js의 API_URL을 채워 주세요.'));
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // CORS 사전요청을 피하는 방식
      body: JSON.stringify({ action: action, args: args || [], adminPassword: getAdminPassword() })
    })
      .then(function (r) {
        if (!r.ok) throw new Error('서버 연결에 실패했습니다 (' + r.status + ')');
        return r.json();
      })
      .then(function (res) {
        if (!res || !res.ok) throw new Error((res && res.error) || '서버 응답이 올바르지 않습니다.');
        return res.result;
      });
  };

  // ---- google.script.run 대체품 ----
  function makeRunner(onSuccess, onFailure) {
    return new Proxy({}, {
      get: function (_, name) {
        if (name === 'withSuccessHandler') return function (fn) { return makeRunner(fn, onFailure); };
        if (name === 'withFailureHandler') return function (fn) { return makeRunner(onSuccess, fn); };
        if (name === 'withUserObject') return function () { return makeRunner(onSuccess, onFailure); };
        return function () {
          var args = Array.prototype.slice.call(arguments);
          window.callApi(String(name), args)
            .then(function (result) { if (onSuccess) onSuccess(result); })
            .catch(function (err) {
              if (onFailure) onFailure(err);
              else alert(err.message);
            });
        };
      }
    });
  }

  window.google = window.google || {};
  window.google.script = window.google.script || {};
  window.google.script.run = makeRunner(null, null);
})();
