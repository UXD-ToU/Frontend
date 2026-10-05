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

  if (!file.type.startsWith("image/")) {
    showToast("이미지 파일만 등록할 수 있어요.");
    return;
  }

  const maxFileSize = 10 * 1024 * 1024;

  if (file.size > maxFileSize) {
    showToast("10MB 이하의 이미지를 선택해주세요.");
    return;
  }

  selectedFile = file;

  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }

  previewUrl = URL.createObjectURL(file);

  // 사진 표시
  previewImage.src = previewUrl;
  previewImage.hidden = false;

  // 안내문 전체 숨기기
  previewPlaceholder.hidden = true;

  // X 버튼 표시
  removePhotoBtn.hidden = false;

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
    URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }

  // 사진 제거
  previewImage.src = "";
  previewImage.hidden = true;

  // 안내문 다시 표시
  previewPlaceholder.hidden = false;

  // X 버튼 숨김
  removePhotoBtn.hidden = true;

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
      window.location.href = "./Present-Confirm.html";
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