/*
 * api.js — 화면(GitHub Pages)과 서버(GAS)를 이어 주는 파일
 *  1) callApi('함수이름', [인자...]) : GAS에 요청하고 결과를 받습니다.
 *  2) google.script.run 대체품 : 기존 Index.html 코드를 거의 고치지 않고 그대로 쓰도록
 *     google.script.run.withSuccessHandler(…).withFailureHandler(…).함수(…) 형태를 흉내 냅니다.
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

  window.callApi = function (action, args) {
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
