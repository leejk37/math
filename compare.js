/*
 * compare.js — 학생 결과 화면의 '반 평균과 내 기록' 표 (100칸 계산 100/index.html, 구구단 gugudan.html)
 * renderCompare(상자, 서버결과, { score, sec, partial })  — partial: 끝까지 풀지 않은 기록이면 true — 서버결과는 학생기록.gs의 getHundredClass / submitGugudan 이 돌려준 값
 *  - 이번 기록 / 내 오늘 평균 / 반 오늘 평균 / 내 전체 평균 / 반 전체 평균 을 점수·시간으로 비교
 *  - 맨 위에 '반 평균보다 몇 초 빨라요/느려요' 한 줄
 */
(function () {
  var css = '.cmp{margin-top:12px;border:1.5px solid #cbd5e1;border-radius:12px;padding:10px 12px;background:#fff;color:#0f172a;font-size:15px;text-align:left}' +
    '.cmp .hd{font-weight:700;margin-bottom:6px}.cmp .msg{margin-bottom:8px;font-size:15px}.cmp .msg b{font-size:17px}' +
    '.cmp .fast{color:#15803d}.cmp .slow{color:#b45309}' +
    '.cmp table{width:100%;border-collapse:collapse}.cmp th,.cmp td{padding:5px 4px;border-bottom:1px solid #e2e8f0;text-align:right;white-space:nowrap}' +
    '.cmp th{font-weight:400;color:#64748b;font-size:13px}.cmp td:first-child,.cmp th:first-child{text-align:left}' +
    '.cmp tr.me td{font-weight:700;background:#fef9c3}.cmp td small{color:#64748b;font-weight:400}' +
    '.cmp .rc{margin-top:8px;font-size:13px;color:#64748b}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function mmss(s) { s = Math.round(Number(s) || 0); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function md(day) { var p = String(day || '').split('-'); return p.length === 3 ? (+p[1]) + '/' + (+p[2]) : day; }

  window.renderCompare = function (box, d, now) {
    if (!box) return;
    if (!d || d.status !== 'success') { box.innerHTML = ''; return; }
    var rows = [['이번 기록', now, '', true]];
    var add = function (label, x, unit) { if (x) rows.push([label, x, '<small>(' + x.n + unit + ')</small>']); };
    add('내 오늘 평균', d.today && d.today.mine, '번');
    add('반 오늘 평균', d.today && d.today.cls, '명');
    add('내 전체 평균', d.all && d.all.mine, '번');
    add('반 전체 평균', d.all && d.all.cls, '명');

    // 반 평균(오늘, 없으면 전체)과 이번 시간 비교 한 줄
    // 정확하게가 먼저: 점수가 반 평균보다 낮으면 시간 칭찬 대신 정확도 안내, 끝까지 풀지 않았으면(now.partial) 비교하지 않음
    var ref = (d.today && d.today.cls) || (d.all && d.all.cls), msg = '';
    if (now && now.partial) {
      msg = '끝까지 풀지 않아서 반 평균과 비교하지 않아요. 모든 문제를 풀면 비교할 수 있어요.';
    } else if (ref && now && now.score < Math.round(ref.score)) {
      msg = '점수가 반 평균보다 <b class="slow">' + (Math.round(ref.score) - now.score) + '점 낮아요</b>. 빠르기보다 <b>정확하게</b>가 먼저예요!';
    } else if (ref && now && now.sec != null) {
      var diff = Math.round(ref.sec - now.sec);
      msg = diff > 0 ? '반 평균보다 <b class="fast">' + mmss(diff) + ' 빨라요</b> 🚀'
        : diff < 0 ? '반 평균보다 <b class="slow">' + mmss(-diff) + ' 느려요</b>. 조금 더 연습해 봐요!'
        : '반 평균과 <b>같은 시간</b>이에요.';
    }
    var mine = d.all && d.all.mine;
    if (mine && mine.best != null && now && !now.partial && now.score === 100 && now.sec <= mine.best) msg += (msg ? '<br>' : '') + '🏆 <b>내 최고 기록(100점 중 가장 빠름)</b>이에요!';

    var html = '<div class="hd">📊 반 평균과 내 기록</div>' + (msg ? '<div class="msg">' + msg + '</div>' : '') +
      '<table><tr><th></th><th>점수</th><th>걸린 시간</th></tr>' +
      rows.map(function (r) {
        return '<tr' + (r[3] ? ' class="me"' : '') + '><td>' + r[0] + ' ' + r[2] + '</td><td>' + Math.round(r[1].score) + '점</td><td>' + mmss(r[1].sec) + '</td></tr>';
      }).join('') + '</table>';
    if (d.recent && d.recent.length) {
      html += '<div class="rc">최근 내 기록: ' + d.recent.map(function (r) {
        return md(r.day) + ' ' + r.score + '점 ' + mmss(r.sec) + (r.note ? '(' + esc(r.note) + ')' : '');
      }).join(' · ') + '</div>';
    }
    box.innerHTML = '<div class="cmp">' + html + '</div>';
  };
})();
