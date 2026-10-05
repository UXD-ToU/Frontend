document.addEventListener("DOMContentLoaded", () => {

  const candidateList =
    document.getElementById("candidateList");

  const candidateCount =
    document.getElementById("candidateCount");

  const friendFilter =
    document.getElementById("friendFilter");

  const sortFilter =
    document.getElementById("sortFilter");

  const addBtn =
    document.getElementById("addBtn");

  const tournamentBtn =
    document.getElementById("tournamentBtn");

  const toast =
    document.getElementById("toast");


  // ========================================
  // 기본 목데이터
  // ========================================

  const defaultCandidates = [
    {
      id: 1,
      name: "버즈 라이트 이어폰 프로",
      category: "삼성",
      price: 68000,
      savedDate: "2025.05.18",
      recipient: "지수",
      relationship: "친구",
      memo: "",
      image:
        "https://img.danuri.io/catalog-image/462/010/013/4f26520466984e6cb05036c94d6b68f4.jpg"
    },
  ];


  // ========================================
  // 후보 데이터 만들기
  // ========================================

  let candidates =
    [...defaultCandidates];


  // ========================================
  // 수정된 목데이터 적용
  // ========================================

  const savedEdits =
    sessionStorage.getItem(
      "editedCandidates"
    );


  if (savedEdits) {

    try {

      const editedCandidates =
        JSON.parse(savedEdits);


      if (
        Array.isArray(
          editedCandidates
        )
      ) {

        editedCandidates.forEach(
          (editedCandidate) => {

            const index =
              candidates.findIndex(
                (candidate) =>
                  String(candidate.id) ===
                  String(editedCandidate.id)
              );


            if (index !== -1) {

              candidates[index] = {
                ...candidates[index],
                ...editedCandidate
              };

            }

          }
        );

      }

    } catch (error) {

      console.error(
        "수정 후보 불러오기 실패:",
        error
      );

    }

  }


  // ========================================
  // 직접 추가한 후보 적용
  // ========================================

  const savedAddedCandidates =
    sessionStorage.getItem(
      "addedCandidates"
    );


  if (savedAddedCandidates) {

    try {

      const addedCandidates =
        JSON.parse(
          savedAddedCandidates
        );


      if (
        Array.isArray(
          addedCandidates
        )
      ) {

        candidates.push(
          ...addedCandidates
        );

      }

    } catch (error) {

      console.error(
        "추가 후보 불러오기 실패:",
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

    let result =
      [...candidates];


    // ======================================
    // 친구 필터
    // ======================================

    if (
      friendFilter &&
      friendFilter.value !== "all"
    ) {

      result =
        result.filter(
          (candidate) =>
            candidate.recipient ===
            friendFilter.value
        );

    }


    // ======================================
    // 정렬
    // ======================================

    const sortValue =
      sortFilter
        ? sortFilter.value
        : "latest";


    if (
      sortValue === "latest"
    ) {

      result.sort(
        (a, b) =>
          parseDate(b.savedDate) -
          parseDate(a.savedDate)
      );

    }


    if (
      sortValue === "oldest"
    ) {

      result.sort(
        (a, b) =>
          parseDate(a.savedDate) -
          parseDate(b.savedDate)
      );

    }


    if (
      sortValue === "priceHigh"
    ) {

      result.sort(
        (a, b) =>
          Number(b.price) -
          Number(a.price)
      );

    }


    if (
      sortValue === "priceLow"
    ) {

      result.sort(
        (a, b) =>
          Number(a.price) -
          Number(b.price)
      );

    }


    // ======================================
    // Count
    // ======================================

    if (candidateCount) {

      candidateCount.textContent =
        `후보 ${result.length}개`;

    }


    candidateList.innerHTML =
      "";


    // ======================================
    // Empty
    // ======================================

    if (
      result.length === 0
    ) {

      candidateList.innerHTML = `
        <div class="empty-state">
          등록된 후보가 없어요.
        </div>
      `;

      updateTournamentButton();

      return;

    }


    // ======================================
    // Card
    // ======================================

    result.forEach(
      (candidate) => {

        const card =
          document.createElement(
            "article"
          );


        card.className =
          "candidate-card";


        card.dataset.id =
          candidate.id;


        const checked =
          selectedCandidates.has(
            String(candidate.id)
          );


        const imageHTML =
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
              ${checked ? "checked" : ""}
            />

          </div>


          ${imageHTML}


          <div class="candidate-info">

            <h4 class="candidate-name">
              ${escapeHtml(candidate.name)}
            </h4>


            <p class="candidate-category">
              ${escapeHtml(
                candidate.category || "기타"
              )}
            </p>


            <strong class="candidate-price">
              ${formatPrice(candidate.price)}원
            </strong>


            ${
              candidate.memo
                ? `
                  <p class="candidate-memo">
                    ${escapeHtml(candidate.memo)}
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
  // List Click
  // ========================================

  candidateList.addEventListener(
    "click",
    (event) => {

      // 체크박스
      if (
        event.target.classList.contains(
          "candidate-checkbox"
        )
      ) {

        event.stopPropagation();


        const id =
          String(
            event.target.dataset.id
          );


        if (
          event.target.checked
        ) {

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


      // 버튼
      const actionButton =
        event.target.closest(
          "[data-action]"
        );


      if (actionButton) {

        event.stopPropagation();


        const id =
          String(
            actionButton.dataset.id
          );


        const candidate =
          candidates.find(
            (item) =>
              String(item.id) === id
          );


        if (!candidate) {
          return;
        }


        // ==================================
        // 수정
        // ==================================

        if (
          actionButton.dataset.action ===
          "edit"
        ) {

          sessionStorage.setItem(
            "selectedCandidate",
            JSON.stringify(candidate)
          );


          sessionStorage.setItem(
            "editPresent",
            JSON.stringify(candidate)
          );


          sessionStorage.setItem(
            "presentMode",
            "edit"
          );


          window.location.href =
            "./Present-Confirm.html";

          return;

        }


        // ==================================
        // 삭제
        // ==================================

        if (
          actionButton.dataset.action ===
          "delete"
        ) {

          deleteCandidate(
            candidate
          );

          return;

        }

      }


      // ====================================
      // 상세 이동
      // ====================================

      const card =
        event.target.closest(
          ".candidate-card"
        );


      if (!card) {
        return;
      }


      const id =
        String(
          card.dataset.id
        );


      const candidate =
        candidates.find(
          (item) =>
            String(item.id) === id
        );


      if (!candidate) {
        return;
      }


      sessionStorage.setItem(
        "selectedCandidate",
        JSON.stringify(candidate)
      );


      window.location.href =
        `./Present-Detail.html?id=${candidate.id}`;

    }
  );


  // ========================================
  // Delete
  // ========================================

  function deleteCandidate(
    candidate
  ) {

    const confirmed =
      window.confirm(
        `"${candidate.name}" 후보를 삭제할까요?`
      );


    if (!confirmed) {
      return;
    }


    candidates =
      candidates.filter(
        (item) =>
          String(item.id) !==
          String(candidate.id)
      );


    selectedCandidates.delete(
      String(candidate.id)
    );


    // 직접 추가한 후보 삭제
    const savedAdded =
      sessionStorage.getItem(
        "addedCandidates"
      );


    if (savedAdded) {

      try {

        const added =
          JSON.parse(savedAdded);


        if (
          Array.isArray(added)
        ) {

          const updated =
            added.filter(
              (item) =>
                String(item.id) !==
                String(candidate.id)
            );


          sessionStorage.setItem(
            "addedCandidates",
            JSON.stringify(updated)
          );

        }

      } catch (error) {

        console.error(error);

      }

    }


    renderCandidates();

    showToast(
      "후보를 삭제했어요."
    );

  }


  // ========================================
  // Filter
  // ========================================

  if (friendFilter) {

    friendFilter.addEventListener(
      "change",
      renderCandidates
    );

  }


  if (sortFilter) {

    sortFilter.addEventListener(
      "change",
      renderCandidates
    );

  }


  // ========================================
  // Add
  // ========================================

  if (addBtn) {

    addBtn.addEventListener(
      "click",
      () => {

        sessionStorage.removeItem(
          "presentMode"
        );

        sessionStorage.removeItem(
          "editPresent"
        );

        sessionStorage.removeItem(
          "presentDraft"
        );


        window.location.href =
          "./Present-Photo.html";

      }
    );

  }


  // ========================================
  // Tournament
  // ========================================

  if (tournamentBtn) {

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
                String(candidate.id)
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

  }


  function updateTournamentButton() {

    if (!tournamentBtn) {
      return;
    }


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
  // Utils
  // ========================================

  function parseDate(
    dateString
  ) {

    if (!dateString) {
      return 0;
    }


    const normalized =
      dateString.replace(
        /\./g,
        "-"
      );


    const date =
      new Date(normalized);


    return Number.isNaN(
      date.getTime()
    )
      ? 0
      : date.getTime();

  }


  function formatPrice(
    price
  ) {

    return Number(
      price || 0
    ).toLocaleString(
      "ko-KR"
    );

  }


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