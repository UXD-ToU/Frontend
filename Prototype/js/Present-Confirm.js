document.addEventListener("DOMContentLoaded", () => {

  const backBtn =
    document.getElementById("backBtn");

  const giftImage =
    document.getElementById("giftImage");

  const imagePlaceholder =
    document.getElementById(
      "imagePlaceholder"
    );

  const productName =
    document.getElementById(
      "productName"
    );

  const productPrice =
    document.getElementById(
      "productPrice"
    );

  const productBrand =
    document.getElementById(
      "productBrand"
    );

  const friendList =
    document.getElementById(
      "friendList"
    );

  const addFriendBtn =
    document.getElementById(
      "addFriendBtn"
    );

  const memoInput =
    document.getElementById(
      "memoInput"
    );

  const memoCount =
    document.getElementById(
      "memoCount"
    );

  const saveBtn =
    document.getElementById(
      "saveBtn"
    );

  const toast =
    document.getElementById(
      "toast"
    );


  let selectedFriend =
    "지수";

  let draftData =
    {};

  let editingData =
    null;

  let toastTimer =
    null;


  // ========================================
  // Mode
  // ========================================

  const presentMode =
    sessionStorage.getItem(
      "presentMode"
    );


  const isEditMode =
    presentMode === "edit";


  // ========================================
  // Edit Data
  // ========================================

  if (isEditMode) {

    const savedEditPresent =
      sessionStorage.getItem(
        "editPresent"
      );


    if (savedEditPresent) {

      try {

        editingData =
          JSON.parse(
            savedEditPresent
          );


        productName.value =
          editingData.name || "";


        productPrice.value =
          editingData.price
            ? formatPrice(
                editingData.price
              )
            : "";


        productBrand.value =
          editingData.category || "";


        memoInput.value =
          editingData.memo || "";


        selectedFriend =
          editingData.recipient ||
          "지수";


        if (
          editingData.image
        ) {

          giftImage.src =
            editingData.image;

          giftImage.hidden =
            false;

          imagePlaceholder.hidden =
            true;

        }


        selectFriendChip(
          selectedFriend
        );


        saveBtn.textContent =
          "수정 내용 저장";

      } catch (error) {

        console.error(
          "수정 데이터 로딩 실패:",
          error
        );

      }

    }

  }


  // ========================================
  // New Data
  // ========================================

  else {

    const savedDraft =
      sessionStorage.getItem(
        "presentDraft"
      );


    if (savedDraft) {

      try {

        draftData =
          JSON.parse(
            savedDraft
          );


        if (
          draftData.image
        ) {

          giftImage.src =
            draftData.image;

          giftImage.hidden =
            false;

          imagePlaceholder.hidden =
            true;

        }


        memoInput.value =
          draftData.memo || "";

      } catch (error) {

        console.error(
          error
        );

      }

    }

  }


  updateMemoCount();


  // ========================================
  // Back
  // ========================================

  backBtn.addEventListener(
    "click",
    () => {

      if (isEditMode) {

        sessionStorage.removeItem(
          "presentMode"
        );

        sessionStorage.removeItem(
          "editPresent"
        );


        window.location.href =
          "./Present-Detail.html";

        return;

      }


      window.location.href =
        "./Present-Photo.html";

    }
  );


  // ========================================
  // Price Input
  // ========================================

  productPrice.addEventListener(
    "input",
    () => {

      const number =
        productPrice.value.replace(
          /[^0-9]/g,
          ""
        );


      productPrice.value =
        number
          ? Number(number)
              .toLocaleString("ko-KR")
          : "";

    }
  );


  // ========================================
  // Friend
  // ========================================

  friendList.addEventListener(
    "click",
    (event) => {

      const button =
        event.target.closest(
          ".friend-chip"
        );


      if (!button) {
        return;
      }


      selectedFriend =
        button.dataset.friend;


      selectFriendChip(
        selectedFriend
      );

    }
  );


  function selectFriendChip(
    friend
  ) {

    const buttons =
      friendList.querySelectorAll(
        ".friend-chip"
      );


    buttons.forEach(
      (button) => {

        button.classList.toggle(
          "active",
          button.dataset.friend ===
            friend
        );

      }
    );

  }


  // ========================================
  // Add Friend
  // ========================================

  if (addFriendBtn) {

    addFriendBtn.addEventListener(
      "click",
      () => {

        showToast(
          "친구 추가 기능은 준비 중이에요."
        );

      }
    );

  }


  // ========================================
  // Memo
  // ========================================

  memoInput.addEventListener(
    "input",
    updateMemoCount
  );


  function updateMemoCount() {

    if (!memoCount) {
      return;
    }


    memoCount.textContent =
      memoInput.value.length;

  }


  // ========================================
  // SAVE
  // ========================================

  saveBtn.addEventListener(
    "click",
    () => {

      const name =
        productName.value.trim();


      const price =
        Number(
          productPrice.value.replace(
            /[^0-9]/g,
            ""
          )
        );


      const category =
        productBrand.value.trim();


      const memo =
        memoInput.value.trim();


      if (!name) {

        showToast(
          "상품명을 입력해주세요."
        );

        productName.focus();

        return;

      }


      if (!price) {

        showToast(
          "가격을 입력해주세요."
        );

        productPrice.focus();

        return;

      }


      // ====================================
      // 수정 모드
      // ====================================

      if (
        isEditMode &&
        editingData
      ) {

        const updatedPresent = {

          ...editingData,

          name:
            name,

          price:
            price,

          category:
            category || "기타",

          recipient:
            selectedFriend,

          memo:
            memo

        };


        // ==================================
        // 기본 목데이터 수정 여부
        // ==================================

        const isDefaultCandidate =
          [1, 2, 3].some(
            (id) =>
              String(id) ===
              String(updatedPresent.id)
          );


        // ==================================
        // 기본 목데이터 수정
        // ==================================

        if (isDefaultCandidate) {

          let editedCandidates =
            [];


          const savedEdits =
            sessionStorage.getItem(
              "editedCandidates"
            );


          if (savedEdits) {

            try {

              const parsed =
                JSON.parse(
                  savedEdits
                );


              if (
                Array.isArray(parsed)
              ) {

                editedCandidates =
                  parsed;

              }

            } catch (error) {

              console.error(
                error
              );

            }

          }


          const existingIndex =
            editedCandidates.findIndex(
              (candidate) =>
                String(candidate.id) ===
                String(updatedPresent.id)
            );


          if (
            existingIndex >= 0
          ) {

            editedCandidates[
              existingIndex
            ] =
              updatedPresent;

          } else {

            editedCandidates.push(
              updatedPresent
            );

          }


          sessionStorage.setItem(
            "editedCandidates",
            JSON.stringify(
              editedCandidates
            )
          );

        }


        // ==================================
        // 직접 등록 후보 수정
        // ==================================

        else {

          let addedCandidates =
            [];


          const savedAdded =
            sessionStorage.getItem(
              "addedCandidates"
            );


          if (savedAdded) {

            try {

              const parsed =
                JSON.parse(
                  savedAdded
                );


              if (
                Array.isArray(parsed)
              ) {

                addedCandidates =
                  parsed;

              }

            } catch (error) {

              console.error(
                error
              );

            }

          }


          addedCandidates =
            addedCandidates.map(
              (candidate) => {

                if (
                  String(candidate.id) ===
                  String(updatedPresent.id)
                ) {

                  return updatedPresent;

                }


                return candidate;

              }
            );


          sessionStorage.setItem(
            "addedCandidates",
            JSON.stringify(
              addedCandidates
            )
          );

        }


        // ==================================
        // 상세 페이지용 최신 데이터
        // ==================================

        sessionStorage.setItem(
          "selectedCandidate",
          JSON.stringify(
            updatedPresent
          )
        );


        sessionStorage.removeItem(
          "editPresent"
        );


        sessionStorage.removeItem(
          "presentMode"
        );


        window.location.href =
          "./Present-Complete.html";


        return;

      }


      // ====================================
      // 신규 등록
      // ====================================

      const today =
        new Date();


      const savedDate =
        [
          today.getFullYear(),

          String(
            today.getMonth() + 1
          ).padStart(2, "0"),

          String(
            today.getDate()
          ).padStart(2, "0")
        ].join(".");


      const newPresent = {

        id:
          Date.now(),

        name:
          name,

        category:
          category || "기타",

        price:
          price,

        savedDate:
          savedDate,

        recipient:
          selectedFriend,

        relationship:
          "친구",

        memo:
          memo,

        image:
          draftData.image ||
          null

      };


      let addedCandidates =
        [];


      const savedAdded =
        sessionStorage.getItem(
          "addedCandidates"
        );


      if (savedAdded) {

        try {

          const parsed =
            JSON.parse(
              savedAdded
            );


          if (
            Array.isArray(parsed)
          ) {

            addedCandidates =
              parsed;

          }

        } catch (error) {

          console.error(
            error
          );

        }

      }


      addedCandidates.push(
        newPresent
      );


      sessionStorage.setItem(
        "addedCandidates",
        JSON.stringify(
          addedCandidates
        )
      );


      sessionStorage.setItem(
        "selectedCandidate",
        JSON.stringify(
          newPresent
        )
      );


      sessionStorage.removeItem(
        "presentDraft"
      );


      window.location.href =
        "./Present-Complete.html";

    }
  );


  // ========================================
  // Price Format
  // ========================================

  function formatPrice(
    value
  ) {

    return Number(
      value || 0
    ).toLocaleString(
      "ko-KR"
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

});