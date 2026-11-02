
import { navigate } from "./router.js";
import "./events.js";

// HTML 컴포넌트 로드
async function loadComponent(selector, path) {
  const element = document.querySelector(selector);

  if (!element) {
    throw new Error(`컴포넌트 영역 없음: ${selector}`);
  }

  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`컴포넌트 로드 실패: ${path}`);
  }

  element.innerHTML = await response.text();
}

// 앱 초기화
async function initApp() {
  try {
    // Header + Bottom Navigation
    await Promise.all([
      loadComponent(
        "#app-header",
        "./components/header.html"
      ),
      loadComponent(
        "#app-bottom-nav",
        "./components/bottom-nav.html"
      )
    ]);

    // Bottom Navigation 클릭
    document
      .querySelector("#app-bottom-nav")
      .addEventListener("click", event => {
        const button = event.target.closest("[data-page]");

        if (!button) return;

        navigate(button.dataset.page);
      });

    // 로고 클릭 시 홈 이동
    document
      .querySelector(".header-logo")
      ?.addEventListener("click", event => {
        event.preventDefault();
        navigate("home");
      });

    // 최초 진입 화면
    await navigate("home");

  } catch (error) {
    console.error("To.U 초기화 실패:", error);
  }
}

document.addEventListener("DOMContentLoaded", initApp);
