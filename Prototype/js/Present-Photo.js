document.addEventListener("DOMContentLoaded", () => {
  // ========================================
  // DOM
  // ========================================

  const backBtn =
    document.querySelector("#backBtn");

  const cameraBtn =
    document.querySelector("#cameraBtn");

  const albumBtn =
    document.querySelector("#albumBtn");

  const cameraInput =
    document.querySelector("#cameraInput");

  const albumInput =
    document.querySelector("#albumInput");

  const previewImage =
    document.querySelector("#previewImage");

  const previewPlaceholder =
    document.querySelector("#previewPlaceholder");

  const removePhotoBtn =
    document.querySelector("#removePhotoBtn");

  const memoInput =
    document.querySelector("#memoInput");

  const memoCount =
    document.querySelector("#memoCount");

  const saveBtn =
    document.querySelector("#saveBtn");

  const toast =
    document.querySelector("#toast");


  // ========================================
  // State
  // ========================================

  let selectedFile = null;
  let previewUrl = null;
  let toastTimer = null;


  // ========================================
  // 기존 임시 데이터 제거
  // 새 후보 등록 시작
  // ========================================

  sessionStorage.removeItem("presentDraft");


  // ========================================
  // 뒤로가기
  // ========================================

  backBtn.addEventListener("click", () => {
    window.location.href =
      "./Present-List.html";
  });


  // ========================================
  // 카메라 열기
  // ========================================

  cameraBtn.addEventListener("click", () => {
    cameraInput.click();
  });


  // ========================================
  // 앨범 열기
  // ========================================

  albumBtn.addEventListener("click", () => {
    albumInput.click();
  });


  // ========================================
  // 카메라 이미지 선택
  // ========================================

  cameraInput.addEventListener(
    "change",
    (event) => {
      const file =
        event.target.files[0];

      handleSelectedImage(file);
    }
  );


  // ========================================
  // 앨범 이미지 선택
  // ========================================

  albumInput.addEventListener(
    "change",
    (event) => {
      const file =
        event.target.files[0];

      handleSelectedImage(file);
    }
  );


  // ========================================
  // 이미지 처리
  // ========================================

  function handleSelectedImage(file) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      showToast(
        "이미지 파일만 등록할 수 있어요."
      );
      return;
    }

    const maxFileSize =
      10 * 1024 * 1024;

    if (file.size > maxFileSize) {
      showToast(
        "10MB 이하의 이미지를 선택해주세요."
      );
      return;
    }

    selectedFile = file;

    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    previewUrl =
      URL.createObjectURL(file);

    previewImage.src =
      previewUrl;

    previewImage.hidden =
      false;

    previewPlaceholder.hidden =
      true;

    removePhotoBtn.hidden =
      false;

    updateSaveButton();
  }


  // ========================================
  // 이미지 삭제
  // ========================================

  removePhotoBtn.addEventListener(
    "click",
    () => {
      removeSelectedImage();
    }
  );


  function removeSelectedImage() {
    selectedFile = null;

    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );

      previewUrl = null;
    }

    previewImage.src = "";
    previewImage.hidden = true;

    previewPlaceholder.hidden =
      false;

    removePhotoBtn.hidden =
      true;

    cameraInput.value = "";
    albumInput.value = "";

    updateSaveButton();
  }


  // ========================================
  // 메모 글자 수
  // ========================================

  memoInput.addEventListener(
    "input",
    () => {
      updateMemoCount();
    }
  );


  function updateMemoCount() {
    const length =
      memoInput.value.length;

    memoCount.textContent =
      `${length}/200`;
  }


  // ========================================
  // 저장 버튼 상태
  // ========================================

  function updateSaveButton() {
    saveBtn.disabled =
      !selectedFile;
  }


  // ========================================
  // 사진 등록
  // ========================================

  saveBtn.addEventListener(
    "click",
    () => {
      if (!selectedFile) {
        showToast(
          "등록할 사진을 선택해주세요."
        );
        return;
      }

      const memo =
        memoInput.value.trim();


      // File → Base64
      const reader =
        new FileReader();


      reader.onload = () => {
        const presentDraft = {
          image:
            reader.result,

          memo:
            memo
        };


        // Confirm 페이지에서 사용할 임시 데이터
        sessionStorage.setItem(
          "presentDraft",
          JSON.stringify(
            presentDraft
          )
        );


        // 확인 페이지로 이동
        window.location.href =
          "./Present-Confirm.html";
      };


      reader.onerror = () => {
        showToast(
          "사진을 불러오지 못했어요."
        );
      };


      reader.readAsDataURL(
        selectedFile
      );
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


  // ========================================
  // Object URL 정리
  // ========================================

  window.addEventListener(
    "beforeunload",
    () => {
      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl
        );
      }
    }
  );


  // ========================================
  // Initial
  // ========================================

  updateMemoCount();
  updateSaveButton();
});