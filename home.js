/*
 * home.js — 진단 첫 화면(index.html) 보조
 *  1) 진단을 시작하면(영역 탭 #nav-menu가 숨겨지면) 평가자 선택(학년·반·번호)을 잠그고,
 *     진단이 끝나 영역 탭이 다시 보이면 풀어 줍니다. → 문제를 푸는 중에 다른 학생으로 바뀌는 일을 막음
 *     (구글 로그인한 학생은 login.js가 따로 잠가 두므로 그대로 둡니다)
 *  2) 진단 중에는 맨 아래 '통계 대시보드(선생님용)'도 숨깁니다.
 * 기존 진단 코드는 고치지 않고, 화면 상태만 지켜봅니다.
 */
(function () {
  var SEL = ['grade', 'classNum', 'studentNum'];

  function $(id) { return document.getElementById(id); }

  function inQuiz() {
    var nav = $('nav-menu');
    return !!nav && nav.style.display === 'none';
  }

  function sync() {
    var quiz = inQuiz();
    var bar = $('evaluatorBar');
    if (bar) bar.classList.toggle('quiz-locked', quiz);
    SEL.forEach(function (id) {
      var s = $(id);
      if (!s) return;
      if (quiz) {
        if (!s.disabled) { s.disabled = true; s.dataset.quizLock = '1'; }
      } else if (s.dataset.quizLock) {
        delete s.dataset.quizLock;
        s.disabled = false;
      }
    });
    var stats = $('teacherStats');
    if (stats) stats.style.display = quiz ? 'none' : '';
  }

  function ready(fn) { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }

  ready(function () {
    var nav = $('nav-menu');
    if (!nav) return;
    new MutationObserver(sync).observe(nav, { attributes: true, attributeFilter: ['style'] });
    sync();
  });
})();
