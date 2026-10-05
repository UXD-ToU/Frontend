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

  const friendFilter =
    document.getElementById(
      "friendFilter"
    );

  const sortFilter =
    document.getElementById(
      "sortFilter"
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
  // Mock Data
  // ========================================

  const candidates = [

    {
      id: 1,

      name:
        "버즈 라이트 이어폰 프로",

      category:
        "삼성",

      price:
        68000,

      savedDate:
        "2025.05.18",

      recipient:
        "지수",

      relationship:
        "친구",

      memo:
        "",

      image:
        "https://img.danuri.io/catalog-image/462/010/013/4f26520466984e6cb05036c94d6b68f4.jpg"
    },

  ];


  // ========================================
  // 직접 추가한 후보
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

  let toastTimer =
    null;


  // ========================================
  // Render
  // ========================================

  function renderCandidates() {

    const selectedFriend =
      friendFilter.value;

    const selectedSort =
      sortFilter.value;


    // ----------------------------------------
    // 친구 필터
    // ----------------------------------------

    let filteredCandidates =
      candidates.filter(
        (candidate) => {

          if (
            selectedFriend === "all"
          ) {

            return true;

          }


          return (
            candidate.recipient ===
            selectedFriend
          );

        }
      );


    // ----------------------------------------
    // 정렬
    // ----------------------------------------

    filteredCandidates =
      [...filteredCandidates];


    switch (selectedSort) {

      case "latest":

        filteredCandidates.sort(
          (a, b) =>
            parseDate(
              b.savedDate
            ) -
            parseDate(
              a.savedDate
            )
        );

        break;


      case "oldest":

        filteredCandidates.sort(
          (a, b) =>
            parseDate(
              a.savedDate
            ) -
            parseDate(
              b.savedDate
            )
        );

        break;


      case "priceHigh":

        filteredCandidates.sort(
          (a, b) =>
            Number(b.price) -
            Number(a.price)
        );

        break;


      case "priceLow":

        filteredCandidates.sort(
          (a, b) =>
            Number(a.price) -
            Number(b.price)
        );

        break;

    }


    // ----------------------------------------
    // Count
    // ----------------------------------------

    candidateCount.textContent =
      `후보 ${filteredCandidates.length}개`;


    candidateList.innerHTML =
      "";


    // ----------------------------------------
    // Empty
    // ----------------------------------------

    if (
      filteredCandidates.length === 0
    ) {

      candidateList.innerHTML = `
        <div class="empty-state">
          등록된 후보가 없어요.
        </div>
      `;

      updateTournamentButton();

      return;

    }


    // ----------------------------------------
    // Cards
    // ----------------------------------------

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


        const imageHtml =
          candidate.image
            ? `
              <div class="candidate-image-wrap">

                <img
                  class="candidate-image"
                  src="${candidate.image}"
                  alt="${escapeHtml(
                    candidate.name
                  )}"
                />

              </div>
            `
            : `
              <div
                class="
                  candidate-image-wrap
                  candidate-image-placeholder
                "
              >
                이미지
              </div>
            `;


        card.innerHTML = `

          <div class="candidate-select">

            <input
              class="candidate-checkbox"
              type="checkbox"
              data-id="${candidate.id}"
              ${isSelected ? "checked" : ""}
              aria-label="${escapeHtml(
                candidate.name
              )} 선택"
            />

          </div>


          ${imageHtml}


          <div class="candidate-info">

            <h4 class="candidate-name">
              ${escapeHtml(
                candidate.name
              )}
            </h4>


            <p class="candidate-category">
              ${escapeHtml(
                candidate.category ||
                "기타"
              )}
            </p>


            <strong class="candidate-price">
              ${formatPrice(
                candidate.price
              )}원
            </strong>


            ${
              candidate.memo
                ? `
                  <p class="candidate-memo">
                    ${escapeHtml(
                      candidate.memo
                    )}
                  </p>
                `
                : ""
            }


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
              ${escapeHtml(
                candidate.savedDate
              )}
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
  // Card Event
  // ========================================

  candidateList.addEventListener(
    "click",
    (event) => {

      // --------------------------------------
      // Checkbox
      // --------------------------------------

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


      // --------------------------------------
      // Action Button
      // --------------------------------------

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

          const candidate =
            candidates.find(
              (item) =>
                item.id === id
            );


          if (!candidate) {
            return;
          }


          sessionStorage.setItem(
            "selectedCandidate",
            JSON.stringify(
              candidate
            )
          );


          sessionStorage.setItem(
            "editPresent",
            JSON.stringify(
              candidate
            )
          );


          sessionStorage.setItem(
            "presentMode",
            "edit"
          );


          window.location.href =
            "./Present-Confirm.html";


          return;

        }


        if (action === "delete") {

          deleteCandidate(
            id
          );

          return;

        }

      }


      // --------------------------------------
      // Detail
      // --------------------------------------

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
        JSON.stringify(
          selectedCandidate
        )
      );


      window.location.href =
        `./Present-Detail.html?id=${id}`;

    }
  );


  // ========================================
  // Delete
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


    saveAddedCandidates();

    renderCandidates();


    showToast(
      "후보를 삭제했어요."
    );

  }


  // ========================================
  // 추가 후보 저장
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

  friendFilter.addEventListener(
    "change",
    renderCandidates
  );


  sortFilter.addEventListener(
    "change",
    renderCandidates
  );


  // ========================================
  // 후보 추가
  // ========================================

  addBtn.addEventListener(
    "click",
    () => {

      sessionStorage.removeItem(
        "presentMode"
      );

      sessionStorage.removeItem(
        "editPresent"
      );


      window.location.href =
        "./Present-Photo.html";

    }
  );


  // ========================================
  // Tournament
  // ========================================

  tournamentBtn.addEventListener(
    "click",
    () => {

      if (
        selectedCandidates.size < 2
      ) {

        showToast(
          "후보를 2개 이상 선택해주세요."
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

    }
  );


  function updateTournamentButton() {

    const count =
      selectedCandidates.size;


    tournamentBtn.disabled =
      count < 2;


    tournamentBtn.textContent =
      count >= 2
        ? `토너먼트 시작 (${count})`
        : "토너먼트 시작";

  }


  // ========================================
  // Date
  // ========================================

  function parseDate(
    dateString
  ) {

    if (!dateString) {
      return 0;
    }


    const normalized =
      String(dateString)
        .replaceAll(".", "-");


    const date =
      new Date(
        normalized
      );


    const time =
      date.getTime();


    return Number.isNaN(time)
      ? 0
      : time;

  }


  // ========================================
  // Price
  // ========================================

  function formatPrice(
    price
  ) {

    return Number(
      price || 0
    ).toLocaleString(
      "ko-KR"
    );

  }


  // ========================================
  // Escape
  // ========================================

  function escapeHtml(
    value
  ) {

    return String(
      value ?? ""
    )
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

  function showToast(
    message
  ) {

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
      setTimeout(
        () => {

          toast.classList.remove(
            "show"
          );

        },
        2000
      );

  }


  // ========================================
  // Initial
  // ========================================

  renderCandidates();

});