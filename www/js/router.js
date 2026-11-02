import {
  initFriends,
  initFriendDetail,
  initFriendAdd,
  initFriendSelect,
  initWishAdd
} from "./features/friends.js";

const routes = {
  home: "home.html",
  wishlist: "wishlist.html",
  friends: "friends.html",

  "friend-add": "friend-add.html",
  "friend-detail": "friend-detail.html",
  "friend-select": "friend-select.html",

  "wish-add": "wish-add.html",
  "wish-link": "wish-link.html",
  "wish-detail": "wish-detail.html",
  "wishlist-detail": "wishlist-detail.html",
  "wishlist-grid": "wishlist-grid.html"
  
};

const placeholders = {
  community: "커뮤니티 화면 준비 중"
};

// 하위 화면에서 하단 내비게이션에 켜 둘 탭
const navTabs = {
  "wishlist-detail": "wishlist-detail.html",
  "wishlist-grid": "wishlist-grid.html"
};

let navigationId = 0;

export async function navigate(page) {
  const content = document.querySelector("#app-content");
  if (!content) return;

  const currentNavigation = ++navigationId;

  try {
    if (Object.hasOwn(placeholders, page)) {
      content.innerHTML = `
        <section class="page-container">
          <h1>${placeholders[page]}</h1>
        </section>
      `;
    } else {
      const file = routes[page];

      if (!file) {
        console.warn(`등록되지 않은 페이지: ${page}`);
        return;
      }

      const response = await fetch(`./pages/${file}`);

      if (!response.ok) {
        throw new Error(`페이지 로드 실패: ${file}`);
      }

      const html = await response.text();

      if (currentNavigation !== navigationId) return;

      content.innerHTML = html;
    }

    // 화면별 헤더/내비게이션 표시용
    document.body.dataset.page = page;

    // 하단 내비게이션 ON/OFF
    const activeTab = navTabs[page] || page;

    document.querySelectorAll(".nav-item").forEach(button => {
      const active = button.dataset.page === activeTab;

      button.classList.toggle("active", active);

      if (active) {
        button.setAttribute("aria-current", "page");
      } else {
        button.removeAttribute("aria-current");
      }
    });

    window.scrollTo(0, 0);

  } catch (error) {
    if (currentNavigation !== navigationId) return;

    console.error("화면 전환 오류:", error);

    content.innerHTML = `
      <section class="page-container">
        <p>화면을 불러오지 못했습니다.</p>
      </section>
    `;
  }
}