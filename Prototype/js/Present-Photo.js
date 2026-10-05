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
  // 뒤로가기
  // ========================================

  backBtn.addEventListener("click", () => {

    if (window.history.length > 1) {
      window.history.back();

      return;
    }

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


    // 이미지 파일인지 확인
    if (!file.type.startsWith("image/")) {

      showToast(
        "이미지 파일만 등록할 수 있어요."
      );

      return;
    }


    // 10MB 제한
    const maxFileSize =
      10 * 1024 * 1024;


    if (file.size > maxFileSize) {

      showToast(
        "10MB 이하의 이미지를 선택해주세요."
      );

      return;
    }


    selectedFile = file;


    // 기존 Object URL 제거
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }


    previewUrl =
      URL.createObjectURL(file);


    // 이미지 표시
    previewImage.src =
      previewUrl;

    previewImage.hidden =
      false;


    // Placeholder 숨기기
    previewPlaceholder.hidden =
      true;


    // 삭제 버튼 표시
    removePhotoBtn.hidden =
      false;


    // 저장 버튼 활성화
    updateSaveButton();


    showToast(
      "사진을 선택했어요."
    );
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

    previewImage.hidden =
      true;


    previewPlaceholder.hidden =
      false;


    removePhotoBtn.hidden =
      true;


    // 같은 파일을 다시 선택할 수 있도록 초기화
    cameraInput.value = "";

    albumInput.value = "";


    updateSaveButton();


    showToast(
      "사진을 삭제했어요."
    );
  }


  // ========================================
  // 메모 글자 수
  // ========================================

  memoInput.addEventListener(
    "input",
    () => {

      const length =
        memoInput.value.length;


      memoCount.textContent =
        `${length}/200`;
    }
  );


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


      // ====================================
      // FormData 생성
      // ====================================

      const formData =
        new FormData();


      formData.append(
        "image",
        selectedFile
      );


      formData.append(
        "memo",
        memo
      );


      console.log(
        "선택 이미지:",
        selectedFile
      );


      console.log(
        "메모:",
        memo
      );


      /*
       * 추후 백엔드 연결 예시
       *
       *
       * fetch("/api/presents/photo", {
       *
       *   method: "POST",
       *
       *   body: formData
       *
       * })
       *
       * .then((response) => {
       *
       *   if (!response.ok) {
       *     throw new Error();
       *   }
       *
       *   return response.json();
       *
       * })
       *
       * .then((data) => {
       *
       *   window.location.href =
       *     `./Present-Detail.html?id=${data.id}`;
       *
       * })
       *
       * .catch(() => {
       *
       *   showToast(
       *     "사진 등록에 실패했어요."
       *   );
       *
       * });
       */


      // 현재 프로토타입
      showToast(
        "사진을 등록했어요."
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
  // 페이지 종료 시 Object URL 정리
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

  updateSaveButton();

});