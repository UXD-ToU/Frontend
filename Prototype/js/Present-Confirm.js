document.addEventListener("DOMContentLoaded", () => {

  // ========================================
  // DOM
  // ========================================

  const backBtn =
    document.getElementById(
      "backBtn"
    );

  const giftImage =
    document.getElementById(
      "giftImage"
    );

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


  // ========================================
  // State
  // ========================================

  let selectedFriend =
    "지수";

  let draftData =
    {};

  let editingData =
    null;

  let toastTimer =
    null;


  const presentMode =
    sessionStorage.getItem(
      "presentMode"
    );


  const isEditMode =
    presentMode === "edit";


  // ========================================
  // Edit Mode
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
          editingData.name ||
          "";


        productPrice.value =
          editingData.price
            ? formatPrice(
                editingData.price
              )
            : "";


        productBrand.value =
          editingData.category ||
          "";


        memoInput.value =
          editingData.memo ||
          "";


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
          error
        );

      }

    }

  }


  // ========================================
  // New Mode
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
          draftData.memo ||
          "";

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
  // Price
  // ========================================

  productPrice.addEventListener(
    "input",
    () => {

      const value =
        productPrice.value.replace(
          /[^0-9]/g,
          ""
        );


      productPrice.value =
        value
          ? Number(
              value
            ).toLocaleString(
              "ko-KR"
            )
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

  addFriendBtn.addEventListener(
    "click",
    () => {

      showToast(
        "친구 추가 기능은 준비 중이에요."
      );

    }
  );


  // ========================================
  // Memo
  // ========================================

  memoInput.addEventListener(
    "input",
    updateMemoCount
  );


  function updateMemoCount() {

    memoCount.textContent =
      memoInput.value.length;

  }


  // ========================================
  // Save
  // ========================================

  saveBtn.addEventListener(
    "click",
    () => {

      const name =
        productName.value.trim();


      const priceText =
        productPrice.value
          .replace(/,/g, "")
          .trim();


      const brand =
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


      if (!priceText) {

        showToast(
          "가격을 입력해주세요."
        );

        productPrice.focus();

        return;

      }


      // ====================================
      // Edit Save
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
            Number(
              priceText
            ),

          category:
            brand || "기타",

          recipient:
            selectedFriend,

          memo:
            memo

        };


        let savedInCustomList =
          false;


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

              const exists =
                addedCandidates.some(
                  (candidate) =>
                    candidate.id ===
                    updatedPresent.id
                );


              if (exists) {

                const updatedCandidates =
                  addedCandidates.map(
                    (candidate) =>
                      candidate.id ===
                      updatedPresent.id
                        ? updatedPresent
                        : candidate
                  );


                sessionStorage.setItem(
                  "addedCandidates",
                  JSON.stringify(
                    updatedCandidates
                  )
                );


                savedInCustomList =
                  true;

              }

            }

          } catch (error) {

            console.error(
              error
            );

          }

        }


        /*
         * 기본 목데이터를 수정한 경우에도
         * sessionStorage에 override 저장
         */

        if (!savedInCustomList) {

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
                Array.isArray(
                  parsed
                )
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
                candidate.id ===
                updatedPresent.id
            );


          if (
            existingIndex !== -1
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
      // New Save
      // ====================================

      const today =
        new Date();


      const year =
        today.getFullYear();


      const month =
        String(
          today.getMonth() + 1
        ).padStart(
          2,
          "0"
        );


      const day =
        String(
          today.getDate()
        ).padStart(
          2,
          "0"
        );


      const presentData = {

        id:
          Date.now(),

        name:
          name,

        category:
          brand || "기타",

        price:
          Number(
            priceText
          ),

        savedDate:
          `${year}.${month}.${day}`,

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


      const savedCandidates =
        sessionStorage.getItem(
          "addedCandidates"
        );


      if (savedCandidates) {

        try {

          const parsed =
            JSON.parse(
              savedCandidates
            );


          if (
            Array.isArray(
              parsed
            )
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


      addedCandidates.unshift(
        presentData
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
          presentData
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
  // Format Price
  // ========================================

  function formatPrice(
    value
  ) {

    const number =
      String(
        value
      ).replace(
        /[^0-9]/g,
        ""
      );


    if (!number) {
      return "";
    }


    return Number(
      number
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

  document.addEventListener("DOMContentLoaded", () => {

  // ========================================
  // DOM
  // ========================================

  const backBtn =
    document.getElementById(
      "backBtn"
    );

  const giftImage =
    document.getElementById(
      "giftImage"
    );

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


  // ========================================
  // State
  // ========================================

  let selectedFriend =
    "지수";

  let draftData =
    {};

  let editingData =
    null;

  let toastTimer =
    null;


  const presentMode =
    sessionStorage.getItem(
      "presentMode"
    );


  const isEditMode =
    presentMode === "edit";


  // ========================================
  // Edit Mode
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
          editingData.name ||
          "";


        productPrice.value =
          editingData.price
            ? formatPrice(
                editingData.price
              )
            : "";


        productBrand.value =
          editingData.category ||
          "";


        memoInput.value =
          editingData.memo ||
          "";


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
          error
        );

      }

    }

  }


  // ========================================
  // New Mode
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
          draftData.memo ||
          "";

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
  // Price
  // ========================================

  productPrice.addEventListener(
    "input",
    () => {

      const value =
        productPrice.value.replace(
          /[^0-9]/g,
          ""
        );


      productPrice.value =
        value
          ? Number(
              value
            ).toLocaleString(
              "ko-KR"
            )
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

  addFriendBtn.addEventListener(
    "click",
    () => {

      showToast(
        "친구 추가 기능은 준비 중이에요."
      );

    }
  );


  // ========================================
  // Memo
  // ========================================

  memoInput.addEventListener(
    "input",
    updateMemoCount
  );


  function updateMemoCount() {

    memoCount.textContent =
      memoInput.value.length;

  }


  // ========================================
  // Save
  // ========================================

  saveBtn.addEventListener(
    "click",
    () => {

      const name =
        productName.value.trim();


      const priceText =
        productPrice.value
          .replace(/,/g, "")
          .trim();


      const brand =
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


      if (!priceText) {

        showToast(
          "가격을 입력해주세요."
        );

        productPrice.focus();

        return;

      }


      // ====================================
      // Edit Save
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
            Number(
              priceText
            ),

          category:
            brand || "기타",

          recipient:
            selectedFriend,

          memo:
            memo

        };


        let savedInCustomList =
          false;


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

              const exists =
                addedCandidates.some(
                  (candidate) =>
                    candidate.id ===
                    updatedPresent.id
                );


              if (exists) {

                const updatedCandidates =
                  addedCandidates.map(
                    (candidate) =>
                      candidate.id ===
                      updatedPresent.id
                        ? updatedPresent
                        : candidate
                  );


                sessionStorage.setItem(
                  "addedCandidates",
                  JSON.stringify(
                    updatedCandidates
                  )
                );


                savedInCustomList =
                  true;

              }

            }

          } catch (error) {

            console.error(
              error
            );

          }

        }


        /*
         * 기본 목데이터를 수정한 경우에도
         * sessionStorage에 override 저장
         */

        if (!savedInCustomList) {

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
                Array.isArray(
                  parsed
                )
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
                candidate.id ===
                updatedPresent.id
            );


          if (
            existingIndex !== -1
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
      // New Save
      // ====================================

      const today =
        new Date();


      const year =
        today.getFullYear();


      const month =
        String(
          today.getMonth() + 1
        ).padStart(
          2,
          "0"
        );


      const day =
        String(
          today.getDate()
        ).padStart(
          2,
          "0"
        );


      const presentData = {

        id:
          Date.now(),

        name:
          name,

        category:
          brand || "기타",

        price:
          Number(
            priceText
          ),

        savedDate:
          `${year}.${month}.${day}`,

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


      const savedCandidates =
        sessionStorage.getItem(
          "addedCandidates"
        );


      if (savedCandidates) {

        try {

          const parsed =
            JSON.parse(
              savedCandidates
            );


          if (
            Array.isArray(
              parsed
            )
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


      addedCandidates.unshift(
        presentData
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
          presentData
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
  // Format Price
  // ========================================

  function formatPrice(
    value
  ) {

    const number =
      String(
        value
      ).replace(
        /[^0-9]/g,
        ""
      );


    if (!number) {
      return "";
    }


    return Number(
      number
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

});