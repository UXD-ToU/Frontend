import { state } from "../state.js";
import {
  AVATARS,
  listFriends,
  getFriend,
  saveFriend,
  deleteFriend,
  formatBirthday
} from "../services/friend-service.js";
import { escapeHtml, avatarHTML } from "../utils.js";

function sortByName(friends) {
  return [...friends].sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

/* =========================
   친구 목록
========================= */

export async function initFriends() {
  const root = document.querySelector("#app-content").firstElementChild;
  const list = root.querySelector("#friend-list");
  const search = root.querySelector("#friend-search");
  if (!list) return;

  const friends = await listFriends();

  function render(keyword = "") {
    const filtered = friends.filter(friend => friend.name.includes(keyword));

    list.innerHTML = filtered.map(friend => `
      <li>
        <button class="friend-item" type="button"
                data-page="friend-detail" data-friend-id="${friend.id}">
          ${avatarHTML(friend.avatar)}
          ${escapeHtml(friend.name)}
        </button>
      </li>
    `).join("");
  }

  render();
  search?.addEventListener("input", () => render(search.value.trim()));
}

/* =========================
   친구 상세
========================= */

export async function initFriendDetail(navigate) {
  const root = document.querySelector("#app-content").firstElementChild;
  const friend = state.currentFriendId
    ? await getFriend(state.currentFriendId)
    : null;

  if (!root.isConnected) return;

  if (!friend) {
    navigate("friends");
    return;
  }

  root.querySelector("#detail-avatar").className =
    `btn-avatar btn-avatar--${friend.avatar} btn-avatar--lg`;
  root.querySelector("#detail-name").textContent = friend.name;
  root.querySelector("#detail-birthday").textContent =
    `🎂 ${formatBirthday(friend.birthday)}`;
  root.querySelector("#detail-tags").innerHTML = friend.relation
    ? `<li class="tag">${escapeHtml(friend.relation)}</li>`
    : "";

  const deleteButton = root.querySelector("#delete-friend");
  deleteButton.addEventListener("click", async () => {
    if (deleteButton.disabled || !confirm(`${friend.name}님을 삭제할까요?`)) return;
    deleteButton.disabled = true;
    try {
      await deleteFriend(friend.id);
      if (!root.isConnected) return;
      state.currentFriendId = null;
      navigate("friends");
    } catch (error) {
      console.error("친구 삭제 실패:", error);
      if (root.isConnected) alert("삭제하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      deleteButton.disabled = false;
    }
  });
}

/* =========================
   친구 추가 / 수정
========================= */

export async function initFriendAdd(navigate) {
  const root = document.querySelector("#app-content").firstElementChild;
  const nameInput = root.querySelector("#friend-name");
  const birthdayInput = root.querySelector("#friend-birthday");
  const relationSelect = root.querySelector("#friend-relation");
  const saveButton = root.querySelector("#save-friend");
  const avatarEl = root.querySelector("#edit-avatar");
  const picker = root.querySelector("#avatar-picker");
  const decorateButton = root.querySelector("#decorate-btn");

  const editing = state.editingFriendId
    ? await getFriend(state.editingFriendId)
    : null;

  if (!root.isConnected) return;

  // 사용자가 고른 단추 색 (고르지 않으면 null)
  let avatar = editing?.avatar || null;

  function showAvatar() {
    avatarEl.className = `btn-avatar btn-avatar--${avatar || "pale"} btn-avatar--lg`;

    picker.querySelectorAll("button").forEach(button => {
      button.classList.toggle("is-selected", button.dataset.avatar === avatar);
    });
  }

  // 단추 색 선택지
  picker.innerHTML = AVATARS.map(style => `
    <button type="button" data-avatar="${style}" aria-label="${style} 단추">
      ${avatarHTML(style)}
    </button>
  `).join("");

  decorateButton.addEventListener("click", () => {
    picker.hidden = !picker.hidden;
  });

  picker.addEventListener("click", event => {
    const button = event.target.closest("[data-avatar]");
    if (!button) return;

    avatar = button.dataset.avatar;
    showAvatar();
  });

  if (editing) {
    nameInput.value = editing.name;
    birthdayInput.value = editing.birthday;
    relationSelect.value = editing.relation || "";
    saveButton.textContent = "저장하기";
  }

  showAvatar();

  saveButton.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    const birthday = birthdayInput.value;

    if (!name || !birthday) {
      alert("이름과 생일을 입력해 주세요.");
      return;
    }

    if (saveButton.disabled) return;
    saveButton.disabled = true;
    try {
      const saved = await saveFriend({
        id: editing?.id,
        name,
        birthday,
        relation: relationSelect.value,
        avatar
      });

      if (!root.isConnected) return;
      if (editing) {
        state.currentFriendId = saved.id;
        state.editingFriendId = null;
        navigate("friend-detail");
      } else {
        navigate("friends");
      }
    } catch (error) {
      console.error("친구 저장 실패:", error);
      if (root.isConnected) alert("저장하지 못했습니다. 다시 시도해 주세요.");
    } finally {
      saveButton.disabled = false;
    }
  });
}

/* =========================
   친구 선택 (상품 등록용)
========================= */

export async function initFriendSelect(navigate) {
  const root = document.querySelector("#app-content").firstElementChild;
  const list = root.querySelector("#select-list");
  const search = root.querySelector("#select-search");
  if (!list) return;

  const friends = sortByName(await listFriends());
  if (!root.isConnected) return;
  let selectedId = state.selectedFriendId;
  list.addEventListener("change", event => {
    if (event.target.matches('input[name="gift-friend"]')) selectedId = event.target.value;
  });

  function render(keyword = "") {
    const filtered = friends.filter(friend => friend.name.includes(keyword));

    list.innerHTML = filtered.map(friend => `
      <li>
        <label class="friend-item friend-item--select">
          <span class="friend-item__who">
            ${avatarHTML(friend.avatar)}
            ${escapeHtml(friend.name)}
          </span>
          <input class="radio" type="radio" name="gift-friend"
                 value="${friend.id}"
                 ${friend.id === selectedId ? "checked" : ""}>
        </label>
      </li>
    `).join("");
  }

  render();
  search?.addEventListener("input", () => render(search.value.trim()));

  root.querySelector("#confirm-friend").addEventListener("click", () => {
    if (!selectedId) {
      alert("친구를 선택해 주세요.");
      return;
    }
    state.selectedFriendId = selectedId;
    navigate("wish-add");
  });
}
