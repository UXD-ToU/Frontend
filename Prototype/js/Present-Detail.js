document.addEventListener("DOMContentLoaded", () => {
  // ========================================
  // DOM
  // ========================================

  const backBtn =
    document.getElementById("backBtn");

  const presentImage =
    document.getElementById("presentImage");

  const imagePlaceholder =
    document.getElementById("imagePlaceholder");

  const presentName =
    document.getElementById("presentName");

  const presentPrice =
    document.getElementById("presentPrice");

  const savedDate =
    document.getElementById("savedDate");

  const recipient =
    document.getElementById("recipient");

  const relationship =
    document.getElementById("relationship");

  const reasonList =
    document.getElementById("reasonList");

  const memo =
    document.getElementById("memo");

  const memoSection =
    document.getElementById("memoSection");

  const editBtn =
    document.getElementById("editBtn");

  const deleteBtn =
    document.getElementById("deleteBtn");

  const deleteModal =
    document.getElementById("deleteModal");

  const cancelDeleteBtn =
    document.getElementById("cancelDeleteBtn");

  const confirmDeleteBtn =
    document.getElementById("confirmDeleteBtn");


  // ========================================
  // List에서 선택한 후보 데이터 가져오기
  // ========================================

  const savedCandidate =
    sessionStorage.getItem(
      "selectedCandidate"
    );


  if (!savedCandidate) {
    console.error(
      "선택된 후보 데이터가 없습니다."
    );

    window.location.href =
      "./Present-List.html";

    return;
  }


  let presentData;


  try {
    presentData =
      JSON.parse(savedCandidate);
  } catch (error) {
    console.error(
      "후보 데이터를 불러오지 못했습니다.",
      error
    );

    window.location.href =
      "./Present-List.html";

    return;
  }


  // ========================================
  // 데이터 렌더링
  // ========================================

  renderPresentDetail();


  function renderPresentDetail() {
    // --------------------------------------
    // 이미지
    // --------------------------------------

    if (presentData.image) {
      presentImage.src =
        presentData.image;

      presentImage.alt =
        presentData.name;

      presentImage.hidden =
        false;


      if (imagePlaceholder) {
        imagePlaceholder.hidden =
          true;
      }

    } else {
      presentImage.hidden =
        true;


      if (imagePlaceholder) {
        imagePlaceholder.hidden =
          false;
      }
    }


    // --------------------------------------
    // 상품명
    // --------------------------------------

    if (presentName) {
      presentName.textContent =
        presentData.name || "-";
    }


    // --------------------------------------
    // 가격
    // --------------------------------------

    if (presentPrice) {
      presentPrice.textContent =
        presentData.price
          ? `${formatPrice(
              presentData.price
            )}원`
          : "-";
    }


    // --------------------------------------
    // 저장 날짜
    // --------------------------------------

    if (savedDate) {
      savedDate.textContent =
        presentData.savedDate || "-";
    }


    // --------------------------------------
    // 선물 대상
    // --------------------------------------

    if (recipient) {
      recipient.textContent =
        presentData.recipient || "-";
    }


    // --------------------------------------
    // 관계
    // --------------------------------------

    if (relationship) {
      relationship.textContent =
        presentData.relationship || "-";
    }


    // --------------------------------------
    // 관심 근거
    // --------------------------------------

    if (reasonList) {
      reasonList.innerHTML = "";


      if (presentData.reason) {
        const reasonItem =
          document.createElement("li");

        reasonItem.textContent =
          presentData.reason;

        reasonList.appendChild(
          reasonItem
        );

      } else {
        const reasonItem =
          document.createElement("li");

        reasonItem.textContent =
          "등록된 관심 근거가 없습니다.";

        reasonList.appendChild(
          reasonItem
        );
      }
    }


    // --------------------------------------
    // 메모
    // --------------------------------------

    if (memo) {
      if (presentData.memo) {
        memo.textContent =
          presentData.memo;


        if (memoSection) {
          memoSection.hidden =
            false;
        }

      } else {
        // 메모가 없으면 섹션 자체 숨김

        if (memoSection) {
          memoSection.hidden =
            true;
        }
      }
    }
  }


  // ========================================
  // 뒤로가기
  // ========================================

  if (backBtn) {
    backBtn.addEventListener(
      "click",
      () => {
        window.location.href =
          "./Present-List.html";
      }
    );
  }


  // ========================================
  // 수정
  // ========================================

  if (editBtn) {
    editBtn.addEventListener(
      "click",
      () => {
        /*
         * 추후 수정 페이지가 생기면
         *
         * window.location.href =
         *   `./Present-Edit.html?id=${presentData.id}`;
         */

        alert(
          "수정 기능은 준비 중입니다."
        );
      }
    );
  }


  // ========================================
  // 삭제 모달 열기
  // ========================================

  if (deleteBtn) {
    deleteBtn.addEventListener(
      "click",
      () => {
        if (!deleteModal) {
          return;
        }

        deleteModal.hidden =
          false;
      }
    );
  }


  // ========================================
  // 삭제 취소
  // ========================================

  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener(
      "click",
      () => {
        if (!deleteModal) {
          return;
        }

        deleteModal.hidden =
          true;
      }
    );
  }


  // ========================================
  // 삭제 확인
  // ========================================

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener(
      "click",
      () => {
        deletePresent();
      }
    );
  }


  // ========================================
  // 모달 바깥 클릭
  // ========================================

  if (deleteModal) {
    deleteModal.addEventListener(
      "click",
      (event) => {
        if (
          event.target ===
          deleteModal
        ) {
          deleteModal.hidden =
            true;
        }
      }
    );
  }


  // ========================================
  // 후보 삭제
  // ========================================

  function deletePresent() {
    /*
     * 직접 추가한 후보라면
     * sessionStorage에서도 삭제
     */

    const savedCandidates =
      sessionStorage.getItem(
        "addedCandidates"
      );


    if (savedCandidates) {
      try {
        const addedCandidates =
          JSON.parse(
            savedCandidates
          );


        if (
          Array.isArray(
            addedCandidates
          )
        ) {
          const updatedCandidates =
            addedCandidates.filter(
              (candidate) =>
                candidate.id !==
                presentData.id
            );


          sessionStorage.setItem(
            "addedCandidates",
            JSON.stringify(
              updatedCandidates
            )
          );
        }

      } catch (error) {
        console.error(
          "후보 삭제 중 오류가 발생했습니다.",
          error
        );
      }
    }


    sessionStorage.removeItem(
      "selectedCandidate"
    );


    window.location.href =
      "./Present-List.html";
  }


  // ========================================
  // 가격 포맷
  // ========================================

  function formatPrice(price) {
    return Number(
      price
    ).toLocaleString(
      "ko-KR"
    );
  }
});