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
  const avatarEl = document.querySelector("#edit-avatar");
  const picker = document.querySelector("#avatar-picker");
  const decorateButton = document.querySelector("#decorate-btn");

  const editing = state.editingFriendId
    ? await getFriend(state.editingFriendId)
    : null;

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

    const saved = await saveFriend({
      id: editing?.id,
      name,
      birthday,
      relation: relationSelect.value,
      avatar
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