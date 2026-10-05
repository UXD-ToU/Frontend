document.addEventListener("DOMContentLoaded", () => {
  const backBtn =
    document.getElementById("backBtn");

  const giftImage =
    document.getElementById("giftImage");

  const imagePlaceholder =
    document.getElementById("imagePlaceholder");

  const productName =
    document.getElementById("productName");

  const productPrice =
    document.getElementById("productPrice");

  const productBrand =
    document.getElementById("productBrand");

  const friendList =
    document.getElementById("friendList");

  const addFriendBtn =
    document.getElementById("addFriendBtn");

  const memoInput =
    document.getElementById("memoInput");

  const memoCount =
    document.getElementById("memoCount");

  const saveBtn =
    document.getElementById("saveBtn");

  const toast =
    document.getElementById("toast");


  let selectedFriend = "지수";

  let toastTimer = null;


  // =========================================
  // 이전 페이지
  // =========================================

  backBtn.addEventListener("click", () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    window.location.href =
      "./Present-Photo.html";
  });


  // =========================================
  // 이전 단계 데이터 불러오기
  // =========================================

  const savedPresent =
    sessionStorage.getItem(
      "presentDraft"
    );

  if (savedPresent) {
    try {
      const data =
        JSON.parse(savedPresent);

      productName.value =
        data.name || "";

      productPrice.value =
        data.price
          ? formatPrice(data.price)
          : "";

      productBrand.value =
        data.brand || "";

      memoInput.value =
        data.memo || "";

      updateMemoCount();


      if (data.image) {
        giftImage.src =
          data.image;

        giftImage.hidden =
          false;

        imagePlaceholder.hidden =
          true;
      }
    } catch (error) {
      console.error(
        "임시 저장 데이터를 불러오지 못했습니다.",
        error
      );
    }
  }


  // =========================================
  // 가격 입력
  // =========================================

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
            ).toLocaleString("ko-KR")
          : "";
    }
  );


  // =========================================
  // 친구 선택
  // =========================================

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


  // =========================================
  // 친구 추가
  // =========================================

  addFriendBtn.addEventListener(
    "click",
    () => {
      showToast(
        "친구 추가 기능은 준비 중이에요."
      );
    }
  );


  // =========================================
  // 메모
  // =========================================

  memoInput.addEventListener(
    "input",
    updateMemoCount
  );


  function updateMemoCount() {
    memoCount.textContent =
      memoInput.value.length;
  }


  // =========================================
  // 저장
  // =========================================

  saveBtn.addEventListener(
    "click",
    () => {
      const name =
        productName.value.trim();

      const price =
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


      if (!price) {
        showToast(
          "가격을 입력해주세요."
        );

        productPrice.focus();

        return;
      }


      const presentData = {
        name,
        price: Number(price),
        brand,
        friend: selectedFriend,
        memo
      };


      console.log(
        "저장할 선물:",
        presentData
      );


      /*
       * 추후 백엔드 연결 예시
       *
       * fetch("/api/presents", {
       *   method: "POST",
       *
       *   headers: {
       *     "Content-Type":
       *       "application/json"
       *   },
       *
       *   body: JSON.stringify(
       *     presentData
       *   )
       * })
       *
       * .then((response) => {
       *   if (!response.ok) {
       *     throw new Error();
       *   }
       *
       *   return response.json();
       * })
       *
       * .then((data) => {
       *   window.location.href =
       *     "./Present-Complete.html";
       * })
       *
       * .catch(() => {
       *   showToast(
       *     "선물 저장에 실패했어요."
       *   );
       * });
       */


      // 프로토타입
      sessionStorage.setItem(
        "savedPresent",
        JSON.stringify(
          presentData
        )
      );


      window.location.href =
        "./Present-Complete.html";
    }
  );


  // =========================================
  // Price Format
  // =========================================

  function formatPrice(value) {
    const number =
      String(value).replace(
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


  // =========================================
  // Toast
  // =========================================

  function showToast(message) {
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