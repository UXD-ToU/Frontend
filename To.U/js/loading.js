const LoADING_DURATION = 3000;

// 이동할 페이지
const NEXT_PAGE = "./000.html";

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    window.location.replace(NEXT_PAGE);
  }, LOADING_DURATION);
});
