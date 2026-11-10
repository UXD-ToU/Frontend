# To.U Play Store AAB

`ToU-1.0.1-v3-release.aab`는 아래 원본 커밋의 `www`와 기존 Android 프로젝트로 빌드한 릴리스 Android App Bundle입니다.

- 원본 커밋: `bf44e47f4d0e1928f052fd1961b8b7202c7ef28c`
- applicationId: `com.to.u.app`
- versionName / versionCode: `1.0.1` / `3`
- minSdk / targetSdk / compileSdk: `24` / `36` / `36`
- Capacitor Android/Core: `8.6.0`, Clipboard: `8.0.1` (기존 lockfile 사용)
- 기존 추적 파일은 수정하지 않았으며, 이 PR은 `test/` 안의 파일만 추가합니다.

## 업로드

Play Console에서 패키지명이 같은 신규 앱을 만들고 Play App Signing을 설정한 다음, 원하는 테스트/프로덕션 트랙에 AAB를 업로드합니다. 스토어 등록정보, 개인정보처리방침, 데이터 보안, 콘텐츠 등급 등 콘솔의 필수 항목도 작성해야 합니다. 실제 업로드 및 Google 심사는 이 빌드 작업의 검증 범위에 포함되지 않습니다.

새 RSA 업로드 키로 서명했습니다. `tou-upload-certificate.pem`은 공개 인증서이며 개인키가 아닙니다. 개인키와 비밀번호는 공개 저장소에 포함하지 않습니다. 후속 릴리스에도 같은 업로드 키를 사용하고 versionCode를 증가시켜야 합니다. 이미 등록된 앱이라면 Play Console의 업로드 인증서와 이 인증서가 일치해야 하며, versionCode 3이 이미 사용된 경우 이 AAB를 새 릴리스로 업로드할 수 없습니다.

## 검증

- 기존 `tests/app.cjs`의 Chromium 웹 회귀 테스트 8개 통과.
- Gradle `:app:bundleRelease` 릴리스 빌드.
- Google bundletool의 번들 구조 검증 및 manifest 확인.
- jarsigner 서명 검증 및 공개 인증서 대조.
- `www`의 모든 파일과 AAB 내부 `base/assets/public/` 파일을 바이트 단위로 대조.
- Android 실기기/에뮬레이터 실행은 검증하지 않았습니다.

`build-verification.json`에 원본 파일별 SHA-256, AAB 해시와 검증 결과를 기록했습니다.

## 빌드 과정

별도 작업 복사본에서 `npm ci`, `npx cap sync android`, `android/gradlew :app:bundleRelease`를 실행했습니다. Java 21 JDK, Android SDK 36, Build Tools 35.0.0, 저장소의 Gradle 8.14.3 / Android Gradle Plugin 8.13.0을 사용했습니다. 원본 소스 파일과 빌드 설정은 수정하지 않았습니다. 생성된 unsigned AAB를 외부에서 `jarsigner`로 SHA256withRSA / SHA-256 서명했습니다.

앱의 친구·생일·선물 후보 정보는 기존 코드의 IndexedDB 저장 방식을 유지합니다. AI 상품 정보 추출과 커뮤니티는 원본 테스트 안내에 기재된 대로 실제 구현이 없는 상태를 유지합니다.
