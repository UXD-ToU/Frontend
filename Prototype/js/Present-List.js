document.addEventListener("DOMContentLoaded", () => {
  // ========================================
  // DOM
  // ========================================

  const candidateList = document.querySelector("#candidateList");
  const candidateCount = document.querySelector("#candidateCount");

  const statusFilter = document.querySelector("#statusFilter");
  const reasonFilter = document.querySelector("#reasonFilter");

  const addBtn = document.querySelector("#addBtn");
  const tournamentBtn = document.querySelector("#tournamentBtn");

  const toast = document.querySelector("#toast");


  // ========================================
  // 후보 목데이터
  // ========================================

  let candidates = [
    {
      id: 1,

      name: "버즈 라이트 이어폰 프로",
      category: "블루투스 이어폰",

      price: 68000,
      savedDate: "2025.05.18",

      source: "AI 제안",

      recipient: "지수",
      relationship: "친구",

      reasonType: "direct",
      reasonLabel: "직접 표현",
      reason: "직접 갖고 싶다고 했어요",

      status: "considering",
      statusLabel: "고려 중",

      memo:
        "생일 선물로 고려 중. 작년에 이어폰 잃어버렸다고 했음.",

      image: null
    },

    {
      id: 2,

      name: "조 말론 우드 세이지 앤 씨 솔트 코롱",
      category: "향수",

      price: 110000,
      savedDate: "2025.05.12",

      source: "직접 저장",

      recipient: "지수",
      relationship: "친구",

      reasonType: "judgment",
      reasonLabel: "내 판단",
      reason: "좋아하는 브랜드 매장에서 오래 구경함",

      status: "considering",
      statusLabel: "고려 중",

      memo: "",

      image: null
    },

    {
      id: 3,

      name: "아뮤트, 여름 — 김신희",
      category: "도서",

      price: 18000,
      savedDate: "2025.05.08",

      source: "직접 저장",

      recipient: "지수",
      relationship: "친구",

      reasonType: "direct",
      reasonLabel: "직접 표현",
      reason: "읽어보고 싶다고 말함",

      status: "saved",
      statusLabel: "저장",

      memo: "",

      image: null
    }
  ];


  // ========================================
  // 선택된 후보 ID
  // ========================================

  const selectedCandidates = new Set();


  // ========================================
  // 후보 리스트 렌더링
  // ========================================

  function renderCandidates() {
    const statusValue = statusFilter.value;
    const reasonValue = reasonFilter.value;


    // 필터링
    const filteredCandidates = candidates.filter((candidate) => {
      const statusMatch =
        statusValue === "all" ||
        candidate.status === statusValue;

      const reasonMatch =
        reasonValue === "all" ||
        candidate.reasonType === reasonValue;

      return statusMatch && reasonMatch;
    });


    // 기존 리스트 초기화
    candidateList.innerHTML = "";


    // ========================================
    // 검색 결과 없음
    // ========================================

    if (filteredCandidates.length === 0) {
      candidateList.innerHTML = `
        <div class="empty-state">
          <p>조건에 맞는 후보가 없어요.</p>
        </div>
      `;

      updateCandidateCount();
      updateTournamentButton();

      return;
    }


    // ========================================
    // 후보 카드 생성
    // ========================================

    filteredCandidates.forEach((candidate) => {
      const card = document.createElement("article");

      card.className = "candidate-card";

      card.dataset.id = candidate.id;
      card.dataset.status = candidate.status;
      card.dataset.reason = candidate.reasonType;


      const isChecked =
        selectedCandidates.has(candidate.id);


      card.innerHTML = `
        <label class="candidate-check">
          <input
            type="checkbox"
            class="candidate-checkbox"
            value="${candidate.id}"
            ${isChecked ? "checked" : ""}
          />

          <span class="check-ui"></span>
        </label>


        <div class="candidate-image">

          ${
            candidate.image
              ? `
                <img
                  src="${candidate.image}"
                  alt="${candidate.name}"
                  class="candidate-product-image"
                />
              `
              : `
                <div class="image-placeholder">

                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="16"
                      rx="2"
                      stroke="currentColor"
                      stroke-width="1.5"
                    />

                    <circle
                      cx="9"
                      cy="9"
                      r="1.5"
                      fill="currentColor"
                    />

                    <path
                      d="M4 18L9 13L12 16L15 13L20 18"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>

                  <span>${candidate.category}</span>

                </div>
              `
          }

        </div>


        <div class="candidate-content">

          <h3 class="candidate-name">
            ${candidate.name}
          </h3>


          <span class="reason-badge">
            ${candidate.reasonLabel}
          </span>


          <p class="candidate-reason">
            ${candidate.reason}
          </p>


          <div class="candidate-actions">

            <span class="status-badge">
              ${candidate.statusLabel}
            </span>


            <button
              class="text-btn edit-btn"
              type="button"
              data-id="${candidate.id}"
            >
              편집
            </button>


            <button
              class="delete-btn"
              type="button"
              data-id="${candidate.id}"
            >
              삭제
            </button>

          </div>

        </div>
      `;


      // ========================================
      // 카드 클릭 → 상세 페이지
      // ========================================

      card.addEventListener("click", (event) => {
        // 체크박스 클릭
        if (event.target.closest(".candidate-check")) {
          return;
        }

        // 버튼 클릭
        if (event.target.closest("button")) {
          return;
        }

        window.location.href =
          `./Present-Detail.html?id=${candidate.id}`;
      });


      // ========================================
      // 체크박스
      // ========================================

      const checkbox =
        card.querySelector(".candidate-checkbox");

      checkbox.addEventListener("change", () => {
        const candidateId =
          Number(checkbox.value);


        if (checkbox.checked) {
          selectedCandidates.add(candidateId);

          card.classList.add("selected");
        } else {
          selectedCandidates.delete(candidateId);

          card.classList.remove("selected");
        }


        updateTournamentButton();
      });


      if (isChecked) {
        card.classList.add("selected");
      }


      // ========================================
      // 편집 버튼
      // ========================================

      const editBtn =
        card.querySelector(".edit-btn");

      editBtn.addEventListener("click", (event) => {
        event.stopPropagation();

        const candidateId =
          Number(editBtn.dataset.id);

        console.log(
          "편집할 후보:",
          candidateId
        );


        /*
         * 편집 페이지가 생기면 아래 코드 사용
         *
         * window.location.href =
         *   `./Present-Edit.html?id=${candidateId}`;
         */


        showToast("편집 페이지 준비 중이에요.");
      });


      // ========================================
      // 삭제 버튼
      // ========================================

      const deleteBtn =
        card.querySelector(".delete-btn");

      deleteBtn.addEventListener("click", (event) => {
        event.stopPropagation();

        const candidateId =
          Number(deleteBtn.dataset.id);

        deleteCandidate(candidateId);
      });


      candidateList.appendChild(card);
    });


    updateCandidateCount();
    updateTournamentButton();
  }


  // ========================================
  // 후보 개수
  // ========================================

  function updateCandidateCount() {
    candidateCount.textContent =
      `후보 ${candidates.length}개`;
  }


  // ========================================
  // 후보 삭제
  // ========================================

  function deleteCandidate(candidateId) {
    const candidate =
      candidates.find(
        (item) => item.id === candidateId
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


    // 후보 데이터 삭제
    candidates = candidates.filter(
      (item) => item.id !== candidateId
    );


    // 토너먼트 선택에서도 제거
    selectedCandidates.delete(candidateId);


    renderCandidates();


    showToast("후보를 삭제했어요.");
  }


  // ========================================
  // 필터
  // ========================================

  statusFilter.addEventListener(
    "change",
    renderCandidates
  );


  reasonFilter.addEventListener(
    "change",
    renderCandidates
  );


  // ========================================
  // 후보 추가
  // ========================================

addBtn.addEventListener("click", () => {
  window.location.href = "./Present-Photo.html";
});

  // ========================================
  // 토너먼트 버튼 상태
  // ========================================

  function updateTournamentButton() {
    const selectedCount =
      selectedCandidates.size;


    /*
     * 2개 이상 선택해야 시작 가능
     */

    if (selectedCount >= 2) {
      tournamentBtn.disabled = false;

      tournamentBtn.classList.add("active");
    } else {
      tournamentBtn.disabled = true;

      tournamentBtn.classList.remove("active");
    }
  }


  // ========================================
  // 토너먼트 시작
  // ========================================

  tournamentBtn.addEventListener(
    "click",
    () => {

      if (selectedCandidates.size < 2) {
        showToast(
          "후보를 2개 이상 선택해주세요."
        );

        return;
      }


      const selectedIds =
        Array.from(selectedCandidates);


      const tournamentCandidates =
        candidates.filter((candidate) =>
          selectedIds.includes(candidate.id)
        );


      console.log(
        "토너먼트 후보:",
        tournamentCandidates
      );


      // 다음 페이지에서 사용할 수 있도록 저장
      sessionStorage.setItem(
        "tournamentCandidates",
        JSON.stringify(tournamentCandidates)
      );


      /*
       * 토너먼트 페이지가 생기면 사용
       *
       * window.location.href =
       *   "./Tournament.html";
       */


      showToast(
        `${selectedCandidates.size}개의 후보를 선택했어요.`
      );
    }
  );


  // ========================================
  // Toast
  // ========================================

  let toastTimer;


  function showToast(message) {
    if (!toast) {
      return;
    }


    clearTimeout(toastTimer);


    toast.textContent = message;

    toast.classList.add("show");


    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2000);
  }


  // ========================================
  // 하단 네비게이션
  // ========================================

  const tabItems =
    document.querySelectorAll(".tab-item");


  tabItems.forEach((tab, index) => {
    tab.addEventListener("click", () => {

      switch (index) {

        // 홈
        case 0:
          console.log("홈");

          /*
          window.location.href =
            "./Home.html";
          */

          showToast("홈 페이지 준비 중이에요.");

          break;


        // 위시리스트
        case 1:
          // 현재 페이지
          break;


        // 커뮤니티
        case 2:
          console.log("커뮤니티");

          /*
          window.location.href =
            "./Community.html";
          */

          showToast(
            "커뮤니티 페이지 준비 중이에요."
          );

          break;


        default:
          break;
      }
    });
  });


  // ========================================
  // 초기 렌더링
  // ========================================

  renderCandidates();
});