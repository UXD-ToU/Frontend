document.addEventListener("DOMContentLoaded", () => {

  // ========================================
  // DOM
  // ========================================

  const backButton =
    document.querySelector("#backButton");

  const editButton =
    document.querySelector("#editButton");

  const deleteButton =
    document.querySelector("#deleteButton");

  const deleteModal =
    document.querySelector("#deleteModal");

  const cancelDeleteButton =
    document.querySelector("#cancelDeleteButton");

  const confirmDeleteButton =
    document.querySelector("#confirmDeleteButton");


  // ========================================
  // 임시 후보 데이터
  // 추후 API 응답으로 교체
  // ========================================

  const presentData = {
    id: 1,

    name: "버즈 라이트 이어폰 프로",

    price: 68000,

    savedDate: "2025.05.18",

    source: "AI 제안",

    recipient: "지수",

    relationship: "친구",

    reasons: [
      "직접 갖고 싶다고 했어요",
      "요즘 자주 쓰는 것 같아요"
    ],

    memo:
      "생일 선물로 고려 중. 작년에 이어폰 잃어버렸다고 했음.",

    image: null
  };


  // ========================================
  // 가격 포맷
  // ========================================

  function formatPrice(price) {
    return `${price.toLocaleString("ko-KR")}원`;
  }


  // ========================================
  // 데이터 렌더링
  // ========================================

  function renderPresent(data) {

    const productName =
      document.querySelector("#productName");

    const productPrice =
      document.querySelector("#productPrice");

    const savedDate =
      document.querySelector("#savedDate");

    const sourceBadge =
      document.querySelector("#sourceBadge");

    const recipient =
      document.querySelector("#recipient");

    const relationship =
      document.querySelector("#relationship");

    const reasonList =
      document.querySelector("#reasonList");

    const memoText =
      document.querySelector("#memoText");


    productName.textContent =
      data.name;

    productPrice.textContent =
      formatPrice(data.price);

    savedDate.textContent =
      data.savedDate;

    sourceBadge.textContent =
      data.source;

    recipient.textContent =
      data.recipient;

    relationship.textContent =
      data.relationship;

    memoText.textContent =
      data.memo;


    // 관심 근거 렌더링
    reasonList.innerHTML = "";

    data.reasons.forEach((reason) => {

      const chip =
        document.createElement("span");

      chip.className =
        "outline-chip reason-chip";

      chip.textContent =
        reason;

      reasonList.appendChild(chip);
    });


    // 이미지 렌더링
    renderProductImage(data.image);
  }


  // ========================================
  // 상품 이미지
  // ========================================

  function renderProductImage(imageUrl) {

    if (!imageUrl) return;

    const imageBox =
      document.querySelector("#productImageBox");

    const placeholder =
      document.querySelector("#imagePlaceholder");

    placeholder?.remove();

    const image =
      document.createElement("img");

    image.className =
      "product-image";

    image.src =
      imageUrl;

    image.alt =
      presentData.name;

    imageBox.appendChild(image);
  }


  // ========================================
  // 뒤로가기
  // ========================================

  backButton.addEventListener("click", () => {

    // 이전 페이지가 있는 경우
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    // 직접 URL로 접근했을 경우
    window.location.href =
      "./Present-List.html";
  });


  // ========================================
  // 편집하기
  // ========================================

  editButton.addEventListener("click", () => {

    const presentId =
      presentData.id;

    console.log(
      "편집할 후보:",
      presentId
    );

    // 추후 편집 페이지 연결
    //
    // window.location.href =
    //   `./Present-Edit.html?id=${presentId}`;
  });


  // ========================================
  // 삭제 Modal 열기
  // ========================================

  function openDeleteModal() {

    deleteModal.classList.add("open");

    deleteModal.setAttribute(
      "aria-hidden",
      "false"
    );

    document.body.style.overflow =
      "hidden";
  }


  // ========================================
  // 삭제 Modal 닫기
  // ========================================

  function closeDeleteModal() {

    deleteModal.classList.remove("open");

    deleteModal.setAttribute(
      "aria-hidden",
      "true"
    );

    document.body.style.overflow =
      "";
  }


  deleteButton.addEventListener(
    "click",
    openDeleteModal
  );


  cancelDeleteButton.addEventListener(
    "click",
    closeDeleteModal
  );


  // ========================================
  // Modal 바깥 영역 클릭
  // ========================================

  deleteModal.addEventListener(
    "click",
    (event) => {

      if (event.target === deleteModal) {
        closeDeleteModal();
      }
    }
  );


  // ========================================
  // ESC
  // ========================================

  document.addEventListener(
    "keydown",
    (event) => {

      if (event.key !== "Escape") {
        return;
      }

      if (
        deleteModal.classList.contains("open")
      ) {
        closeDeleteModal();
      }
    }
  );


  // ========================================
  // 실제 삭제
  // ========================================

  confirmDeleteButton.addEventListener(
    "click",
    () => {

      const presentId =
        presentData.id;

      console.log(
        "삭제 후보:",
        presentId
      );

      /*
       * 추후 API 연결 예시
       *
       * await fetch(
       *   `/api/presents/${presentId}`,
       *   {
       *     method: "DELETE"
       *   }
       * );
       */

      closeDeleteModal();

      // 삭제 완료 후 목록 이동
      window.location.href =
        "./Present-List.html";
    }
  );


  // ========================================
  // Initial Render
  // ========================================

  renderPresent(presentData);
});