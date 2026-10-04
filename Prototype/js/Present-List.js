// ========================================
// 후보 목록 페이지
// ========================================

document.addEventListener("DOMContentLoaded", () => {
  const candidateCards = document.querySelectorAll(".candidate-card");
  const tournamentButton = document.querySelector(".tournament-button");
  const addButton = document.querySelector(".add-button");

  // ========================================
  // 후보 선택
  // ========================================

  candidateCards.forEach((card) => {
    const checkbox = card.querySelector('input[type="checkbox"]');

    if (!checkbox) return;

    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        card.classList.add("selected");
      } else {
        card.classList.remove("selected");
      }

      updateTournamentButton();
    });
  });

  // ========================================
  // 토너먼트 버튼 상태
  // ========================================

  function updateTournamentButton() {
    const checkedCandidates = document.querySelectorAll(
      '.candidate-card input[type="checkbox"]:checked'
    );

    if (!tournamentButton) return;

    tournamentButton.disabled = checkedCandidates.length < 2;
  }

  // ========================================
  // 후보 삭제
  // ========================================

  document.addEventListener("click", (event) => {
    const deleteButton = event.target.closest(".delete-button");

    if (!deleteButton) return;

    const card = deleteButton.closest(".candidate-card");

    if (!card) return;

    const confirmed = window.confirm(
      "이 후보를 위시리스트에서 삭제할까요?"
    );

    if (!confirmed) return;

    card.remove();

    updateCandidateCount();
    updateTournamentButton();
  });

  // ========================================
  // 후보 개수 업데이트
  // ========================================

  function updateCandidateCount() {
    const countElement = document.querySelector(".candidate-count");

    if (!countElement) return;

    const currentCards =
      document.querySelectorAll(".candidate-card").length;

    countElement.textContent = `후보 ${currentCards}개`;
  }

  // ========================================
  // 후보 편집
  // ========================================

  document.addEventListener("click", (event) => {
    const editButton = event.target.closest(".edit-button");

    if (!editButton) return;

    const card = editButton.closest(".candidate-card");

    if (!card) return;

    const candidateId = card.dataset.id;

    console.log("편집할 후보:", candidateId);

    // 추후 편집 페이지 연결
    // window.location.href =
    //   `candidate-edit.html?id=${candidateId}`;
  });

  // ========================================
  // 후보 추가
  // ========================================

  if (addButton) {
    addButton.addEventListener("click", () => {
      console.log("후보 추가");

      // 추후 후보 추가 페이지 연결
      // window.location.href = "candidate-add.html";
    });
  }

  // ========================================
  // 토너먼트 시작
  // ========================================

  if (tournamentButton) {
    tournamentButton.addEventListener("click", () => {
      const selectedCandidates = [
        ...document.querySelectorAll(
          '.candidate-card input[type="checkbox"]:checked'
        ),
      ];

      if (selectedCandidates.length < 2) {
        alert("토너먼트를 시작하려면 후보를 2개 이상 선택해주세요.");
        return;
      }

      const candidateIds = selectedCandidates.map((checkbox) => {
        return checkbox
          .closest(".candidate-card")
          ?.dataset.id;
      });

      console.log(
        "토너먼트 선택 후보:",
        candidateIds
      );

      // 추후 토너먼트 페이지 연결
      // sessionStorage.setItem(
      //   "tournamentCandidates",
      //   JSON.stringify(candidateIds)
      // );

      // window.location.href =
      //   "gift-tournament.html";
    });
  }

  // ========================================
  // 필터
  // ========================================

  const statusFilter =
    document.querySelector("#statusFilter");

  const reasonFilter =
    document.querySelector("#reasonFilter");

  function applyFilters() {
    const selectedStatus =
      statusFilter?.value ?? "all";

    const selectedReason =
      reasonFilter?.value ?? "all";

    candidateCards.forEach((card) => {
      const cardStatus =
        card.dataset.status;

      const cardReason =
        card.dataset.reason;

      const statusMatched =
        selectedStatus === "all" ||
        cardStatus === selectedStatus;

      const reasonMatched =
        selectedReason === "all" ||
        cardReason === selectedReason;

      if (statusMatched && reasonMatched) {
        card.hidden = false;
      } else {
        card.hidden = true;
      }
    });
  }

  statusFilter?.addEventListener(
    "change",
    applyFilters
  );

  reasonFilter?.addEventListener(
    "change",
    applyFilters
  );

  // ========================================
  // 하단 네비게이션
  // ========================================

  const navigationItems =
    document.querySelectorAll(".nav-item");

  navigationItems.forEach((item) => {
    item.addEventListener("click", () => {
      const page = item.dataset.page;

      switch (page) {
        case "home":
          console.log("홈");
          // window.location.href = "home.html";
          break;

        case "wishlist":
          console.log("위시리스트");
          // window.location.href =
          //   "candidate-list.html";
          break;

        case "community":
          console.log("커뮤니티");
          // window.location.href =
          //   "community.html";
          break;

        default:
          break;
      }
    });
  });

  // 초기 상태
  updateCandidateCount();
  updateTournamentButton();
});