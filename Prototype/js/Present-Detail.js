document.addEventListener("DOMContentLoaded", () => {

  const backBtn =
    document.getElementById("backBtn");

  const presentImage =
    document.getElementById("presentImage");

  const imagePlaceholder =
    document.getElementById("imagePlaceholder");

  const productName =
    document.getElementById("productName");

  const productPrice =
    document.getElementById("productPrice");

  const savedDate =
    document.getElementById("savedDate");

  const recipient =
    document.getElementById("recipient");

  const relationship =
    document.getElementById("relationship");

  const reasonList =
    document.getElementById("reasonList");

  const memoArea =
    document.getElementById("memoArea");

  const memoDivider =
    document.getElementById("memoDivider");

  const memoText =
    document.getElementById("memoText");

  const editButton =
    document.getElementById("editButton");

  const deleteButton =
    document.getElementById("deleteButton");

  const deleteModal =
    document.getElementById("deleteModal");

  const cancelDeleteButton =
    document.getElementById("cancelDeleteButton");

  const confirmDeleteButton =
    document.getElementById("confirmDeleteButton");


  // ========================================
  // 데이터
  // ========================================

  const savedCandidate =
    sessionStorage.getItem(
      "selectedCandidate"
    );


  if (!savedCandidate) {
    window.location.href =
      "./Present-List.html";

    return;
  }


  let presentData;


  try {
    presentData =
      JSON.parse(savedCandidate);

  } catch (error) {

    console.error(error);

    window.location.href =
      "./Present-List.html";

    return;
  }


  // ========================================
  // 상세 정보 렌더링
  // ========================================

  function renderPresentDetail() {

    if (presentData.image) {

      presentImage.src =
        presentData.image;

      presentImage.alt =
        presentData.name || "선물 이미지";

      presentImage.hidden =
        false;

      imagePlaceholder.hidden =
        true;

    } else {

      presentImage.hidden =
        true;

      imagePlaceholder.hidden =
        false;
    }


    productName.textContent =
      presentData.name || "-";


    productPrice.textContent =
      presentData.price
        ? `${formatPrice(
            presentData.price
          )}원`
        : "-";


    savedDate.textContent =
      presentData.savedDate || "-";


    recipient.textContent =
      presentData.recipient || "-";


    relationship.textContent =
      presentData.relationship || "-";


    reasonList.innerHTML = "";


    if (presentData.reason) {

      const reasonChip =
        document.createElement(
          "span"
        );

      reasonChip.className =
        "outline-chip reason-chip";

      reasonChip.textContent =
        presentData.reason;

      reasonList.appendChild(
        reasonChip
      );
    }


    if (presentData.memo) {

      memoText.textContent =
        presentData.memo;

      memoArea.hidden =
        false;

      memoDivider.hidden =
        false;

    } else {

      memoArea.hidden =
        true;

      memoDivider.hidden =
        true;
    }
  }


  // ========================================
  // 뒤로가기
  // ========================================

  backBtn.addEventListener(
    "click",
    () => {

      window.location.href =
        "./Present-List.html";

    }
  );


  // ========================================
  // 편집하기
  // ========================================

  editButton.addEventListener(
    "click",
    () => {

      sessionStorage.setItem(
        "editPresent",
        JSON.stringify(
          presentData
        )
      );


      sessionStorage.setItem(
        "presentMode",
        "edit"
      );


      window.location.href =
        "./Present-Confirm.html";

    }
  );


  // ========================================
  // 삭제 모달
  // ========================================

  deleteButton.addEventListener(
    "click",
    () => {

      deleteModal.classList.add(
        "show"
      );

      deleteModal.setAttribute(
        "aria-hidden",
        "false"
      );

    }
  );


  cancelDeleteButton.addEventListener(
    "click",
    closeDeleteModal
  );


  deleteModal.addEventListener(
    "click",
    (event) => {

      if (
        event.target ===
        deleteModal
      ) {

        closeDeleteModal();

      }

    }
  );


  function closeDeleteModal() {

    deleteModal.classList.remove(
      "show"
    );

    deleteModal.setAttribute(
      "aria-hidden",
      "true"
    );

  }


  // ========================================
  // 삭제
  // ========================================

  confirmDeleteButton.addEventListener(
    "click",
    () => {

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

          console.error(error);

        }

      }


      sessionStorage.removeItem(
        "selectedCandidate"
      );


      window.location.href =
        "./Present-List.html";

    }
  );


  // ========================================
  // 가격
  // ========================================

  function formatPrice(price) {

    return Number(
      price
    ).toLocaleString(
      "ko-KR"
    );

  }


  renderPresentDetail();

});