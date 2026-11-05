/*
 * method-hint.js — 방법 선택형 분수 페이지(4215·4216)의 💡 힌트
 *  - '문제 N' 상자 안에 💡 힌트 버튼, 카드 맨 아래에 힌트 상자를 둡니다.
 *  - 힌트 상자는 그 문제에서 고른 풀이 방법(받아내림 / 가분수 변환)에 맞는 내용만 보여 줍니다.
 *    방법을 바꾸면(문제별·전체 일괄 선택 모두) 열린 힌트도 바로 바뀝니다.
 *  - 힌트는 혼자 해결용이라 선생님께 알리지 않습니다. (선생님 호출은 help.js의 🤔 도움)
 *  - 사용: frac-kit.js 다음, help.js 앞에 <script src="method-hint.js"></script>
 *          카드 문자열 안에서 MethodHint.button() 과 MethodHint.box(받아내림 힌트, 가분수 힌트) 를 씁니다.
 */
(function () {
  var css = document.createElement('style');
  css.textContent =
    '.mh-btn{display:block;margin:6px auto 0;font:inherit;font-size:12px;font-weight:bold;line-height:1.2;padding:2px 8px;border-radius:999px;border:1.5px solid #fcd34d;background:#fffbeb;color:#92400e;cursor:pointer;white-space:nowrap}' +
    '.mh-btn:hover{border-color:#f59e0b}' +
    '.mh-btn.on{background:#fde68a}' +
    '.quiz-number>.help-bar{margin-top:4px!important}' +
    // contain:inline-size — 힌트 글이 길어도 카드 폭을 넓히지 않게
    '.mh-box{display:none;contain:inline-size;grid-column:1/-1;flex-basis:100%;background:#fffbeb;border:1.5px dashed #f59e0b;border-radius:10px;padding:8px 14px;font-size:15px;color:#78350f;line-height:1.9;text-align:center}' +
    '.mh-box.show{display:block}' +
    '.mh-box .mh-m2{display:none}.mh-box.m2 .mh-m1{display:none}.mh-box.m2 .mh-m2{display:block}' +
    '.mh-fr{display:inline-flex;flex-direction:column;align-items:center;vertical-align:middle;font-size:13px;line-height:1.1;margin:0 2px}' +
    '.mh-fr>span:first-child{border-bottom:1.5px solid #78350f;padding:0 2px}' +
    '.quiz-card:has(.mh-box){flex-wrap:wrap}';
  document.head.appendChild(css);

  function refresh(card) {
    var box = card && card.querySelector('.mh-box');
    if (!box) return;
    var r = card.querySelector('.method-selector input[value="m2"]');
    box.classList.toggle('m2', !!(r && r.checked));
  }

  window.MethodHint = {
    // 작은 분수 (힌트 글 안에서)
    fr: function (n, d) { return '<span class="mh-fr"><span>' + n + '</span><span>' + d + '</span></span>'; },
    // 대분수 (자연수 + 작은 분수)
    mixed: function (w, n, d) { return w + this.fr(n, d); },
    button: function () {
      return '<button type="button" class="mh-btn" tabindex="-1" title="풀이 방법을 봅니다 (선생님께 알리지 않음)" onclick="MethodHint.toggle(this)">💡 힌트</button>';
    },
    box: function (m1, m2) {
      return '<div class="mh-box"><div class="mh-m1">' + m1 + '</div><div class="mh-m2">' + m2 + '</div></div>';
    },
    toggle: function (btn) {
      var card = btn.closest('.quiz-card');
      var box = card && card.querySelector('.mh-box');
      if (!box) return;
      refresh(card);
      var on = box.classList.toggle('show');
      btn.classList.toggle('on', on);
    }
  };

  // 풀이 방법을 바꾸면 그 카드(전체 일괄 선택이면 모든 카드)의 힌트 내용도 바꿈
  document.addEventListener('change', function (e) {
    var t = e.target;
    if (!t || t.type !== 'radio') return;
    if (t.name === 'global-method') document.querySelectorAll('.quiz-card').forEach(refresh);
    else refresh(t.closest('.quiz-card'));
  });
})();
