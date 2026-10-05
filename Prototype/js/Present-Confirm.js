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

  let selectedFriend = "지수";
  let draftData = {};
  let toastTimer = null;


  // ========================================
  // Photo 페이지 데이터 불러오기
  // ========================================

  const savedDraft =
    sessionStorage.getItem(
      "presentDraft"
    );


  if (savedDraft) {
    try {
      draftData =
        JSON.parse(savedDraft);


      // 사진 표시
      if (draftData.image) {
        giftImage.src =
          draftData.image;

        giftImage.hidden =
          false;

        imagePlaceholder.hidden =
          true;
      }


      // 메모 표시
      if (draftData.memo) {
        memoInput.value =
          draftData.memo;
      }

    } catch (error) {
      console.error(
        "임시 데이터를 불러오지 못했습니다.",
        error
      );
    }
  }


  // ========================================
  // 메모 카운트 초기화
  // ========================================

  updateMemoCount();


  // ========================================
  // 뒤로가기
  // ========================================

  backBtn.addEventListener(
    "click",
    () => {
      window.location.href =
        "./Present-Photo.html";
    }
  );


  // ========================================
  // 가격 입력
  // ========================================

  productPrice.addEventListener(
    "input",
    () => {
      const numberValue =
        productPrice.value.replace(
          /[^0-9]/g,
          ""
        );


      productPrice.value =
        numberValue
          ? Number(
              numberValue
            ).toLocaleString(
              "ko-KR"
            )
          : "";
    }
  );


  // ========================================
  // 친구 선택
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


      const friendButtons =
        friendList.querySelectorAll(
          ".friend-chip"
        );


      friendButtons.forEach(
        (friendButton) => {
          friendButton.classList.remove(
            "active"
          );
        }
      );


      button.classList.add(
        "active"
      );


      selectedFriend =
        button.dataset.friend;
    }
  );


  // ========================================
  // 친구 추가
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
  // 메모
  // ========================================

  memoInput.addEventListener(
    "input",
    () => {
      updateMemoCount();
    }
  );


  function updateMemoCount() {
    memoCount.textContent =
      memoInput.value.length;
  }


  // ========================================
  // 후보 저장
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


      // ------------------------------------
      // Validation
      // ------------------------------------

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
      // 날짜 생성
      // ====================================

      const today =
        new Date();

      const year =
        today.getFullYear();

      const month =
        String(
          today.getMonth() + 1
        ).padStart(2, "0");

      const day =
        String(
          today.getDate()
        ).padStart(2, "0");

      const savedDate =
        `${year}.${month}.${day}`;


      // ====================================
      // List에서 사용하는 데이터 구조
      // ====================================

      const presentData = {
        id:
          Date.now(),

        name:
          name,

        category:
          brand || "기타",

        price:
          Number(priceText),

        savedDate:
          savedDate,

        source:
          "직접 저장",

        recipient:
          selectedFriend,

        relationship:
          "친구",

        reasonType:
          "judgment",

        reasonLabel:
          "내 판단",

        reason:
          "직접 등록한 선물 후보",

        status:
          "considering",

        statusLabel:
          "고려 중",

        memo:
          memo,

        image:
          draftData.image || null
      };


      console.log(
        "새 후보:",
        presentData
      );


      // ====================================
      // 기존 추가 후보 배열 가져오기
      // ====================================

      let addedCandidates = [];

      const savedCandidates =
        sessionStorage.getItem(
          "addedCandidates"
        );


      if (savedCandidates) {
        try {
          addedCandidates =
            JSON.parse(
              savedCandidates
            );

          if (
            !Array.isArray(
              addedCandidates
            )
          ) {
            addedCandidates = [];
          }

        } catch (error) {
          addedCandidates = [];
        }
      }


      // ====================================
      // 새로운 후보 추가
      // ====================================

      addedCandidates.unshift(
        presentData
      );


      // ====================================
      // sessionStorage 저장
      // ====================================

      sessionStorage.setItem(
        "addedCandidates",
        JSON.stringify(
          addedCandidates
        )
      );


      // 임시 Photo 데이터 제거
      sessionStorage.removeItem(
        "presentDraft"
      );


      // ====================================
      // 완료 페이지
      // ====================================

      window.location.href =
        "./Present-Complete.html";
    }
  );


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
});