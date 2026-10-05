document.addEventListener("DOMContentLoaded", () => {
  const backBtn = document.getElementById("backBtn");
  const homeBtn = document.getElementById("homeBtn");
  const continueBtn = document.getElementById("continueBtn");

  // =========================================
  // 뒤로가기
  // =========================================

  backBtn.addEventListener("click", () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href = "./Present-Photo.html";
  });


  // =========================================
  // 홈으로
  // =========================================

  homeBtn.addEventListener("click", () => {
    // 실제 홈 페이지 파일명에 맞춰 변경 가능
    window.location.href = "./Present-List.html";
  });


  // =========================================
  // 계속 등록
  // =========================================

  continueBtn.addEventListener("click", () => {
    window.location.href = "./Present-Photo.html";
  });
});