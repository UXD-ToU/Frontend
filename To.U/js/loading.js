const LOADING_DURATION = 3000;

// 이동할 페이지
const NEXT_PAGE = "./photo-test.html";

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    window.location.replace(NEXT_PAGE);
  }, LOADING_DURATION);
});
