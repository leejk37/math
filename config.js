/*
 * config.js — 학교마다 바꾸는 값은 이 파일 한 곳뿐입니다.
 * API_URL: GAS 웹앱을 배포하고 받은 주소(…/exec)를 따옴표 안에 붙여 넣으세요.
 * (비워 두면 화면 주소 뒤에 ?api=웹앱주소 를 붙여 한 번 열었을 때 그 기기에 저장된 주소를 씁니다)
 *
 * FIREBASE: 교사용 실시간 현황판(live.html)을 쓸 때만 채웁니다.
 *   Firebase 콘솔 → 프로젝트 설정 → 일반 → 내 앱 → 'SDK 설정 및 구성'의 firebaseConfig 내용을 그대로 붙여 넣으세요.
 *   비워 두면 현황판 전송은 꺼지고, 기존 기능(시트 저장)은 그대로 작동합니다.
 *   apiKey는 비밀번호가 아닙니다. 데이터 보호는 Firebase '규칙'이 맡습니다.
 *
 * TIME_ZONE: 현황판의 '오늘' 날짜 기준입니다.
 */
window.APP_CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbzii93AdfzuM64bPFk1z_rX-qEn1TomNHbjyUund4Zb1dMh30GtIwkmSpGdRak5j_ZZ/exec',

  FIREBASE: {
    apiKey: 'AIzaSyDzOBpJcqWcyQ-7qi4zTj_nxn7Gvrv6WOM',
    authDomain: 'math-live-e522a.firebaseapp.com',
    databaseURL: 'https://math-live-e522a-default-rtdb.asia-southeast1.firebasedatabase.app',
    projectId: 'math-live-e522a',
    appId: '1:569121499911:web:0b1ecbcdb22823cf29b3a2'
  },

  TIME_ZONE: 'Asia/Seoul'
};
