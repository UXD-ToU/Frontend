
const LOADING_DURATION = 3000;
const NEXT_PAGE = "./photo.html?source=gallery";

document.addEventListener("DOMContentLoaded", async () => {
  const startTime = performance.now();

  const delay = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  function openTransferDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(
        "present-photo-transfer-v1",
        1
      );

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains("transfers")) {
          db.createObjectStore("transfers");
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  try {
    const db = await openTransferDatabase();

    const files = await new Promise((resolve, reject) => {
      const transaction = db.transaction(
        "transfers",
        "readonly"
      );

      const request = transaction
        .objectStore("transfers")
        .get("selected-images");

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    db.close();

    if (!Array.isArray(files) || files.length === 0) {
      throw new Error("선택한 사진이 없습니다.");
    }

    // 최소 3초 동안 기존 로딩 애니메이션 표시
    const elapsed = performance.now() - startTime;

    await delay(Math.max(0, LOADING_DURATION - elapsed));

    // 선택한 사진을 유지하면서 등록 페이지로 이동
    window.location.replace(NEXT_PAGE);

  } catch (error) {
    console.error("사진 불러오기 실패:", error);

    const loadingText = document.querySelector(".loading-text");

    if (loadingText) {
      loadingText.textContent =
        "사진을 불러오지 못했어요. 다시 선택해 주세요.";
    }

    await delay(1500);

    window.location.replace("./home.html");
  }
});
