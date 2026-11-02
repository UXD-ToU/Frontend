import { navigate } from "./router.js";
import { state } from "./state.js";

async function readClipboard() {
  const plugin = window.Capacitor?.Plugins?.Clipboard;

  if (plugin) {
    const { value } = await plugin.read();
    return value || "";
  }

  return navigator.clipboard.readText();
}

async function pasteLink() {
  const input = document.querySelector(".link-field input");
  if (!input) return;

  try {
    const text = (await readClipboard()).trim();

    if (text) {
      input.value = text;
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
  } catch (error) {
    console.warn("붙여넣기 실패:", error);
    input.focus();
  }
}

document.addEventListener("click", event => {
  if (event.target.closest('[data-action="paste-link"]')) {
    pasteLink();
    return;
  }

  // 친구를 눌렀을 때 어떤 친구인지 기억
  const friendButton = event.target.closest("[data-friend-id]");

  if (friendButton) {
    state.currentFriendId = friendButton.dataset.friendId;
  }

  // 페이지 이동 (하단 내비는 app.js에서 처리)
  const pageButton = event.target.closest("[data-page]");

  if (pageButton && !pageButton.closest("#app-bottom-nav")) {
    if (pageButton.dataset.page === "friend-add") {
      state.editingFriendId =
        pageButton.dataset.edit === "true" ? state.currentFriendId : null;
    }

    navigate(pageButton.dataset.page);
  }
});