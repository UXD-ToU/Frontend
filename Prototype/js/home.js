"use strict";

/*
 * Paths are relative to the HTML page.
 * Fill in the actual project paths before testing navigation.
 */
const PAGE_PATHS = {
  home: "./Home.html",
  friends: "",
  gifts: "",
  community: "",
  my: "",
  registerLink: "",
  registerPhoto: "",
  giftDetail: "",
  friendDetail: ""
};

/*
 * Example only:
 * home: "../assets/icons/home.svg"
 *
 * Use your team's actual SVG file paths.
 */
const ICON_PATHS = {
  home: "../assets/icon/home.svg",
  friends: "../assets/icon/friends.svg",
  gifts: "../assets/icon/gifts.svg",
  community: "../assets/icon/community.svg",
  my: "../assets/icon/my.svg"
};

const NAV_ITEMS = [
  { id: "home", label: "홈", fallback: "⌂" },
  { id: "friends", label: "친구", fallback: "♙" },
  { id: "gifts", label: "선물함", fallback: "♡" },
  { id: "community", label: "커뮤니티", fallback: "☰" },
  { id: "my", label: "마이", fallback: "MY" }
];

let noticeTimer;

function showNotice(message) {
  let notice = document.querySelector(".home-notice");

  if (!notice) {
    notice = document.createElement("div");
    notice.className = "home-notice";
    notice.setAttribute("role", "status");
    notice.setAttribute("aria-live", "polite");
    document.body.append(notice);
  }

  clearTimeout(noticeTimer);
  notice.textContent = message;
  notice.hidden = false;

  noticeTimer = setTimeout(() => {
    notice.hidden = true;
  }, 3000);
}

function navigateTo(path, label) {
  if (!path) {
    showNotice(`${label} 페이지의 파일 경로를 먼저 연결해 주세요.`);
    return;
  }

  window.location.assign(path);
}

function getCurrentPage(items) {
  const currentPath = window.location.pathname;

  const matchedItem = items.find((item) => {
    const path = PAGE_PATHS[item.id];

    if (!path) return false;

    return new URL(path, window.location.href).pathname === currentPath;
  });

  return matchedItem?.id || document.body.dataset.page || "";
}

function makeIcon(item) {
  const container = document.createElement("span");
  container.className = "tou-nav-icon";
  container.setAttribute("aria-hidden", "true");

  const fallback = document.createElement("span");
  fallback.className = "tou-nav-fallback";

  if (item.id === "my") {
    fallback.classList.add("tou-nav-fallback--my");
  }

  fallback.textContent = item.fallback;

  const source = ICON_PATHS[item.id];

  if (source) {
    const image = document.createElement("img");
    image.src = source;
    image.alt = "";

    image.addEventListener("error", () => {
      container.replaceChildren(fallback);
    }, { once: true });

    container.append(image);
  } else {
    container.append(fallback);
  }

  return container;
}

/*
 * Shared navigation renderer.
 * Include home.css, home.js and <div id="bottom-nav"></div>
 * on another page to reuse this component.
 */
function renderBottomNavigation() {
  const host = document.getElementById("bottom-nav");

  if (!host) return;

  host.replaceChildren();

  if (document.body.dataset.hideNav === "true") return;

  const currentPage = getCurrentPage(NAV_ITEMS);
  const navigation = document.createElement("nav");
  navigation.className = "tou-bottom-nav";
  navigation.setAttribute("aria-label", "주 메뉴");

  const list = document.createElement("ul");
  list.className = "tou-nav-list";

  NAV_ITEMS.forEach((item) => {
    const listItem = document.createElement("li");
    const link = document.createElement("a");
    const path = PAGE_PATHS[item.id];

    link.className = "tou-nav-link";
    link.href = path || "#";

    if (item.id === currentPage) {
      link.setAttribute("aria-current", "page");
    }

    if (!path) {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        showNotice(`${item.label} 페이지의 파일 경로를 연결해 주세요.`);
      });
    }

    const label = document.createElement("span");
    label.className = "tou-nav-label";
    label.textContent = item.label;

    link.append(makeIcon(item), label);
    listItem.append(link);
    list.append(listItem);
  });

  navigation.append(list);
  host.append(navigation);
}

function loadProductImages() {
  document.querySelectorAll("[data-product-image]").forEach((container) => {
    const source = container.dataset.src;

    if (!source) return;

    const image = document.createElement("img");
    image.alt = "";
    image.src = source;

    image.addEventListener("load", () => {
      container.replaceChildren(image);
    }, { once: true });

    image.addEventListener("error", () => {
      container.textContent = "이미지를 확인해 주세요";
    }, { once: true });
  });
}

function setupHomeActions() {
  const dialog = document.getElementById("register-dialog");
  const registerButton = document.querySelector(".register-button");
  const closeButton = document.querySelector(".dialog-close");

  registerButton?.addEventListener("click", () => {
    if (dialog && !dialog.open) dialog.showModal();
  });

  closeButton?.addEventListener("click", () => {
    dialog?.close();
  });
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.dataset.action;

      if (action === "gift-list") {
        navigateTo(PAGE_PATHS.gifts, "선물함");
      }

      if (action === "gift-detail") {
        navigateTo(PAGE_PATHS.giftDetail, "선물 상세");
      }

      if (action === "friend") {
        navigateTo(PAGE_PATHS.friendDetail, "친구 상세");
      }

      if (action === "register-link") {
        dialog?.close();
        navigateTo(PAGE_PATHS.registerLink, "링크 등록");
      }

      if (action === "register-photo") {
        dialog?.close();
        navigateTo(PAGE_PATHS.registerPhoto, "사진 등록");
      }
    });
  });
}

renderBottomNavigation();
loadProductImages();
setupHomeActions();

window.addEventListener("pageshow", renderBottomNavigation);
window.addEventListener("popstate", renderBottomNavigation);