document.addEventListener("DOMContentLoaded", () => {
  // ========================================
  // DOM
  // ========================================

  const candidateList =
    document.getElementById(
      "candidateList"
    );

  const candidateCount =
    document.getElementById(
      "candidateCount"
    );

  const statusFilter =
    document.getElementById(
      "statusFilter"
    );

  const reasonFilter =
    document.getElementById(
      "reasonFilter"
    );

  const addBtn =
    document.getElementById(
      "addBtn"
    );

  const tournamentBtn =
    document.getElementById(
      "tournamentBtn"
    );

  const toast =
    document.getElementById(
      "toast"
    );


  // ========================================
  // 기본 Mock Data
  // ========================================

  const candidates = [
    {
  id: 1,

  name: "버즈 라이트 이어폰 프로",

  category: "삼성",

  price: 68000,

  savedDate: "2025.05.18",

  recipient: "지수",

  relationship: "친구",

  reasonType: "direct",

  reason: "직접 갖고 싶다고 했어요",

  status: "considering",

  statusLabel: "고려 중",

  image: "https://img.danuri.io/catalog-image/462/010/013/4f26520466984e6cb05036c94d6b68f4.jpg"
}

  ];


  // ========================================
  // sessionStorage 후보 가져오기
  // ========================================

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
        candidates.unshift(
          ...addedCandidates
        );
      }

    } catch (error) {
      console.error(
        "추가 후보를 불러오지 못했습니다.",
        error
      );
    }
  }


  // ========================================
  // State
  // ========================================

  const selectedCandidates =
    new Set();

  let toastTimer = null;


  // ========================================
  // 후보 렌더링
  // ========================================

  function renderCandidates() {
    const selectedStatus =
      statusFilter.value;

    const selectedReason =
      reasonFilter.value;


    const filteredCandidates =
      candidates.filter(
        (candidate) => {
          const statusMatch =
            selectedStatus === "all" ||
            candidate.status ===
              selectedStatus;


          const reasonMatch =
            selectedReason === "all" ||
            candidate.reasonType ===
              selectedReason;


          return (
            statusMatch &&
            reasonMatch
          );
        }
      );


    candidateCount.textContent =
      `후보 ${filteredCandidates.length}개`;


    candidateList.innerHTML = "";


    if (
      filteredCandidates.length === 0
    ) {
      candidateList.innerHTML = `
        <div class="empty-state">
          조건에 맞는 후보가 없어요.
        </div>
      `;

      return;
    }


    filteredCandidates.forEach(
      (candidate) => {
        const card =
          document.createElement(
            "article"
          );


        card.className =
          "candidate-card";


        card.dataset.id =
          candidate.id;


        const isSelected =
          selectedCandidates.has(
            candidate.id
          );


        // ====================================
        // 이미지
        // ====================================

        const imageHtml =
          candidate.image
            ? `
              <div class="candidate-image-wrap">
                <img
                  class="candidate-image"
                  src="${candidate.image}"
                  alt="${escapeHtml(candidate.name)}"
                />
              </div>
            `
            : `
              <div class="candidate-image-wrap candidate-image-placeholder">
                <span>이미지</span>
              </div>
            `;


        // ====================================
        // Card
        // ====================================

        card.innerHTML = `
  <div class="candidate-select">
    <input
      class="candidate-checkbox"
      type="checkbox"
      data-id="${candidate.id}"
      ${isSelected ? "checked" : ""}
      aria-label="${escapeHtml(candidate.name)} 선택"
    />
  </div>

  ${imageHtml}

  <div class="candidate-info">

    <div class="candidate-top">

      <div class="candidate-title-area">
        <h4>
          ${escapeHtml(candidate.name)}
        </h4>

        <p class="candidate-category">
          ${escapeHtml(candidate.category)}
        </p>
      </div>

      <span class="status-badge ${candidate.status}">
        ${escapeHtml(candidate.statusLabel)}
      </span>

    </div>

    <strong class="candidate-price">
      ${formatPrice(candidate.price)}원
    </strong>

    <p class="candidate-reason">
      ${escapeHtml(candidate.reason)}
    </p>

    <div class="candidate-actions">

      <button
        class="edit-btn"
        type="button"
        data-action="edit"
        data-id="${candidate.id}"
      >
        수정
      </button>

      <button
        class="delete-btn"
        type="button"
        data-action="delete"
        data-id="${candidate.id}"
      >
        삭제
      </button>

    </div>

    <p class="candidate-date">
      ${escapeHtml(candidate.savedDate)}
    </p>

  </div>
`;


        candidateList.appendChild(
          card
        );
      }
    );


    updateTournamentButton();
  }


  // ========================================
  // 카드 이벤트
  // ========================================

  candidateList.addEventListener(
    "click",
    (event) => {
      const checkbox =
        event.target.closest(
          ".candidate-checkbox"
        );


      if (checkbox) {
        const id =
          Number(
            checkbox.dataset.id
          );


        if (checkbox.checked) {
          selectedCandidates.add(
            id
          );
        } else {
          selectedCandidates.delete(
            id
          );
        }


        updateTournamentButton();

        return;
      }


      const actionButton =
        event.target.closest(
          "[data-action]"
        );


      if (actionButton) {
        event.stopPropagation();


        const id =
          Number(
            actionButton.dataset.id
          );


        const action =
          actionButton.dataset.action;


        if (action === "edit") {
          showToast(
            "수정 기능은 준비 중이에요."
          );

          return;
        }


        if (action === "delete") {
          deleteCandidate(id);

          return;
        }
      }


      const card =
        event.target.closest(
          ".candidate-card"
        );


      if (!card) {
        return;
      }


      const id =
        Number(
          card.dataset.id
        );


      const selectedCandidate =
  candidates.find(
    (candidate) =>
      candidate.id === id
  );

if (!selectedCandidate) {
  return;
}

sessionStorage.setItem(
  "selectedCandidate",
  JSON.stringify(selectedCandidate)
);

window.location.href =
  `./Present-Detail.html?id=${id}`;
    }
  );


  // ========================================
  // 후보 삭제
  // ========================================

  function deleteCandidate(id) {
    const candidate =
      candidates.find(
        (item) =>
          item.id === id
      );


    if (!candidate) {
      return;
    }


    const confirmed =
      window.confirm(
        `"${candidate.name}" 후보를 삭제할까요?`
      );


    if (!confirmed) {
      return;
    }


    const index =
      candidates.findIndex(
        (item) =>
          item.id === id
      );


    if (index !== -1) {
      candidates.splice(
        index,
        1
      );
    }


    selectedCandidates.delete(
      id
    );


    // sessionStorage에 들어있는
    // 사용자 추가 후보도 같이 갱신
    saveAddedCandidates();


    renderCandidates();


    showToast(
      "후보를 삭제했어요."
    );
  }


  // ========================================
  // 추가 후보 sessionStorage 갱신
  // ========================================

  function saveAddedCandidates() {
    const customCandidates =
      candidates.filter(
        (candidate) =>
          Number(candidate.id) > 3
      );


    sessionStorage.setItem(
      "addedCandidates",
      JSON.stringify(
        customCandidates
      )
    );
  }


  // ========================================
  // Filter
  // ========================================

  statusFilter.addEventListener(
    "change",
    () => {
      renderCandidates();
    }
  );


  reasonFilter.addEventListener(
    "change",
    () => {
      renderCandidates();
    }
  );


  // ========================================
  // 후보 추가
  // ========================================

  addBtn.addEventListener(
    "click",
    () => {
      window.location.href =
        "./Present-Photo.html";
    }
  );


  // ========================================
  // 토너먼트
  // ========================================

  tournamentBtn.addEventListener(
    "click",
    () => {
      if (
        selectedCandidates.size < 2
      ) {
        showToast(
          "토너먼트 후보를 2개 이상 선택해주세요."
        );

        return;
      }


      const selectedData =
        candidates.filter(
          (candidate) =>
            selectedCandidates.has(
              candidate.id
            )
        );


      sessionStorage.setItem(
        "tournamentCandidates",
        JSON.stringify(
          selectedData
        )
      );


      showToast(
        "토너먼트 후보가 선택됐어요."
      );


      /*
      window.location.href =
        "./Tournament.html";
      */
    }
  );


  function updateTournamentButton() {
    const count =
      selectedCandidates.size;


    tournamentBtn.disabled =
      count < 2;


    if (count >= 2) {
      tournamentBtn.textContent =
        `토너먼트 시작 (${count})`;
    } else {
      tournamentBtn.textContent =
        "토너먼트 시작";
    }
  }


  // ========================================
  // Tab Bar
  // ========================================

  const tabItems =
    document.querySelectorAll(
      ".tab-item"
    );


  tabItems.forEach(
    (tab) => {
      tab.addEventListener(
        "click",
        () => {
          if (
            tab.classList.contains(
              "active"
            )
          ) {
            return;
          }


          showToast(
            "해당 페이지는 준비 중이에요."
          );
        }
      );
    }
  );


  // ========================================
  // Price
  // ========================================

  function formatPrice(price) {
    return Number(
      price
    ).toLocaleString(
      "ko-KR"
    );
  }


  // ========================================
  // HTML Escape
  // ========================================

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll(
        "&",
        "&amp;"
      )
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );
  }


  // ========================================
  // Toast
  // ========================================

  function showToast(message) {
    if (!toast) {
      return;
    }


    clearTimeout(
      toastTimer
    );


    toast.textContent =
      message;


    toast.classList.add(
      "show"
    );


    toastTimer =
      setTimeout(() => {
        toast.classList.remove(
          "show"
        );
      }, 2000);
  }


  // ========================================
  // Initial
  // ========================================

  renderCandidates();
});