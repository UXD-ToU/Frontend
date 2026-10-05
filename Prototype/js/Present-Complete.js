document.addEventListener("DOMContentLoaded", () => {
  const backBtn =
    document.getElementById(
      "backBtn"
    );

  const homeBtn =
    document.getElementById(
      "homeBtn"
    );

  const continueBtn =
    document.getElementById(
      "continueBtn"
    );


  // ========================================
  // 뒤로가기
  // ========================================

  backBtn.addEventListener(
    "click",
    () => {
      window.location.href =
        "./Present-Confirm.html";
    }
  );


  // ========================================
  // 후보 목록으로
  // ========================================

  homeBtn.addEventListener(
    "click",
    () => {
      window.location.href =
        "./Present-List.html";
    }
  );


  // ========================================
  // 계속 등록
  // ========================================

  continueBtn.addEventListener(
    "click",
    () => {
      window.location.href =
        "./Present-Photo.html";
    }
  );
});