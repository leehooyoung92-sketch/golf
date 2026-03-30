/**
 * Google Apps Script - RSVP 폼 데이터 수신
 *
 * 사용법:
 * 1. Google 스프레드시트를 생성하고 첫 행에 아래 헤더를 입력하세요:
 *    타임스탬프 | 참석날짜 | 성함 | 대리운전 | 차량번호 | 자택주소 | 개인정보동의
 *
 * 2. 확장 프로그램 > Apps Script를 클릭하세요.
 *
 * 3. 아래 코드를 편집기에 붙여넣으세요.
 *
 * 4. 배포 > 새 배포를 클릭하세요.
 *    - 유형: 웹 앱
 *    - 실행 주체: 나 (시트 소유자)
 *    - 액세스 권한: 모든 사용자
 *
 * 5. 배포 URL을 복사하여 main.js의 APPS_SCRIPT_URL에 붙여넣으세요.
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    sheet.appendRow([
      new Date(),              // 타임스탬프
      data.date || '',         // 참석날짜
      data.name || '',         // 성함
      data.drive || '',        // 대리운전
      data.carnum || '',       // 차량번호
      data.address || '',      // 자택주소
      '동의'                   // 개인정보동의
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// 테스트용 GET 핸들러
function doGet(e) {
  return ContentService
    .createTextOutput('RSVP 서비스가 정상 작동 중입니다.')
    .setMimeType(ContentService.MimeType.TEXT);
}
