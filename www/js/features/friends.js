import { state } from "../state.js";
import {
  listFriends,
  getFriend,
  saveFriend,
  deleteFriend,
  formatBirthday
} from "../services/friend-service.js";

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function avatarHTML(style, extraClass = "") {
  return `
    <span class="btn-avatar btn-avatar--${style} ${extraClass}" aria-hidden="true">
      <span class="btn-avatar__holes"><i></i><i></i><i></i><i></i></span>
    </span>
  `;
}

function sortByName(friends) {
  return [...friends].sort((a, b) => a.name.localeCompare(b.name, "ko"));
}

/* =========================
   친구 목록
========================= */

export async function initFriends() {
  const list = document.querySelector("#friend-list");
  const search = document.querySelector("#friend-search");
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
  const friend = state.currentFriendId
    ? await getFriend(state.currentFriendId)
    : null;

  if (!friend) {
    navigate("friends");
    return;
  }

  document.querySelector("#detail-avatar").className =
    `btn-avatar btn-avatar--${friend.avatar} btn-avatar--lg`;
  document.querySelector("#detail-name").textContent = friend.name;
  document.querySelector("#detail-birthday").textContent =
    `🎂 ${formatBirthday(friend.birthday)}`;
  document.querySelector("#detail-tags").innerHTML = friend.relation
    ? `<li class="tag">${escapeHtml(friend.relation)}</li>`
    : "";

  document.querySelector("#delete-friend").addEventListener("click", async () => {
    if (!confirm(`${friend.name}님을 삭제할까요?`)) return;

    await deleteFriend(friend.id);
    state.currentFriendId = null;
    navigate("friends");
  });
}

/* =========================
   친구 추가 / 수정
========================= */

export async function initFriendAdd(navigate) {
  const nameInput = document.querySelector("#friend-name");
  const birthdayInput = document.querySelector("#friend-birthday");
  const relationSelect = document.querySelector("#friend-relation");
  const saveButton = document.querySelector("#save-friend");

  const editing = state.editingFriendId
    ? await getFriend(state.editingFriendId)
    : null;

  if (editing) {
    nameInput.value = editing.name;
    birthdayInput.value = editing.birthday;
    relationSelect.value = editing.relation || "";
    saveButton.textContent = "저장하기";

    document.querySelector("#edit-avatar").className =
      `btn-avatar btn-avatar--${editing.avatar} btn-avatar--lg`;
  }

  saveButton.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    const birthday = birthdayInput.value;

    if (!name || !birthday) {
      alert("이름과 생일을 입력해 주세요.");
      return;
    }

    const saved = await saveFriend({
      id: editing?.id,
      name,
      birthday,
      relation: relationSelect.value
    });

    if (editing) {
      state.currentFriendId = saved.id;
      state.editingFriendId = null;
      navigate("friend-detail");
    } else {
      navigate("friends");
    }
  });
}

/* =========================
   친구 선택 (상품 등록용)
========================= */

export async function initFriendSelect(navigate) {
  const list = document.querySelector("#select-list");
  const search = document.querySelector("#select-search");
  if (!list) return;

  const friends = sortByName(await listFriends());

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
                 ${friend.id === state.selectedFriendId ? "checked" : ""}>
        </label>
      </li>
    `).join("");
  }

  render();
  search?.addEventListener("input", () => render(search.value.trim()));

  document.querySelector("#confirm-friend").addEventListener("click", () => {
    const checked = list.querySelector('input[name="gift-friend"]:checked');
    state.selectedFriendId = checked ? checked.value : null;
    navigate("wish-add");
  });
}

/* =========================
   상품 입력: 선택한 친구 표시
========================= */

export async function initWishAdd() {
  const button = document.querySelector("#select-friend-btn");
  if (!button || !state.selectedFriendId) return;

  const friend = await getFriend(state.selectedFriendId);

  if (friend) {
    button.textContent = friend.name;
    button.classList.add("is-filled");
  }
}