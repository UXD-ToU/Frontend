앱 회귀 테스트

1. 저장소 루트에서 `python3 -m http.server 8765 --bind 127.0.0.1 --directory www`를 실행합니다.
2. Playwright가 설치된 Node 환경에서 `node tests/app.cjs`를 실행합니다.
   - Playwright가 없으면 별도 테스트 환경에 `npm install --no-save playwright` 후 `npx playwright install chromium`으로 준비합니다.
   - 시스템 Chromium을 쓰려면 `CHROMIUM_PATH=/usr/bin/chromium node tests/app.cjs`를 실행합니다.
   - 서버 주소는 `APP_URL`로 바꿀 수 있습니다.

테스트마다 새 브라우저 컨텍스트를 사용하므로 실제 앱의 사용자 데이터를 변경하지 않습니다.
친구/상품 중복 등록, 검색 후 친구 선택 유지, 작성 내용 유지, 속성 값 이스케이프, 데이터 영속성, 링크 검사, 빠른 화면 전환, 사진 제한/삭제, 친구 삭제 시 상품 정리를 검사합니다.

범위: www 웹 화면을 Chromium에서 검증합니다. Android APK 빌드, 실기기의 Clipboard 및 외부 사이트 열기는 별도 확인이 필요합니다. AI 상품 정보 추출과 커뮤니티는 현재 코드에 실제 구현이 없습니다.
