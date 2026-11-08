/* confirm-near.js
 * 브라우저 기본 confirm() 창은 항상 화면 위쪽에 떠서 아래쪽 버튼(제출, 메인으로)을 누른 뒤
 * 마우스를 멀리 옮겨야 합니다. confirmNear()는 방금 클릭한 자리 바로 위에 '확인' 버튼이 오도록
 * 확인 창을 띄웁니다.
 *
 * 사용법: confirmNear('제출할까요?').then(function (ok) { if (ok) { ... } });
 *         또는 async 함수 안에서 if (!(await confirmNear('제출할까요?'))) return;
 * 키보드: Enter = 확인, Esc = 취소
 */
(function () {
  if (window.confirmNear) return;

  // 마지막으로 누른 위치를 기억 (터치·마우스 모두)
  var lastPoint = null;
  document.addEventListener('pointerdown', function (e) {
    lastPoint = { x: e.clientX, y: e.clientY, t: Date.now() };
  }, true);

  var css = '' +
    '.cn-overlay{position:fixed;inset:0;background:rgba(15,23,42,.35);z-index:99999}' +
    '.cn-box{position:fixed;width:340px;max-width:calc(100vw - 24px);background:#fff;border-radius:14px;' +
    'box-shadow:0 12px 32px rgba(0,0,0,.25);padding:20px 20px 16px;font-family:"Malgun Gothic","맑은 고딕",sans-serif;' +
    'box-sizing:border-box;animation:cnPop .12s ease-out}' +
    '@keyframes cnPop{from{transform:scale(.95);opacity:0}to{transform:scale(1);opacity:1}}' +
    '.cn-msg{font-size:16px;line-height:1.5;color:#0f172a;white-space:pre-line;margin-bottom:16px;word-break:keep-all}' +
    '.cn-btns{display:flex;justify-content:flex-end;gap:8px}' +
    '.cn-btns button{font-size:16px;font-weight:bold;border:none;border-radius:8px;padding:10px 22px;cursor:pointer;font-family:inherit}' +
    '.cn-cancel{background:#e2e8f0;color:#475569}.cn-cancel:hover{background:#cbd5e1}' +
    '.cn-ok{background:#ea580c;color:#fff}.cn-ok:hover{background:#c2410c}' +
    '.cn-btns button:focus-visible{outline:3px solid #38bdf8;outline-offset:2px}';

  function ensureStyle() {
    if (document.getElementById('cn-style')) return;
    var s = document.createElement('style');
    s.id = 'cn-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  window.confirmNear = function (message) {
    return new Promise(function (resolve) {
      ensureStyle();
      var overlay = document.createElement('div');
      overlay.className = 'cn-overlay';
      var box = document.createElement('div');
      box.className = 'cn-box';
      box.setAttribute('role', 'alertdialog');
      box.setAttribute('aria-modal', 'true');
      var msg = document.createElement('div');
      msg.className = 'cn-msg';
      msg.textContent = message;
      var btns = document.createElement('div');
      btns.className = 'cn-btns';
      var cancel = document.createElement('button');
      cancel.className = 'cn-cancel';
      cancel.textContent = '취소';
      var ok = document.createElement('button');
      ok.className = 'cn-ok';
      ok.textContent = '확인';
      btns.appendChild(cancel);
      btns.appendChild(ok);
      box.appendChild(msg);
      box.appendChild(btns);
      overlay.appendChild(box);
      document.body.appendChild(overlay);

      // 위치: 방금 누른 자리(1초 이내)에 '확인' 버튼 가운데가 오도록. 없으면 화면 가운데.
      var vw = window.innerWidth, vh = window.innerHeight, m = 12;
      var bw = box.offsetWidth, bh = box.offsetHeight;
      var left, top;
      if (lastPoint && Date.now() - lastPoint.t < 1000) {
        var okR = ok.getBoundingClientRect(), boxR = box.getBoundingClientRect();
        var okCx = okR.left - boxR.left + okR.width / 2;
        var okCy = okR.top - boxR.top + okR.height / 2;
        left = lastPoint.x - okCx;
        top = lastPoint.y - okCy;
      } else {
        left = (vw - bw) / 2;
        top = (vh - bh) / 2;
      }
      left = Math.max(m, Math.min(left, vw - bw - m));
      top = Math.max(m, Math.min(top, vh - bh - m));
      box.style.left = left + 'px';
      box.style.top = top + 'px';

      var prevFocus = document.activeElement;
      function close(result) {
        document.removeEventListener('keydown', onKey, true);
        overlay.remove();
        if (prevFocus && prevFocus.focus) { try { prevFocus.focus(); } catch (e) {} }
        resolve(result);
      }
      function onKey(e) {
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(false); }
        else if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); close(document.activeElement !== cancel); }
        else if (e.key === 'Tab') { e.preventDefault(); (document.activeElement === ok ? cancel : ok).focus(); }
      }
      ok.onclick = function () { close(true); };
      cancel.onclick = function () { close(false); };
      overlay.addEventListener('pointerdown', function (e) { if (e.target === overlay) e.preventDefault(); });
      document.addEventListener('keydown', onKey, true);
      ok.focus();
    });
  };
})();
