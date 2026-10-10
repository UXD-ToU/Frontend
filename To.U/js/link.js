
const linkInput = document.getElementById("linkInput");
const linkInputWrapper = document.getElementById("linkInputWrapper");

const analyzeButton = document.getElementById("analyzeButton");
const analyzeIcon = document.getElementById("analyzeIcon");

// 페이지 및 아이콘 경로
const NEXT_PAGE = "./loading.html";

const ICON_GRAY = "../assets/icons/AI_Gray.svg";
const ICON_WHITE = "../assets/icons/AI_White.svg";

/* =========================
   밑줄 상태 업데이트
========================= */

function updateUnderline() {
  const hasValue = linkInput.value.trim().length > 0;
  const isFocused = document.activeElement === linkInput;

  // 입력값이 있거나 포커스 중이면 밑줄 표시
  linkInputWrapper.classList.toggle(
    "is-active",
    hasValue || isFocused
  );
}

/* =========================
   AI 분석 버튼 상태 업데이트
========================= */

function updateLinkState() {
  const value = linkInput.value.trim();
  const hasValue = value.length > 0;

  // 입력값이 있으면 버튼 활성화
  analyzeButton.disabled = !hasValue;

  // 버튼 상태에 따라 아이콘 변경
  analyzeIcon.src = hasValue
    ? ICON_WHITE
    : ICON_GRAY;

  // 밑줄 상태도 함께 업데이트
  updateUnderline();
}

/* =========================
   입력 이벤트
========================= */

// 링크 입력 또는 삭제
linkInput.addEventListener("input", updateLinkState);

// 입력창 선택
linkInput.addEventListener("focus", updateUnderline);

// 입력창 선택 해제
linkInput.addEventListener("blur", updateUnderline);

/* =========================
   AI 분석 버튼 클릭
========================= */

analyzeButton.addEventListener("click", () => {
  const value = linkInput.value.trim();

  if (!value) return;

  // 입력한 링크 저장
  sessionStorage.setItem("analysisUrl", value);

  // 로딩 페이지 이동
  window.location.href = NEXT_PAGE;
});

/* =========================
   모바일 키보드 대응
========================= */

function updateKeyboardOffset() {
  if (!window.visualViewport) return;

  const viewport = window.visualViewport;

  const keyboardHeight = Math.max(
    0,
    window.innerHeight -
      viewport.height -
      viewport.offsetTop
  );

  document.documentElement.style.setProperty(
    "--keyboard-offset",
    `${keyboardHeight}px`
  );
}

if (window.visualViewport) {
  window.visualViewport.addEventListener(
    "resize",
    updateKeyboardOffset
  );

  window.visualViewport.addEventListener(
    "scroll",
    updateKeyboardOffset
  );
}

/* =========================
   초기 상태 설정
========================= */

updateLinkState();
updateKeyboardOffset();

/* =========================
   CLOSE BUTTON
========================= */

const backBtn = document.getElementById("backBtn");

backBtn.addEventListener("click", () => {
  window.location.href = "./home.html";
});